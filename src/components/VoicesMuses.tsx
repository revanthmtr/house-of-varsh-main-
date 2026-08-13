import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import './VoicesMuses.css';

const VoicesMuses = () => {
  const muses = [
    {
      id: 1,
      name: 'Shreya Sen',
      role: 'Connoisseur · Mumbai',
      avatar: '/editorial_2.png', // Reusing matching available public assets
      quote: '“Wearing Chinni is like wearing poetry. The drape, the sheer weightless sheen of the tissue silk, and the rich gold borders make me feel like modern royalty.”',
      rating: 5
    },
    {
      id: 2,
      name: 'Dia Mehta',
      role: 'Bride · New Delhi',
      avatar: '/editorial_3.png',
      quote: '“The craftsmanship is absolutely unparalleled. I wore their Heritage Bridal Couture for my wedding, and it was a masterpiece that drew admiration from everyone.”',
      rating: 5
    },
    {
      id: 3,
      name: 'Kiara R.',
      role: 'Stylist · Bangalore',
      avatar: '/editorial_4.png',
      quote: '“Unapologetically bold and breathtakingly elegant. Their deep rich plum and wine sarees are absolute landmarks of classic zari weaving. A wardrobe must.”',
      rating: 5
    }
  ];

  return (
    <section className="section voices-muses" id="muses">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Maison Voices</span>
          <h2 className="section-title">Muses & Icons</h2>
        </div>

        <div className="muses-grid">
          {muses.map((muse, index) => (
            <motion.div 
              key={muse.id}
              className="muse-card glass-dark"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: [0.25, 1, 0.5, 1] }}
            >
              <div className="muse-stars">
                {[...Array(muse.rating)].map((_, i) => (
                  <Star key={i} size={13} fill="var(--gold)" stroke="var(--gold)" />
                ))}
              </div>

              <blockquote className="muse-quote">
                {muse.quote}
              </blockquote>

              <div className="muse-author-block">
                <img src={muse.avatar} alt={muse.name} className="muse-avatar" />
                <div className="muse-details">
                  <span className="muse-name">{muse.name}</span>
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
