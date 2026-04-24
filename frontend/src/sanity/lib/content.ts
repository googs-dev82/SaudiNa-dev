import { client } from "./client";
import { articlesQuery, faqsQuery, pageBySlugQuery, siteSettingsQuery } from "./queries";
import type { CmsArticleCard, CmsFaqItem, CmsPage, CmsSiteSettings } from "@/types/cms";

export const fetchSiteSettings = async () =>
  client.fetch<CmsSiteSettings | null>(siteSettingsQuery);

export const fetchPageBySlug = async (slug: string) =>
  client.fetch<CmsPage | null>(pageBySlugQuery, { slug });

export const fetchArticles = async () =>
  client.fetch<CmsArticleCard[]>(articlesQuery);

export const fetchFaqs = async () =>
  client.fetch<CmsFaqItem[]>(faqsQuery);
