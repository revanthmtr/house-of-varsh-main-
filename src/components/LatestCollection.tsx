import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSiteContent } from '../context/SiteContentContext';
import { DEFAULT_PRODUCTS, type Product } from '../data/defaultProducts';
import { resolveMediaUrl } from '../utils/api';
import './LatestCollection.css';


const LatestCollection = () => {
  const [activeTab, setActiveTab] = useState('new');
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart();
  const { get } = useSiteContent();

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      })
      .catch(() => {
        // Fallback to official Instagram default products
        setProducts(DEFAULT_PRODUCTS);
      });
  }, []);

  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter(p => p.category === activeTab);

  return (
    <section className="section latest-collection" id="new" aria-label="Shop Best Selling Luxury Sarees and Newly Launched Designer Collections Online">
      <div className="container">
        <div className="section-header text-center">
          <div className="lc-eyebrow">
            <span className="lc-eyebrow-line" />
            <span className="lc-eyebrow-text">{get('latest_collection', 'eyebrow_label', 'Best Sellers & New Launches')}</span>
            <span className="lc-eyebrow-line" />
          </div>

          <motion.h2
            className="lc-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            Shop the Latest{' '}
            <span className="lc-heading-italic">
              {get('latest_collection', 'section_title_italic', 'Luxury Collections')}
            </span>
          </motion.h2>

          <div className="tabs" role="tablist" aria-label="Browse luxury saree collections by category">
            <div
              className={`tab ${activeTab === 'new' ? 'active' : ''}`}
              onClick={() => setActiveTab('new')}
            >
              {get('latest_collection', 'tab_1_label', 'Newly Launched Sarees')}
            </div>
            <div
              className={`tab ${activeTab === 'bestseller' ? 'active' : ''}`}
              onClick={() => setActiveTab('bestseller')}
            >
              {get('latest_collection', 'tab_2_label', 'Best Selling Sarees')}
            </div>
          </div>
        </div>

        <div className="collection-layout">
          <div className="product-grid">
            {filteredProducts.map((product, idx) => (
              <motion.div
                className="product-card"
                key={product.id}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.25, 1, 0.5, 1] }}
              >
                <div className="product-image-container">
                  {product.badge && <div className="product-badge">{product.badge}</div>}
                  
                  <button 
                    className={`wishlist-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                    onClick={(e) => toggleWishlist(product.id, e)}
                    aria-label="Add to wishlist"
                  >
                    <Heart size={16} fill={wishlist.includes(product.id) ? 'var(--gold)' : 'none'} strokeWidth={1.5} />
                  </button>

                  {product.img.endsWith('.mp4') || product.img.endsWith('.webm') || product.img.endsWith('.mov') ? (
                    <video 
                      src={resolveMediaUrl(product.img)} 
                      className="product-image" 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      preload="metadata"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  ) : (
                    <img 
                      src={resolveMediaUrl(product.img)} 
                      alt={product.name} 
                      className="product-image" 
                      loading="lazy" 
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg';
                      }}
                    />
                  )}

                  
                  <div
                    className="quick-add-overlay"
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ 
                        product_id: product.id, 
                        name: product.name, 
                        price: product.price, 
                        img: product.img, 
                        category: product.category 
                      });
                    }}
                  >
                    <ShoppingBag size={14} />
                    <span>Quick Add to Bag</span>
                  </div>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">{product.price}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="collection-info-box" key={activeTab}>
            <p className="collection-description">
              {activeTab === 'new'
                ? get('latest_collection', 'description_new',       'Discover our newest luxury creations, masterfully crafted to embody modern opulence and timeless grace.')
                : get('latest_collection', 'description_bestseller', 'Our most coveted masterpieces, celebrated by connoisseurs for their intricate details and regal elegance.')}
            </p>

            <div className="elegant-underline">
              <img
                src={get('latest_collection', 'divider_image', '/underline_border.png')}
                alt="Elegant Divider"
                className="custom-divider"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LatestCollection;
