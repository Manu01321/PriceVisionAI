import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initializes the Gemini client with the API key from environment variables.
 * @returns {GoogleGenerativeAI} Configured Gemini client instance.
 */
const genAI = import.meta.env.VITE_GEMINI_API_KEY
  ? new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)
  : null;

export default genAI;
