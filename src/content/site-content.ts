import siteRaw from './site.json';
import eventsRaw from './events.json';
import categoriesRaw from './gallery-categories.json';

export type PhoneEntry = { tel: string; display: string; label: string };
export type PageHeader = { title: string; subtitle: string };
export type CtaBanner  = { title: string; subtitle: string };

export type SiteContent = {
  school: { name: string; tagline: string };
  contact: {
    phones: PhoneEntry[];
    primaryPhone: string;
    registrationFormUrl: string;
    maps: { shareUrl: string; embedSrc: string };
  };
  pages: {
    home:     { heroBadge: string; heroDescription: string };
    gallery:  { header: PageHeader; ctaBanner: CtaBanner };
    events:   { header: PageHeader; ctaBanner: CtaBanner };
    founders: { header: PageHeader; ctaBanner: CtaBanner };
  };
};

export type EventPill = { label: string; value: string; icon?: string };
export type EventType = 'featured' | 'programme' | 'admissions';

export type EventConfig = {
  id: string;
  type: EventType;
  eyebrow: string;
  title: string;
  lede: string;
  imageSlot: string;
  pills: EventPill[];
  tags: string[];
  order: number;
};

export type GalleryCategory = {
  id: string;
  label: string;
  description: string;
  order: number;
};

export const SITE: SiteContent = siteRaw as SiteContent;
export const EVENTS: EventConfig[] = (eventsRaw as EventConfig[]).sort((a, b) => a.order - b.order);
export const GALLERY_CATEGORIES: GalleryCategory[] = (categoriesRaw as GalleryCategory[]).sort((a, b) => a.order - b.order);
