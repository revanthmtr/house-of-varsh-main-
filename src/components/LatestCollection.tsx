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

  const COLLECTION_TABS = [
    { id: 'all',          label: get('latest_collection', 'tab_all_label', 'All Pieces') },
    { id: 'new',          label: get('latest_collection', 'tab_1_label', 'Newly Launched') },
    { id: 'bestseller',   label: get('latest_collection', 'tab_2_label', 'Best Sellers') },
    { id: 'bridal',       label: get('latest_collection', 'tab_bridal_label', 'Bridal Couture') },
    { id: 'silk',         label: get('latest_collection', 'tab_silk_label', 'Silk Sarees') },
    { id: 'gown',         label: get('latest_collection', 'tab_gown_label', 'Designer Gowns') },
    { id: 'contemporary', label: get('latest_collection', 'tab_contemporary_label', 'Contemporary') },
    { id: 'festive',      label: get('latest_collection', 'tab_festive_label', 'Festive Wear') },
  ];

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(p => p.category === activeTab);

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
            {COLLECTION_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={activeTab === tab.id}
                aria-controls="product-catalog-grid"
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>


        <div className="collection-layout">
          <div className="product-grid" id="product-catalog-grid" role="region" aria-labelledby={`tab-${activeTab}`}>

            {filteredProducts.map((product) => (
              <motion.div
                className="product-card"
                key={product.id}
                initial={{ opacity: 0.9, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
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
