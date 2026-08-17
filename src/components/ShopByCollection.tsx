import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSiteContent } from '../context/SiteContentContext';
import { DEFAULT_PRODUCTS, type Product } from '../data/defaultProducts';
import { resolveMediaUrl } from '../utils/api';
import './ShopByCollection.css';


const defaultNewArrivals = DEFAULT_PRODUCTS.filter(p => p.category === 'new');

const ShopByCollection = () => {
  const [products, setProducts] = useState<Product[]>(defaultNewArrivals);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart();
  const { get } = useSiteContent();

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error('API error');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const newArrivals = data.filter((p: Product) => p.category === 'new');
          if (newArrivals.length > 0) {
            setProducts(newArrivals);
          }
        }
      })
      .catch(() => {
        setProducts(defaultNewArrivals);
      });
  }, []);

  const toggleWishlist = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="shop-collection" id="collections" aria-label="New Arrivals — Shop Latest Handcrafted Luxury Sarees and Designer Lehengas Online">
      <div className="shimmer-overlay"></div>
      
      <div className="shop-collection-container">
        <div className="shop-collection-header">
          <div className="shop-collection-eyebrow">
            <span className="shop-collection-eyebrow-line"></span>
            <span className="shop-collection-eyebrow-text">New Season — Latest Designer Collection</span>
            <span className="shop-collection-eyebrow-line"></span>
          </div>
          
          <motion.h2
            className="shop-collection-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            New <span className="italic text-gradient-gold">Arrivals</span> — Luxury Sarees & Designer Wear
          </motion.h2>
          
          <p className="shop-collection-subtitle">
            {get('shop_by_collection', 'section_subtitle', 'Discover our newest luxury sarees, designer lehengas, and handcrafted couture — freshly arrived from the House of Varsh atelier. Each piece is handwoven with premium silks and artisan embroidery.')}
          </p>
        </div>

        <div className="new-arrivals-grid">
          {products.map((product) => (
            <motion.article
              itemScope
              itemType="https://schema.org/Product"
              key={product.id}
              className="product-card group"
              initial={{ opacity: 0.9, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '200px' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >

              <div className="product-image-wrapper">
                {product.img.endsWith('.mp4') || product.img.endsWith('.webm') || product.img.endsWith('.mov') ? (
                  <video
                    src={resolveMediaUrl(product.img)}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    className="product-image"
                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  />
                ) : (
                  <img
                    src={resolveMediaUrl(product.img)}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="product-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg';
                    }}
                  />
                )}

                
                {product.badge && (
                  <span className="product-card-badge">
                    {product.badge}
                  </span>
                )}
                
                <button
                  onClick={(e) => toggleWishlist(product.id, e)}
                  aria-label="Wishlist"
                  className="wishlist-btn"
                >
                  <Heart
                    size={15}
                    fill={wishlist.includes(product.id) ? 'var(--gold)' : 'none'}
                    stroke={wishlist.includes(product.id) ? 'var(--gold)' : 'currentColor'}
                    strokeWidth={1.5}
                  />
                </button>

                <div className="quick-add-container">
                  <button
                    onClick={() =>
                      addToCart({
                        product_id: product.id,
                        name: product.name,
                        price: product.price,
                        img: product.img,
                        category: product.category,
                      })
                    }
                    className="quick-add-btn"
                  >
                    <ShoppingBag size={13} />
                    Quick Add
                  </button>
                </div>
              </div>

              <div className="product-details">
                <h3 className="product-title" itemProp="name">
                  {product.name}
                </h3>
                <p className="product-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="priceCurrency" content="INR" />
                  <span itemProp="price">{product.price}</span>
                  <meta itemProp="availability" content="https://schema.org/InStock" />
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCollection;
