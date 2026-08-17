import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Clock, CheckCircle2, Truck, AlertCircle, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../utils/api';
import './OrdersModal.css';

interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  price: string;
  img: string;
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number | string;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city?: string;
  shipping_pincode?: string;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
}

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose }) => {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && token) {
      setLoading(true);
      setError('');
      fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to load orders');
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) setOrders(data);
        })
        .catch((err) => {
          console.error(err);
          setError('Unable to fetch your orders. Please try again.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="order-badge status-confirmed"><CheckCircle2 size={13} /> Confirmed</span>;
      case 'shipped':
        return <span className="order-badge status-shipped"><Truck size={13} /> Shipped</span>;
      case 'delivered':
        return <span className="order-badge status-delivered"><CheckCircle2 size={13} /> Delivered</span>;
      case 'cancelled':
        return <span className="order-badge status-cancelled"><AlertCircle size={13} /> Cancelled</span>;
      default:
        return <span className="order-badge status-pending"><Clock size={13} /> Order Received</span>;
    }
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className="orders-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="orders-modal-container"
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="orders-modal-header">
            <div className="orders-header-title">
              <Package size={22} className="gold-icon" />
              <div>
                <h2>My Orders & Purchase Tracking</h2>
                <p>Track delivery status and view past couture orders for {user?.name || user?.email}</p>
              </div>
            </div>
            <button className="orders-close-btn" onClick={onClose} aria-label="Close orders modal">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="orders-modal-body" data-lenis-prevent>
            {loading && (
              <div className="orders-loading">
                <div className="orders-spinner" />
                <p>Loading your private order archive…</p>
              </div>
            )}

            {error && <div className="orders-error">{error}</div>}

            {!loading && !error && orders.length === 0 && (
              <div className="orders-empty">
                <ShoppingBag size={52} className="empty-bag-icon" />
                <h3>No Orders Placed Yet</h3>
                <p>You have not placed any orders yet. Discover our latest handwoven sarees and bespoke bridal couture.</p>
                <button
                  className="orders-shop-btn"
                  onClick={() => {
                    onClose();
                    window.location.hash = 'collections';
                  }}
                >
                  Explore Luxury Collections
                </button>
              </div>
            )}

            {!loading && orders.map((order) => (
              <div className="order-card" key={order.id}>
                <div className="order-card-header">
                  <div>
                    <span className="order-number">Order #{order.id.toString().padStart(4, '0')}</span>
                    <span className="order-date">
                      Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="order-header-right">
                    {getStatusBadge(order.status)}
                    <span className="order-total-amount">&#8377;{Number(order.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div className="order-tracking-bar">
                  <div className={`track-step ${['pending', 'confirmed', 'shipped', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                    <div className="track-dot" />
                    <span>Received</span>
                  </div>
                  <div className={`track-line ${['confirmed', 'shipped', 'delivered'].includes(order.status) ? 'active' : ''}`} />
                  <div className={`track-step ${['confirmed', 'shipped', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                    <div className="track-dot" />
                    <span>Confirmed</span>
                  </div>
                  <div className={`track-line ${['shipped', 'delivered'].includes(order.status) ? 'active' : ''}`} />
                  <div className={`track-step ${['shipped', 'delivered'].includes(order.status) ? 'active' : ''}`}>
                    <div className="track-dot" />
                    <span>Shipped</span>
                  </div>
                  <div className={`track-line ${order.status === 'delivered' ? 'active' : ''}`} />
                  <div className={`track-step ${order.status === 'delivered' ? 'active' : ''}`}>
                    <div className="track-dot" />
                    <span>Delivered</span>
                  </div>
                </div>

                {/* Items */}
                <div className="order-items-list">
                  {(order.items || []).map((item, idx) => (
                    <div className="order-item-row" key={item.id || idx}>
                      {item.img && (item.img.endsWith('.mp4') || item.img.endsWith('.webm')) ? (
                        <video src={resolveMediaUrl(item.img)} autoPlay loop muted playsInline className="order-item-thumb" />
                      ) : (
                        <img
                          src={resolveMediaUrl(item.img) || '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg'}
                          alt={item.name}
                          className="order-item-thumb"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg';
                          }}
                        />
                      )}
                      <div className="order-item-details">
                        <h4>{item.name}</h4>
                        <span className="order-item-category">{item.category?.toUpperCase() || 'HAUTE COUTURE'}</span>
                      </div>
                      <div className="order-item-price">{item.price}</div>
                    </div>
                  ))}
                </div>

                {/* Shipping & Delivery Footer */}
                <div className="order-card-footer">
                  <div>
                    <span className="footer-label">Delivering To</span>
                    <p className="footer-text">
                      <strong>{order.shipping_name}</strong> (📞 {order.shipping_phone})<br />
                      {order.shipping_address}{order.shipping_city ? `, ${order.shipping_city}` : ''} {order.shipping_pincode ? `— ${order.shipping_pincode}` : ''}
                    </p>
                  </div>
                  <div>
                    <span className="footer-label">Payment Method</span>
                    <p className="footer-text uppercase-tag">
                      {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
export default OrdersModal;
