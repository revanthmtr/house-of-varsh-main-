import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';
import { DEFAULT_PRODUCTS, type Product } from '../data/defaultProducts';
import { resolveMediaUrl } from '../utils/api';
import './ShopByCollection.css';

const defaultNewArrivals = DEFAULT_PRODUCTS.filter(p => p.category === 'new');

const ShopByCollection = () => {
  const [products, setProducts] = useState<Product[]>(defaultNewArrivals);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { get } = useSiteContent();

  const isAdmin = user?.role === 'admin';


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

              <div className={`product-image-wrapper ${product.is_sold_out ? 'product-image-sold-out' : ''}`}>
                {product.img.endsWith('.mp4') || product.img.endsWith('.webm') || product.img.endsWith('.mov') ? (
                  <video
                    src={resolveMediaUrl(product.img)}
                    poster="/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg"
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="product-image"
                    style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block', backgroundColor: '#2A0108' }}
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

                {product.is_sold_out ? (
                  <span className="product-card-badge sold-out-badge">
                    SOLD OUT
                  </span>
                ) : product.badge ? (
                  <span className="product-card-badge">
                    {product.badge}
                  </span>
                ) : null}
                
                {!isAdmin && (
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
                )}
              </div>

              <div className="product-details">
                <h3 className="product-title" itemProp="name">
                  {product.name}
                </h3>
                <p className="product-price" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="priceCurrency" content="INR" />
                  <span itemProp="price">{product.price}</span>
                  <meta itemProp="availability" content={product.is_sold_out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'} />
                </p>

                {!isAdmin && (
                  <button
                    type="button"
                    className={`product-card-add-btn ${product.is_sold_out ? 'product-card-sold-out-btn' : ''}`}
                    disabled={product.is_sold_out}
                    onClick={() => {
                      if (product.is_sold_out) return;
                      addToCart({
                        product_id: product.id,
                        name: product.name,
                        price: product.price,
                        img: product.img,
                        category: product.category,
                      });
                    }}
                    aria-label={product.is_sold_out ? `${product.name} is Sold Out` : `Add ${product.name} to shopping bag`}
                  >
                    {product.is_sold_out ? (
                      <span>Sold Out</span>
                    ) : (
                      <>
                        <ShoppingBag size={13} />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>
                )}
              </div>


            </motion.article>

          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByCollection;
