import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
export type FontSizeScale = 0.875 | 1 | 1.125 | 1.25 | 1.375;

export type AccessibilityState = {
  theme: ThemeMode;
  fontScale: FontSizeScale;
  reducedMotion: boolean;
  highContrast: boolean;
};

const THEME_STORAGE_KEY = "void_spatial_theme";
const FONT_SCALE_STORAGE_KEY = "void_spatial_font_scale";
const REDUCED_MOTION_STORAGE_KEY = "void_spatial_reduced_motion";
const HIGH_CONTRAST_STORAGE_KEY = "void_spatial_high_contrast";

export function useAccessibility() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [fontScale, setFontScale] = useState<FontSizeScale>(() => {
    if (typeof window === "undefined") return 1;
    const saved = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    if (saved) {
      const parsed = parseFloat(saved);
      if ([0.875, 1, 1.125, 1.25, 1.375].includes(parsed)) {
        return parsed as FontSizeScale;
      }
    }
    return 1;
  });

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(REDUCED_MOTION_STORAGE_KEY);
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY);
    return saved === "true";
  });

  // Aplica o tema no elemento <html>
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Aplica a escala de fonte no elemento <html>
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-scale", fontScale.toString());
    localStorage.setItem(FONT_SCALE_STORAGE_KEY, fontScale.toString());
  }, [fontScale]);

  // Aplica preferência de movimento
  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) {
      root.setAttribute("data-reduced-motion", "true");
    } else {
      root.removeAttribute("data-reduced-motion");
    }
    localStorage.setItem(REDUCED_MOTION_STORAGE_KEY, reducedMotion.toString());
  }, [reducedMotion]);

  // Aplica alto contraste
  useEffect(() => {
    const root = document.documentElement;
    if (highContrast) {
      root.setAttribute("data-high-contrast", "true");
    } else {
      root.removeAttribute("data-high-contrast");
    }
    localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, highContrast.toString());
  }, [highContrast]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const increaseFontSize = () => {
    setFontScale((prev) => {
      if (prev === 0.875) return 1;
      if (prev === 1) return 1.125;
      if (prev === 1.125) return 1.25;
      if (prev === 1.25) return 1.375;
      return 1.375;
    });
  };

  const decreaseFontSize = () => {
    setFontScale((prev) => {
      if (prev === 1.375) return 1.25;
      if (prev === 1.25) return 1.125;
      if (prev === 1.125) return 1;
      if (prev === 1) return 0.875;
      return 0.875;
    });
  };

  const resetFontSize = () => {
    setFontScale(1);
  };

  const toggleReducedMotion = () => {
    setReducedMotion((prev) => !prev);
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const resetAll = () => {
    setTheme("light");
    setFontScale(1);
    setReducedMotion(false);
    setHighContrast(false);
  };

  return {
    theme,
    fontScale,
    reducedMotion,
    highContrast,
    setTheme,
    toggleTheme,
    setFontScale,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleReducedMotion,
    toggleHighContrast,
    resetAll,
  };
}
