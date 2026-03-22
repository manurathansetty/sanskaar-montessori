import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-col">
          <h4>Sanskaar Montessori</h4>
          <p>Rooted in Values, Growing with Joy</p>
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
            <li><Link to="/events">Events</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contact Us</h4>
          <p>
            Phone:<br />
            <a href="tel:+919113805407">+91 91138 05407</a><br />
            <a href="tel:+918105358074">+91 81053 58074</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Sanskaar Montessori. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
