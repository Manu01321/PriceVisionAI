/**
 * ML Search Engine - TF-IDF + Cosine Similarity
 * Trains on the product database and ranks results by relevance score.
 * No external API needed — runs entirely in the browser.
 */

// ─── Tokenizer ────────────────────────────────────────────────────────────────
function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

// ─── Build document corpus from a product ─────────────────────────────────────
function productToDocument(product) {
  return [
    product.name,
    product.brand,
    product.category,
    ...(product.features || []),
    product.aiInsight || '',
    String(product.currentPrice || ''),
  ].join(' ');
}

// ─── TF (term frequency within a document) ────────────────────────────────────
function computeTF(tokens) {
  const tf = {};
  tokens.forEach((t) => { tf[t] = (tf[t] || 0) + 1; });
  const total = tokens.length || 1;
  Object.keys(tf).forEach((t) => { tf[t] /= total; });
  return tf;
}

// ─── IDF (inverse document frequency across corpus) ───────────────────────────
function computeIDF(corpus) {
  const N = corpus.length;
  const df = {};
  corpus.forEach((tokens) => {
    const unique = new Set(tokens);
    unique.forEach((t) => { df[t] = (df[t] || 0) + 1; });
  });
  const idf = {};
  Object.keys(df).forEach((t) => {
    idf[t] = Math.log((N + 1) / (df[t] + 1)) + 1; // smoothed
  });
  return idf;
}

// ─── TF-IDF vector for a token list ───────────────────────────────────────────
function tfidfVector(tokens, idf) {
  const tf = computeTF(tokens);
  const vec = {};
  Object.keys(tf).forEach((t) => {
    vec[t] = tf[t] * (idf[t] || Math.log(2)); // unknown terms get small weight
  });
  return vec;
}

// ─── Cosine similarity between two sparse vectors ─────────────────────────────
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  Object.keys(a).forEach((t) => {
    dot += (a[t] || 0) * (b[t] || 0);
    normA += a[t] ** 2;
  });
  Object.keys(b).forEach((t) => { normB += b[t] ** 2; });
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── MLSearchEngine class ─────────────────────────────────────────────────────
class MLSearchEngine {
  constructor() {
    this.products = [];
    this.idf = {};
    this.docVectors = [];
    this.trained = false;
  }

  /** Train the model on a product array */
  train(products) {
    this.products = products;
    const corpus = products.map((p) => tokenize(productToDocument(p)));
    this.idf = computeIDF(corpus);
    this.docVectors = corpus.map((tokens) => tfidfVector(tokens, this.idf));
    this.trained = true;
    console.log(`[MLSearchEngine] Trained on ${products.length} products, vocab size: ${Object.keys(this.idf).length}`);
  }

  /**
   * Search and rank products by relevance to query.
   * Returns products sorted by ML score, filtered by threshold.
   */
  search(query, filters = {}, topK = 20) {
    if (!this.trained || !query?.trim()) {
      return this._applyFilters(this.products, filters);
    }

    const queryTokens = tokenize(query);
    const queryVec = tfidfVector(queryTokens, this.idf);

    // Score every product
    const scored = this.products.map((product, i) => {
      const mlScore = cosineSimilarity(queryVec, this.docVectors[i]);

      // Boost score for exact brand/category match
      const brandBoost = product.brand?.toLowerCase().includes(query.toLowerCase()) ? 0.3 : 0;
      const catBoost = product.category?.toLowerCase().includes(query.toLowerCase()) ? 0.2 : 0;
      const nameBoost = product.name?.toLowerCase().includes(query.toLowerCase()) ? 0.25 : 0;

      return { product, score: mlScore + brandBoost + catBoost + nameBoost };
    });

    // Filter by minimum relevance threshold
    const relevant = scored
      .filter((s) => s.score > 0.05)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map((s) => ({
        ...s.product,
        confidence: Math.min(99, Math.round(50 + s.score * 200)),
      }));

    return this._applyFilters(relevant, filters);
  }

  _applyFilters(products, filters) {
    let result = [...products];
    if (filters?.priceRange?.min) result = result.filter((p) => p.currentPrice >= +filters.priceRange.min);
    if (filters?.priceRange?.max) result = result.filter((p) => p.currentPrice <= +filters.priceRange.max);
    if (filters?.brand?.length) result = result.filter((p) => filters.brand.includes(p.brand));
    if (filters?.category?.length) result = result.filter((p) => filters.category.includes(p.category));
    if (filters?.sortBy) {
      const sorts = {
        price_low: (a, b) => a.currentPrice - b.currentPrice,
        price_high: (a, b) => b.currentPrice - a.currentPrice,
        rating: (a, b) => b.rating - a.rating,
        deal_quality: (a, b) => b.dealUrgency - a.dealUrgency,
      };
      if (sorts[filters.sortBy]) result.sort(sorts[filters.sortBy]);
    }
    return result;
  }
}

export const mlSearchEngine = new MLSearchEngine();
export default mlSearchEngine;
