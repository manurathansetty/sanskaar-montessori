import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SITE } from '../content/site-content';

type Props = {
  primaryLabel?: string;
  phone?: string;
};

const EventActions: React.FC<Props> = ({
  primaryLabel = 'Register Interest',
  phone,
}) => {
  const tel = phone ?? SITE.contact.primaryPhone;
  return (
    <div className="featured-event-actions">
      <a
        href={SITE.contact.registrationFormUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cta-primary"
      >
        {primaryLabel} <ArrowRight size={18} />
      </a>
      <a href={`tel:${tel}`} className="btn-cta-ghost">
        Call to Enquire
      </a>
    </div>
  );
};

export default EventActions;
