import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { useCart } from '../../services/cartService';
import { formatINR } from '../../utils/productUtils';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, totalCount, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutComplete, setCheckoutComplete] = useState(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      setIsCheckingOut(false);
      setCheckoutComplete(true);
      clearCart();
    }, 1500);
  };

  const handleClose = () => {
    setCheckoutComplete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-500 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-border shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-primary/10 text-primary rounded-lg">
                <Icon name="ShoppingCart" size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-foreground text-base">Your Cart</h3>
                <p className="text-xs text-muted-foreground">
                  {totalCount} item{totalCount !== 1 ? 's' : ''} saved for checkout
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {checkoutComplete ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
                  <Icon name="CheckCircle" size={36} />
                </div>
                <h4 className="text-lg font-bold text-foreground">Order Placed Successfully!</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Your cart items have been processed at the best multi-store prices.
                </p>
                <Button variant="default" onClick={handleClose} className="mt-4">
                  Continue Shopping
                </Button>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-20 text-center space-y-3">
                <Icon name="ShoppingBag" size={48} className="text-muted-foreground/40 mx-auto" />
                <h4 className="text-base font-semibold text-foreground">Your cart is empty</h4>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Browse products and click &ldquo;Add to Cart&rdquo; to save them for quick checkout.
                </p>
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Explore Products
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 p-3 bg-muted/30 border border-border rounded-xl hover:border-primary/40 transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover bg-muted flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e';
                      }}
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground line-clamp-1">
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary font-medium rounded text-[10px]">
                          {item.selectedStore || 'Amazon India'}
                        </span>
                        <span>Unit: {formatINR(item.price)}</span>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border rounded-lg bg-background">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                            className="px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted text-xs transition-colors rounded-l-lg"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-0.5 text-xs font-semibold text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                            className="px-2 py-0.5 text-muted-foreground hover:text-foreground hover:bg-muted text-xs transition-colors rounded-r-lg"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-foreground">
                            {formatINR(Number(item.price || 0) * (item.quantity || 1))}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-error transition-colors p-1"
                            title="Remove item"
                          >
                            <Icon name="Trash2" size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-muted-foreground hover:text-error transition-colors pt-2 block ml-auto"
                >
                  Clear all items
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer / Summary */}
          {!checkoutComplete && cart.length > 0 && (
            <div className="p-4 border-t border-border bg-surface space-y-3">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({totalCount} items)</span>
                  <span>{formatINR(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charges</span>
                  <span className="text-success font-medium">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-base pt-2 border-t border-border">
                  <span>Total Amount</span>
                  <span className="text-primary">{formatINR(totalAmount)}</span>
                </div>
              </div>

              <Button
                variant="default"
                className="w-full py-2.5 font-semibold text-sm flex items-center justify-center space-x-2"
                disabled={isCheckingOut}
                onClick={handleCheckout}
              >
                {isCheckingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Icon name="CreditCard" size={16} />
                    <span>Proceed to Checkout ({formatINR(totalAmount)})</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
