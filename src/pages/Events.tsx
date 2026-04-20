import React from 'react';
import { DoorOpen } from 'lucide-react';
import EventCard from '../components/EventCard';
import { EVENTS, SITE } from '../content/site-content';
import type { UpcomingEvent } from '../content/site-content';
import { UPCOMING_ICON_MAP } from './admin/AdminUpcomingEvents';

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

      {/* Upcoming Events — driven by site.json upcomingEvents */}
      {SITE.upcomingEvents && SITE.upcomingEvents.map((ev: UpcomingEvent, i: number) => {
        const altIdx = EVENTS.length + i;
        const icon = UPCOMING_ICON_MAP[ev.icon ?? 'DoorOpen']
          ? React.cloneElement(UPCOMING_ICON_MAP[ev.icon ?? 'DoorOpen'], { size: 22 })
          : <DoorOpen size={22} />;
        return (
          <div key={i} className={altIdx % 2 === 0 ? 'section-alt' : ''}>
            <section className="section">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {icon}{ev.title}
              </h2>
              {ev.subtitle && <p className="section-subtitle">{ev.subtitle}</p>}
              <div className="content-box-featured">
                {ev.description.split('\n\n').map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
                <p className="open-house-meta">
                  <span className="soon-tag">Coming Soon</span>
                  <span>{ev.date}</span>
                </p>
              </div>
            </section>
          </div>
        );
      })}

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
