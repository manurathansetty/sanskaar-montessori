import React from 'react';
import { Leaf, Heart, Globe } from 'lucide-react';

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
        <div className="founder-article">
          <div className="founder-photo">
            <img src="/sushma.jpg" alt="Sushma Nagendra" />
          </div>
          <h3>Sushma Nagendra</h3>
          <p className="role">Founder &amp; Director</p>
          <p>
            Sushma Nagendra is a passionate educator dedicated to nurturing young minds with care, understanding and purpose. She holds a Bachelor of Arts degree, along with certifications in Montessori Education for Pre-Primary, Primary and Elementary levels. She has also completed her Diploma in NTT and an ECCE certification from Finland, reflecting her commitment to global best practices in early childhood education. Currently, she is pursuing a PG Diploma in Inclusive Education to deepen her understanding of diverse learning needs.
          </p>
          <p>
            With over 18 years of experience working with early years children, Sushma has continuously evolved in her understanding of child development. Her journey has led her to rediscover and reimagine the uniqueness of every child—how each one grows, learns and expresses differently at every stage. This deep insight became the foundation for conceiving Sanskaar Montessori, a truly child-centric space that offers freedom with limits, while nurturing strong values and a sense of responsibility.
          </p>
          <p>
            Her growing interest in inclusive education has further strengthened her vision. She strongly believes in creating classrooms where children with intellectual disabilities are meaningfully included and supported according to their individual needs. For Sushma, this journey is one of continuous learning and growth. With every child she meets, she continues to learn, evolve and refine her approach—ensuring that Sanskaar Montessori remains a space where every child feels valued, understood and empowered to thrive.
          </p>
        </div>

        <div className="founder-article">
          <div className="founder-photo">
            <img src="/shwetha.jpg" alt="Smt. Shwetha V" />
          </div>
          <h3>Smt. Shwetha V</h3>
          <p className="role">Co-Founder &amp; Director</p>
          <p>
            Smt. Shwetha V, the co-founder of Sanskaar Montessori, is a graduate in Bachelor of Commerce from Bangalore University, with over 5 years of professional experience in Accounts and Administration. While her career began in the corporate field, her true passion has always been working with children—especially toddlers during their most formative years.
          </p>
          <p>
            Driven by a deep interest in early childhood education, she has embraced the Montessori philosophy, which encourages independence, hands-on learning and respect for each child's unique pace of development. Starting Sanskaar Montessori is not just a professional step, but a heartfelt journey to create a safe, joyful and stimulating environment for young learners.
          </p>
          <p>
            She believes in continuously taking up new challenges and growing alongside the children she teaches. At Sanskaar Montessori, our goal is to build a strong foundation for every child—academically, socially and emotionally—while making learning a joyful and meaningful experience.
          </p>
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
