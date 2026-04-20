import React from 'react';
import {
  Sparkles, GraduationCap, BookOpen, Tag,
  Calendar, Clock, Users, BadgePercent, Shield,
  Home, DoorOpen,
} from 'lucide-react';
import CloudinaryImage from './CloudinaryImage';
import EventActions from './EventActions';
import type { EventConfig } from '../content/site-content';

type IconName = string | undefined;

const ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
  Sparkles, GraduationCap, BookOpen, Tag,
  Calendar, Clock, Users, BadgePercent, Shield, Home, DoorOpen,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const C = (name && ICON_MAP[name]) || Tag;
  return <C size={size} />;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string }> = {
  featured:   { label: 'Featured Event',   icon: 'Sparkles'      },
  admissions: { label: 'Admissions Open',  icon: 'GraduationCap' },
  programme:  { label: 'Programme',        icon: 'BookOpen'      },
};

type Props = { event: EventConfig };

const EventCard: React.FC<Props> = ({ event }) => {
  const badge = TYPE_CONFIG[event.type] ?? TYPE_CONFIG.programme;

  return (
    <div className="featured-event">
      <div className="featured-event-badge">
        <Icon name={badge.icon} size={14} /> {badge.label}
      </div>
      <div className="featured-event-grid">
        <div className="featured-event-media">
          <CloudinaryImage
            publicId={`sanskaar/events/${event.imageSlot}`}
            alt={event.eyebrow}
            width={800}
          />
        </div>
        <div className="featured-event-content">
          <span className="featured-event-eyebrow">
            <Icon name={badge.icon} size={16} /> {event.eyebrow}
          </span>
          <h2>{event.title}</h2>
          <p className="featured-event-lede">{event.lede}</p>

          {event.pills.length > 0 && (
            <div className="featured-event-meta">
              {event.pills.map((pill, i) => (
                <div
                  key={i}
                  className={`meta-pill${pill.icon === 'BadgePercent' ? ' meta-pill-accent' : ''}`}
                >
                  <Icon name={pill.icon} size={18} />
                  <div>
                    <span className="meta-label">{pill.label}</span>
                    <span className="meta-value">{pill.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {event.tags.length > 0 && (
            <div className="featured-event-tags">
              {event.tags.map((tag, i) => (
                <span key={i} className="event-tag">{tag}</span>
              ))}
            </div>
          )}

          <EventActions />
        </div>
      </div>
    </div>
  );
};

export default EventCard;
