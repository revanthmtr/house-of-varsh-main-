import { motion } from 'framer-motion';
import { Award, Sparkles, Compass } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import './BrandStory.css';

const BrandStory = () => {
  const { get } = useSiteContent();

  const pillars = [
    {
      icon: Award,
      title: get('brand_story', 'pillar_1_title', '15+ Years of Master Artisan Craftsmanship'),
      subtitle: get('brand_story', 'pillar_1_subtitle', 'Heritage Handloom Excellence'),
      desc: get('brand_story', 'pillar_1_desc', 'Every House of Varsh saree is handwoven by master artisans with over 15 years of expertise in Banarasi silk, Kanjivaram weaving, and bespoke embroidery — preserving India\'s rich textile heritage.'),
    },
    {
      icon: Sparkles,
      title: get('brand_story', 'pillar_2_title', 'Luxury Couture, Reimagined for Modern India'),
      subtitle: get('brand_story', 'pillar_2_subtitle', 'Designer Runway Elegance'),
      desc: get('brand_story', 'pillar_2_desc', 'From bridal lehengas to contemporary organza drapes — our haute couture collections blend traditional Indian craftsmanship with runway-ready silhouettes that define modern luxury fashion.'),
    },
    {
      icon: Compass,
      title: get('brand_story', 'pillar_3_title', 'Empowering the Modern Indian Woman'),
      subtitle: get('brand_story', 'pillar_3_subtitle', 'Confidence Through Couture'),
      desc: get('brand_story', 'pillar_3_desc', 'House of Varsh designs for strong, confident women who celebrate their heritage. Each piece embodies sovereignty, grace, and unapologetic elegance for every occasion — from weddings to soirées.'),
    },
  ];

  return (
    <section className="brand-story" id="story" aria-label="About House of Varsh — Our Heritage and Craftsmanship Story" itemScope itemType="https://schema.org/AboutPage">
      <div className="story-glow" />
      <div className="story-glow-2" />

      <article className="container story-manifesto-container">
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
              {get('brand_story', 'eyebrow_text', 'LUXURY INDIAN COUTURE · HERITAGE CRAFTSMANSHIP')}
            </span>
            <span className="story-line" />
          </div>

          <div className="story-logo-hero-wrap">
            <img
              src={get('header', 'logo_src', '/chinni_logo.png')}
              alt="House of Varsh — Premium Luxury Indian Fashion Brand Logo"
              className="story-hero-logo"
              width="200"
              height="80"
              loading="lazy"
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
          itemScope
          itemType="https://schema.org/CreativeWork"
        >
          <div className="story-quote-symbol" aria-hidden="true">"</div>
          <h2 className="story-lead-paragraph" itemProp="description">
            {get('brand_story', 'story_paragraph', "House of Varsh is India's premier luxury couture brand — a movement redefining how sarees, lehengas, and ethnic wear are designed, worn, and celebrated. Our high-fashion inspired collections feature premium handcrafted silk sarees, designer bridal lehengas, and contemporary ethnic wear — crafted for women who are strong, confident, and unapologetically elegant.")}
          </h2>

          <div className="story-founder-tag">
            <span className="founder-name" itemProp="name">{get('brand_story', 'founder_tag_name', 'HOUSE OF VARSH ATELIER')}</span>
            <span className="founder-title" itemProp="location">{get('brand_story', 'founder_tag_location', 'India · Worldwide Shipping')}</span>
          </div>
        </motion.div>


        {/* 3 Pillars Grid Presentation */}
        <div className="story-pillars-grid" role="list" aria-label="Our brand pillars — heritage, luxury, and empowerment">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                className="story-pillar-card"
                role="listitem"
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 + idx * 0.15 }}
              >
                <div className="pillar-icon-box" aria-hidden="true">
                  <Icon size={22} />
                </div>
                <h3 className="pillar-title">{item.title}</h3>
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
            aria-label="Discover our luxury saree, lehenga, and bridal couture collections"
            onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {get('brand_story', 'cta_button_label', 'SHOP LUXURY COLLECTIONS')}
          </button>
        </motion.div>
      </article>
    </section>
  );
};

export default BrandStory;

