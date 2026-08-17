import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import { resolveMediaUrl } from '../utils/api';
import './VoicesMuses.css';

const VoicesMuses = () => {
  const { get } = useSiteContent();

  const muses = [
    {
      id: 1,
      name: get('voices_muses', 'muse_1_name', 'Shreya Sen'),
      role: get('voices_muses', 'muse_1_role', 'Luxury Fashion Connoisseur · Mumbai'),
      avatar: resolveMediaUrl(get('voices_muses', 'muse_1_avatar', '/editorial_2.png')),
      quote: get('voices_muses', 'muse_1_quote', '"Wearing House of Varsh silk sarees is like wearing poetry. The drape of the tissue silk, the sheer weightless sheen, and the rich hand-embroidered gold borders — it\'s modern royalty redefined. Best luxury saree brand in India."'),
      rating: 5
    },
    {
      id: 2,
      name: get('voices_muses', 'muse_2_name', 'Dia Mehta'),
      role: get('voices_muses', 'muse_2_role', 'Bride · New Delhi'),
      avatar: resolveMediaUrl(get('voices_muses', 'muse_2_avatar', '/editorial_3.png')),
      quote: get('voices_muses', 'muse_2_quote', '"The craftsmanship of my House of Varsh bridal lehenga was absolutely unparalleled. The Heritage Bridal Couture collection is a masterpiece — intricate zari embroidery and premium Banarasi silk that drew admiration from every wedding guest."'),
      rating: 5
    },
    {
      id: 3,
      name: get('voices_muses', 'muse_3_name', 'Kiara R.'),
      role: get('voices_muses', 'muse_3_role', 'Fashion Stylist · Bangalore'),
      avatar: resolveMediaUrl(get('voices_muses', 'muse_3_avatar', '/editorial_4.png')),
      quote: get('voices_muses', 'muse_3_quote', '"Unapologetically bold and breathtakingly elegant. Their deep plum and wine designer sarees are absolute landmarks of classic zari weaving. A must-have luxury wardrobe staple for any fashion-forward Indian woman."'),
      rating: 5
    }
  ];

  return (
    <section className="section voices-muses" id="muses" aria-label="Customer Reviews — What Clients Say About House of Varsh Luxury Sarees and Couture">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">{get('voices_muses', 'section_subtitle', 'Trusted by Fashion Connoisseurs Across India')}</span>
          <h2 className="section-title">{get('voices_muses', 'section_title', 'Client Reviews & Testimonials')}</h2>
        </div>

        <div className="muses-grid" itemScope itemType="https://schema.org/Product">
          <meta itemProp="name" content="House of Varsh Luxury Sarees & Couture" />
          <meta itemProp="brand" content="House of Varsh" />
          <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" style={{ display: 'none' }}>
            <meta itemProp="ratingValue" content="5" />
            <meta itemProp="bestRating" content="5" />
            <meta itemProp="ratingCount" content="3" />
          </div>
          {muses.map((muse) => (
            <motion.div 
              key={muse.id}
              className="muse-card glass-dark"
              itemProp="review"
              itemScope
              itemType="https://schema.org/Review"
              initial={{ opacity: 0.9, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "200px" }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <div className="muse-stars" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                <meta itemProp="ratingValue" content={String(muse.rating)} />
                <meta itemProp="bestRating" content="5" />
                {[...Array(muse.rating)].map((_, i) => (
                  <Star key={i} size={13} fill="var(--gold)" stroke="var(--gold)" aria-hidden="true" />
                ))}
              </div>

              <blockquote className="muse-quote" itemProp="reviewBody">
                {muse.quote}
              </blockquote>

              <div className="muse-author-block" itemProp="author" itemScope itemType="https://schema.org/Person">
                <img src={muse.avatar} alt={`${muse.name} — House of Varsh client review`} className="muse-avatar" loading="lazy" />
                <div className="muse-details">
                  <span className="muse-name" itemProp="name">{muse.name}</span>
                  <span className="muse-role">{muse.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VoicesMuses;

