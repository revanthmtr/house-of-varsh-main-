import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

type Step = 'bag' | 'shipping' | 'confirmed';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, checkout, cartTotal } = useCart();

  const [step, setStep] = useState<Step>('bag');
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', pincode: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Lock background scroll when cart drawer is open
  useEffect(() => {
    if (isCartOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isCartOpen]);

  const closeAndReset = () => {
    setIsCartOpen(false);
    // Wait for the close animation before resetting internal state
    setTimeout(() => {
      setStep('bag');
      setError('');
      setForm({ name: '', phone: '', address: '', city: '', pincode: '', notes: '' });
      setOrderId(null);
    }, 350);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Name, phone, and address are required.');
      return;
    }
    setLoading(true);
    const result = await checkout(form);
    setLoading(false);
    if (result.success) {
      setOrderId(result.orderId ?? null);
      setStep('confirmed');
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };


  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          className="cart-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          >
            <div className="cart-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                {step === 'shipping' && (
                  <ArrowLeft
                    size={20}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setStep('bag')}
                  />
                )}
                <img src="/chinni_logo.png" alt="House of Varsh" style={{ height: '28px' }} />
                <h2 className="cart-title">
                  {step === 'bag' && 'Private Client Bag'}
                  {step === 'shipping' && 'Shipping Details'}
                  {step === 'confirmed' && 'Order Confirmed'}
                </h2>
              </div>
              <X className="cart-close" onClick={closeAndReset} size={24} />
            </div>

            {/* Step 1: Bag contents */}
            {step === 'bag' && (
              <>
                <div className="cart-content">
                  {cart.length === 0 ? (
                    <div className="cart-empty">
                      <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>Your bag is currently empty.</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div className="cart-item" key={item.id}>
                        <img src={item.img} alt={item.name} className="cart-item-img" />
                        <div className="cart-item-info">
                          <h4 className="cart-item-title">{item.name}</h4>
                          <div className="cart-item-price">{item.price}</div>
                          <div className="cart-item-remove" onClick={() => removeFromCart(item.id)}>Remove</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="cart-footer">
                    <div className="cart-total">
                      <span>Total</span>
                      <span>&#8377;{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    <button className="cart-checkout-btn" onClick={() => setStep('shipping')}>
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Shipping form */}
            {step === 'shipping' && (
              <form
                className="cart-form-wrapper"
                onSubmit={handlePlaceOrder}
                style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}
              >
                <div
                  className="cart-content cart-shipping-form"
                  data-lenis-prevent
                  style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain' }}
                >
                  {error && <div className="cart-form-error">&#9888; {error}</div>}

                  <label className="cart-form-label">Full Name *</label>
                  <input
                    className="cart-form-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    disabled={loading}
                    required
                  />

                  <label className="cart-form-label">Phone Number *</label>
                  <input
                    className="cart-form-input"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    disabled={loading}
                    required
                  />

                  <label className="cart-form-label">Delivery Address *</label>
                  <textarea
                    className="cart-form-input cart-form-textarea"
                    value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    placeholder="House no., street, area"
                    disabled={loading}
                    rows={3}
                    required
                  />

                  <div className="cart-form-row">
                    <div>
                      <label className="cart-form-label">City</label>
                      <input
                        className="cart-form-input"
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        placeholder="City"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="cart-form-label">Pincode</label>
                      <input
                        className="cart-form-input"
                        value={form.pincode}
                        onChange={e => setForm({ ...form, pincode: e.target.value })}
                        placeholder="Pincode"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <label className="cart-form-label">Order Notes (optional)</label>
                  <textarea
                    className="cart-form-input cart-form-textarea"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any special instructions"
                    disabled={loading}
                    rows={2}
                  />

                  <div className="cart-payment-note">
                    Payment: <strong>Cash on Delivery</strong> &mdash; pay when your order arrives.
                  </div>
                </div>

                {/* Pinned Footer — Always 100% visible on screen */}
                <div className="cart-footer" style={{ flexShrink: 0, borderTop: '1px solid rgba(18,18,18,0.1)' }}>
                  <div className="cart-total">
                    <span>Total</span>
                    <span>&#8377;{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <button className="cart-checkout-btn" type="submit" disabled={loading}>
                    {loading ? 'Placing Order…' : 'Place Order'}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Confirmation */}
            {step === 'confirmed' && (
              <div className="cart-content cart-confirmation" data-lenis-prevent>
                <CheckCircle2 size={56} className="cart-confirm-icon" />
                <h3>Thank you!</h3>
                <p>
                  Your order{orderId ? ` #${orderId}` : ''} has been placed successfully.
                  We'll contact you shortly to confirm delivery details.
                </p>
                <button className="cart-checkout-btn" onClick={closeAndReset}>
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;

