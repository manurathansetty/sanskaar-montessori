import React from 'react';
import { ArrowRight } from 'lucide-react';

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSemG7oTdole_VKTfNFKNOEYb_mmpjDFCT2mLMqWyxBvip_MlQ/viewform';

type Props = {
  primaryLabel?: string;
  phone?: string;
};

const EventActions: React.FC<Props> = ({
  primaryLabel = 'Register Interest',
  phone = '+919113805407',
}) => {
  return (
    <div className="featured-event-actions">
      <a
        href={FORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-cta-primary"
      >
        {primaryLabel} <ArrowRight size={18} />
      </a>
      <a href={`tel:${phone}`} className="btn-cta-ghost">
        Call to Enquire
      </a>
    </div>
  );
};

export default EventActions;
