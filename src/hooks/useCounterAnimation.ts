import { useEffect, useRef, useState } from "react";

/**
 * Hook para contagem animada numérica inspirada no estilo Shopify Editions.
 * Dispara a interpolação suave quando o elemento entra no viewport.
 */
export function useCounterAnimation(
  targetValue: number,
  durationMs: number = 1600,
  decimals: number = 0,
  prefix: string = "",
  suffix: string = ""
) {
  const [displayValue, setDisplayValue] = useState<string>(`${prefix}0${suffix}`);
  const ref = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayValue(
        `${prefix}${targetValue.toLocaleString("pt-BR", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })}${suffix}`
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animatedRef.current) {
            animatedRef.current = true;
            const startTime = performance.now();

            const updateCount = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / durationMs, 1);
              // Curva de facilitação quartica suave estilo Apple/Shopify
              const easeOutProgress = 1 - Math.pow(1 - progress, 4);
              const current = easeOutProgress * targetValue;

              setDisplayValue(
                `${prefix}${current.toLocaleString("pt-BR", {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                })}${suffix}`
              );

              if (progress < 1) {
                requestAnimationFrame(updateCount);
              } else {
                setDisplayValue(
                  `${prefix}${targetValue.toLocaleString("pt-BR", {
                    minimumFractionDigits: decimals,
                    maximumFractionDigits: decimals,
                  })}${suffix}`
                );
              }
            };

            requestAnimationFrame(updateCount);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetValue, durationMs, decimals, prefix, suffix]);

  return { ref, displayValue };
}
