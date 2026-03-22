import React from 'react';
import { Target, Eye, HeartHandshake, Microscope, HandHeart, Shield, Users } from 'lucide-react';

const About: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>About Us</h1>
        <p>Discover the heart and soul of Sanskaar Montessori</p>
      </div>

      {/* About Intro */}
      <section className="section">
        <div className="about-intro">
          <div>
            <img src="/poster.jpg" alt="Sanskaar Montessori" />
          </div>
          <div className="text">
            <h3>Who We Are</h3>
            <p>
              Sanskaar Montessori is a child-centric learning space dedicated to
              nurturing young minds through the Montessori method combined with
              strong Indian values (Sanskaar). We believe that every child is
              unique, and our role is to provide a safe, caring and joyful
              environment where they can explore, discover and grow at their own
              pace.
            </p>
            <p>
              We cater to children aged 18 months to 6 years, offering both a
              structured Montessori curriculum and a day care facility for
              working parents.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <div className="section-alt">
        <section className="section">
          <h2>Our Mission &amp; Vision</h2>
          <p className="section-subtitle">
            Building strong foundations, one child at a time
          </p>
          <div className="cards">
            <div className="card">
              <div className="card-icon"><Target size={32} /></div>
              <h3>Our Mission</h3>
              <p>
                To provide a holistic Montessori education rooted in Indian
                values, empowering children to become confident, compassionate
                and curious lifelong learners.
              </p>
            </div>
            <div className="card">
              <div className="card-icon"><Eye size={32} /></div>
              <h3>Our Vision</h3>
              <p>
                To be a trusted name in early childhood education, where every
                child's potential is recognised, nurtured and celebrated in an
                environment of love and respect.
              </p>
            </div>
            <div className="card">
              <div className="card-icon"><HeartHandshake size={32} /></div>
              <h3>Our Values</h3>
              <p>
                Respect, empathy, integrity, joyful learning, inclusivity and a
                deep connection to cultural roots form the pillars of our
                educational philosophy.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Why Choose Us */}
      <section className="section">
        <h2>Why Choose Sanskaar Montessori?</h2>
        <p className="section-subtitle">Play - Learn - Grow</p>
        <div className="cards">
          <div className="card">
            <div className="card-icon"><Microscope size={32} /></div>
            <h3>Montessori Method</h3>
            <p>
              Child-led, hands-on learning that fosters independence, critical
              thinking and a love of discovery.
            </p>
          </div>
          <div className="card">
            <div className="card-icon"><HandHeart size={32} /></div>
            <h3>Value-Based Approach</h3>
            <p>
              We integrate Sanskaar (values) into daily activities, nurturing
              character alongside academics.
            </p>
          </div>
          <div className="card">
            <div className="card-icon"><Shield size={32} /></div>
            <h3>Safe &amp; Caring</h3>
            <p>
              A warm, secure environment where children feel loved, respected
              and free to express themselves.
            </p>
          </div>
          <div className="card">
            <div className="card-icon"><Users size={32} /></div>
            <h3>Small Class Sizes</h3>
            <p>
              Personalised attention ensures every child receives the guidance
              and support they need to thrive.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-banner">
        <h2>Join the Sanskaar Montessori Family</h2>
        <p>Admissions open for 2026-2027. Reach out to learn more.</p>
        <a href="tel:+919113805407" className="btn-cta">
          Contact Us
        </a>
      </div>
    </>
  );
};

export default About;
