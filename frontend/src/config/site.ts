export const locales = ["ar", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const isLocale = (value: string): value is Locale =>
  locales.includes(value as Locale);

export const localeDirection = (locale: Locale): "rtl" | "ltr" =>
  locale === "ar" ? "rtl" : "ltr";

export const siteConfig = {
  name: {
    ar: "رسالة سعودينا",
    en: "SaudiNA Message",
  },
  description: {
    ar: "منصة سعودينا للرسائل التعريفية والاجتماعات والموارد الداعمة للتعافي.",
    en: "SaudiNA public platform for recovery meetings, resources, and guided support.",
  },
};
