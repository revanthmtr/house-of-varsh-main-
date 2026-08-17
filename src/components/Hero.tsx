import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../context/SiteContentContext';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 250]);
  const { get } = useSiteContent();

  const slides = [
    { 
      image: get('hero', 'slide_1_image', '/house_of_varsh-2026-08-12/683650085_18070177769422704_4642689253014659001_n.jpg'), 
      subtitle: get('hero', 'slide_1_subtitle', 'Handcrafted Luxury Couture'),   
      title: get('hero', 'slide_1_title', 'The Divine Collection'),
      alt: 'House of Varsh premium handcrafted silk saree from The Divine Collection'
    },
    { 
      image: get('hero', 'slide_2_image', '/house_of_varsh-2026-08-12/687657173_18071142494422704_1421778732749517278_n.jpg'),                                                                                  
      subtitle: get('hero', 'slide_2_subtitle', 'Artisan Gold Embroidery'),     
      title: get('hero', 'slide_2_title', 'Golden Embroidery'),
      alt: 'House of Varsh designer lehenga with intricate golden zari embroidery'
    },
    { 
      image: get('hero', 'slide_3_image', '/house_of_varsh-2026-08-12/687824056_18071480624422704_1700268466384918671_n.jpg'),                                                                                 
      subtitle: get('hero', 'slide_3_subtitle', 'Heritage Anarkali Collection'), 
      title: get('hero', 'slide_3_title', 'Emerald Shadows'),
      alt: 'House of Varsh heritage anarkali suit in emerald green silk'
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="hero" aria-label="House of Varsh — Premium Handcrafted Sarees and Luxury Indian Couture" itemScope itemType="https://schema.org/WPHeader">
      <div className="hero-background-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero-background"
            role="img"
            aria-label={slides[currentSlide].alt}
            style={{ y, backgroundImage: `url('${slides[currentSlide].image}')` }}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 1.8, ease: [0.25, 1, 0.5, 1] }}
          />
        </AnimatePresence>
        <div className="hero-overlay-horizontal" />
        <div className="hero-overlay-vertical" />
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
      </div>

      <header className="hero-content">
        <div className="hero-text-block">
          <div className="hero-eyebrow-container">
            <span className="hero-eyebrow-line" />
            <AnimatePresence mode="wait">
              <motion.span 
                key={`${currentSlide}-subtitle`} 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }} 
                transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
              >
                {slides[currentSlide].subtitle}
              </motion.span>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.h1 
              key={`${currentSlide}-title`} 
              className="hero-title" 
              initial={{ opacity: 0, y: 35 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -35 }} 
              transition={{ duration: 1, delay: 0.4, ease: [0.25, 1, 0.5, 1] }}
            >
              {slides[currentSlide].title}
            </motion.h1>
          </AnimatePresence>

          <motion.p
            className="hero-description"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            {get('hero', 'description', 'Discover premium handcrafted silk sarees, designer lehengas, and luxury Indian couture — handwoven by master artisans with over 15 years of heritage craftsmanship. Shop the finest bridal wear and contemporary ethnic fashion online.')}
          </motion.p>

          <motion.div 
            className="hero-button-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <button 
              className="hero-btn-primary"
              aria-label="Explore our luxury saree and lehenga collections"
              onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {get('hero', 'cta_button_label', 'Explore Collection')}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button 
              className="hero-btn-outline"
              aria-label="Read our brand story and heritage craftsmanship journey"
              onClick={() => document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Our Heritage Story
            </button>
          </motion.div>
        </div>
      </header>

      {/* Scroll down indicator */}
      <nav 
        className="hero-scroll-indicator" 
        aria-label="Scroll to collections"
        onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span>Scroll Down</span>
        <div className="hero-scroll-line" />
      </nav>

      <div className="hero-indicators" role="tablist" aria-label="Slide navigation">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
            role="tab"
            aria-selected={idx === currentSlide}
            aria-label={`View slide ${idx + 1}`}
            className={`hero-indicator ${idx === currentSlide ? 'active' : ''}`} 
            onClick={() => setCurrentSlide(idx)}
          >
            <div className="hero-indicator-line" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Hero;
