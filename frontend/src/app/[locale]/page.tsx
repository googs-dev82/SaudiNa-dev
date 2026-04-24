import { CmsPageView } from "@/components/cms/cms-page";
import { contentService } from "@/services/content.service";
import type { Locale } from "@/config/site";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const page = await contentService.getPage("home");

  return page ? <CmsPageView locale={locale} page={page} /> : null;
}
