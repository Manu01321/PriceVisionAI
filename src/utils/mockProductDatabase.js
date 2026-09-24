// Comprehensive mock product database for frontend-only solution
export const mockProductDatabase = [
  // Nokia Phones
  {
    id: 1,
    name: 'Nokia 110 4G (2023) - Dual SIM Feature Phone',
    image: 'https://images.unsplash.com/photo-1523131965559-94826a91ada0',
    imageAlt: 'Nokia 110 4G feature phone in black showing classic keypad design and small screen',
    currentPrice: 39.99,
    originalPrice: 49.99,
    discount: 20,
    confidence: 92,
    dealUrgency: 75,
    aiInsight:
      'Perfect basic phone for calls and texts. Long battery life and durable design make it ideal for backup or elderly users.',
    priceHistory: [49.99, 47.99, 45.99, 42.99, 39.99],
    retailers: [
      { name: 'Nokia Store', price: 39.99 },
      { name: 'Amazon', price: 42.99 },
      { name: 'Best Buy', price: 44.99 }
    ],

    brand: 'Nokia',
    category: 'Feature Phone',
    features: ['4G LTE', 'Dual SIM', 'MP3 Player', 'FM Radio', 'Snake Game'],
    rating: 4.3,
    reviews: 287,
    isWishlisted: false
  },
  {
    id: 2,
    name: 'Nokia 105 (2023) - Classic Feature Phone',
    image: 'https://images.unsplash.com/photo-1686372538515-1a6a5ff7870e',
    imageAlt:
      'Nokia 105 feature phone in blue showing traditional T9 keypad and monochrome display',
    currentPrice: 24.99,
    originalPrice: 29.99,
    discount: 17,
    confidence: 89,
    dealUrgency: 68,
    aiInsight:
      'Ultra-affordable basic phone with weeks of battery life. Perfect for emergencies or digital detox.',
    priceHistory: [29.99, 28.99, 27.99, 26.99, 24.99],
    retailers: [
      { name: 'Nokia Store', price: 24.99 },
      { name: 'Amazon', price: 26.99 },
      { name: 'Walmart', price: 27.99 }
    ],

    brand: 'Nokia',
    category: 'Feature Phone',
    features: ['Long Battery Life', 'FM Radio', 'Flashlight', 'Calculator'],
    rating: 4.1,
    reviews: 156,
    isWishlisted: false
  },
  {
    id: 3,
    name: 'Nokia G22 5G (2023) - Sustainable Smartphone',
    image: 'https://images.unsplash.com/photo-1644646973212-1d05a9f32b3d',
    imageAlt: 'Nokia G22 smartphone in green showing eco-friendly design with triple camera setup',
    currentPrice: 199.99,
    originalPrice: 249.99,
    discount: 20,
    confidence: 94,
    dealUrgency: 82,
    aiInsight:
      'Eco-friendly smartphone with user-repairable design. Great value 5G phone with clean Android experience.',
    priceHistory: [249.99, 239.99, 229.99, 219.99, 199.99],
    retailers: [
      { name: 'Nokia Store', price: 199.99 },
      { name: 'Amazon', price: 209.99 },
      { name: 'Best Buy', price: 219.99 }
    ],

    brand: 'Nokia',
    category: 'Smartphone',
    features: ['5G', '50MP Triple Camera', 'Repairable Design', 'Android 13'],
    rating: 4.2,
    reviews: 342,
    isWishlisted: false
  },

  // Apple Products
  {
    id: 4,
    name: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
    image: 'https://images.unsplash.com/photo-1697292866700-148d1078b17a',
    imageAlt: 'Apple iPhone 15 Pro Max in natural titanium color showing front and back views',
    currentPrice: 1199,
    originalPrice: 1299,
    discount: 8,
    confidence: 95,
    dealUrgency: 85,
    aiInsight:
      'Premium flagship with titanium build and advanced camera system. Best-in-class performance and display quality.',
    priceHistory: [1299, 1280, 1250, 1220, 1199],
    retailers: [
      { name: 'Apple', price: 1199 },
      { name: 'Best Buy', price: 1199 },
      { name: 'Amazon', price: 1249 }
    ],

    brand: 'Apple',
    category: 'Smartphone',
    features: ['A17 Pro Chip', '48MP Camera System', 'Titanium Build', 'USB-C'],
    rating: 4.8,
    reviews: 1247,
    isWishlisted: false
  },
  {
    id: 5,
    name: 'Apple iPhone 14 128GB - Midnight',
    image: 'https://images.unsplash.com/photo-1571137062219-e63343b18bd7',
    imageAlt: 'Apple iPhone 14 in midnight black showing sleek design with dual camera system',
    currentPrice: 699,
    originalPrice: 799,
    discount: 13,
    confidence: 93,
    dealUrgency: 78,
    aiInsight:
      'Solid mid-range iPhone with excellent cameras and reliable performance. Great value after price drop.',
    priceHistory: [799, 779, 749, 719, 699],
    retailers: [
      { name: 'Apple', price: 699 },
      { name: 'Verizon', price: 699 },
      { name: 'T-Mobile', price: 719 }
    ],

    brand: 'Apple',
    category: 'Smartphone',
    features: ['A15 Bionic', '12MP Dual Camera', 'Face ID', '5G'],
    rating: 4.6,
    reviews: 2156,
    isWishlisted: false
  },

  // Samsung Products
  {
    id: 6,
    name: 'Samsung Galaxy S24 Ultra 512GB - Titanium Black',
    image: 'https://images.unsplash.com/photo-1707410420102-faff6eb0e033',
    imageAlt: 'Samsung Galaxy S24 Ultra smartphone in titanium black with S Pen stylus',
    currentPrice: 1099,
    originalPrice: 1199,
    discount: 8,
    confidence: 92,
    dealUrgency: 78,
    aiInsight:
      'Flagship Android with S Pen and exceptional zoom capabilities. Perfect for productivity and photography.',
    priceHistory: [1199, 1180, 1150, 1120, 1099],
    retailers: [
      { name: 'Samsung', price: 1099 },
      { name: 'Best Buy', price: 1129 },
      { name: 'Amazon', price: 1149 }
    ],

    brand: 'Samsung',
    category: 'Smartphone',
    features: ['200MP Camera', 'S Pen', '100x Zoom', 'Galaxy AI'],
    rating: 4.7,
    reviews: 892,
    isWishlisted: true
  },
  {
    id: 7,
    name: 'Samsung Galaxy A54 5G 128GB - Awesome Violet',
    image: 'https://images.unsplash.com/photo-1610945264232-541f10d0282d',
    imageAlt:
      'Samsung Galaxy A54 smartphone in violet purple showing modern design with triple camera',
    currentPrice: 349,
    originalPrice: 449,
    discount: 22,
    confidence: 88,
    dealUrgency: 86,
    aiInsight:
      'Excellent mid-range phone with great cameras and 5G. Outstanding value with premium features.',
    priceHistory: [449, 429, 399, 369, 349],
    retailers: [
      { name: 'Samsung', price: 349 },
      { name: 'Amazon', price: 369 },
      { name: 'Best Buy', price: 379 }
    ],

    brand: 'Samsung',
    category: 'Smartphone',
    features: ['50MP Triple Camera', '5G', '120Hz Display', '5000mAh Battery'],
    rating: 4.4,
    reviews: 567,
    isWishlisted: false
  },

  // Google Pixel
  {
    id: 8,
    name: 'Google Pixel 8 Pro 128GB - Obsidian',
    image: 'https://images.unsplash.com/photo-1669708182253-1dfe68b48fc6',
    imageAlt: 'Google Pixel 8 Pro smartphone in obsidian black showing camera bar design',
    currentPrice: 699,
    originalPrice: 899,
    discount: 22,
    confidence: 88,
    dealUrgency: 92,
    aiInsight:
      'Best computational photography with Google AI features. Significant discount makes this a hot deal.',
    priceHistory: [899, 850, 799, 749, 699],
    retailers: [
      { name: 'Google', price: 699 },
      { name: 'Best Buy', price: 729 },
      { name: 'Verizon', price: 749 }
    ],

    brand: 'Google',
    category: 'Smartphone',
    features: ['Tensor G3', '50MP Pro Camera', 'Magic Eraser', 'Pure Android'],
    rating: 4.5,
    reviews: 734,
    isWishlisted: false
  },

  // OnePlus
  {
    id: 9,
    name: 'OnePlus 12 256GB - Flowy Emerald',
    image: 'https://images.unsplash.com/photo-1610887603721-1b944a45d266',
    imageAlt: 'OnePlus 12 smartphone in flowy emerald green color with curved display',
    currentPrice: 799,
    originalPrice: 899,
    discount: 11,
    confidence: 85,
    dealUrgency: 65,
    aiInsight:
      'Flagship performance with ultra-fast charging. Great value in the premium segment with OxygenOS.',
    priceHistory: [899, 879, 849, 819, 799],
    retailers: [
      { name: 'OnePlus', price: 799 },
      { name: 'Amazon', price: 829 },
      { name: 'T-Mobile', price: 849 }
    ],

    brand: 'OnePlus',
    category: 'Smartphone',
    features: ['Snapdragon 8 Gen 3', '100W SuperVOOC', '50MP Triple Camera', 'OxygenOS 14'],
    rating: 4.3,
    reviews: 423,
    isWishlisted: false
  },

  // Xiaomi
  {
    id: 10,
    name: 'Xiaomi 14 Ultra 512GB - Black',
    image: 'https://images.unsplash.com/photo-1687331780289-f2bec66a0550',
    imageAlt: 'Xiaomi 14 Ultra smartphone in black with prominent Leica camera module',
    currentPrice: 899,
    originalPrice: 999,
    discount: 10,
    confidence: 82,
    dealUrgency: 58,
    aiInsight:
      'Photography powerhouse with Leica partnership. Professional-grade camera system in flagship body.',
    priceHistory: [999, 979, 949, 919, 899],
    retailers: [
      { name: 'Xiaomi', price: 899 },
      { name: 'Amazon', price: 929 },
      { name: 'AliExpress', price: 949 }
    ],

    brand: 'Xiaomi',
    category: 'Smartphone',
    features: ['Leica Cameras', 'Snapdragon 8 Gen 3', '120W HyperCharge', 'MIUI 15'],
    rating: 4.4,
    reviews: 312,
    isWishlisted: false
  },

  // Nothing Phone
  {
    id: 11,
    name: 'Nothing Phone (2a) 256GB - Black',
    image: 'https://images.unsplash.com/photo-1690134774371-20f9213ca0d0',
    imageAlt: 'Nothing Phone 2a in black showing transparent back design with LED lights',
    currentPrice: 399,
    originalPrice: 449,
    discount: 11,
    confidence: 79,
    dealUrgency: 72,
    aiInsight:
      'Unique transparent design with Glyph lighting system. Distinctive aesthetics meet solid mid-range performance.',
    priceHistory: [449, 439, 429, 419, 399],
    retailers: [
      { name: 'Nothing', price: 399 },
      { name: 'Amazon', price: 419 },
      { name: 'Best Buy', price: 429 }
    ],

    brand: 'Nothing',
    category: 'Smartphone',
    features: ['Glyph Interface', '50MP Dual Camera', 'MediaTek Dimensity', 'Nothing OS 2.5'],
    rating: 4.2,
    reviews: 287,
    isWishlisted: false
  },

  // Budget/Feature Phones
  {
    id: 12,
    name: 'TCL 305i 4G - Smartphone Entry Level',
    image: 'https://images.unsplash.com/photo-1734703657458-938dcf2d5bbe',
    imageAlt: 'TCL 305i smartphone in blue showing basic Android interface and single camera',
    currentPrice: 89.99,
    originalPrice: 119.99,
    discount: 25,
    confidence: 76,
    dealUrgency: 84,
    aiInsight:
      'Ultra-budget Android smartphone with decent performance for basic tasks. Great first smartphone option.',
    priceHistory: [119.99, 109.99, 99.99, 94.99, 89.99],
    retailers: [
      { name: 'TCL', price: 89.99 },
      { name: 'Amazon', price: 94.99 },
      { name: 'Walmart', price: 99.99 }
    ],

    brand: 'TCL',
    category: 'Smartphone',
    features: ['Android Go', '13MP Camera', '4G LTE', '3000mAh Battery'],
    rating: 3.9,
    reviews: 145,
    isWishlisted: false
  },

  // Tablets
  {
    id: 13,
    name: 'Apple iPad Air 5th Gen 256GB - Space Gray',
    image: 'https://images.unsplash.com/photo-1591094825572-244c7a90d7ca',
    imageAlt: 'Apple iPad Air in space gray showing slim profile and Apple Pencil compatibility',
    currentPrice: 649,
    originalPrice: 749,
    discount: 13,
    confidence: 91,
    dealUrgency: 73,
    aiInsight:
      'Powerful tablet with M1 chip and Apple Pencil support. Perfect for productivity and creative work.',
    priceHistory: [749, 729, 699, 669, 649],
    retailers: [
      { name: 'Apple', price: 649 },
      { name: 'Best Buy', price: 659 },
      { name: 'Amazon', price: 669 }
    ],

    brand: 'Apple',
    category: 'Tablet',
    features: ['M1 Chip', '10.9-inch Display', 'Apple Pencil Support', 'Touch ID'],
    rating: 4.7,
    reviews: 892,
    isWishlisted: false
  },

  // Laptops
  {
    id: 14,
    name: 'MacBook Air M2 13-inch 256GB - Midnight',
    image: 'https://images.unsplash.com/photo-1660906424762-f97c15c9e72f',
    imageAlt: 'MacBook Air M2 in midnight blue showing ultra-thin profile and modern design',
    currentPrice: 999,
    originalPrice: 1199,
    discount: 17,
    confidence: 94,
    dealUrgency: 88,
    aiInsight:
      'Exceptional performance laptop with all-day battery life. M2 chip delivers pro-level power in ultra-portable design.',
    priceHistory: [1199, 1149, 1099, 1049, 999],
    retailers: [
      { name: 'Apple', price: 999 },
      { name: 'Best Buy', price: 1019 },
      { name: 'Amazon', price: 1029 }
    ],

    brand: 'Apple',
    category: 'Laptop',
    features: ['M2 Chip', '13.6-inch Liquid Retina', '18-hour Battery', 'MagSafe'],
    rating: 4.8,
    reviews: 1456,
    isWishlisted: false
  },

  // Audio Devices
  {
    id: 15,
    name: 'Apple AirPods Pro 2nd Gen - White',
    image: 'https://images.unsplash.com/photo-1717855530472-71ab928e85f6',
    imageAlt: 'Apple AirPods Pro 2nd generation in white charging case showing wireless earbuds',
    currentPrice: 199,
    originalPrice: 249,
    discount: 20,
    confidence: 93,
    dealUrgency: 87,
    aiInsight:
      'Industry-leading noise cancellation with spatial audio. Significant discount on premium wireless earbuds.',
    priceHistory: [249, 239, 229, 209, 199],
    retailers: [
      { name: 'Apple', price: 199 },
      { name: 'Best Buy', price: 199 },
      { name: 'Amazon', price: 209 }
    ],

    brand: 'Apple',
    category: 'Audio',
    features: ['Active Noise Cancellation', 'Spatial Audio', 'MagSafe Case', 'IPX4 Rating'],
    rating: 4.6,
    reviews: 2134,
    isWishlisted: false
  },

  // Smart Watches
  {
    id: 16,
    name: 'Apple Watch Series 9 GPS 45mm - Midnight Aluminum',
    image: 'https://images.unsplash.com/photo-1548185114-ab19718a8817',
    imageAlt:
      'Apple Watch Series 9 in midnight aluminum showing health tracking interface and sport band',
    currentPrice: 379,
    originalPrice: 429,
    discount: 12,
    confidence: 89,
    dealUrgency: 71,
    aiInsight:
      'Advanced health monitoring with ECG and blood oxygen sensors. Latest watchOS features and all-day battery.',
    priceHistory: [429, 419, 399, 389, 379],
    retailers: [
      { name: 'Apple', price: 379 },
      { name: 'Best Buy', price: 389 },
      { name: 'Target', price: 399 }
    ],

    brand: 'Apple',
    category: 'Smartwatch',
    features: ['S9 Chip', 'ECG & Blood Oxygen', 'Always-On Display', 'Water Resistant'],
    rating: 4.5,
    reviews: 967,
    isWishlisted: false
  },

  // Gaming
  {
    id: 17,
    name: 'Sony PlayStation 5 Console - Standard Edition',
    image: 'https://images.unsplash.com/photo-1688785494928-9cc57a7b9afc',
    imageAlt:
      'Sony PlayStation 5 console in white and black showing modern design with DualSense controller',
    currentPrice: 499,
    originalPrice: 499,
    discount: 0,
    confidence: 96,
    dealUrgency: 45,
    aiInsight:
      'Next-gen gaming console with 4K gaming and ray tracing. High demand item with limited availability.',
    priceHistory: [499, 499, 499, 499, 499],
    retailers: [
      { name: 'Sony', price: 499 },
      { name: 'Best Buy', price: 499 },
      { name: 'GameStop', price: 499 }
    ],

    brand: 'Sony',
    category: 'Gaming Console',
    features: ['4K Gaming', 'Ray Tracing', 'SSD Storage', 'DualSense Controller'],
    rating: 4.7,
    reviews: 3421,
    isWishlisted: false
  },

  // Accessories
  {
    id: 18,
    name: 'Anker PowerCore 10000 Portable Charger - Black',
    image: 'https://images.unsplash.com/photo-1596877445530-ad74838754c6',
    imageAlt:
      'Anker PowerCore portable battery charger in black showing compact design with USB ports',
    currentPrice: 19.99,
    originalPrice: 29.99,
    discount: 33,
    confidence: 87,
    dealUrgency: 91,
    aiInsight:
      'Compact high-capacity power bank with fast charging. Excellent deal on essential mobile accessory.',
    priceHistory: [29.99, 27.99, 24.99, 22.99, 19.99],
    retailers: [
      { name: 'Anker', price: 19.99 },
      { name: 'Amazon', price: 21.99 },
      { name: 'Best Buy', price: 24.99 }
    ],

    brand: 'Anker',
    category: 'Accessory',
    features: ['10000mAh Capacity', 'PowerIQ Technology', 'Compact Design', 'MultiProtect Safety'],
    rating: 4.4,
    reviews: 12456,
    isWishlisted: false
  }
];

// Search functionality
export function searchProducts(query, filters = {}) {
  if (!query?.trim()) {
    return mockProductDatabase;
  }

  const searchTerm = query?.toLowerCase()?.trim();

  // Enhanced search logic with multiple matching strategies
  let filteredProducts = mockProductDatabase?.filter((product) => {
    // Direct name matching
    if (product?.name?.toLowerCase()?.includes(searchTerm)) return true;

    // Brand matching
    if (product?.brand?.toLowerCase()?.includes(searchTerm)) return true;

    // Category matching
    if (product?.category?.toLowerCase()?.includes(searchTerm)) return true;

    // Features matching
    if (product?.features?.some((feature) => feature?.toLowerCase()?.includes(searchTerm)))
      return true;

    // AI insight matching
    if (product?.aiInsight?.toLowerCase()?.includes(searchTerm)) return true;

    // Partial word matching for model numbers
    const searchWords = searchTerm?.split(' ');
    const productWords = product?.name?.toLowerCase()?.split(' ');

    return searchWords?.some((searchWord) =>
      productWords?.some(
        (productWord) => productWord?.includes(searchWord) || searchWord?.includes(productWord)
      )
    );
  });

  // Apply filters
  if (filters?.priceRange?.min) {
    filteredProducts = filteredProducts?.filter(
      (p) => p?.currentPrice >= parseFloat(filters?.priceRange?.min)
    );
  }
  if (filters?.priceRange?.max) {
    filteredProducts = filteredProducts?.filter(
      (p) => p?.currentPrice <= parseFloat(filters?.priceRange?.max)
    );
  }
  if (filters?.brand?.length > 0) {
    filteredProducts = filteredProducts?.filter((p) => filters?.brand?.includes(p?.brand));
  }
  if (filters?.category?.length > 0) {
    filteredProducts = filteredProducts?.filter((p) => filters?.category?.includes(p?.category));
  }
  if (filters?.confidenceThreshold) {
    filteredProducts = filteredProducts?.filter(
      (p) => p?.confidence >= filters?.confidenceThreshold
    );
  }
  if (filters?.dealQuality && filters?.dealQuality !== 'all') {
    const thresholds = { hot: 80, good: 60, fair: 40 };
    filteredProducts = filteredProducts?.filter(
      (p) => p?.dealUrgency >= thresholds?.[filters?.dealQuality]
    );
  }

  // Sort products
  if (filters?.sortBy) {
    switch (filters?.sortBy) {
      case 'price_low':
        filteredProducts?.sort((a, b) => a?.currentPrice - b?.currentPrice);
        break;
      case 'price_high':
        filteredProducts?.sort((a, b) => b?.currentPrice - a?.currentPrice);
        break;
      case 'confidence':
        filteredProducts?.sort((a, b) => b?.confidence - a?.confidence);
        break;
      case 'deal_quality':
        filteredProducts?.sort((a, b) => b?.dealUrgency - a?.dealUrgency);
        break;
      case 'rating':
        filteredProducts?.sort((a, b) => b?.rating - a?.rating);
        break;
      case 'reviews':
        filteredProducts?.sort((a, b) => b?.reviews - a?.reviews);
        break;
      default:
        // Keep relevance order
        break;
    }
  }

  return filteredProducts;
}

// Get product by ID
export function getProductById(id) {
  return mockProductDatabase?.find((product) => product?.id === id);
}

// Get products by category
export function getProductsByCategory(category) {
  return mockProductDatabase?.filter(
    (product) => product?.category?.toLowerCase() === category?.toLowerCase()
  );
}

// Get products by brand
export function getProductsByBrand(brand) {
  return mockProductDatabase?.filter(
    (product) => product?.brand?.toLowerCase() === brand?.toLowerCase()
  );
}

// Get featured deals (high discount or deal urgency)
export function getFeaturedDeals(limit = 6) {
  return mockProductDatabase
    ?.filter((product) => product?.discount >= 15 || product?.dealUrgency >= 80)
    ?.sort((a, b) => b?.dealUrgency - a?.dealUrgency)
    ?.slice(0, limit);
}

// Get trending products (high ratings and reviews)
export function getTrendingProducts(limit = 6) {
  return mockProductDatabase
    ?.filter((product) => product?.rating >= 4.2 && product?.reviews >= 300)
    ?.sort((a, b) => b?.rating * Math.log(b?.reviews) - a?.rating * Math.log(a?.reviews))
    ?.slice(0, limit);
}

// Get available brands
export function getAvailableBrands() {
  const brands = [...new Set(mockProductDatabase.map((product) => product?.brand))];
  return brands?.sort();
}

// Get available categories
export function getAvailableCategories() {
  const categories = [...new Set(mockProductDatabase.map((product) => product?.category))];
  return categories?.sort();
}

// Get price range
export function getPriceRange() {
  const prices = mockProductDatabase?.map((product) => product?.currentPrice);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}
