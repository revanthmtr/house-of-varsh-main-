import { Instagram, Facebook, Twitter, Mail, Clock, Phone } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import './Footer.css';

const Footer = () => {
  const { get } = useSiteContent();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <img 
                src={get('header', 'logo_src', '/chinni_logo.png')} 
                alt="House of Varsh" 
                className="footer-logo-img" 
              />
            </div>
            <p className="footer-text">
              {get('footer', 'tagline', 'Redefining heritage. Premium handcrafted silk sarees for the modern royalty.')}
            </p>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">{get('footer', 'explore_heading', 'Explore')}</h4>
            <ul className="footer-links">
              <li><a href="#new">{get('footer', 'explore_link_1', 'New Arrivals')}</a></li>
              <li><a href="#collections">{get('footer', 'explore_link_2', 'Best Sellers')}</a></li>
              <li><a href="#collections">{get('footer', 'explore_link_3', 'Tissue Silk')}</a></li>
              <li><a href="#collections">{get('footer', 'explore_link_4', 'Organza')}</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4 className="footer-heading">{get('footer', 'help_heading', 'Bespoke Guide')}</h4>
            <ul className="footer-links">
              <li><a href="#story">{get('footer', 'help_link_1', 'Our Atelier Story')}</a></li>
              <li><a href="#story">{get('footer', 'help_link_2', 'Heritage Craftsmanship')}</a></li>
              <li><a href="#story">{get('footer', 'help_link_3', 'Sizing & Drape Guide')}</a></li>
              <li><a href="#story">{get('footer', 'help_link_4', 'Private Showings')}</a></li>
            </ul>
          </div>

          <div className="footer-client-services-col">
            <h4 className="footer-heading">Private Client Services</h4>
            <ul className="footer-client-services">
              <li className="client-service-item">
                <Phone size={14} className="service-icon" />
                <a href="tel:+919346370857" className="service-link">+91 93463 70857</a>
              </li>
              <li className="client-service-item">
                <Mail size={14} className="service-icon" />
                <a href="mailto:houshofvarsh@gmail.com" className="service-link">houshofvarsh@gmail.com</a>
              </li>
              <li className="client-service-item">
                <Instagram size={14} className="service-icon" />
                <a href="https://instagram.com/house_of_varsh" target="_blank" rel="noopener noreferrer" className="service-link">@house_of_varsh</a>
              </li>
              <li className="client-service-item">
                <Clock size={14} className="service-icon" />
                <span className="service-text">Mon - Sat: 10 AM - 7 PM IST</span>
              </li>
            </ul>
            <a href="https://wa.me/919346370857" target="_blank" rel="noopener noreferrer" className="footer-cta-link">
              Book Consultation
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            {get('footer', 'copyright_text', `© ${new Date().getFullYear()} House of Varsh. All rights reserved.`)}
          </div>
          
          <div className="crafted-india-wrap">
            <span className="crafted-india">CRAFTED · IN · INDIA</span>
          </div>

          <div className="socials">
            <a href="https://instagram.com/house_of_varsh" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <Instagram size={15} strokeWidth={1.5} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <Facebook size={15} strokeWidth={1.5} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <Twitter size={15} strokeWidth={1.5} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
