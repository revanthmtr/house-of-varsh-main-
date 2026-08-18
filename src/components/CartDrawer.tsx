import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl, resolveApiUrl } from '../utils/api';
import './CartDrawer.css';

type Step = 'bag' | 'shipping' | 'confirmed';

const CartDrawer: React.FC = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, checkout, cartTotal } = useCart();
  const { user } = useAuth();



  const [step, setStep] = useState<Step>('bag');
  const [form, setForm] = useState({ name: user?.name || '', phone: '', address: '', city: '', pincode: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isRazorpayPaid, setIsRazorpayPaid] = useState(false);

  // Keep name in sync with user login state
  useEffect(() => {
    if (user?.name && !form.name) {
      setForm(prev => ({ ...prev, name: user.name }));
    }
  }, [user]);

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

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const closeAndReset = () => {
    setIsCartOpen(false);
    // Wait for the close animation before resetting internal state
    setTimeout(() => {
      setStep('bag');
      setError('');
      setForm({ name: user?.name || '', phone: '', address: '', city: '', pincode: '', notes: '' });
      setOrderId(null);
      setIsRazorpayPaid(false);
      setPaymentMethod('razorpay');
    }, 350);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Name, phone number, and delivery address are required.');
      return;
    }

    const token = localStorage.getItem('hov_token');
    if (!token) {
      setError('Please sign in or create an account to place your order.');
      return;
    }

    setLoading(true);

    // ── Razorpay Online Payment Flow ──
    if (paymentMethod === 'razorpay') {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          throw new Error('Unable to load Razorpay payment gateway. Please check your internet connection.');
        }

        // 1. Create Razorpay order on backend
        const orderRes = await fetch(resolveApiUrl('/api/payment/create-order'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: cartTotal,
            items: cart,
          }),
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.error || 'Failed to initiate Razorpay transaction.');
        }

        // 2. Open Razorpay Checkout Modal
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'House of Varsh',
          description: 'Luxury Couture Private Order',
          image: '/chinni_logo.png',
          order_id: orderData.orderId,
          prefill: {
            name: form.name,
            contact: form.phone,
            email: user?.email || '',
          },
          theme: {
            color: '#2A0108',
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 3. Verify Payment Signature & Create Confirmed Order on Backend
              const verifyRes = await fetch(resolveApiUrl('/api/payment/verify'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  shipping: form,
                }),
              });


              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData.error || 'Payment signature could not be verified.');
              }

              setIsRazorpayPaid(true);
              setOrderId(verifyData.order?.id ?? null);
              setStep('confirmed');
            } catch (err: any) {
              console.error(err);
              setError(err.message || 'Payment verification failed.');
            } finally {
              setLoading(false);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', (response: any) => {
          setLoading(false);
          setError(`Payment Failed: ${response.error?.description || 'Transaction declined.'}`);
        });
        rzp.open();
      } catch (err: any) {
        setLoading(false);
        console.error(err);
        setError(err.message || 'Payment initiation failed. Please try again.');
      }
      return;
    }

    // ── Cash on Delivery (COD) Flow ──
    const result = await checkout({ ...form, notes: form.notes ? `${form.notes} (Payment: Cash on Delivery)` : 'Payment: Cash on Delivery' });
    setLoading(false);
    if (result.success) {
      setIsRazorpayPaid(false);
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
          data-lenis-prevent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="cart-drawer"
            data-lenis-prevent
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
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
                  {step === 'shipping' && 'Checkout & Payment'}
                  {step === 'confirmed' && 'Order Confirmed'}
                </h2>
              </div>
              <X className="cart-close" onClick={closeAndReset} size={24} />
            </div>

            {/* Step 1: Bag contents */}
            {step === 'bag' && (
              <>
                <div className="cart-content" data-lenis-prevent>
                  {cart.length === 0 ? (
                    <div className="cart-empty">
                      <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                      <p>Your bag is currently empty.</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div className="cart-item" key={item.id}>
                        {item.img && (item.img.endsWith('.mp4') || item.img.endsWith('.webm') || item.img.endsWith('.mov')) ? (
                          <video
                            src={resolveMediaUrl(item.img)}
                            poster="/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg"
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="cart-item-img"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <img
                            src={resolveMediaUrl(item.img)}
                            alt={item.name}
                            className="cart-item-img"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg';
                            }}
                          />
                        )}
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


            {/* Step 2: Shipping form & Payment Selection */}
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
                    autoComplete="name"
                    disabled={loading}
                    required
                  />

                  <label className="cart-form-label">Phone Number *</label>
                  <input
                    className="cart-form-input"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
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
                    placeholder="House / Flat no., building, street, landmark"
                    autoComplete="street-address"
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
                        autoComplete="address-level2"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="cart-form-label">Pincode</label>
                      <input
                        className="cart-form-input"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="postal-code"
                        value={form.pincode}
                        onChange={e => setForm({ ...form, pincode: e.target.value })}
                        placeholder="6-digit pincode"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <label className="cart-form-label">Order Notes (optional)</label>
                  <textarea
                    className="cart-form-input cart-form-textarea"
                    value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    placeholder="Special tailoring or delivery requests"
                    disabled={loading}
                    rows={2}
                  />

                  {/* ── Payment Method Selector ── */}
                  <label className="cart-form-label" style={{ marginTop: '0.5rem' }}>Payment Method *</label>
                  <div className="cart-payment-options">
                    <label className={`cart-payment-option ${paymentMethod === 'razorpay' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={() => setPaymentMethod('razorpay')}
                        disabled={loading}
                      />
                      <div className="cart-payment-option-content">
                        <div className="cart-payment-option-title">
                          <span>💳 Razorpay Secure Online Payment</span>
                          <span className="cart-payment-tag">INSTANT</span>
                        </div>
                        <span className="cart-payment-option-desc">UPI (GPay / PhonePe / Paytm), Credit / Debit Cards, NetBanking, EMI</span>
                      </div>
                    </label>

                    <label className={`cart-payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        disabled={loading}
                      />
                      <div className="cart-payment-option-content">
                        <div className="cart-payment-option-title">
                          <span>📦 Cash on Delivery (COD)</span>
                        </div>
                        <span className="cart-payment-option-desc">Pay in cash or UPI when your masterpiece arrives at your doorstep.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Pinned Footer — Always 100% visible on screen */}
                <div className="cart-footer" style={{ flexShrink: 0, borderTop: '1px solid rgba(18,18,18,0.1)' }}>
                  <div className="cart-total">
                    <span>Total</span>
                    <span>&#8377;{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <button className="cart-checkout-btn" type="submit" disabled={loading}>
                    {loading
                      ? (paymentMethod === 'razorpay' ? 'Opening Payment Gateway…' : 'Placing Order…')
                      : (paymentMethod === 'razorpay' ? `Pay ₹${cartTotal.toLocaleString('en-IN')} via Razorpay` : 'Place Order (Cash on Delivery)')}
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
                  Your order{orderId ? ` #${orderId}` : ''} has been {isRazorpayPaid ? 'paid and confirmed' : 'placed'} successfully.
                  {isRazorpayPaid && (
                    <span style={{ display: 'block', marginTop: '0.5rem', color: '#2e7d32', fontWeight: 600 }}>
                      ✓ Payment Verified via Razorpay
                    </span>
                  )}
                  We'll contact you shortly to coordinate your private delivery.
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


