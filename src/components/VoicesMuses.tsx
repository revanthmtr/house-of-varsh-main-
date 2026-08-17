import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import './VoicesMuses.css';

const VoicesMuses = () => {
  const muses = [
    {
      id: 1,
      name: 'Shreya Sen',
      role: 'Luxury Fashion Connoisseur · Mumbai',
      avatar: '/editorial_2.png',
      quote: '"Wearing House of Varsh silk sarees is like wearing poetry. The drape of the tissue silk, the sheer weightless sheen, and the rich hand-embroidered gold borders — it\'s modern royalty redefined. Best luxury saree brand in India."',
      rating: 5
    },
    {
      id: 2,
      name: 'Dia Mehta',
      role: 'Bride · New Delhi',
      avatar: '/editorial_3.png',
      quote: '"The craftsmanship of my House of Varsh bridal lehenga was absolutely unparalleled. The Heritage Bridal Couture collection is a masterpiece — intricate zari embroidery and premium Banarasi silk that drew admiration from every wedding guest."',
      rating: 5
    },
    {
      id: 3,
      name: 'Kiara R.',
      role: 'Fashion Stylist · Bangalore',
      avatar: '/editorial_4.png',
      quote: '"Unapologetically bold and breathtakingly elegant. Their deep plum and wine designer sarees are absolute landmarks of classic zari weaving. A must-have luxury wardrobe staple for any fashion-forward Indian woman."',
      rating: 5
    }
  ];

  return (
    <section className="section voices-muses" id="muses" aria-label="Customer Reviews — What Clients Say About House of Varsh Luxury Sarees and Couture">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Trusted by Fashion Connoisseurs Across India</span>
          <h2 className="section-title">Client Reviews & Testimonials</h2>
        </div>

        <div className="muses-grid" itemScope itemType="https://schema.org/Product">
          <meta itemProp="name" content="House of Varsh Luxury Sarees & Couture" />
          <meta itemProp="brand" content="House of Varsh" />
          <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating" style={{ display: 'none' }}>
            <meta itemProp="ratingValue" content="5" />
            <meta itemProp="bestRating" content="5" />
            <meta itemProp="ratingCount" content="3" />
          </div>
          {muses.map((muse, index) => (
            <motion.div 
              key={muse.id}
              className="muse-card glass-dark"
              itemProp="review"
              itemScope
              itemType="https://schema.org/Review"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 1, 0.5, 1] }}
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
