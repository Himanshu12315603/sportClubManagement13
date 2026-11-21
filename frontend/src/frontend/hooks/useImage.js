/**
 * Image hook — provides direct, instant loading of high-resolution CDN images
 * to avoid delayed AI placeholder boxes ("Image is generating...").
 */
export function useImage(src, fallback) {
  // If a reliable CDN fallback is available, use it directly for instant crisp rendering.
  const resolved = fallback || src;
  return { src: resolved, failed: false };
}

export default useImage;
