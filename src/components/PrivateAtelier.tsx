import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSiteContent } from '../context/SiteContentContext';
import './PrivateAtelier.css';

const PrivateAtelier = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { get } = useSiteContent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="pa-section" id="atelier" aria-label="Subscribe to House of Varsh — Exclusive Luxury Fashion Updates and Private Consultations">
      <div className="pa-container">
        <motion.div
          className="pa-card"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="pa-card-frame-outer">
            <div className="pa-card-frame-inner">
              <div className="pa-card-content">
                <span className="pa-subtitle">Exclusive Luxury Fashion Preview</span>
                
                {/* Heading */}
                <h2 className="pa-title">
                  {get('private_atelier', 'heading', 'Join the House of Varsh Inner Circle')}
                </h2>

                <p className="pa-desc">
                  {get('private_atelier', 'description', 'Subscribe for exclusive early access to new luxury saree collections, designer lehenga drops, private styling consultations, and invitation-only bridal couture previews. Be the first to shop limited-edition handcrafted pieces.')}
                </p>

                {/* Email form */}
                {!subscribed ? (
                  <form onSubmit={handleSubmit} className="pa-form" aria-label="Subscribe to House of Varsh luxury fashion newsletter">
                    <div className="pa-input-wrapper">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email for exclusive access"
                        className="pa-input"
                        required
                        aria-label="Email address for luxury fashion newsletter"
                      />
                      <span className="pa-input-line-active"></span>
                    </div>
                    <button type="submit" className="pa-btn" aria-label="Subscribe to receive exclusive House of Varsh updates">
                      {get('private_atelier', 'cta_label', 'Get Exclusive Access')}
                    </button>
                  </form>
                ) : (
                  <motion.p
                    className="pa-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    Welcome to the House of Varsh inner circle. You'll be first to see our newest luxury collections.
                  </motion.p>
                )}

                <p className="pa-legal">
                  {get('private_atelier', 'legal_text', 'By subscribing you accept our privacy policy. Unsubscribe anytime. We never share your information.')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PrivateAtelier;

