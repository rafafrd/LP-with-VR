import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealVariant = "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";

type RevealProps = {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delayMs?: number;
  threshold?: number;
  once?: boolean;
};

export default function Reveal({
  children,
  className = "",
  variant = "fade-up",
  delayMs = 0,
  threshold = 0.12,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }

    const isInViewport = (target: Element) => {
      const rect = target.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    };

    if (isInViewport(el)) {
      setInView(true);
      if (once) return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) {
              io.unobserve(entry.target);
            }
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold, once]);

  const style = delayMs > 0 ? { transitionDelay: `${delayMs}ms` } : undefined;

  const classes = [
    "reveal",
    `reveal--${variant}`,
    inView ? "in-view" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes} style={style}>
      {children}
    </div>
  );
}
