import { useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useSiteContent } from '../context/SiteContentContext';
import './Hero.css';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { scrollY } = useScroll();
  // Disable parallax on touch/mobile — it causes GPU overhead and frame drops on iOS/Android
  const isTouch = useMemo(() =>
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  []);
  const yDesktop = useTransform(scrollY, [0, 1000], [0, 250]);
  // On mobile, pass 0 (no parallax) to eliminate GPU layer promotion costs
  const y = isTouch ? 0 : yDesktop;
  const { get } = useSiteContent();

  const slides = [
    { 
      image: get('hero', 'slide_1_image', '/house_of_varsh-2026-08-12/687657173_18071142494422704_1421778732749517278_n.jpg'), 
      subtitle: get('hero', 'slide_1_subtitle', 'Handcrafted Luxury Couture'),   
      title: get('hero', 'slide_1_title', 'The Divine Collection'),
      alt: 'House of Varsh premium handcrafted silk saree from The Divine Collection'
    },
    { 
      image: get('hero', 'slide_2_image', '/house_of_varsh-2026-08-12/688713427_18071142515422704_1852034660631262620_n.jpg'),                                                                                  
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
            style={{ y }}
            initial={{ opacity: currentSlide === 0 ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].alt}
              className="hero-background-img"
              fetchPriority={currentSlide === 0 ? 'high' : 'auto'}
              loading={currentSlide === 0 ? 'eager' : 'lazy'}
              decoding={currentSlide === 0 ? 'sync' : 'async'}
            />
          </motion.div>
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
                initial={{ opacity: currentSlide === 0 ? 1 : 0, y: currentSlide === 0 ? 0 : 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }} 
                transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              >
                {slides[currentSlide].subtitle}
              </motion.span>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.h1 
              key={`${currentSlide}-title`} 
              className="hero-title" 
              initial={{ opacity: currentSlide === 0 ? 1 : 0, y: currentSlide === 0 ? 0 : 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            >
              {slides[currentSlide].title}
            </motion.h1>
          </AnimatePresence>

          <p className="hero-description">
            {get('hero', 'description', 'Discover premium handcrafted silk sarees, designer lehengas, and luxury Indian couture — handwoven by master artisans with over 15 years of heritage craftsmanship. Shop the finest bridal wear and contemporary ethnic fashion online.')}
          </p>

          <div className="hero-button-group">
            <button 
              className="hero-btn-primary"
              aria-label="Explore our luxury saree and lehenga collections"
              onClick={() => {
                const el = document.getElementById('new') || document.getElementById('collections');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span className="hero-btn-text">
                {get('hero', 'cta_button_label', 'Explore Collection')}
              </span>
              <span className="hero-btn-icon" aria-hidden="true">→</span>
            </button>
            <button 
              className="hero-btn-secondary"
              aria-label="Learn about the House of Varsh brand story and heritage"
              onClick={() => {
                const el = document.getElementById('story');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <span>Our Heritage</span>
            </button>
          </div>
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
          <button 
            key={idx} 
            type="button"
            role="tab"
            aria-selected={idx === currentSlide}
            aria-label={`View slide ${idx + 1}`}
            className={`hero-indicator ${idx === currentSlide ? 'active' : ''}`} 
            onClick={() => setCurrentSlide(idx)}
          >
            <div className="hero-indicator-line" />
          </button>
        ))}
      </div>

    </section>
  );
};

export default Hero;

