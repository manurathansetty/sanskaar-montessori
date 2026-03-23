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
            <h3>Why Sanskaar?</h3>
            <p>
              The name, tagline and logo—"Rooted in Values, Growing with
              Joy"—beautifully reflect our philosophy. At Sanskaar, we believe
              that true education begins with values. Sanskaar Montessori was
              conceived with a deep commitment to nurturing not just academic
              growth, but the character and inner strength of every child. We
              create an environment where kindness, respect, empathy and
              responsibility are lived experiences, not just taught concepts.
            </p>
            <p>
              At Sanskaar Montessori, learning goes far beyond the classroom
              walls—it comes alive through real-world experiences. Children step
              into their neighbourhoods to explore places like bakeries, grocery
              stores, tailor shops and local markets, gaining practical
              knowledge, language and numerical skills that connect learning
              with life. These experiences nurture curiosity, confidence and a
              deeper understanding of the world around them.
            </p>
            <p>
              We also believe in building a strong school–parent partnership and
              warmly invite parents to volunteer in selected activities, becoming
              a meaningful part of their child's learning journey.
            </p>
            <p>
              Sanskaar Montessori and Day Care is a truly child-centric
              environment that welcomes children from all backgrounds. Here,
              every child is respected as an individual and encouraged to learn
              at their own pace, with joy and without pressure. We cater to
              children aged 18 months to 6 years, nurturing independence,
              responsibility and a natural love for learning—laying a strong
              foundation for life.
            </p>
            <p>
              Our day care extends this philosophy beyond supervision. It is a
              space where children actively participate in daily routines, learn
              to care for their environment and build meaningful relationships
              with their peers. Every moment is an opportunity for growth,
              discovery and connection—ensuring that each child feels secure,
              valued and inspired every single day.
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
