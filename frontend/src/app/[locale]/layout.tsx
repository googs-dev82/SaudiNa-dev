import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChatbotWidget } from "@/features/shared/components/chatbot-widget";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { contentService } from "@/services/content.service";
import { defaultLocale, isLocale, localeDirection, siteConfig, type Locale } from "@/config/site";

export async function generateStaticParams() {
  return [{ locale: "ar" }, { locale: "en" }];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale;
  const settings = await contentService.getSiteSettings();

  return {
    title: settings.siteTitle[resolvedLocale] ?? siteConfig.name[resolvedLocale],
    description: settings.siteDescription[resolvedLocale] ?? siteConfig.description[resolvedLocale],
  };
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const direction = localeDirection(locale);
  const settings = await contentService.getSiteSettings();

  return (
    <div lang={locale} dir={direction} className="min-h-screen bg-background text-foreground">
      <SiteHeader locale={locale as Locale} settings={settings} />
      {children}
      <SiteFooter locale={locale as Locale} settings={settings} />
      <ChatbotWidget locale={locale as Locale} />
    </div>
  );
}
