import React from 'react';
import { GraduationCap, Leaf, Heart, Globe } from 'lucide-react';

const Founders: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>About the Founders</h1>
        <p>Meet the passionate educators behind Sanskaar Montessori</p>
      </div>

      {/* Founders */}
      <section className="section">
        <h2>Our Founders</h2>
        <p className="section-subtitle">
          Driven by a shared vision of nurturing young minds with values and joy
        </p>
        <div className="founders-grid">
          <div className="founder-card">
            <div className="avatar"><GraduationCap size={48} /></div>
            <h3>Founder 1</h3>
            <p className="role">Co-Founder &amp; Director</p>
            <p>
              With a deep passion for early childhood education and the
              Montessori philosophy, our founder brings years of experience in
              creating nurturing learning environments. Their vision is to blend
              the best of Montessori methodology with the richness of Indian
              values to shape confident, compassionate children.
            </p>
          </div>
          <div className="founder-card">
            <div className="avatar"><GraduationCap size={48} /></div>
            <h3>Founder 2</h3>
            <p className="role">Co-Founder &amp; Director</p>
            <p>
              Committed to building a safe and joyful space for children, our
              co-founder focuses on curriculum development and community
              engagement. Their belief that every child deserves a strong
              foundation of values drives the ethos of Sanskaar Montessori.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <div className="section-alt">
        <section className="section">
          <h2>Our Educational Philosophy</h2>
          <p className="section-subtitle">
            Where Montessori meets Sanskaar
          </p>
          <div className="cards">
            <div className="card">
              <div className="card-icon"><Leaf size={32} /></div>
              <h3>Child-Centred Learning</h3>
              <p>
                Every child is unique. We observe, guide and support each
                child's individual learning journey, respecting their pace and
                interests.
              </p>
            </div>
            <div className="card">
              <div className="card-icon"><Heart size={32} /></div>
              <h3>Rooted in Values</h3>
              <p>
                Sanskaar - the values of respect, kindness, honesty and empathy -
                are woven into every activity, interaction and lesson.
              </p>
            </div>
            <div className="card">
              <div className="card-icon"><Globe size={32} /></div>
              <h3>Holistic Development</h3>
              <p>
                We nurture the whole child - cognitive, emotional, social and
                physical - preparing them not just for school, but for life.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="cta-banner">
        <h2>Want to Know More?</h2>
        <p>We'd love to hear from you. Get in touch today.</p>
        <a href="tel:+919113805407" className="btn-cta">
          Call Us: +91 91138 05407
        </a>
      </div>
    </>
  );
};

export default Founders;
