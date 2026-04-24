import { fetchArticles, fetchFaqs, fetchPageBySlug, fetchSiteSettings } from "@/sanity/lib/content";
import { siteConfig } from "@/config/site";
import type { CmsArticleCard, CmsFaqItem, CmsPage, CmsSiteSettings } from "@/types/cms";
import { hasSanityConfig } from "@/config/env";

const fallbackSiteSettings: CmsSiteSettings = {
  siteTitle: siteConfig.name,
  siteDescription: siteConfig.description,
  navigation: [],
  footerBlurb: siteConfig.description,
  footerColumns: [],
  footerCopyright: siteConfig.name,
  socialLinks: [],
};

export const contentRepository = {
  async getSiteSettings(): Promise<CmsSiteSettings> {
    if (!hasSanityConfig) {
      return fallbackSiteSettings;
    }

    try {
      const settings = await fetchSiteSettings();
      if (!settings) {
        return fallbackSiteSettings;
      }

      return settings;
    } catch {
      return fallbackSiteSettings;
    }
  },

  async getPage(slug: string): Promise<CmsPage | null> {
    if (!hasSanityConfig) {
      return null;
    }

    return fetchPageBySlug(slug).catch(() => null);
  },

  async listArticles(): Promise<CmsArticleCard[]> {
    if (!hasSanityConfig) {
      return [];
    }

    return fetchArticles().catch(() => []);
  },

  async listFaqs(): Promise<CmsFaqItem[]> {
    if (!hasSanityConfig) {
      return [];
    }

    return fetchFaqs().catch(() => []);
  },
};
