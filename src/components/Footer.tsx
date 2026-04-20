import React from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../content/site-content';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h4>{SITE.school.name}</h4>
          <p>{SITE.school.tagline}</p>
          <p style={{ marginTop: '0.75rem' }}>
            A safe, caring and joyful learning environment for children aged 18 months to 6 years.
          </p>
        </div>
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/founders">About Founders</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
            <li><Link to="/events">Programmes &amp; Events</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>
            Phone:<br />
            {SITE.contact.phones.map((p) => (
              <React.Fragment key={p.tel}>
                <a href={`tel:${p.tel}`}>{p.display}</a><br />
              </React.Fragment>
            ))}
          </p>
          <p style={{ marginTop: '0.75rem' }}>
            <a href={SITE.contact.maps.shareUrl} target="_blank" rel="noopener noreferrer">
              📍 Find us on Google Maps
            </a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 {SITE.school.name}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
