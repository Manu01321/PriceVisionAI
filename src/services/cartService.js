import { useState, useEffect } from 'react';

const CART_KEY = 'priceVision_cart';

export const cartService = {
  getCart: () => {
    try {
      const data = localStorage.getItem(CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to read cart:', e);
      return [];
    }
  },

  saveCart: (cart) => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pv_cart_updated', { detail: { cart } }));
      }
    } catch (e) {
      console.warn('Failed to save cart:', e);
    }
  },

  addToCart: (product, quantity = 1, store = null) => {
    if (!product) return;
    const cart = cartService.getCart();
    const existingIndex = cart.findIndex((item) => String(item.id) === String(product.id));

    const price = Number(product.currentPrice || product.price || 0);
    const selectedStore = store || product.retailers?.[0]?.name || 'Amazon India';

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
      cart[existingIndex].selectedStore = selectedStore;
    } else {
      cart.push({
        id: String(product.id || Date.now()),
        name: product.name || 'Product',
        image: product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        price,
        originalPrice: Number(product.originalPrice || price * 1.25),
        selectedStore,
        quantity: Math.max(1, quantity),
        url: product.url || ''
      });
    }

    cartService.saveCart(cart);
  },

  removeFromCart: (productId) => {
    const cart = cartService.getCart().filter((item) => String(item.id) !== String(productId));
    cartService.saveCart(cart);
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      cartService.removeFromCart(productId);
      return;
    }
    const cart = cartService.getCart().map((item) => {
      if (String(item.id) === String(productId)) {
        return { ...item, quantity };
      }
      return item;
    });
    cartService.saveCart(cart);
  },

  clearCart: () => {
    cartService.saveCart([]);
  },

  getCartCount: () => {
    const cart = cartService.getCart();
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  },

  getCartTotal: () => {
    const cart = cartService.getCart();
    return cart.reduce((total, item) => total + Number(item.price || 0) * (item.quantity || 1), 0);
  }
};

// React hook for reactive cart state in components
export const useCart = () => {
  const [cart, setCart] = useState(() => cartService.getCart());

  useEffect(() => {
    const handleUpdate = () => {
      setCart(cartService.getCart());
    };

    window.addEventListener('pv_cart_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('pv_cart_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalAmount = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
    0
  );

  return {
    cart,
    totalCount,
    totalAmount,
    addToCart: cartService.addToCart,
    removeFromCart: cartService.removeFromCart,
    updateQuantity: cartService.updateQuantity,
    clearCart: cartService.clearCart
  };
};

export default cartService;
