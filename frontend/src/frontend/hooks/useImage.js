import { useEffect, useState } from 'react';

/**
 * Tries `src` first; on error (or after a timeout when the API is slow),
 * swaps to `fallback` so a product/facility/cafe card never shows a broken
 * "image is generating" placeholder.
 */
export function useImage(src, fallback, timeoutMs = 6000) {
  const [current, setCurrent] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setCurrent(src);
    setFailed(false);
    if (!src) {
      setFailed(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setFailed(true), timeoutMs);
    const img = new Image();
    img.onload = () => window.clearTimeout(timer);
    img.onerror = () => setFailed(true);
    img.src = src;
    return () => window.clearTimeout(timer);
  }, [src, timeoutMs]);

  useEffect(() => {
    if (failed && fallback) setCurrent(fallback);
  }, [failed, fallback]);

  return { src: current, failed };
}

export default useImage;
