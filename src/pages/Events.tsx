import React from 'react';
import { DoorOpen } from 'lucide-react';
import EventCard from '../components/EventCard';
import { EVENTS, SITE } from '../content/site-content';

const Events: React.FC = () => {
  const primaryPhone = SITE.contact.phones.find(
    (p) => p.tel === SITE.contact.primaryPhone
  );

  return (
    <>
      <div className="page-header">
        <h1>{SITE.pages.events.header.title}</h1>
        <p>{SITE.pages.events.header.subtitle}</p>
      </div>

      {EVENTS.map((event, i) => {
        const isAlt = i % 2 === 0;
        return isAlt ? (
          <div key={event.id} className="section-alt">
            <section className="section">
              <EventCard event={event} />
            </section>
          </div>
        ) : (
          <section key={event.id} className="section">
            <EventCard event={event} />
          </section>
        );
      })}

      {/* Open House — static section, not managed via content system */}
      <div className={EVENTS.length % 2 === 0 ? 'section-alt' : ''}>
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
      </div>

      <div className="cta-banner">
        <h2>{SITE.pages.events.ctaBanner.title}</h2>
        <p>{SITE.pages.events.ctaBanner.subtitle}</p>
        <a href={`tel:${SITE.contact.primaryPhone}`} className="btn-cta">
          Call: {primaryPhone?.display ?? SITE.contact.primaryPhone}
        </a>
      </div>
    </>
  );
};

export default Events;
