import { motion } from 'framer-motion';
import { Award, Sparkles, Compass } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import './BrandStory.css';

const BrandStory = () => {
  const { get } = useSiteContent();

  const pillars = [
    {
      icon: Award,
      title: '15+ Years of Mastery',
      subtitle: 'Heritage Craftsmanship',
      desc: 'Over a decade of refining hand-woven silks, artisanal embroidery, and bespoke silhouettes.',
    },
    {
      icon: Sparkles,
      title: 'High Couture, Reimagined',
      subtitle: 'Runway Elegance',
      desc: 'High-fashion inspired drapes crafted with royal splendor—democratizing haute couture.',
    },
    {
      icon: Compass,
      title: 'Unapologetic Sovereignty',
      subtitle: 'For the Modern Woman',
      desc: 'Embodying young, prosperous grace for strong, confident women who define their own legacy.',
    },
  ];

  return (
    <section className="brand-story" id="story">
      <div className="story-glow" />
      <div className="story-glow-2" />

      <div className="container story-manifesto-container">
        {/* Eyebrow & Brand Crest */}
        <motion.div
          className="story-header text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="story-eyebrow-wrap">
            <span className="story-line" />
            <span className="story-eyebrow-text">
              {get('brand_story', 'eyebrow_text', 'MAISON DE COUTURE · ATELIER MANIFESTO')}
            </span>
            <span className="story-line" />
          </div>

          <div className="story-logo-hero-wrap">
            <img
              src={get('header', 'logo_src', '/chinni_logo.png')}
              alt="House of Varsh Logo"
              className="story-hero-logo"
            />
          </div>
        </motion.div>

        {/* Central Quote & Narrative Box */}
        <motion.div
          className="story-narrative-card"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          <div className="story-quote-symbol">“</div>
          <p className="story-lead-paragraph">
            {get('brand_story', 'story_paragraph', "At House of Varsh, we're not just another fashion brand—we're a movement, roaring to redefine how sarees are worn and celebrated. Choose House of Varsh's High fashion inspired sarees: young, prosperous, and crafted for women who are strong, confident, and unapologetic.")}
          </p>

          <div className="story-founder-tag">
            <span className="founder-name">HOUSE OF VARSH ATELIER</span>
            <span className="founder-title">Mumbai · Paris · Worldwide</span>
          </div>
        </motion.div>

        {/* 3 Pillars Grid Presentation */}
        <div className="story-pillars-grid">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                className="story-pillar-card"
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + idx * 0.15 }}
              >
                <div className="pillar-icon-box">
                  <Icon size={22} />
                </div>
                <h4 className="pillar-title">{item.title}</h4>
                <div className="pillar-subtitle">{item.subtitle}</div>
                <p className="pillar-desc">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div
          className="story-cta-wrap text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <button
            className="btn-solid-gold"
            onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {get('brand_story', 'cta_button_label', 'DISCOVER OUR COLLECTIONS')}
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default BrandStory;
