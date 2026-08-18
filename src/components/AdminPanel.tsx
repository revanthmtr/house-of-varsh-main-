import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Image as ImageIcon, LayoutDashboard, Package, FileEdit, ShoppingBag, Users as UsersIcon, LogOut, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';
import { resolveMediaUrl, resolveApiUrl } from '../utils/api';

import './AdminPanel.css';


interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Product {
  id: number;
  name: string;
  price: string;
  category: string;
  img: string;
  badge?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  google_id: string;
  auth_method: string;
  created_at: string;
  last_login: string;
  login_count: number;
  last_ip: string;
  last_device: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  name: string;
  price: string;
  img: string;
  category: string;
  quantity: number;
}

interface Order {
  id: number;
  user_id: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: string;
  total_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city?: string;
  shipping_pincode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
  items: OrderItem[];
}

interface AuditLog {
  id: number;
  timestamp: string;
  email: string;
  action: string;
  ip_address: string;
  status: 'success' | 'failed' | 'threat';
  details: string;
}

// Section definitions — order and labels shown in the UI
const CONTENT_SECTIONS = [
  {
    section: 'header',
    label: 'Header & Navigation',
    keys: [
      { key: 'logo_src',         label: 'Header Brand Logo',       type: 'image' },
      { key: 'nav_link_1_label', label: 'Nav Link 1 — Label',     type: 'text'  },
      { key: 'nav_link_1_href',  label: 'Nav Link 1 — URL Anchor',type: 'text'  },
      { key: 'nav_link_2_label', label: 'Nav Link 2 — Label',     type: 'text'  },
      { key: 'nav_link_2_href',  label: 'Nav Link 2 — URL Anchor',type: 'text'  },
      { key: 'nav_link_3_label', label: 'Nav Link 3 — Label',     type: 'text'  },
      { key: 'nav_link_3_href',  label: 'Nav Link 3 — URL Anchor',type: 'text'  },
    ],
  },
  {
    section: 'hero',
    label: 'Hero Slider',
    keys: [
      { key: 'slide_1_image',    label: 'Slide 1 — Cover Media',  type: 'image' },
      { key: 'slide_1_subtitle', label: 'Slide 1 — Subtitle',     type: 'text'  },
      { key: 'slide_1_title',    label: 'Slide 1 — Headline Title',type: 'text' },
      { key: 'slide_2_image',    label: 'Slide 2 — Cover Media',  type: 'image' },
      { key: 'slide_2_subtitle', label: 'Slide 2 — Subtitle',     type: 'text'  },
      { key: 'slide_2_title',    label: 'Slide 2 — Headline Title',type: 'text' },
      { key: 'slide_3_image',    label: 'Slide 3 — Cover Media',  type: 'image' },
      { key: 'slide_3_subtitle', label: 'Slide 3 — Subtitle',     type: 'text'  },
      { key: 'slide_3_title',    label: 'Slide 3 — Headline Title',type: 'text' },
      { key: 'cta_button_label', label: 'Hero CTA Button Text',   type: 'text'  },
    ],
  },
  {
    section: 'photo_gallery',
    label: 'Shop Our Luxury Collections (Masonry Gallery)',
    keys: [
      { key: 'eyebrow_text',            label: 'Section Eyebrow',                type: 'text'  },
      { key: 'section_title_prefix',    label: 'Title Prefix (e.g. Shop Our)',   type: 'text'  },
      { key: 'section_title_highlight', label: 'Title Highlight (Gold text)',     type: 'text'  },
      { key: 'view_all_label',          label: 'View All Link Label',            type: 'text'  },
      { key: 'photo_1_title',           label: 'Card 1 — Title',                 type: 'text'  },
      { key: 'photo_1_tag',             label: 'Card 1 — Subtitle / Tag',        type: 'text'  },
      { key: 'photo_1_src',             label: 'Card 1 — Image / Video',         type: 'image' },
      { key: 'photo_1_alt',             label: 'Card 1 — Image Alt Text',        type: 'text'  },
      { key: 'photo_2_title',           label: 'Card 2 — Title',                 type: 'text'  },
      { key: 'photo_2_tag',             label: 'Card 2 — Subtitle / Tag',        type: 'text'  },
      { key: 'photo_2_src',             label: 'Card 2 — Image / Video',         type: 'image' },
      { key: 'photo_2_alt',             label: 'Card 2 — Image Alt Text',        type: 'text'  },
      { key: 'photo_3_title',           label: 'Card 3 — Title',                 type: 'text'  },
      { key: 'photo_3_tag',             label: 'Card 3 — Subtitle / Tag',        type: 'text'  },
      { key: 'photo_3_src',             label: 'Card 3 — Image / Video',         type: 'image' },
      { key: 'photo_3_alt',             label: 'Card 3 — Image Alt Text',        type: 'text'  },
      { key: 'photo_4_title',           label: 'Card 4 — Title',                 type: 'text'  },
      { key: 'photo_4_tag',             label: 'Card 4 — Subtitle / Tag',        type: 'text'  },
      { key: 'photo_4_src',             label: 'Card 4 — Image / Video',         type: 'image' },
      { key: 'photo_4_alt',             label: 'Card 4 — Image Alt Text',        type: 'text'  },
      { key: 'photo_5_title',           label: 'Card 5 — Title',                 type: 'text'  },
      { key: 'photo_5_tag',             label: 'Card 5 — Subtitle / Tag',        type: 'text'  },
      { key: 'photo_5_src',             label: 'Card 5 — Image / Video',         type: 'image' },
      { key: 'photo_5_alt',             label: 'Card 5 — Image Alt Text',        type: 'text'  },
    ],
  },
  {
    section: 'shop_by_collection',
    label: 'New Arrivals Saree Grid',
    keys: [
      { key: 'eyebrow_text',     label: 'Section Eyebrow',            type: 'text' },
      { key: 'section_title',    label: 'Section Headline Title',     type: 'text' },
      { key: 'section_subtitle', label: 'Section Narrative Subtitle', type: 'text' },
    ],
  },
  {
    section: 'latest_collection',
    label: 'Interactive Catalog (Newly Launched vs Best Sellers)',
    keys: [
      { key: 'section_title', label: 'Section Headline Title',         type: 'text' },
      { key: 'tab_1_label',   label: 'Tab 1 Label (Newly Launched)',  type: 'text' },
      { key: 'tab_2_label',   label: 'Tab 2 Label (Best Sellers)',    type: 'text' },
    ],
  },
  {
    section: 'brand_story',
    label: 'Brand Story & Atelier Heritage',
    keys: [
      { key: 'eyebrow_text',           label: 'Section Eyebrow',             type: 'text' },
      { key: 'story_paragraph',        label: 'Lead Manifesto Paragraph',    type: 'text' },
      { key: 'founder_tag_name',       label: 'Founder / Atelier Tag Name',  type: 'text' },
      { key: 'founder_tag_location',   label: 'Founder Tag Location Info',   type: 'text' },
      { key: 'pillar_1_title',         label: 'Pillar 1 — Title',            type: 'text' },
      { key: 'pillar_1_subtitle',      label: 'Pillar 1 — Subtitle',         type: 'text' },
      { key: 'pillar_1_desc',          label: 'Pillar 1 — Description',      type: 'text' },
      { key: 'pillar_2_title',         label: 'Pillar 2 — Title',            type: 'text' },
      { key: 'pillar_2_subtitle',      label: 'Pillar 2 — Subtitle',         type: 'text' },
      { key: 'pillar_2_desc',          label: 'Pillar 2 — Description',      type: 'text' },
      { key: 'pillar_3_title',         label: 'Pillar 3 — Title',            type: 'text' },
      { key: 'pillar_3_subtitle',      label: 'Pillar 3 — Subtitle',         type: 'text' },
      { key: 'pillar_3_desc',          label: 'Pillar 3 — Description',      type: 'text' },
      { key: 'cta_button_label',       label: 'CTA Button Text',             type: 'text' },
    ],
  },
  {
    section: 'voices_muses',
    label: 'Client Reviews & Testimonials',
    keys: [
      { key: 'section_subtitle', label: 'Section Eyebrow Subtitle', type: 'text'  },
      { key: 'section_title',    label: 'Section Headline Title',   type: 'text'  },
      { key: 'muse_1_name',      label: 'Review 1 — Client Name',   type: 'text'  },
      { key: 'muse_1_role',      label: 'Review 1 — Client Role/City', type: 'text' },
      { key: 'muse_1_avatar',    label: 'Review 1 — Client Photo',  type: 'image' },
      { key: 'muse_1_quote',     label: 'Review 1 — Review Quote',  type: 'text'  },
      { key: 'muse_2_name',      label: 'Review 2 — Client Name',   type: 'text'  },
      { key: 'muse_2_role',      label: 'Review 2 — Client Role/City', type: 'text' },
      { key: 'muse_2_avatar',    label: 'Review 2 — Client Photo',  type: 'image' },
      { key: 'muse_2_quote',     label: 'Review 2 — Review Quote',  type: 'text'  },
      { key: 'muse_3_name',      label: 'Review 3 — Client Name',   type: 'text'  },
      { key: 'muse_3_role',      label: 'Review 3 — Client Role/City', type: 'text' },
      { key: 'muse_3_avatar',    label: 'Review 3 — Client Photo',  type: 'image' },
      { key: 'muse_3_quote',     label: 'Review 3 — Review Quote',  type: 'text'  },
    ],
  },
  {
    section: 'private_atelier',
    label: 'Private Atelier VIP Newsletter',
    keys: [
      { key: 'subtitle',        label: 'Section Subtitle Tag',      type: 'text' },
      { key: 'heading',         label: 'Main Headline',             type: 'text' },
      { key: 'description',     label: 'Invitation Description',    type: 'text' },
      { key: 'placeholder',     label: 'Email Input Placeholder',   type: 'text' },
      { key: 'cta_label',       label: 'Subscribe Button Text',     type: 'text' },
      { key: 'success_message', label: 'VIP Welcome Message',       type: 'text' },
      { key: 'legal_text',      label: 'Privacy / Legal Disclaimer',type: 'text' },
    ],
  },
  {
    section: 'footer',
    label: 'Footer & Company Info',
    keys: [
      { key: 'logo_src',               label: 'Footer Brand Logo',         type: 'image' },
      { key: 'tagline',                label: 'Brand Tagline',             type: 'text'  },
      { key: 'explore_heading',        label: 'Explore Column Heading',    type: 'text'  },
      { key: 'explore_link_1',         label: 'Explore Link 1',            type: 'text'  },
      { key: 'explore_link_2',         label: 'Explore Link 2',            type: 'text'  },
      { key: 'explore_link_3',         label: 'Explore Link 3',            type: 'text'  },
      { key: 'explore_link_4',         label: 'Explore Link 4',            type: 'text'  },
      { key: 'help_heading',           label: 'Help Column Heading',       type: 'text'  },
      { key: 'help_link_1',            label: 'Help Link 1',               type: 'text'  },
      { key: 'help_link_2',            label: 'Help Link 2',               type: 'text'  },
      { key: 'help_link_3',            label: 'Help Link 3',               type: 'text'  },
      { key: 'help_link_4',            label: 'Help Link 4',               type: 'text'  },
      { key: 'newsletter_heading',     label: 'Newsletter Column Heading', type: 'text'  },
      { key: 'newsletter_description', label: 'Newsletter Description',    type: 'text'  },
      { key: 'newsletter_placeholder', label: 'Newsletter Email Placeholder', type: 'text' },
      { key: 'newsletter_btn_label',   label: 'Newsletter Subscribe Button', type: 'text' },
      { key: 'copyright_text',         label: 'Copyright Footer Line',     type: 'text'  },
    ],
  },
];


// ── Site Content Editor ──────────────────────────────────────────────────────
const SiteContentEditor: React.FC = () => {
  const { token } = useAuth();
  const { get, updateSection } = useSiteContent();

  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const compositeKey = (section: string, key: string) => `${section}__${key}`;

  const currentValue = (section: string, key: string) => {
    const ck = compositeKey(section, key);
    return localEdits[ck] !== undefined ? localEdits[ck] : get(section, key, '');
  };

  const handleChange = (section: string, key: string, value: string) => {
    setLocalEdits(prev => ({ ...prev, [compositeKey(section, key)]: value }));
    setSavedSections(prev => { const s = new Set(prev); s.delete(section); return s; });
  };

  const handleFileUpload = async (section: string, key: string, file: File) => {
    if (!token) return;
    setUploadingField(compositeKey(section, key));
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(resolveApiUrl('/api/upload'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      handleChange(section, key, data.url);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveSection = async (section: string, keys: { key: string }[]) => {
    setSavingSection(section);

    // Collect only the fields that have been changed
    const changedFields: Record<string, string> = {};
    for (const { key } of keys) {
      const ck = compositeKey(section, key);
      if (localEdits[ck] !== undefined) {
        changedFields[key] = localEdits[ck];
      }
    }

    if (Object.keys(changedFields).length === 0) {
      setSavingSection(null);
      setSavedSections(prev => new Set(prev).add(section));
      return;
    }

    try {
      // ONE request for the entire section
      const res = await fetch(resolveApiUrl(`/api/content/${section}/bulk`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fields: changedFields }),
      });


      if (!res.ok) throw new Error('Save failed');

      const updatedSection = await res.json();
      
      // Update local React Context INSTANTLY and avoid browser cache issues
      updateSection(section, updatedSection);
      
      setSavedSections(prev => new Set(prev).add(section));
      setLocalEdits(prev => {
        const next = { ...prev };
        keys.forEach(({ key }) => delete next[compositeKey(section, key)]);
        return next;
      });
    } catch {
      alert('Failed to save. Please try again.');
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="ap-content-editor">
      {CONTENT_SECTIONS.map(({ section, label, keys }) => (
        <div className="ap-card" key={section}>
          <div className="ap-card-header">
            <h3>{label}</h3>
            <button
              className={`ap-btn-primary ${savedSections.has(section) ? 'saved' : ''}`}
              onClick={() => handleSaveSection(section, keys)}
              disabled={savingSection === section}
            >
              {savingSection === section
                ? 'Saving…'
                : savedSections.has(section)
                  ? <><Check size={14} style={{ marginRight: 6 }} /> Saved</>
                  : 'Save Changes'}
            </button>
          </div>

          <div className="ap-card-body ap-grid-2">
            {keys.map(({ key, label: fieldLabel, type }) => {
              const val = currentValue(section, key);
              const dbVal = get(section, key, '');
              const isDirty = localEdits[compositeKey(section, key)] !== undefined &&
                              localEdits[compositeKey(section, key)] !== dbVal;
              const isUploading = uploadingField === compositeKey(section, key);

              return (
                <div className={`ap-field ${isDirty ? 'dirty' : ''}`} key={key}>
                  <label>
                    {type === 'image' && <ImageIcon size={12} style={{ marginRight: 6, opacity: 0.5 }} />}
                    {fieldLabel}
                    {isDirty && <span className="ap-badge-dot" title="Unsaved change" />}
                  </label>

                  {type === 'image' && (
                    <div className="ap-image-field">
                      {val && (
                        <div className="ap-image-preview">
                          <img src={resolveMediaUrl(val)} alt={fieldLabel} onError={e => (e.currentTarget.style.display = 'none')} />
                        </div>
                      )}
                      <div className="ap-input-with-btn">

                        <input
                          type="text"
                          className="ap-input"
                          value={val}
                          onChange={e => handleChange(section, key, e.target.value)}
                          placeholder="Image URL..."
                        />
                        <label className="ap-btn-outline" style={{ cursor: isUploading ? 'wait' : 'pointer' }}>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            disabled={isUploading}
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(section, key, file);
                            }}
                          />
                          {isUploading ? '...' : 'Upload'}
                        </label>
                      </div>
                    </div>
                  )}

                  {type === 'text' && fieldLabel.toLowerCase().includes('paragraph') ? (
                    <textarea
                      className="ap-input ap-textarea"
                      value={val}
                      onChange={e => handleChange(section, key, e.target.value)}
                      rows={4}
                    />
                  ) : type === 'text' && (
                    <input
                      type="text"
                      className="ap-input"
                      value={val}
                      onChange={e => handleChange(section, key, e.target.value)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Main Admin Panel ─────────────────────────────────────────────────────────
const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const { token, user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<'dashboard' | 'products' | 'content' | 'orders' | 'customers' | 'security'>('dashboard');
  
  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Product Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', price: '', category: 'new', img: '', badge: '' });
  const [isUploadingProductImg, setIsUploadingProductImg] = useState(false);

  const handleProductImgUpload = async (file: File) => {
    if (!token) return;
    setIsUploadingProductImg(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch(resolveApiUrl('/api/upload'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData(prev => ({ ...prev, img: data.url }));
    } catch (err) {
      console.error(err);
      alert('Image upload failed. Please try a different file.');
    } finally {
      setIsUploadingProductImg(false);
    }
  };

  const fetchData = async () => {
    if (!token) return;
    try {
      const [prodRes, userRes, orderRes, auditRes] = await Promise.all([
        fetch(resolveApiUrl('/api/products')).catch(() => null),
        fetch(resolveApiUrl('/api/admin/users'), { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        fetch(resolveApiUrl('/api/admin/orders'), { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
        fetch(resolveApiUrl('/api/admin/audit-logs'), { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
      ]);
      
      const p = prodRes && prodRes.ok ? await prodRes.json().catch(() => []) : [];
      const u = userRes && userRes.ok ? await userRes.json().catch(() => []) : [];
      const o = orderRes && orderRes.ok ? await orderRes.json().catch(() => []) : [];
      const a = auditRes && auditRes.ok ? await auditRes.json().catch(() => []) : [];
      
      if (Array.isArray(p)) setProducts(p);
      if (Array.isArray(u)) setUsers(u);
      if (Array.isArray(o)) setOrders(o);
      if (Array.isArray(a)) setAuditLogs(a);
    } catch (err) {
      console.error('Error fetching admin data', err);
    }
  };

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen, activeMenu]);

  // Product Handlers
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = resolveApiUrl(editingId ? `/api/products/${editingId}` : '/api/products');
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to save product');
      fetchData();
      setEditingId(null);
      setFormData({ name: '', price: '', category: 'new', img: '', badge: '' });
    } catch (err) {
      console.error(err);
      alert('Error saving product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingId(product.id);
    setFormData({ name: product.name, price: product.price, category: product.category, img: product.img, badge: product.badge || '' });
    setActiveMenu('products');
  };


  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product forever?')) return;
    try {
      const res = await fetch(resolveApiUrl(`/api/products/${id}`), { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Order Handlers
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
  const handleOrderStatusChange = async (orderId: number, status: string) => {
    if (!token) return;
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(resolveApiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update order status');
      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: status as Order['status'] } : o)));
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Helper values
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const ongoingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'ongoing' | 'delivered' | 'cancelled'>('all');

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'pending') return o.status === 'pending';
    if (orderFilter === 'ongoing') return o.status === 'pending' || o.status === 'confirmed' || o.status === 'shipped';
    if (orderFilter === 'delivered') return o.status === 'delivered';
    if (orderFilter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

  const adminPanelContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="ap-overlay"
          initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
        >
          <div className="ap-container">
            {/* Sidebar */}
            <div className="ap-sidebar">
              <div className="ap-sidebar-brand">
                House of Varsh
                <span>HQ System Panel</span>
              </div>
              
              <nav className="ap-nav">
                <button className={`ap-nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveMenu('dashboard')}>
                  <LayoutDashboard size={18} /> Dashboard
                </button>
                <div className="ap-nav-divider">Managment</div>
                <button className={`ap-nav-item ${activeMenu === 'orders' ? 'active' : ''}`} onClick={() => setActiveMenu('orders')}>
                  <ShoppingBag size={18} /> Live Orders
                  {pendingOrdersCount > 0 && (
                    <span className="ap-nav-badge" style={{ background: '#ef4444', color: '#FFF' }}>
                      {pendingOrdersCount}
                    </span>
                  )}
                </button>
                <button className={`ap-nav-item ${activeMenu === 'customers' ? 'active' : ''}`} onClick={() => setActiveMenu('customers')}>
                  <UsersIcon size={18} /> Customers
                </button>
                <button className={`ap-nav-item ${activeMenu === 'products' ? 'active' : ''}`} onClick={() => setActiveMenu('products')}>
                  <Package size={18} /> Product Catalog
                </button>
                <button className={`ap-nav-item ${activeMenu === 'content' ? 'active' : ''}`} onClick={() => setActiveMenu('content')}>
                  <FileEdit size={18} /> Site Content Editor
                </button>
                <div className="ap-nav-divider">Security</div>
                <button className={`ap-nav-item ${activeMenu === 'security' ? 'active' : ''}`} onClick={() => setActiveMenu('security')} style={activeMenu === 'security' ? {} : { color: auditLogs.some(l => l.status === 'threat') ? '#ef4444' : undefined }}>
                  <ShieldAlert size={18} /> Audit Logs
                  {auditLogs.filter(l => l.status === 'threat').length > 0 && (
                    <span className="ap-nav-badge" style={{ background: '#ef4444' }}>
                      {auditLogs.filter(l => l.status === 'threat').length}
                    </span>
                  )}
                </button>
              </nav>
              
              <div className="ap-sidebar-footer">
                <div className="ap-user-info">
                  <strong>{user?.name}</strong>
                  <span>Super Admin</span>
                </div>
                <button className="ap-nav-item" style={{ color: '#ef4444', marginTop: '1rem' }} onClick={onClose}>
                  <LogOut size={18} /> Exit HQ
                </button>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="ap-main">
              <div className="ap-header">
                <div className="ap-header-left">
                  <button className="ap-back-btn" onClick={onClose} title="Return to website">
                    <ArrowLeft size={16} />
                    <span>Preview Site</span>
                  </button>
                  <div className="ap-header-divider" />
                  <h2>
                    {activeMenu === 'dashboard' && 'Executive Dashboard'}
                    {activeMenu === 'orders' && 'Real-time Order Tracking & Fulfillment'}
                    {activeMenu === 'customers' && 'Customer Intelligence'}
                    {activeMenu === 'products' && 'Product Matrix'}
                    {activeMenu === 'content' && 'Global Content Layout'}
                    {activeMenu === 'security' && 'Security & Audit Logs'}
                  </h2>
                </div>
                <div className="ap-header-actions">
                  <div className="ap-status-dot"></div> Live Network Connect
                </div>
              </div>

              <div className="ap-viewport" data-lenis-prevent>
                
                {/* ── DASHBOARD ── */}
                {activeMenu === 'dashboard' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="ap-dashboard">
                    <div className="ap-stats-grid">
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Net Realized Revenue</span>
                        <div className="ap-stat-value">&#8377;{totalRevenue.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Active / Ongoing Orders</span>
                        <div className="ap-stat-value" style={{ color: ongoingOrdersCount > 0 ? 'var(--ap-gold)' : undefined }}>
                          {ongoingOrdersCount}
                        </div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">New Action Required</span>
                        <div className="ap-stat-value" style={{ color: pendingOrdersCount > 0 ? '#ef4444' : '#10b981' }}>
                          {pendingOrdersCount}
                        </div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Completed Deliveries</span>
                        <div className="ap-stat-value" style={{ color: '#10b981' }}>
                          {deliveredOrdersCount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ap-dashboard-recent">
                      <div className="ap-card ap-interactive-hover" style={{ flex: 1 }}>
                        <div className="ap-card-header">
                          <h3>Recent Active Orders</h3>
                          <button className="ap-btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem' }} onClick={() => setActiveMenu('orders')}>
                            View All Live Orders →
                          </button>
                        </div>
                        <div className="ap-table-wrapper">
                          <table className="ap-table">
                            <thead>
                              <tr>
                                <th>Customer</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.slice(0, 5).map(o => (
                                <tr key={o.id}>
                                  <td><strong>{o.user_name || o.shipping_name || 'Guest'}</strong><br/><span style={{opacity: 0.5}}>{o.user_email}</span></td>
                                  <td>{(o.items || []).map(i => i.name).join(', ')}</td>
                                  <td>&#8377;{Number(o.total_amount).toLocaleString('en-IN')}</td>
                                  <td><span className={`ap-badge status-${o.status}`} style={{ borderRadius: '30px' }}>{o.status}</span></td>
                                </tr>
                              ))}
                              {orders.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', opacity: 0.5 }}>No recent activity to display.</td></tr>}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── ORDERS ── */}
                {activeMenu === 'orders' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="ap-card ap-interactive-hover">
                      <div className="ap-card-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                          <h3>Live Orders</h3>
                          <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>
                            {pendingOrdersCount} new order(s) waiting for review • {ongoingOrdersCount} active in fulfillment
                          </span>
                        </div>
                        <button className="ap-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={fetchData}>
                          &#8635; Refresh Orders
                        </button>
                      </div>

                      {/* Order Filter Tabs */}
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', padding: '1rem 1.4rem', borderBottom: '1px solid rgba(212,175,55,0.12)', background: 'rgba(10,1,3,0.4)' }}>
                        <button
                          className={`ap-btn-outline ${orderFilter === 'all' ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.74rem', borderRadius: '20px', background: orderFilter === 'all' ? 'var(--ap-gold)' : undefined, color: orderFilter === 'all' ? '#0A0103' : undefined, fontWeight: orderFilter === 'all' ? 700 : 500 }}
                          onClick={() => setOrderFilter('all')}
                        >
                          📋 All Orders ({orders.length})
                        </button>
                        <button
                          className={`ap-btn-outline ${orderFilter === 'pending' ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.74rem', borderRadius: '20px', background: orderFilter === 'pending' ? '#ef4444' : undefined, color: orderFilter === 'pending' ? '#FFF' : undefined, fontWeight: orderFilter === 'pending' ? 700 : 500 }}
                          onClick={() => setOrderFilter('pending')}
                        >
                          🔴 Action Required ({pendingOrdersCount})
                        </button>
                        <button
                          className={`ap-btn-outline ${orderFilter === 'ongoing' ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.74rem', borderRadius: '20px', background: orderFilter === 'ongoing' ? 'var(--ap-gold)' : undefined, color: orderFilter === 'ongoing' ? '#0A0103' : undefined, fontWeight: orderFilter === 'ongoing' ? 700 : 500 }}
                          onClick={() => setOrderFilter('ongoing')}
                        >
                          ⚡ Active Ongoing ({ongoingOrdersCount})
                        </button>
                        <button
                          className={`ap-btn-outline ${orderFilter === 'delivered' ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.74rem', borderRadius: '20px', background: orderFilter === 'delivered' ? '#10b981' : undefined, color: orderFilter === 'delivered' ? '#0A0103' : undefined, fontWeight: orderFilter === 'delivered' ? 700 : 500 }}
                          onClick={() => setOrderFilter('delivered')}
                        >
                          ✅ Delivered ({deliveredOrdersCount})
                        </button>
                        <button
                          className={`ap-btn-outline ${orderFilter === 'cancelled' ? 'active' : ''}`}
                          style={{ padding: '0.4rem 0.9rem', fontSize: '0.74rem', borderRadius: '20px', background: orderFilter === 'cancelled' ? '#6b7280' : undefined, color: orderFilter === 'cancelled' ? '#FFF' : undefined, fontWeight: orderFilter === 'cancelled' ? 700 : 500 }}
                          onClick={() => setOrderFilter('cancelled')}
                        >
                          ❌ Cancelled ({cancelledOrdersCount})
                        </button>
                      </div>

                      <div className="ap-table-wrapper">
                        <table className="ap-table">
                          <thead>
                            <tr>
                              <th>Order #</th>
                              <th>Customer</th>
                              <th>Items</th>
                              <th>Shipping Address</th>
                              <th>Total</th>
                              <th>Payment</th>
                              <th>Status Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.map(o => (
                              <tr key={o.id} style={{ background: o.status === 'pending' ? 'rgba(239, 68, 68, 0.06)' : undefined }}>
                                <td style={{fontFamily: 'monospace', color: 'var(--ap-gold-light)'}}>
                                  <strong>#{o.id.toString().padStart(4, '0')}</strong>
                                  <br/><span style={{opacity: 0.6, fontSize: '0.72rem'}}>{new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </td>
                                <td>
                                  <strong>{o.user_name || o.shipping_name || 'Valued Client'}</strong>
                                  <br/><span style={{opacity: 0.6, fontSize: '0.78rem'}}>{o.user_email || '—'}</span>
                                </td>
                                <td>
                                  {(o.items || []).map((item, idx) => (
                                    <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                                      {item.img && (item.img.endsWith('.mp4') || item.img.endsWith('.webm')) ? (
                                        <video src={resolveMediaUrl(item.img)} autoPlay loop muted playsInline style={{width: '34px', height: '34px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--ap-gold-border)'}} />
                                      ) : (
                                        <img
                                          src={resolveMediaUrl(item.img) || '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg'}
                                          alt={item.name}
                                          style={{width: '34px', height: '34px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--ap-gold-border)'}}
                                          onError={(e) => { (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg'; }}
                                        />
                                      )}
                                      <div style={{ lineHeight: '1.2' }}>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ap-text-light)' }}>{item.name}</div>
                                        <div style={{ fontSize: '0.74rem', color: 'var(--ap-gold)' }}>{item.price}</div>
                                      </div>
                                    </div>
                                  ))}
                                </td>
                                <td style={{ fontSize: '0.82rem', maxWidth: '200px' }}>
                                  <strong style={{ color: 'var(--ap-gold-light)' }}>{o.shipping_name}</strong><br/>
                                  <span style={{ color: 'var(--ap-text-light)' }}>📞 {o.shipping_phone}</span><br/>
                                  <span style={{ opacity: 0.75, display: 'block', marginTop: '2px', lineHeight: '1.3' }}>
                                    {o.shipping_address}{o.shipping_city ? `, ${o.shipping_city}` : ''} {o.shipping_pincode ? `— ${o.shipping_pincode}` : ''}
                                  </span>
                                  {o.notes && (
                                    <div style={{ marginTop: '4px', fontSize: '0.72rem', color: 'var(--ap-gold)', fontStyle: 'italic' }}>
                                      Note: {o.notes}
                                    </div>
                                  )}
                                </td>
                                <td><strong style={{ color: 'var(--ap-gold-light)', fontSize: '0.95rem' }}>&#8377;{Number(o.total_amount).toLocaleString('en-IN')}</strong></td>
                                <td>
                                  <span style={{ textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(212,175,55,0.12)', color: 'var(--ap-gold)' }}>
                                    {o.payment_method || 'COD'}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', minWidth: '130px' }}>
                                    <select
                                      value={o.status}
                                      disabled={updatingOrderId === o.id}
                                      onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                                      className={`ap-badge ap-status-select status-${o.status}`}
                                      style={{ width: '100%', cursor: 'pointer' }}
                                    >
                                      <option value="pending">⏳ Pending Review</option>
                                      <option value="confirmed">✓ Confirmed</option>
                                      <option value="shipped">🚚 Shipped</option>
                                      <option value="delivered">🎉 Delivered</option>
                                      <option value="cancelled">✕ Cancelled</option>
                                    </select>
                                    
                                    {/* 1-Click Quick Progression Buttons */}
                                    {o.status === 'pending' && (
                                      <button
                                        className="ap-btn-primary"
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', width: '100%' }}
                                        disabled={updatingOrderId === o.id}
                                        onClick={() => handleOrderStatusChange(o.id, 'confirmed')}
                                      >
                                        ✓ Accept Order
                                      </button>
                                    )}
                                    {o.status === 'confirmed' && (
                                      <button
                                        className="ap-btn-primary"
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', width: '100%', background: '#3b82f6' }}
                                        disabled={updatingOrderId === o.id}
                                        onClick={() => handleOrderStatusChange(o.id, 'shipped')}
                                      >
                                        🚚 Mark Shipped
                                      </button>
                                    )}
                                    {o.status === 'shipped' && (
                                      <button
                                        className="ap-btn-primary"
                                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.72rem', width: '100%', background: '#10b981' }}
                                        disabled={updatingOrderId === o.id}
                                        onClick={() => handleOrderStatusChange(o.id, 'delivered')}
                                      >
                                        🎉 Mark Delivered
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                              <tr>
                                <td colSpan={7} style={{ textAlign: 'center', opacity: 0.6, padding: '3.5rem' }}>
                                  No orders matching the selected filter ({orderFilter}).
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── CUSTOMERS ── */}
                {activeMenu === 'customers' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    {/* Summary row */}
                    <div className="ap-stats-grid" style={{ marginBottom: '2.5rem' }}>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Total Clients</span>
                        <div className="ap-stat-value">{users.length}</div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Google Accounts</span>
                        <div className="ap-stat-value">{users.filter(u => u.auth_method === 'google').length}</div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Email Accounts</span>
                        <div className="ap-stat-value">{users.filter(u => u.auth_method === 'email').length}</div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Total Logins</span>
                        <div className="ap-stat-value">{users.reduce((s, u) => s + (u.login_count || 0), 0)}</div>
                      </div>
                    </div>

                    <div className="ap-card ap-interactive-hover">
                      <div className="ap-card-header">
                        <h3>Client Intelligence Database</h3>
                        <button className="ap-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={fetchData}>↺ Refresh</button>
                      </div>
                      <div className="ap-table-wrapper">
                        <table className="ap-table">
                          <thead>
                            <tr>
                              <th>CID</th>
                              <th>Full Name</th>
                              <th>Email Address</th>
                              <th>Role</th>
                              <th>Auth Method</th>
                              <th>Joined</th>
                              <th>Last Login</th>
                              <th>Logins</th>
                              <th>Last IP</th>
                              <th>Device / Browser</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map(u => {
                              // Parse device string to a short readable label
                              const deviceShort = u.last_device
                                ? u.last_device.replace(/\(.*?\)/g, '').trim().substring(0, 50)
                                : '—';
                              return (
                                <tr key={u.id}>
                                  <td style={{ fontFamily: 'monospace', opacity: 0.6, fontSize: '0.78rem' }}>#{u.id}</td>
                                  <td><strong>{u.name || '—'}</strong></td>
                                  <td style={{ fontSize: '0.87rem' }}>{u.email}</td>
                                  <td>
                                    <span className={`ap-badge ${u.role === 'admin' ? 'admin' : 'standard'}`}>
                                      {u.role?.toUpperCase() || 'USER'}
                                    </span>
                                  </td>
                                  <td>
                                    {u.auth_method === 'google'
                                      ? <span style={{ color: '#4285F4', fontWeight: 600, fontSize: '0.82rem' }}>◉ Google</span>
                                      : <span style={{ opacity: 0.7, fontSize: '0.82rem' }}>✉ Email</span>}
                                  </td>
                                  <td style={{ fontSize: '0.8rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
                                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                  </td>
                                  <td style={{ fontSize: '0.8rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
                                    {u.last_login ? new Date(u.last_login).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                                  </td>
                                  <td>
                                    <span style={{ background: 'rgba(180,130,70,0.1)', color: 'var(--ap-accent)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600 }}>
                                      {u.login_count || 0}×
                                    </span>
                                  </td>
                                  <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', opacity: 0.6 }}>{u.last_ip || '—'}</td>
                                  <td style={{ fontSize: '0.78rem', opacity: 0.6, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={u.last_device || ''}>
                                    {deviceShort}
                                  </td>
                                </tr>
                              );
                            })}
                            {users.length === 0 && (
                              <tr><td colSpan={10} style={{ textAlign: 'center', opacity: 0.5, padding: '3rem' }}>No clients registered yet.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}


                {/* ── PRODUCTS ── */}
                {activeMenu === 'products' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="ap-grid-columns">
                    {/* Form Component */}
                    <div className="ap-card ap-interactive-hover" style={{ height: 'fit-content' }}>
                      <div className="ap-card-header">
                        <h3>{editingId ? 'Modify Matrix' : 'Deploy New Asset'}</h3>
                      </div>
                      <div className="ap-card-body">
                        <form onSubmit={handleProductSubmit} className="ap-form">
                          <div className="ap-field">
                            <label>Product Name</label>
                            <input type="text" className="ap-input" placeholder="e.g. Royal Silk Banarasi Saree" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                          </div>
                          <div className="ap-grid-2">
                            <div className="ap-field">
                              <label>Price (INR)</label>
                              <input type="text" className="ap-input" placeholder="₹ 1,25,000" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                            </div>
                            <div className="ap-field">
                              <label>Collection / Category</label>
                              <select className="ap-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="new">✨ Newly Launched</option>
                                <option value="bestseller">🏆 Best Seller</option>
                                <option value="bridal">👰 Bridal Couture Collection</option>
                                <option value="silk">🥻 Premium Silk Sarees</option>
                                <option value="gown">👗 Designer Evening Gowns</option>
                                <option value="contemporary">✨ Contemporary Ethnic Wear</option>
                                <option value="festive">🎉 Festive & Wedding Collection</option>
                              </select>
                            </div>
                          </div>

                          <div className="ap-field">
                            <label>Image Source / Upload</label>
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <input type="text" className="ap-input" placeholder="/house_of_varsh-... or https://..." value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} required />
                              <label className="ap-btn-outline" style={{ margin: 0, padding: '0.65rem 1rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                {isUploadingProductImg ? 'Uploading…' : '📁 Browse'}
                                <input type="file" accept="image/*,video/*" style={{ display: 'none' }} disabled={isUploadingProductImg} onChange={e => { if (e.target.files?.[0]) handleProductImgUpload(e.target.files[0]); }} />
                              </label>
                            </div>
                            {formData.img && (
                              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                {formData.img.endsWith('.mp4') || formData.img.endsWith('.webm') ? (
                                  <video src={resolveMediaUrl(formData.img)} autoPlay loop muted playsInline style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--ap-gold)' }} />
                                ) : (
                                  <img src={resolveMediaUrl(formData.img)} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--ap-gold)' }} onError={(e) => { (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg'; }} />
                                )}
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Media ready</span>
                              </div>
                            )}
                          </div>
                          <div className="ap-field">
                            <label>Highlight Badge (Optional)</label>
                            <input type="text" className="ap-input" placeholder="e.g. LIMITED EDITION, COUTURE" value={formData.badge} onChange={e => setFormData({ ...formData, badge: e.target.value })} />
                          </div>
                          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="ap-btn-primary" style={{ flex: 1 }}>{editingId ? 'Update Product' : 'Publish Product'}</button>
                            {editingId && (
                              <button type="button" className="ap-btn-outline" onClick={() => { setEditingId(null); setFormData({ name: '', price: '', category: 'new', img: '', badge: '' }); }}>Cancel</button>
                            )}
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Products List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {products.map(product => (
                        <div className="ap-product-card" key={product.id}>
                          {product.img && (product.img.endsWith('.mp4') || product.img.endsWith('.webm') || product.img.endsWith('.mov')) ? (
                            <video src={resolveMediaUrl(product.img)} autoPlay loop muted playsInline style={{ width: '68px', height: '68px', objectFit: 'cover', borderRadius: '8px' }} />
                          ) : (
                            <img
                              src={resolveMediaUrl(product.img)}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg';
                              }}
                            />
                          )}

                          <div className="ap-info">
                            <h4>{product.name}</h4>
                            <span>{product.price} // {product.category?.toUpperCase() || 'NEW'}</span>
                          </div>
                          <div className="ap-actions">
                            <button className="ap-btn-outline" onClick={() => handleEditProduct(product)}>EDIT</button>
                            <button className="ap-btn-danger" onClick={() => handleDeleteProduct(product.id)}>DELETE</button>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className="ap-card" style={{ padding: '3rem', textAlign: 'center', opacity: 0.6 }}>
                          No products found. Add your first piece using the form on the left.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}


                {/* ── CONTENT ── */}
                {activeMenu === 'content' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <SiteContentEditor />
                  </motion.div>
                )}

                {/* ── SECURITY LOGS ── */}
                {activeMenu === 'security' && (
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="ap-security-summary">
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Total Events</span>
                        <div className="ap-stat-value">{auditLogs.length}</div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Successful Logins</span>
                        <div className="ap-stat-value" style={{ color: '#10b981' }}>
                          {auditLogs.filter(l => l.status === 'success').length}
                        </div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Failed Attempts</span>
                        <div className="ap-stat-value" style={{ color: '#f59e0b' }}>
                          {auditLogs.filter(l => l.status === 'failed').length}
                        </div>
                      </div>
                      <div className="ap-stat-card ap-interactive-hover">
                        <span className="ap-stat-label">Threat Detections</span>
                        <div className="ap-stat-value" style={{ color: '#ef4444' }}>
                          {auditLogs.filter(l => l.status === 'threat').length}
                        </div>
                      </div>
                    </div>

                    <div className="ap-card ap-interactive-hover">
                      <div className="ap-card-header">
                        <h3>Live Activity Feed</h3>
                        <button className="ap-btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }} onClick={fetchData}>↺ Refresh</button>
                      </div>
                      <div className="ap-table-wrapper">
                        <table className="ap-table">
                          <thead>
                            <tr>
                              <th>Timestamp</th>
                              <th>Email / Actor</th>
                              <th>Event</th>
                              <th>IP Address</th>
                              <th>Details</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {auditLogs.map(log => (
                              <tr key={log.id}>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', opacity: 0.7, whiteSpace: 'nowrap' }}>
                                  {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td><strong>{log.email || '—'}</strong></td>
                                <td>{log.action}</td>
                                <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.ip_address || '—'}</td>
                                <td style={{ opacity: 0.7, fontSize: '0.85rem' }}>{log.details || '—'}</td>
                                <td>
                                  <span className={`ap-badge ${
                                    log.status === 'success' ? 'success' :
                                    log.status === 'failed' ? 'warning' : 'threat'
                                  }`}>
                                    {log.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {auditLogs.length === 0 && (
                              <tr>
                                <td colSpan={6} style={{ textAlign: 'center', opacity: 0.5, padding: '3rem' }}>
                                  No activity recorded yet. Events will appear here after logins.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return ReactDOM.createPortal(adminPanelContent, document.body);
};

export default AdminPanel;
