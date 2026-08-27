import { useEffect, useState } from "react";

export type ScrollState = {
  scrollY: number;
  scrollProgress: number; // 0 a 100
  activeSection: string;
  isScrolled: boolean;
  scrollDirection: "up" | "down" | "none";
};

const SECTION_IDS = [
  "top",
  "hero",
  "showcase",
  "como-funciona",
  "engenharia",
  "specs",
  "campanha",
  "filosofia",
  "acesso",
];

export function useScrollAnimations(): ScrollState {
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollY: 0,
    scrollProgress: 0,
    activeSection: "top",
    isScrolled: false,
    scrollDirection: "none",
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const totalHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const progress =
            totalHeight > 0
              ? Math.min(100, Math.max(0, (currentScrollY / totalHeight) * 100))
              : 0;

          // Determina a seção ativa baseada na posição do viewport
          let currentSection = "top";
          const scrollMarker = currentScrollY + window.innerHeight * 0.35;

          for (const id of SECTION_IDS) {
            const el = document.getElementById(id);
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollMarker >= top && scrollMarker < top + height) {
                currentSection = id;
                break;
              }
            }
          }

          const direction =
            currentScrollY > lastScrollY
              ? "down"
              : currentScrollY < lastScrollY
              ? "up"
              : "none";

          setScrollState({
            scrollY: currentScrollY,
            scrollProgress: progress,
            activeSection: currentSection,
            isScrolled: currentScrollY > 12,
            scrollDirection: direction,
          });

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return scrollState;
}
