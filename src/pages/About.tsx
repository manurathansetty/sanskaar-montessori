import React from 'react';
import { Target, Eye, HeartHandshake, Heart, Lightbulb, Users, BookOpen, Smile, HandHeart, Microscope, Sprout } from 'lucide-react';

const About: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>About Us</h1>
        <p>Discover the heart and soul of Sanskaar Montessori</p>
      </div>

      {/* Why Sanskaar */}
      <section className="section">
        <h2>Why Sanskaar?</h2>
        <div className="content-box-centered">
          <div className="card-icon"><Sprout size={40} /></div>
          <p>
            At Sanskaar Montessori, our name is our promise. "Rooted in Values, Growing with Joy" is not just a tagline—it is the soul of everything we do.
          </p>
          <p>
            We believe education begins beyond books—with values that shape character, choices and life. At Sanskaar, children don't just learn… they become—kind, respectful, empathetic and responsible individuals.
          </p>
          <p>
            <strong>Learning here is alive.</strong> From exploring neighbourhood spaces like bakeries, markets and local stores to engaging in real-world experiences, children connect knowledge with life—building confidence, curiosity and practical understanding every day.
          </p>
          <p>
            <strong>We cherish the power of partnership.</strong> Parents are not spectators, but co-travellers in this journey—invited to participate, engage and grow alongside their children.
          </p>
          <p>
            <strong>Every child at Sanskaar is seen, heard and valued.</strong> In our nurturing, child-centric environment, children learn at their own pace—free from pressure, full of joy—developing independence, responsibility and a lifelong love for learning.
          </p>
          <p>
            <strong>Our Day Care is an extension of this philosophy.</strong> More than care, it is a space of belonging—where children engage in meaningful routines, build relationships and grow in a secure, loving environment.
          </p>
          <p className="highlight-text">
            At Sanskaar, we don't just prepare children for school. We prepare them for life.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <div className="section-alt">
        <section className="section">
          <div className="mission-vision-grid">
            <article className="mv-card">
              <div className="card-icon"><Target size={40} /></div>
              <h2>Our Mission</h2>
              <p>
                At Sanskaar Montessori, our mission is to nurture independent, confident and compassionate learners by providing a child-centric environment rooted in strong values. We aim to foster curiosity, creativity and a lifelong love for learning through meaningful experiences, while supporting each child's unique pace of growth. Through a balance of guidance, freedom and real-world exposure, we strive to build responsible individuals who are prepared not just for school, but for life.
              </p>
            </article>
            <article className="mv-card">
              <div className="card-icon"><Eye size={40} /></div>
              <h2>Our Vision</h2>
              <p>
                At Sanskaar Montessori, our vision is to create a nurturing and inspiring space where every child grows into a confident, compassionate and responsible individual. We envision a learning community rooted in strong values, where children develop a deep love for learning, respect for others and a meaningful connection with the world around them. Our goal is to lay a strong foundation that empowers children to become thoughtful, independent learners and positive contributors to society.
              </p>
            </article>
          </div>
        </section>
      </div>

      {/* Values */}
      <div className="section-alt">
        <section className="section">
          <h2>Our Values</h2>
          <p className="section-subtitle">
            The pillars of our educational philosophy
          </p>
          <div className="values-grid">
            <article className="value-card">
              <div className="value-icon"><HeartHandshake size={26} /></div>
              <h3>Respect</h3>
              <p>We honour every child, family and educator—creating a culture of mutual respect and understanding.</p>
            </article>
            <article className="value-card">
              <div className="value-icon"><Heart size={26} /></div>
              <h3>Kindness &amp; Empathy</h3>
              <p>Children learn to care for others, building emotional intelligence and compassion in every interaction.</p>
            </article>
            <article className="value-card">
              <div className="value-icon"><Lightbulb size={26} /></div>
              <h3>Independence</h3>
              <p>We empower children to think, choose and act for themselves—building confidence and self-reliance.</p>
            </article>
            <article className="value-card">
              <div className="value-icon"><HandHeart size={26} /></div>
              <h3>Responsibility</h3>
              <p>Children learn to care for themselves, their environment and their community.</p>
            </article>
            <article className="value-card">
              <div className="value-icon"><BookOpen size={26} /></div>
              <h3>Curiosity &amp; Love for Learning</h3>
              <p>We nurture a natural desire to explore, question and discover—making learning a joyful journey.</p>
            </article>
            <article className="value-card">
              <div className="value-icon"><Users size={26} /></div>
              <h3>Inclusivity</h3>
              <p>Every child is welcomed, valued and supported regardless of their background or abilities.</p>
            </article>
            <article className="value-card value-feature">
              <div className="value-feature-inner">
                <div className="value-icon value-icon-lg"><Smile size={40} /></div>
                <div className="value-feature-text">
                  <h3>Joyful Learning</h3>
                  <p>Learning should be fun, engaging and meaningful—filled with wonder and delight.</p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>

      {/* Montessori Method */}
      <section className="section">
        <h2>Montessori Method at Sanskaar</h2>
        <div className="content-box-featured">
          <div className="card-icon"><Microscope size={40} /></div>
          <p>
            At Sanskaar Montessori, we follow the Montessori approach as a way of life rather than just a method of teaching. Our classrooms are thoughtfully prepared to encourage independence, exploration and self-directed learning, where children choose activities based on their interests and developmental needs.
          </p>
          <p>
            With the guidance of trained adults, children engage with hands-on Montessori materials that build concentration, coordination and critical thinking. We respect each child's unique pace of learning, allowing them the freedom to discover, make choices and grow with confidence—fostering a deep sense of responsibility, discipline and a lifelong love for learning.
          </p>
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
