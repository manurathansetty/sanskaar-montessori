export type SlotType = 'collection' | 'single';

export type SlotDef = {
  id: string;
  label: string;
  type: SlotType;
};

export type Category = 'gallery' | 'events' | 'founders' | 'home';

export const SLOTS: Record<Category, SlotDef[]> = {
  gallery: [
    { id: 'classroom',      label: 'Classroom',          type: 'collection' },
    { id: 'practical-life', label: 'Practical Life',     type: 'collection' },
    { id: 'language',       label: 'Language',           type: 'collection' },
    { id: 'mathematics',    label: 'Mathematics',        type: 'collection' },
    { id: 'geography',      label: 'Geography',          type: 'collection' },
    { id: 'art-craft',      label: 'Art & Craft',        type: 'collection' },
    { id: 'story-time',     label: 'Story Time',         type: 'collection' },
    { id: 'gardening',      label: 'Gardening',          type: 'collection' },
  ],
  events: [
    { id: 'summer-camp',  label: 'Summer Camp 2026',     type: 'single' },
    { id: 'admissions',   label: 'Admissions 2026-27',   type: 'single' },
    { id: 'day-care',     label: 'Day Care Programme',   type: 'single' },
    { id: 'after-school', label: 'After School Program', type: 'single' },
  ],
  founders: [
    { id: 'sushma',  label: 'Smt. Sushma',  type: 'single' },
    { id: 'shwetha', label: 'Smt. Shwetha', type: 'single' },
  ],
  home: [
    { id: 'hero', label: 'Home Hero', type: 'single' },
  ],
};

export const CATEGORIES: Category[] = ['gallery', 'events', 'founders', 'home'];

export function findSlot(
  category: Category,
  slotId: string
): SlotDef | undefined {
  return SLOTS[category].find((s) => s.id === slotId);
}

export function isValidCategory(value: string): value is Category {
  return (CATEGORIES as string[]).includes(value);
}

export function folderPath(category: Category, slotId: string): string {
  return `sanskaar/${category}/${slotId}`;
}

export function singlePublicId(category: Category, slotId: string): string {
  return `sanskaar/${category}/${slotId}`;
}
