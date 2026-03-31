import React from 'react';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="coming-soon">
      <img src="/logo.jpg" alt="Sanskaar Montessori" className="coming-soon-logo" />
      <h1>Sanskaar Montessori</h1>
      <p className="coming-soon-tagline">Rooted in Values, Growing with Joy</p>
      <div className="coming-soon-divider"></div>
      <h2>Coming Soon...</h2>
      <p className="coming-soon-text">We're building something beautiful for our little learners. Stay tuned!</p>
      <a href="tel:+919113805407" className="coming-soon-contact">+91 91138 05407</a>
    </div>
  );
};

export default App;
