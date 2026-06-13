import { useState, useEffect, useCallback } from "react";

const KEY = "ObraBien_favs";

export function useFavorites() {
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setFavs(new Set(JSON.parse(s) as string[]));
    } catch {}
    setReady(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setFavs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try { localStorage.setItem(KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  return { favs, toggle, ready };
}
