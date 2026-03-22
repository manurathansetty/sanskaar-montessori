import React from 'react';
import { Sprout, BookOpen, Star, Home as HomeIcon, Baby, Palette, Heart, Sun } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <span className="badge">Admissions Open 2026-2027</span>
        <h1>Sanskaar Montessori</h1>
        <p className="tagline">Rooted in Values, Growing with Joy</p>
        <p>
          A safe, caring and joyful learning environment for children aged 18
          months to 6 years
        </p>
      </section>

      {/* Highlights */}
      <div className="section-alt">
        <div className="highlights">
          <div className="highlight-item">
            <div className="icon"><Sprout size={32} /></div>
            <h3>Play</h3>
            <p>Hands-on, child-led activities that spark curiosity and imagination</p>
          </div>
          <div className="highlight-item">
            <div className="icon"><BookOpen size={32} /></div>
            <h3>Learn</h3>
            <p>Montessori-based curriculum designed for holistic development</p>
          </div>
          <div className="highlight-item">
            <div className="icon"><Star size={32} /></div>
            <h3>Grow</h3>
            <p>Nurturing values, confidence and life skills in every child</p>
          </div>
          <div className="highlight-item">
            <div className="icon"><HomeIcon size={32} /></div>
            <h3>Day Care</h3>
            <p>Day care facility also available for working parents</p>
          </div>
        </div>
      </div>

      {/* What We Offer */}
      <section className="section">
        <h2>What We Offer</h2>
        <p className="section-subtitle">
          A nurturing space where your child's potential blossoms
        </p>
        <div className="cards">
          <div className="card">
            <div className="card-icon"><Baby size={32} /></div>
            <h3>Toddler Program</h3>
            <p>
              For ages 18 months to 3 years. A gentle introduction to structured
              learning through play, sensory exploration and social interaction.
            </p>
          </div>
          <div className="card">
            <div className="card-icon"><Palette size={32} /></div>
            <h3>Pre-Primary Program</h3>
            <p>
              For ages 3 to 6 years. A Montessori-based curriculum that builds
              literacy, numeracy, creativity and independence.
            </p>
          </div>
          <div className="card">
            <div className="card-icon"><Heart size={32} /></div>
            <h3>Value-Based Education</h3>
            <p>
              Sanskaar (values) are at the heart of everything we do. We instil
              respect, empathy, kindness and responsibility.
            </p>
          </div>
          <div className="card">
            <div className="card-icon"><Sun size={32} /></div>
            <h3>Day Care Facility</h3>
            <p>
              Extended care available for working parents. A safe and engaging
              environment throughout the day.
            </p>
          </div>
        </div>
      </section>

      {/* Google Form Embed Section */}
      <div className="form-section">
        <section className="section">
          <h2>Sign Up for Our Events</h2>
          <p className="section-subtitle">
            Register your interest in upcoming events at Sanskaar Montessori
          </p>
          <div className="form-container">
            {/*
              TO EMBED YOUR GOOGLE FORM:
              Replace the placeholder div below with:
              <iframe
                src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true"
                width="100%"
                height="800"
                frameBorder="0"
                title="Event Registration Form"
              >
                Loading...
              </iframe>
            */}
            <div className="placeholder-msg">
              <p><strong>Google Form will appear here</strong></p>
              <p>
                To embed your Google Form, open <code>src/pages/Home.tsx</code> and
                replace this placeholder with your Google Form iframe embed code.
              </p>
              <code>
                {`<iframe src="https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true" width="100%" height="800" frameBorder="0" title="Event Registration">Loading...</iframe>`}
              </code>
            </div>
          </div>
        </section>
      </div>

      {/* CTA Banner */}
      <div className="cta-banner">
        <h2>Admissions Open for 2026-2027</h2>
        <p>Give your child the gift of joyful, value-based learning. Enrol today!</p>
        <a href="tel:+919113805407" className="btn-cta">
          Call Us: +91 91138 05407
        </a>
      </div>
    </>
  );
};

export default Home;
