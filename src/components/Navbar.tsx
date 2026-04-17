import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string): string =>
    location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src="/logo.jpg" alt="Sanskaar Montessori Logo" />
        <span>Sanskaar Montessori</span>
      </Link>
      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <li><Link to="/" className={isActive('/')} onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/about" className={isActive('/about')} onClick={() => setMenuOpen(false)}>About Us</Link></li>
        <li><Link to="/founders" className={isActive('/founders')} onClick={() => setMenuOpen(false)}>About Founders</Link></li>
        <li><Link to="/gallery" className={isActive('/gallery')} onClick={() => setMenuOpen(false)}>Gallery</Link></li>
        <li><Link to="/events" className={isActive('/events')} onClick={() => setMenuOpen(false)}>Programmes &amp; Events</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
