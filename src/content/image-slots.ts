import { GALLERY_CATEGORIES, EVENTS } from './site-content';

export type SlotType = 'collection' | 'single';

export type SlotDef = {
  id: string;
  label: string;
  type: SlotType;
};

export type Category = 'gallery' | 'events' | 'founders' | 'home';

export const SLOTS: Record<Category, SlotDef[]> = {
  gallery: [
    ...GALLERY_CATEGORIES.map((c) => ({ id: c.id, label: c.label, type: 'collection' as SlotType })),
    { id: 'uncategorized', label: 'Uncategorized', type: 'collection' },
  ],
  events: EVENTS.map((e) => ({ id: e.imageSlot, label: e.eyebrow, type: 'single' as SlotType })),
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
