import { useEffect, useState, useRef } from 'react';
import { Search, ShoppingBag, User, LogOut, LayoutDashboard, ChevronDown, Menu, X } from 'lucide-react';
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
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

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileNavOpen]);

  // Avatar initials
  const initials = user
    ? (user.name || user.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const handleLogout = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    logout();
  };

  const handleOpenAdmin = () => {
    setMenuOpen(false);
    setMobileNavOpen(false);
    setIsAdminOpen(true);
  };

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Mobile Hamburger Toggle */}
      <button 
        className="mobile-menu-btn" 
        onClick={() => setMobileNavOpen(v => !v)}
        aria-label="Toggle navigation menu"
      >
        {mobileNavOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Left nav */}
      <nav className="nav-links" aria-label="Main navigation — Browse House of Varsh luxury collections">
        <a href={get('header', 'nav_link_1_href', '#new')}         className="nav-link">{get('header', 'nav_link_1_label', 'New Arrivals')}</a>
        <a href={get('header', 'nav_link_2_href', '#collections')} className="nav-link">{get('header', 'nav_link_2_label', 'Collections')}</a>
        <a href={get('header', 'nav_link_3_href', '#story')}       className="nav-link">{get('header', 'nav_link_3_label', 'Our Story')}</a>
      </nav>

      {/* Centre logo */}
      <div className="logo">
        <a href="/" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={get('header', 'logo_src', '/chinni_logo.png')} alt="House of Varsh — Premium Handcrafted Luxury Sarees & Indian Couture" className="logo-img" width="150" height="50" />
        </a>
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
            <span className="sign-in-text">Sign In</span>
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

      {/* ── Slide-out Mobile Navigation Drawer ── */}
      <div className={`mobile-nav-drawer ${mobileNavOpen ? 'open' : ''}`}>
        <div className="mobile-nav-overlay" onClick={closeMobileNav} />
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <img src={get('header', 'logo_src', '/chinni_logo.png')} alt="House of Varsh" className="mobile-nav-logo" />
            <button className="mobile-nav-close" onClick={closeMobileNav} aria-label="Close menu">
              <X size={22} />
            </button>
          </div>

          <div className="mobile-nav-links">
            <a href={get('header', 'nav_link_1_href', '#new')} onClick={closeMobileNav} className="mobile-nav-link">
              {get('header', 'nav_link_1_label', 'New Arrivals')}
            </a>
            <a href={get('header', 'nav_link_2_href', '#collections')} onClick={closeMobileNav} className="mobile-nav-link">
              {get('header', 'nav_link_2_label', 'Collections')}
            </a>
            <a href={get('header', 'nav_link_3_href', '#story')} onClick={closeMobileNav} className="mobile-nav-link">
              {get('header', 'nav_link_3_label', 'Our Story')}
            </a>
          </div>

          <div className="mobile-nav-footer">
            {user ? (
              <div className="mobile-user-box">
                <div className="mobile-user-info">
                  <span className="mobile-user-name">{user.name || user.email}</span>
                  <span className="mobile-user-email">{user.email}</span>
                  {user.role === 'admin' && <span className="mobile-admin-badge">Admin</span>}
                </div>
                {user.role === 'admin' && (
                  <button className="mobile-btn-action" onClick={handleOpenAdmin}>
                    <LayoutDashboard size={16} />
                    <span>Admin Panel</span>
                  </button>
                )}
                <button className="mobile-btn-action logout" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button className="mobile-sign-in-btn" onClick={() => { closeMobileNav(); setIsAuthOpen(true); }}>
                <User size={18} />
                <span>Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen}  onClose={() => setIsAuthOpen(false)} />
      <AdminPanel isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </header>
  );
};

export default Header;
