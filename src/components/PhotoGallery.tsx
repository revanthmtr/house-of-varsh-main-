import { motion } from 'framer-motion';
import { useSiteContent } from '../context/SiteContentContext';
import './PhotoGallery.css';

const PhotoGallery = () => {
  const { get } = useSiteContent();

  const collections = [
    {
      id: 'bridal',
      title: 'Bridal Couture',
      tag: 'Heirloom craft',
      image: get('photo_gallery', 'photo_1_src', '/collection_bridal.jpg'),
      gridArea: 'bridal',
    },
    {
      id: 'saree',
      title: 'Luxury Sarees',
      tag: 'Drape of dreams',
      image: get('photo_gallery', 'photo_2_src', '/collection_saree.jpg'),
      gridArea: 'saree',
    },
    {
      id: 'gown',
      title: 'Evening Gowns',
      tag: 'After-dark elegance',
      image: get('photo_gallery', 'photo_3_src', '/collection_gown.jpg'),
      gridArea: 'gown',
    },
    {
      id: 'contemporary',
      title: 'Contemporary',
      tag: 'Modern silhouettes',
      image: get('photo_gallery', 'photo_4_src', '/collection_contemporary.jpg'),
      gridArea: 'contemporary',
    },
    {
      id: 'festive',
      title: 'Festive',
      tag: 'Royal celebration',
      image: get('photo_gallery', 'photo_5_src', '/collection_festive_lovable.jpg'),
      gridArea: 'festive',
    },
  ];

  return (
    <section className="fc-section" id="gallery">
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
              <span className="fc-eyebrow-text">The Maison</span>
              <span className="fc-eyebrow-line" />
            </div>
            <h2 className="fc-title">
              Featured <span className="fc-title-italic">Collections</span>
            </h2>
          </div>
          <a href="#collections" className="fc-view-all">
            View All Collections →
          </a>
        </motion.div>

        {/* ── Masonry grid ── */}
        <div className="fc-grid">
          {collections.map((col, index) => (
            <motion.a
              key={col.id}
              href="#collections"
              className={`fc-card fc-card--${col.id}`}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.9, delay: index * 0.08, ease: [0.25, 1, 0.5, 1] }}
            >
              {col.image.endsWith('.mp4') || col.image.endsWith('.webm') || col.image.endsWith('.mov') ? (
                <video src={col.image} autoPlay loop muted playsInline preload="metadata" className="fc-card__img" style={{ objectFit: 'cover' }} />
              ) : (
                <img
                  src={col.image}
                  alt={col.title}
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
