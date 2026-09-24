const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' ? process.env?.VITE_API_BASE_URL : undefined) ||
  'http://localhost:5001';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.timeout = 30000; // 30 seconds
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.error || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }

      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError(error.message || 'Network error occurred', 0, { originalError: error });
    }
  }

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, {
      method: 'GET'
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // Upload file (for image search)
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        // Don't set Content-Type, let browser set it for FormData
      },
      body: formData
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/api/health');
      return {
        healthy: response.status === 'healthy',
        ...response
      };
    } catch (error) {
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  // Get supported sites
  async getSupportedSites() {
    return this.get('/api/sites');
  }
}

// Custom error class
class ApiError extends Error {
  constructor(message, status = 0, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  get isNetworkError() {
    return this.status === 0;
  }

  get isServerError() {
    return this.status >= 500;
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500;
  }

  get isTimeout() {
    return this.status === 408;
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export { ApiClient, ApiError };
export default apiClient;
