import { Instagram, Facebook, Twitter, Mail, Clock, Phone } from 'lucide-react';
import { useSiteContent } from '../context/SiteContentContext';
import './Footer.css';

const Footer = () => {
  const { get } = useSiteContent();

  return (
    <footer className="footer" itemScope itemType="https://schema.org/WPFooter">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <img 
                src={get('header', 'logo_src', '/chinni_logo.png')} 
                alt="House of Varsh — India's Premier Luxury Saree and Couture Brand" 
                className="footer-logo-img" 
                width="180"
                height="60"
                loading="lazy"
              />
            </div>
            <p className="footer-text">
              {get('footer', 'tagline', 'India\'s premier luxury couture brand. Premium handcrafted silk sarees, designer lehengas, organza drapes, and bespoke bridal wear — handwoven by master artisans.')}
            </p>
          </div>

          <nav className="footer-links-col" aria-label="Explore House of Varsh Collections">
            <h4 className="footer-heading">{get('footer', 'explore_heading', 'Shop Collections')}</h4>
            <ul className="footer-links">
              <li><a href="#new">{get('footer', 'explore_link_1', 'New Arrivals — Latest Designer Sarees')}</a></li>
              <li><a href="#collections">{get('footer', 'explore_link_2', 'Best Selling Luxury Sarees')}</a></li>
              <li><a href="#collections">{get('footer', 'explore_link_3', 'Tissue Silk Saree Collection')}</a></li>
              <li><a href="#collections">{get('footer', 'explore_link_4', 'Organza Drapes & Designer Wear')}</a></li>
            </ul>
          </nav>

          <nav className="footer-links-col" aria-label="House of Varsh Bespoke Guide and Brand Information">
            <h4 className="footer-heading">{get('footer', 'help_heading', 'Bespoke Guide')}</h4>
            <ul className="footer-links">
              <li><a href="#story">{get('footer', 'help_link_1', 'Our Heritage Craftsmanship Story')}</a></li>
              <li><a href="#story">{get('footer', 'help_link_2', 'Artisan Handloom Process')}</a></li>
              <li><a href="#story">{get('footer', 'help_link_3', 'Saree Sizing & Drape Guide')}</a></li>
              <li><a href="#story">{get('footer', 'help_link_4', 'Book a Private Consultation')}</a></li>
            </ul>
          </nav>

          <div className="footer-client-services-col" itemScope itemType="https://schema.org/LocalBusiness">
            <meta itemProp="name" content="House of Varsh" />
            <meta itemProp="description" content="Premium handcrafted luxury sarees and Indian couture brand" />
            <meta itemProp="url" content="https://houseofvarsh.com/" />
            <h4 className="footer-heading">Private Client Services</h4>
            <address className="footer-client-services" style={{ fontStyle: 'normal' }}>
              <div className="client-service-item">
                <Phone size={14} className="service-icon" aria-hidden="true" />
                <a href="tel:+919346370857" className="service-link" itemProp="telephone" aria-label="Call House of Varsh at +91 93463 70857">+91 93463 70857</a>
              </div>
              <div className="client-service-item">
                <Mail size={14} className="service-icon" aria-hidden="true" />
                <a href="mailto:houshofvarsh@gmail.com" className="service-link" itemProp="email" aria-label="Email House of Varsh">houshofvarsh@gmail.com</a>
              </div>
              <div className="client-service-item">
                <Instagram size={14} className="service-icon" aria-hidden="true" />
                <a href="https://instagram.com/house_of_varsh" target="_blank" rel="noopener noreferrer" className="service-link" aria-label="Follow House of Varsh on Instagram">@house_of_varsh</a>
              </div>
              <div className="client-service-item">
                <Clock size={14} className="service-icon" aria-hidden="true" />
                <span className="service-text" itemProp="openingHours" content="Mo-Sa 10:00-19:00">Mon – Sat: 10 AM – 7 PM IST</span>
              </div>
            </address>
            <a href="https://wa.me/919346370857" target="_blank" rel="noopener noreferrer" className="footer-cta-link" aria-label="Book a private consultation on WhatsApp">
              Book Private Consultation
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>{get('footer', 'copyright_text', `© ${new Date().getFullYear()} House of Varsh. All rights reserved. Premium Handcrafted Luxury Sarees & Indian Couture.`)}</p>
          </div>
          
          <div className="crafted-india-wrap">
            <span className="crafted-india">HANDCRAFTED · IN · INDIA</span>
          </div>

          <nav className="socials" aria-label="Follow House of Varsh on social media">
            <a href="https://instagram.com/house_of_varsh" target="_blank" rel="noopener noreferrer" aria-label="House of Varsh on Instagram — Follow for latest luxury saree collections">
              <Instagram size={15} strokeWidth={1.5} />
            </a>
            <a href="https://facebook.com/houseofvarsh" target="_blank" rel="noopener noreferrer" aria-label="House of Varsh on Facebook">
              <Facebook size={15} strokeWidth={1.5} />
            </a>
            <a href="https://twitter.com/houseofvarsh" target="_blank" rel="noopener noreferrer" aria-label="House of Varsh on Twitter">
              <Twitter size={15} strokeWidth={1.5} />
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

