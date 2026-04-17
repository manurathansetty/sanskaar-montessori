import React from 'react';
import { DoorOpen, Calendar, Sun, Clock, Users, Sparkles, Tag, GraduationCap, BadgePercent } from 'lucide-react';
import EventActions from '../components/EventActions';

const Events: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Events</h1>
        <p>Stay updated with our latest activities and celebrations</p>
      </div>

      {/* Featured: Summer Camp */}
      <div className="section-alt">
        <section className="section">
          <div className="featured-event">
            <div className="featured-event-badge">
              <Sparkles size={14} /> Featured Event
            </div>
            <div className="featured-event-grid">
              <div className="featured-event-media">
                <img
                  src="/summer_camp.jpg"
                  alt="Sanskaar Montessori Summer Camp 2026"
                />
              </div>
              <div className="featured-event-content">
                <span className="featured-event-eyebrow">
                  <Sun size={16} /> Summer Camp 2026
                </span>
                <h2>A Joyful Summer of Learning &amp; Play</h2>
                <p className="featured-event-lede">
                  Two weeks of music, yoga, drama, gardening and creative play —
                  designed to keep little ones curious, active and happy through
                  the summer break.
                </p>

                <div className="featured-event-meta">
                  <div className="meta-pill">
                    <Calendar size={18} />
                    <div>
                      <span className="meta-label">When</span>
                      <span className="meta-value">Apr 15 – Apr 30 · Mon–Fri</span>
                    </div>
                  </div>
                  <div className="meta-pill">
                    <Clock size={18} />
                    <div>
                      <span className="meta-label">Time</span>
                      <span className="meta-value">10:00 AM – 1:00 PM</span>
                    </div>
                  </div>
                  <div className="meta-pill">
                    <Users size={18} />
                    <div>
                      <span className="meta-label">Age Group</span>
                      <span className="meta-value">3+ years</span>
                    </div>
                  </div>
                  <div className="meta-pill meta-pill-accent">
                    <Tag size={18} />
                    <div>
                      <span className="meta-label">Introductory Offer</span>
                      <span className="meta-value">₹4,000/-</span>
                    </div>
                  </div>
                </div>

                <div className="featured-event-tags">
                  <span className="event-tag">Best Out of Waste</span>
                  <span className="event-tag">Grow &amp; Eat</span>
                  <span className="event-tag">Music · Jana Pada Geethe &amp; Shlokas</span>
                  <span className="event-tag">Yoga</span>
                  <span className="event-tag">Drama &amp; Theatre</span>
                </div>

                <EventActions />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Featured: Admissions 2026 – 2027 */}
      <section className="section">
        <div className="featured-event">
          <div className="featured-event-badge">
            <GraduationCap size={14} /> Admissions Open
          </div>
          <div className="featured-event-grid">
            <div className="featured-event-media">
              <img
                src="/gallery/admissions-01.jpg"
                alt="Sanskaar Montessori Admissions 2026-2027 Introductory Offer"
              />
            </div>
            <div className="featured-event-content">
              <span className="featured-event-eyebrow">
                <Calendar size={16} /> Admissions 2026 – 2027
              </span>
              <h2>Now Open · Limited Seats Available</h2>
              <p className="featured-event-lede">
                Admissions are open for children aged 18 months to 6 years.
                Day care also available for working parents.
              </p>

              <div className="featured-event-meta">
                <div className="meta-pill">
                  <Users size={18} />
                  <div>
                    <span className="meta-label">Age Group</span>
                    <span className="meta-value">18 months – 6 years</span>
                  </div>
                </div>
                <div className="meta-pill meta-pill-accent">
                  <BadgePercent size={18} />
                  <div>
                    <span className="meta-label">Introductory Offer</span>
                    <span className="meta-value">10% off annual fee</span>
                  </div>
                </div>
                <div className="meta-pill">
                  <Calendar size={18} />
                  <div>
                    <span className="meta-label">Offer Ends</span>
                    <span className="meta-value">15 May 2026</span>
                  </div>
                </div>
              </div>

              <EventActions />
            </div>
          </div>
        </div>
      </section>

      {/* Open House / Open Day */}
      <section className="section">
        <h2>Open House at Sanskaar Montessori</h2>
        <p className="section-subtitle">
          Visit us, meet our educators and see our Montessori approach in action
        </p>
        <div className="content-box-featured">
          <div className="card-icon"><DoorOpen size={40} /></div>
          <p>
            An Open House at Sanskaar Montessori is a welcoming opportunity for parents to step into our learning environment and experience our philosophy in action. It is a time to explore our thoughtfully prepared classrooms, understand the Montessori approach we follow and see how children learn through hands-on experiences and real-life connections.
          </p>
          <p>
            During the Open House, parents can interact with our educators, gain insights into our child-centric practices and understand how we nurture independence, values and a love for learning.
          </p>
          <p className="open-house-meta">
            <span className="soon-tag">Coming Soon</span>
            <span>Dates to be announced</span>
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-banner">
        <h2>Have Questions?</h2>
        <p>Call us — we'd love to tell you more about our programs.</p>
        <a href="tel:+919113805407" className="btn-cta">
          Call: +91 91138 05407
        </a>
      </div>
    </>
  );
};

export default Events;
