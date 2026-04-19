import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, BookOpen, Star, Home as HomeIcon, Baby, Palette, Heart, Sun, ArrowRight, ClipboardEdit } from 'lucide-react';
import CloudinaryImage from '../components/CloudinaryImage';
import { useSlotImages } from '../hooks/useSlotImages';

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSemG7oTdole_VKTfNFKNOEYb_mmpjDFCT2mLMqWyxBvip_MlQ/viewform';

const Home: React.FC = () => {
  const langPick = useSlotImages('gallery', 'language');
  const gardenPick = useSlotImages('gallery', 'gardening');
  return (
    <>
      {/* Hero */}
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(27, 94, 32, 0.85) 0%, rgba(56, 142, 60, 0.72) 40%, rgba(25, 118, 210, 0.78) 100%), url("https://res.cloudinary.com/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload/c_fill,w_1600,q_auto,f_auto/sanskaar/home/hero")`,
          backgroundPosition: 'center 35%',
        }}
      >
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

      {/* Glimpses Strip */}
      <section className="section glimpses">
        <h2>A Glimpse Into Our World</h2>
        <p className="section-subtitle">
          Moments of joy, learning and discovery at Sanskaar Montessori
        </p>
        <div className="glimpses-strip">
          <Link to="/gallery" className="glimpse-tile">
            <CloudinaryImage publicId="sanskaar/home/hero" alt="Children at Sanskaar Montessori" width={600} loading="lazy" />
          </Link>
          <Link to="/gallery" className="glimpse-tile">
            {langPick.state.status === 'success' && langPick.state.images[0] && (
              <CloudinaryImage
                publicId={langPick.state.images[0].public_id}
                alt="Hands-on Montessori activities"
                width={600}
                loading="lazy"
              />
            )}
          </Link>
          <Link to="/gallery" className="glimpse-tile">
            {gardenPick.state.status === 'success' && gardenPick.state.images[0] && (
              <CloudinaryImage
                publicId={gardenPick.state.images[0].public_id}
                alt="Joyful learning moments"
                width={600}
                loading="lazy"
              />
            )}
          </Link>
        </div>
        <div className="glimpses-cta">
          <Link to="/gallery" className="btn-link">
            View Full Gallery <ArrowRight size={18} />
          </Link>
        </div>
      </section>

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
              Sanskaar (values) are at the heart of everything we do. Kindness,
              respect, empathy and responsibility are lived experiences, not
              just taught concepts.
            </p>
          </div>
          <div className="card">
            <div className="card-icon"><Sun size={32} /></div>
            <h3>Day Care Facility</h3>
            <p>
              A space where children actively participate in daily routines,
              learn to care for their environment and build meaningful
              relationships with their peers.
            </p>
          </div>
        </div>
      </section>

      {/* Sign Up CTA */}
      <section className="section">
        <div className="signup-card">
          <div className="signup-card-icon">
            <ClipboardEdit size={36} />
          </div>
          <div className="signup-card-text">
            <h2>Sign Up for Our Programmes &amp; Events</h2>
            <p>
              Register your interest in our Day Care, After School Program,
              Summer Camp and admissions at Sanskaar Montessori. Takes less
              than a minute.
            </p>
          </div>
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta-primary"
          >
            Open Sign-Up Form <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Admissions Banner */}
      <Link
        to="/events"
        className="cta-banner cta-banner-admissions"
        aria-label="Admissions Open 2026-2027 — view details"
      >
        <span className="badge">Admissions Open</span>
        <h2>2026-2027</h2>
        <p>For children 18 months to 6 years · Day Care &amp; After-School Program available</p>
        <span className="btn-cta">
          View Admissions Details <ArrowRight size={18} />
        </span>
      </Link>
    </>
  );
};

export default Home;
