import { motion } from 'framer-motion';
import { useSiteContent } from '../context/SiteContentContext';
import './PhotoGallery.css';

const PhotoGallery = () => {
  const { get } = useSiteContent();

  const collections = [
    {
      id: 'bridal',
      title: 'Bridal Couture Collection',
      tag: 'Handcrafted bridal lehengas & wedding sarees',
      image: get('photo_gallery', 'photo_1_src', '/house_of_varsh-2026-08-12/688713427_18071142515422704_1852034660631262620_n.jpg'),
      gridArea: 'bridal',
      alt: 'House of Varsh luxury bridal couture — handcrafted wedding lehengas and bridal sarees'
    },
    {
      id: 'saree',
      title: 'Premium Silk Sarees',
      tag: 'Banarasi, Kanjivaram & tissue silk',
      image: get('photo_gallery', 'photo_2_src', '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg'),
      gridArea: 'saree',
      alt: 'House of Varsh premium silk saree collection — Banarasi, Kanjivaram, and tissue silk sarees'
    },
    {
      id: 'gown',
      title: 'Designer Evening Gowns',
      tag: 'Contemporary luxury eveningwear',
      image: get('photo_gallery', 'photo_3_src', '/house_of_varsh-2026-08-12/689071500_18071142485422704_6264482426883037784_n.jpg'),
      gridArea: 'gown',
      alt: 'House of Varsh designer evening gowns — luxury contemporary Indian fashion'
    },
    {
      id: 'contemporary',
      title: 'Contemporary Ethnic Wear',
      tag: 'Modern Indo-western silhouettes',
      image: get('photo_gallery', 'photo_4_src', '/house_of_varsh-2026-08-12/691885391_18071480576422704_2515087678437372300_n.jpg'),
      gridArea: 'contemporary',
      alt: 'House of Varsh contemporary ethnic wear — modern Indo-western designer fashion'
    },
    {
      id: 'festive',
      title: 'Festive & Wedding Collection',
      tag: 'Royal celebration wear',
      image: get('photo_gallery', 'photo_5_src', '/house_of_varsh-2026-08-12/692840788_18071925344422704_6663684273133038371_n.jpg'),
      gridArea: 'festive',
      alt: 'House of Varsh festive collection — luxury wedding and celebration wear'
    },
  ];

  return (
    <section className="fc-section" id="gallery" aria-label="Featured Luxury Fashion Collections — Bridal, Sarees, Gowns, and Festive Wear">
      <div className="fc-container">

        {/* ── Header row ── */}
        <motion.div
          className="fc-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="fc-header-left">
            <div className="fc-eyebrow">
              <span className="fc-eyebrow-line" />
              <span className="fc-eyebrow-text">Shop by Category — Luxury Fashion Collections</span>
              <span className="fc-eyebrow-line" />
            </div>
            <h2 className="fc-title">
              Shop Our <span className="fc-title-italic">Luxury Collections</span>
            </h2>
          </div>
          <a href="#collections" className="fc-view-all" aria-label="Browse all House of Varsh luxury saree and couture collections">
            Shop All Collections →
          </a>
        </motion.div>

        {/* ── Masonry grid ── */}
        <div className="fc-grid">
          {collections.map((col, index) => (
            <motion.a
              key={col.id}
              href="#collections"
              className={`fc-card fc-card--${col.id}`}
              initial={{ opacity: 0.9, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '200px' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >

              {col.image.endsWith('.mp4') || col.image.endsWith('.webm') || col.image.endsWith('.mov') ? (
                <video src={col.image} autoPlay loop muted playsInline preload="metadata" className="fc-card__img" style={{ objectFit: 'cover' }} />
              ) : (
                <img
                  src={col.image}
                  alt={col.alt}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="fc-card__img"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/house_of_varsh-2026-08-12/688853648_18071480609422704_8771821116478855746_n.jpg';
                  }}
                />
              )}
              <div className="fc-card__overlay" />
              <div className="fc-card__body">
                <p className="fc-card__tag">{col.tag}</p>
                <h3 className="fc-card__title">{col.title}</h3>
                <span className="fc-card__line" />
              </div>
            </motion.a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PhotoGallery;
