import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translations, type Language } from "@/lib/translations";

export const LANGUAGE_STORAGE_KEY = "localmate-language";

type TranslationParams = Record<string, string | number>;

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: TranslationParams) => string;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function normalizeLanguage(value: string | null | undefined): Language {
  return value === "zh" ? "zh" : "en";
}

export function translate(language: Language, key: string, params: TranslationParams = {}): string {
  const template = translations[key]?.[language] ?? translations[key]?.en ?? key;
  return Object.entries(params).reduce(
    (output, [name, value]) => output.replaceAll(`{{${name}}}`, String(value)),
    template,
  );
}

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  try {
    return normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The UI can still switch languages when storage is unavailable.
    }
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(current => (current === "en" ? "zh" : "en"));
  }, []);

  const t = useCallback((key: string, params?: TranslationParams) => translate(language, key, params), [language]);
  const value = useMemo(() => ({ language, setLanguage, toggleLanguage, t }), [language, t, toggleLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
