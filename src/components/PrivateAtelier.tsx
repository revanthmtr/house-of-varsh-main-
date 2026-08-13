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
    <section className="pa-section" id="atelier">
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
                <span className="pa-subtitle">Maison Invitation</span>
                
                {/* Heading */}
                <h2 className="pa-title">
                  {get('private_atelier', 'heading', 'Be among the first to see.')}
                </h2>

                <p className="pa-desc">
                  {get('private_atelier', 'description', 'Subscribe to receive private invitations to new drops, runway previews, and atelier appointments.')}
                </p>

                {/* Email form */}
                {!subscribed ? (
                  <form onSubmit={handleSubmit} className="pa-form">
                    <div className="pa-input-wrapper">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Your email address"
                        className="pa-input"
                        required
                      />
                      <span className="pa-input-line-active"></span>
                    </div>
                    <button type="submit" className="pa-btn">
                      {get('private_atelier', 'cta_label', 'Subscribe')}
                    </button>
                  </form>
                ) : (
                  <motion.p
                    className="pa-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    You're on the list. Welcome to the inner circle.
                  </motion.p>
                )}

                <p className="pa-legal">
                  {get('private_atelier', 'legal_text', 'By subscribing you accept our privacy policy. Unsubscribe anytime.')}
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
