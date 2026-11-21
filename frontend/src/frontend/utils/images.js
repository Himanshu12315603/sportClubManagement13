/**
 * Image helper — builds a prompt-driven image URL for web assets.
 * All artwork is generated from text prompts (no hardcoded external assets).
 *
 * When the prompt-driven image is unavailable (slow API, network, etc.) a
 * reliable Unsplash Source fallback is provided so product/facility/cafe
 * cards always show a real image.
 */
const BASE = 'https://coresg-normal.trae.ai/api/ide/v1/text_to_image';

export function genImage(prompt, size = 'landscape_4_3') {
  return `${BASE}?prompt=${encodeURIComponent(prompt)}&image_size=${size}`;
}

/** Real, hand-picked Unsplash photo IDs for reliable fallbacks. */
export const productPhoto = {
  'P-1001': '1622276677921-14291953b5ec', // tennis racket
  'P-1002': '1606112251290-a4904b3c1ba5', // badminton
  'P-1003': '1617071331051-a1d17c4f0e3b', // padel racket
  'P-2001': '1542291026-7a8c40eba340', // tennis shoes
  'P-2002': '1595950194232-d03f1058f177', // sports shoes
  'P-2003': '1549298916-b41d501d3772', // running shoes
  'P-3001': '1622276677921-14291953b5ec', // tennis balls
  'P-3002': '1565731369464-e858e2091b75', // shuttlecock
  'P-3003': '1531415853970-0127803342f3', // cricket ball
  'P-4001': '1511671782779-c97d3d27b1c4', // grip tape
  'P-4002': '1551525326-26a6d574404b', // racket bag
  'P-4003': '1575311105861-91122cc579fa', // fitness band
  'P-5001': '1521572163474-6864f9cf17ab', // tee
  'P-5002': '1591047139829-d91aecb6caea', // shorts
  'P-5003': '1591047139829-d91aecb6caea', // jacket
};

const categorySearch = {
  rackets: 'tennis-racket',
  shoes: 'sports-shoes',
  balls: 'sports-ball',
  accessories: 'sports-equipment',
  apparel: 'sportswear',
};

/**
 * Returns a reliable Unsplash Source URL for a product (by id) or a category.
 * Unsplash Source serves a stable CDN image keyed by photo id or keyword, so
 * it always loads quickly even when the text-to-image API is slow.
 */
export function fallbackImage(id, category, size = 'square') {
  const photoId = productPhoto[id];
  const width = 600;
  const height = 600;
  if (photoId) {
    return `https://source.unsplash.com/${photoId}/${width}x${height}`;
  }
  const kw = categorySearch[category] || 'sports-product';
  return `https://source.unsplash.com/featured/${width}x${height}/?${kw}`;
}

export function fallbackLandscape(keyword) {
  return `https://source.unsplash.com/featured/1600x900/?${encodeURIComponent(keyword)}`;
}

/** Real Unsplash photo IDs for cafe menu fallbacks (hand-picked per dish). */
export const cafePhoto = {
  'CF-101': '1480518673665-4d08dccf3c87',
  'CF-102': '1544149099-1e5cc06e94d3',
  'CF-103': '1494822578308-a80ea9a0646e',
  'CF-104': '1600271886744-d558207aca8b',
  'CF-201': '1525351484163-7529414344d8',
  'CF-202': '1567620905732-2d1ec7ab7445',
  'CF-203': '1525351484163-7529414344d8',
  'CF-301': '1546069901-ba9599a7e63c',
  'CF-302': '1565299624946-b28f40a0ae38',
  'CF-303': '1567620905732-2d1ec7ab7445',
  'CF-401': '1565299624946-b28f40a0ae38',
  'CF-402': '1565299585323-38d6b0865b47',
  'CF-403': '1551782450-a2132b4ba21d',
  'CF-501': '1512621776951-a57141f2eefd',
  'CF-502': '1546069901-ba9599a7e63c',
  'CF-601': '1565958011703-44f9829ba187',
  'CF-602': '1551024506-0bccd828d307',
};

export function fallbackCafe(id, category) {
  const photoId = cafePhoto[id];
  if (photoId) return `https://source.unsplash.com/${photoId}/600x600`;
  const kw = category || 'food';
  return `https://source.unsplash.com/featured/600x600/?${kw}`;
}

export default genImage;
