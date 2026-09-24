const path = require('path');
const fs = require('fs');

class SQLiteClient {
  constructor(dbPath = path.join(__dirname, '../data/price-vision.db'), logger = console) {
    this.dbPath = dbPath;
    this.logger = logger;
    this.ready = false;
    this.db = null;
    this._data = { tracked_products: {}, price_history: [] };
    this._historyId = 1;
  }

  init() {
    try {
      // Try loading persisted JSON data
      const jsonPath = this.dbPath + '.json';
      if (fs.existsSync(jsonPath)) {
        this._data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        this._historyId =
          (this._data.price_history || []).reduce((m, r) => Math.max(m, r.id || 0), 0) + 1;
      }
      this.ready = true;
      this.logger.info('SQLite (JSON fallback) ready');
    } catch (error) {
      this.logger.warn(`SQLite init failed: ${error.message}`);
      this.ready = false;
    }
  }

  _persist() {
    try {
      const jsonPath = this.dbPath + '.json';
      const dir = path.dirname(jsonPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(jsonPath, JSON.stringify(this._data, null, 2));
    } catch (e) {
      this.logger.warn('Failed to persist data:', e.message);
    }
  }

  upsertTrackedProduct(tracking) {
    this._data.tracked_products[tracking.productUrl || tracking.id] = {
      ...tracking,
      initialData: JSON.stringify(tracking.initialData || {})
    };
    this._persist();
  }

  deleteTrackedProduct(id) {
    const key = Object.keys(this._data.tracked_products).find(
      (k) => this._data.tracked_products[k].id === id || k === id
    );
    if (key) delete this._data.tracked_products[key];
    this._data.price_history = this._data.price_history.filter((r) => r.trackingId !== id);
    this._persist();
  }

  listTrackedProducts() {
    return Object.values(this._data.tracked_products).map((row) => ({
      ...row,
      initialData: row.initialData ? JSON.parse(row.initialData) : {},
      priceHistory: this.getPriceHistory(row.id)
    }));
  }

  addPricePoint(trackingId, price, additionalData = {}) {
    this._data.price_history.push({
      id: this._historyId++,
      trackingId,
      timestamp: new Date().toISOString(),
      price,
      availability: additionalData.availability || 'unknown',
      source: additionalData.source || 'unknown',
      raw: JSON.stringify(additionalData || {})
    });
    this._persist();
  }

  getPriceHistory(trackingId) {
    return (this._data.price_history || [])
      .filter((r) => r.trackingId === trackingId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .map((row) => ({
        timestamp: row.timestamp,
        price: row.price,
        availability: row.availability,
        source: row.source,
        raw: row.raw ? JSON.parse(row.raw) : {}
      }));
  }
}

module.exports = SQLiteClient;
