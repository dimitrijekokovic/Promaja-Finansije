"use client";

import { useEffect, useState } from "react";

// Generic hook: da li media query važi
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // inicijalno stanje
    setMatches(mediaQueryList.matches);

    mediaQueryList.addEventListener("change", listener);
    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}

// Specifičan hook za mobilni ekran
export function useIsMobile() {
  return useMediaQuery("(max-width: 768px)");
}
