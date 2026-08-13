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
      image: get('hero', 'slide_1_image', '/hero_fashion_1.png'), 
      subtitle: get('hero', 'slide_1_subtitle', 'Timeless Couture'),   
      title: get('hero', 'slide_1_title', 'The Divine Collection') 
    },
    { 
      image: get('hero', 'slide_2_image', '/hero_slide_2.png'),                                                                                  
      subtitle: get('hero', 'slide_2_subtitle', 'Regal Opulence'),     
      title: get('hero', 'slide_2_title', 'Golden Embroidery')     
    },
    { 
      image: get('hero', 'slide_3_image', '/hero_slide_3.png'),                                                                                 
      subtitle: get('hero', 'slide_3_subtitle', 'Heritage Anarkali'), 
      title: get('hero', 'slide_3_title', 'Emerald Shadows')       
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="hero">
      <div className="hero-background-container">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero-background"
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

      <div className="hero-content">
        <div className="hero-text-block">
          <div className="hero-eyebrow-container">
            <span className="hero-eyebrow-line" />
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${currentSlide}-subtitle`} 
                className="hero-subtitle"
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }} 
                transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 1, 0.5, 1] }}
              >
                {slides[currentSlide].subtitle}
              </motion.div>
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
            {get('hero', 'description', 'Discover handcrafted silhouettes showcasing the finest Indian heritage, tailored with precision for the modern royalty.')}
          </motion.p>

          <motion.div 
            className="hero-button-group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <button 
              className="hero-btn-primary"
              onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {get('hero', 'cta_button_label', 'Explore Collection')}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button 
              className="hero-btn-outline"
              onClick={() => document.getElementById('new')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Atelier Story
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll down indicator */}
      <div 
        className="hero-scroll-indicator" 
        onClick={() => document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <span>Scroll Down</span>
        <div className="hero-scroll-line" />
      </div>

      <div className="hero-indicators">
        {slides.map((_, idx) => (
          <div 
            key={idx} 
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
