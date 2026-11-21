/**
 * Image helper — builds reliable image URLs for web assets.
 * Uses high-speed Unsplash CDN images exclusively to guarantee instant, crisp rendering
 * and eliminate slow text-to-image API placeholder errors ("Image is generating...").
 */
export function genImage(prompt, size = 'landscape_4_3') {
  const p = (prompt || '').toLowerCase();
  if (p.includes('racket') || p.includes('tennis')) {
    return 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&h=600&q=80';
  }
  if (p.includes('badminton') || p.includes('shuttle')) {
    return 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&h=600&q=80';
  }
  if (p.includes('shoe') || p.includes('sneaker')) {
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&h=600&q=80';
  }
  if (p.includes('ball')) {
    return 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&h=600&q=80';
  }
  if (p.includes('cafe') || p.includes('food') || p.includes('juice') || p.includes('salad')) {
    return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&h=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=1200&h=800&q=80';
}

/** Direct Unsplash photo IDs for reliable product images. */
export const productPhoto = {
  'P-1001': '1622276677921-14291953b5ec', // tennis racket
  'P-1002': '1626224583764-f87db24ac4ea', // badminton racket
  'P-1003': '1617071331051-a1d17c4f0e3b', // padel racket
  'P-2001': '1542291026-7eec264c27ff', // tennis shoes
  'P-2002': '1595950653106-6c9ebd614d3a', // sports shoes
  'P-2003': '1584735935682-2f2b69dff9d2', // gym sneakers
  'P-3001': '1554068865-24cecd4e34b8', // tennis balls
  'P-3002': '1613918108466-292b78a8ef95', // shuttlecocks
  'P-3003': '1531415074968-036ba1b575da', // cricket ball
  'P-4001': '1511671782779-c97d3d27b1c4', // grip tape
  'P-4002': '1553062407-98eeb64c6a62', // sports bag
  'P-4003': '1575311373937-040b8e1fd5b6', // smart fitness band
  'P-5001': '1521572267360-ee0c2909d518', // athletic performance tee
  'P-5002': '1591195853828-11db59a44f6b', // sport shorts
  'P-5003': '1544441893-675973e31985', // training jacket
};

const categoryFallbacks = {
  rackets: '1622276677921-14291953b5ec',
  shoes: '1542291026-7eec264c27ff',
  balls: '1554068865-24cecd4e34b8',
  accessories: '1553062407-98eeb64c6a62',
  apparel: '1521572267360-ee0c2909d518',
};

/**
 * Returns a high-speed Unsplash CDN image URL.
 */
export function fallbackImage(id, category, size = 'square') {
  const photoId = productPhoto[id] || categoryFallbacks[category] || '1622276677921-14291953b5ec';
  const w = size === 'square' ? 600 : 800;
  const h = size === 'square' ? 600 : 500;
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
}

export function fallbackLandscape(keyword) {
  const landscapeMap = {
    'sports-shop': 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?auto=format&fit=crop&w=1600&h=900&q=80',
    'tennis': 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1600&h=900&q=80',
    'badminton': 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1600&h=900&q=80',
    'cafeteria': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&h=900&q=80',
  };
  return landscapeMap[keyword] || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&h=900&q=80';
}

/** Hand-picked Unsplash photo IDs for cafeteria dishes. */
export const cafePhoto = {
  'C-101': '1613478223719-2ab802602423', // fresh orange juice
  'C-102': '1553530666-ba11a7da3888', // protein smoothie
  'C-103': '1561336313-0bd5e0b27ec8', // masala chai
  'C-104': '1513558161293-cdaf765ed2fd', // fresh lime soda
  'C-201': '1511690656952-34342bb7c2f2', // athlete breakfast bowl
  'C-202': '1525351484163-7529414344d8', // egg white omelette
  'C-203': '1528735602780-2552fd46c7af', // cheese toast
  'C-301': '1532550907401-a500c9a57435', // grilled chicken steak
  'C-302': '1540420773420-3366772f4999', // quinoa power salad
  'C-303': '1551183053-bf91a1d81141', // protein pasta
  'C-401': '1568901346375-23c9450c58cd', // gourmet burger
  'C-402': '1509722747041-616f39b57569', // club sandwich
  'C-403': '1541592106381-b31e9677c0e5', // baked sweet potato fries
  'C-501': '1546069901-ba9599a7e63c', // avocado superbowl
  'C-502': '1512621776951-a57141f2eefd', // Mediterranean bowl
  'C-601': '1587314168485-3236d6710814', // protein chia pudding
  'C-602': '1579954115545-a95591f28bfc', // berry acai bowl
};

export function fallbackCafe(id, category) {
  const photoId = cafePhoto[id] || '1546069901-ba9599a7e63c';
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&h=600&q=80`;
}

export default genImage;

