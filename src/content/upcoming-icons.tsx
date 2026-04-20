import React from 'react';
import {
  DoorOpen, CalendarDays, CalendarClock, Star, Heart, Sun, Users, Sparkles,
  School, Baby, Palette, BookOpen, Sprout, Music, Trophy, Leaf, Globe,
  Camera, Gift, Mic2, Paintbrush, FlameKindling, TreePine, Landmark, Hourglass,
} from 'lucide-react';

export const UPCOMING_ICON_MAP: Record<string, React.ReactElement<{ size?: number }>> = {
  DoorOpen:      <DoorOpen size={40} />,
  CalendarDays:  <CalendarDays size={40} />,
  CalendarClock: <CalendarClock size={40} />,
  Star:          <Star size={40} />,
  Heart:         <Heart size={40} />,
  Sun:           <Sun size={40} />,
  Users:         <Users size={40} />,
  Sparkles:      <Sparkles size={40} />,
  School:        <School size={40} />,
  Baby:          <Baby size={40} />,
  Palette:       <Palette size={40} />,
  BookOpen:      <BookOpen size={40} />,
  Sprout:        <Sprout size={40} />,
  Music:         <Music size={40} />,
  Trophy:        <Trophy size={40} />,
  Leaf:          <Leaf size={40} />,
  Globe:         <Globe size={40} />,
  Camera:        <Camera size={40} />,
  Gift:          <Gift size={40} />,
  Mic2:          <Mic2 size={40} />,
  Paintbrush:    <Paintbrush size={40} />,
  FlameKindling: <FlameKindling size={40} />,
  TreePine:      <TreePine size={40} />,
  Landmark:      <Landmark size={40} />,
  Hourglass:     <Hourglass size={40} />,
};
