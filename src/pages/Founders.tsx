import React from 'react';
import { GraduationCap, Leaf, Heart, Globe } from 'lucide-react';

const Founders: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Meet Our Founder</h1>
        <p>The passionate educator behind Sanskaar Montessori</p>
      </div>

      {/* Founder Profile */}
      <section className="section">
        <div className="founder-profile">
          <div className="founder-profile-header">
            <div className="avatar"><GraduationCap size={48} /></div>
            <div>
              <h2>Sushma Nagendra</h2>
              <p className="role">Founder, Sanskaar Montessori</p>
            </div>
          </div>

          <div className="founder-section-card">
            <h3>A Passion for Early Childhood Education</h3>
            <p>
              Sushma Nagendra is a dedicated educator with a deep passion for nurturing young minds with care, understanding and purpose. Her academic background and global certifications in early childhood and inclusive education reflect her commitment to bringing thoughtful and meaningful practices into learning environments.
            </p>
          </div>

          <div className="founder-section-card">
            <h3>Experience that Shapes Vision</h3>
            <p>
              With over 18 years of experience in working with early years children, Sushma has developed a profound understanding of child development. Her journey has helped her recognise and respect the uniqueness of every child—how each one learns, grows and expresses in their own way.
            </p>
          </div>

          <div className="founder-section-card">
            <h3>The Birth of Sanskaar Montessori</h3>
            <p>
              This deep insight led to the creation of Sanskaar Montessori—a child-centric space where learning is guided by values, freedom and responsibility. Her vision is to offer an environment where children feel safe, respected and inspired to explore their potential.
            </p>
          </div>

          <div className="founder-section-card">
            <h3>Commitment to Inclusive Education</h3>
            <p>
              Sushma strongly believes in inclusive learning. Her growing focus on this area reflects her dedication to creating classrooms where children of all abilities, including those with intellectual disabilities, are meaningfully included and supported according to their individual needs.
            </p>
          </div>

          <div className="founder-section-card">
            <h3>A Journey of Continuous Learning</h3>
            <p>
              For Sushma, education is an ever-evolving journey. With every child she interacts with, she continues to learn, reflect and grow—ensuring that Sanskaar Montessori remains a nurturing space where every child feels valued, understood and empowered.
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
