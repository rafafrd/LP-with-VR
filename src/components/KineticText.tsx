import { useEffect, useRef, useState } from "react";

type KineticTextProps = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "blockquote";
  highlightWords?: string[];
};

export default function KineticText({
  text,
  className = "",
  as: Component = "p",
  highlightWords = [],
}: KineticTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const words = text.split(" ");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScrollProgress(1);
      return;
    }

    const handleScroll = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Inicia quando o topo do elemento atinge 85% do viewport, completa quando atinge 35%
      const start = windowHeight * 0.85;
      const end = windowHeight * 0.35;
      const current = rect.top;

      if (current >= start) {
        setScrollProgress(0);
      } else if (current <= end) {
        setScrollProgress(1);
      } else {
        const p = (start - current) / (start - end);
        setScrollProgress(Math.min(1, Math.max(0, p)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Component
      ref={containerRef as any}
      className={`kinetic-text ${className}`}
      aria-label={text}
    >
      {words.map((word, index) => {
        const wordThreshold = index / words.length;
        const isLit = scrollProgress >= wordThreshold;
        const isHighlight = highlightWords.some((hw) =>
          word.toLowerCase().includes(hw.toLowerCase())
        );

        return (
          <span
            key={`${word}-${index}`}
            className={`kinetic-word ${isLit ? "is-lit" : ""} ${
              isHighlight ? "is-highlight" : ""
            }`}
            style={{
              transitionDelay: `${index * 18}ms`,
            }}
          >
            {word}&nbsp;
          </span>
        );
      })}
    </Component>
  );
}
