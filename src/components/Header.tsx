import { useEffect, useState, useRef } from 'react';
import { Search, ShoppingBag, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSiteContent } from '../context/SiteContentContext';
import AuthModal from './AuthModal';
import AdminPanel from './AdminPanel';
import './Header.css';

const Header = () => {
  const [scrolled, setScrolled]       = useState(false);
  const [isAuthOpen, setIsAuthOpen]   = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const menuRef                        = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuth();
  const { cart, setIsCartOpen } = useCart();
  const { get } = useSiteContent();

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Avatar initials
  const initials = user
    ? (user.name || user.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
  };

  const handleOpenAdmin = () => {
    setMenuOpen(false);
    setIsAdminOpen(true);
  };

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Left nav */}
      <div className="nav-links">
        <a href={get('header', 'nav_link_1_href', '#new')}         className="nav-link">{get('header', 'nav_link_1_label', 'New Arrivals')}</a>
        <a href={get('header', 'nav_link_2_href', '#collections')} className="nav-link">{get('header', 'nav_link_2_label', 'Collections')}</a>
        <a href={get('header', 'nav_link_3_href', '#story')}       className="nav-link">{get('header', 'nav_link_3_label', 'Our Story')}</a>
      </div>

      {/* Centre logo */}
      <div className="logo">
        <img src={get('header', 'logo_src', '/chinni_logo.png')} alt="House of Varsh" className="logo-img" />
      </div>

      {/* Right actions */}
      <div className="header-actions">
        <Search className="header-icon" size={20} />

        {user ? (
          /* ── User dropdown ── */
          <div className="user-menu-wrap" ref={menuRef}>
            <button
              className={`user-avatar-btn ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Account menu"
            >
              <span className="user-avatar">{initials}</span>
              <ChevronDown className="user-chevron" size={12} />
            </button>

            {menuOpen && (
              <div className="user-dropdown">
                {/* Identity block */}
                <div className="user-dropdown-header">
                  <span className="user-dropdown-name">{user.name || user.email}</span>
                  <span className="user-dropdown-email">{user.email}</span>
                  {user.role === 'admin' && (
                    <span className="user-dropdown-badge">Admin</span>
                  )}
                </div>

                <div className="user-dropdown-divider" />

                {/* Admin Panel link — only for admins */}
                {user.role === 'admin' && (
                  <button className="user-dropdown-item" onClick={handleOpenAdmin}>
                    <LayoutDashboard size={15} />
                    <span>Admin Panel</span>
                  </button>
                )}

                {/* Logout */}
                <button className="user-dropdown-item logout" onClick={handleLogout}>
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ── Sign In icon ── */
          <button
            className="header-sign-in-btn"
            onClick={() => setIsAuthOpen(true)}
            aria-label="Sign in"
          >
            <User size={18} />
            <span>Sign In</span>
          </button>
        )}

        {/* Cart */}
        <div style={{ position: 'relative' }}>
          <ShoppingBag className="header-icon" size={20} onClick={() => setIsCartOpen(true)} />
          {cart.length > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              background: 'var(--accent)', color: '#fff',
              fontSize: '10px', width: '15px', height: '15px',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none'
            }}>
              {cart.length}
            </span>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen}  onClose={() => setIsAuthOpen(false)} />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </header>
  );
};

export default Header;
