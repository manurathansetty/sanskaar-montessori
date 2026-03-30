import React from 'react';
import { Link } from 'react-router-dom';
import { DoorOpen } from 'lucide-react';

const Events: React.FC = () => {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Events</h1>
        <p>Stay updated with our latest activities and celebrations</p>
      </div>

      {/* Open House */}
      <section className="section">
        <h2>Open House at Sanskaar Montessori</h2>
        <div className="content-box-featured">
          <div className="card-icon"><DoorOpen size={40} /></div>
          <p>
            An Open House at Sanskaar Montessori is a welcoming opportunity for parents to step into our learning environment and experience our philosophy in action. It is a time to explore our thoughtfully prepared classrooms, understand the Montessori approach we follow and see how children learn through hands-on experiences and real-life connections.
          </p>
          <p>
            During the Open House, parents can interact with our educators, gain insights into our child-centric practices and understand how we nurture independence, values and a love for learning. It also offers a chance to learn about our programs, day care facilities and the strong partnership we build with families.
          </p>
          <p>
            More than just a visit, it is an experience that helps parents connect with our vision and see how Sanskaar Montessori creates a joyful, respectful and meaningful foundation for every child's growth.
          </p>
        </div>
      </section>

      {/* Upcoming Events */}
      <div className="section-alt">
        <section className="section">
          <h2>Upcoming Events</h2>
          <p className="section-subtitle">
            Join us for fun, learning and celebration
          </p>
          <div className="events-grid">
            <div className="event-card">
              <div className="event-header">
                <h3>Open Day - School Visit</h3>
                <span className="date">Coming Soon</span>
              </div>
              <div className="event-body">
                <p>
                  Visit Sanskaar Montessori, meet our educators, explore our
                  classrooms and discover our Montessori approach first-hand. A
                  wonderful opportunity for parents to see where their child will
                  play, learn and grow.
                </p>
                <Link to="/" className="btn">Register Interest</Link>
              </div>
            </div>

            <div className="event-card">
              <div className="event-header">
                <h3>Admissions 2026-2027</h3>
                <span className="date">Now Open</span>
              </div>
              <div className="event-body">
                <p>
                  Admissions are now open for children aged 18 months to 6 years
                  for the academic year 2026-2027. Day care facility also
                  available. Enrol your child in a safe, caring and joyful
                  learning environment.
                </p>
                <a href="tel:+919113805407" className="btn">Enquire Now</a>
              </div>
            </div>

            <div className="event-card">
              <div className="event-header summer-camp-header">
                <h3>Summer Fun Camp</h3>
                <span className="date">Coming Soon</span>
              </div>
              <div className="event-body">
                <img src="/summer_camp.jpg" alt="Summer Fun Camp at Sanskaar Montessori" className="event-image" />
                <p>
                  A week of creative activities, outdoor play, art, music and
                  storytelling designed to keep little ones engaged and happy
                  during the summer break.
                </p>
                <Link to="/" className="btn">Register Interest</Link>
              </div>
            </div>

            <div className="event-card">
              <div className="event-header">
                <h3>Cultural Celebrations</h3>
                <span className="date">Throughout the Year</span>
              </div>
              <div className="event-body">
                <p>
                  We celebrate festivals and cultural events throughout the year,
                  helping children connect with traditions and develop an
                  appreciation for diversity and heritage.
                </p>
                <Link to="/" className="btn">Learn More</Link>
              </div>
            </div>

            <div className="event-card">
              <div className="event-header">
                <h3>Parent Workshop</h3>
                <span className="date">Coming Soon</span>
              </div>
              <div className="event-body">
                <p>
                  Interactive sessions for parents on Montessori practices at home,
                  positive parenting, early childhood development and how to
                  support your child's learning journey.
                </p>
                <Link to="/" className="btn">Register Interest</Link>
              </div>
            </div>

            <div className="event-card">
              <div className="event-header">
                <h3>Annual Day</h3>
                <span className="date">Coming Soon</span>
              </div>
              <div className="event-body">
                <p>
                  A grand celebration of our children's achievements, talents and
                  growth throughout the year. Performances, exhibitions and joyful
                  moments for the entire Sanskaar family.
                </p>
                <Link to="/" className="btn">Stay Updated</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="cta-banner">
        <h2>Don't Miss Out!</h2>
        <p>Sign up on our home page to register for upcoming events.</p>
        <Link to="/" className="btn-cta">Go to Sign Up</Link>
      </div>
    </>
  );
};

export default Events;
