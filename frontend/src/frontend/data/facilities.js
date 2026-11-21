import { genImage } from '../utils/images';

/**
 * Club facilities. Availability, pricing and descriptions are data-driven so the
 * manager/admin side can reconfigure them without touching components.
 */
export const facilities = [
  {
    id: 'tennis',
    name: 'Tennis',
    icon: 'Tennis',
    accent: '#00a3ff',
    image: genImage(
      'modern outdoor tennis court at dusk with blue acrylic surface, glowing floodlights, net in focus, professional sports club photograph'
    ),
    description: 'Six floodlit championship courts with premium acrylic surfacing and ball-machine lanes.',
    availability: 'Open now',
    availabilityTone: 'badge-active',
    courts: 6,
    hours: '06:00 – 22:00',
    peakPrice: 900,
    offPeakPrice: 550,
    rating: 4.8,
    tags: ['Floodlit', 'Coaching', 'Ball machine'],
  },
  {
    id: 'badminton',
    name: 'Badminton',
    icon: 'Activity',
    accent: '#22c55e',
    image: genImage(
      'indoor badminton courts with wooden flooring, high ceiling, bright overhead lights, empty professional sports hall photograph'
    ),
    description: 'Eight BWF-standard indoor courts with sprung maple flooring and tournament-grade lighting.',
    availability: 'Open now',
    availabilityTone: 'badge-active',
    courts: 8,
    hours: '05:30 – 23:00',
    peakPrice: 500,
    offPeakPrice: 320,
    rating: 4.9,
    tags: ['Indoor', 'Air-conditioned', 'Tournament grade'],
  },
  {
    id: 'cricket',
    name: 'Cricket',
    icon: 'Trophy',
    accent: '#fbbf24',
    image: genImage(
      'cricket practice nets with green turf pitch and bowling machine, floodlights, professional cricket academy photograph'
    ),
    description: 'Indoor turf practice lanes with bowling machines plus a full-size turf oval for weekend matches.',
    availability: 'Open now',
    availabilityTone: 'badge-active',
    courts: 4,
    hours: '06:00 – 21:00',
    peakPrice: 1200,
    offPeakPrice: 800,
    rating: 4.7,
    tags: ['Turf pitch', 'Bowling machine', 'Academy'],
  },
  {
    id: 'padel',
    name: 'Padel',
    icon: 'Zap',
    accent: '#ff1744',
    image: genImage(
      'modern padel court with glass walls and blue turf, dramatic evening lighting, contemporary sports club photograph'
    ),
    description: 'Four glass-walled padel courts — the fastest-growing social sport at ClubBloom.',
    availability: 'Open now',
    availabilityTone: 'badge-active',
    courts: 4,
    hours: '06:00 – 23:00',
    peakPrice: 1000,
    offPeakPrice: 650,
    rating: 4.9,
    tags: ['Social play', 'Glass court', 'Coaching'],
  },
  {
    id: 'fitness',
    name: 'Fitness Studio',
    icon: 'Dumbbell',
    accent: '#a855f7',
    image: genImage(
      'premium modern gym interior with dark equipment, neon accent lighting, treadmills and free weights, luxury fitness studio photograph'
    ),
    description: 'Strength floor, functional zone, cardio deck and daily strength plus HIIT group classes.',
    availability: 'Open now',
    availabilityTone: 'badge-active',
    courts: 1,
    hours: '05:00 – 23:00',
    peakPrice: 0,
    offPeakPrice: 0,
    rating: 4.8,
    tags: ['Group classes', 'Personal training', 'Sauna'],
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria & Bar',
    icon: 'Coffee',
    accent: '#fb923c',
    image: genImage(
      'upscale sports club cafeteria and juice bar with dark wood, pendant lights, healthy bowls on counter, warm modern photograph'
    ),
    description: 'Courtside cafe and juice bar serving athlete-friendly meals, cold-pressed juices and evening drinks.',
    availability: 'Open now',
    availabilityTone: 'badge-active',
    courts: 1,
    hours: '07:00 – 23:30',
    peakPrice: 0,
    offPeakPrice: 0,
    rating: 4.6,
    tags: ['Terrace seating', 'Member discounts', 'Live sports'],
  },
  {
    id: 'shop',
    name: 'Sports Shop',
    icon: 'ShoppingBag',
    accent: '#38bdf8',
    image: genImage(
      'modern sports equipment retail store interior with rackets and shoes on illuminated shelves, premium retail photograph'
    ),
    description: 'Pro shop stocked with rackets, footwear, apparel and accessories — order online for court-side pickup.',
    availability: 'Open now',
    availabilityTone: 'badge-active',
    courts: 1,
    hours: '09:00 – 21:00',
    peakPrice: 0,
    offPeakPrice: 0,
    rating: 4.7,
    tags: ['Stringing service', 'Racket trial', 'Club pickup'],
  },
];

export const facilityById = (id) => facilities.find((f) => f.id === id);
