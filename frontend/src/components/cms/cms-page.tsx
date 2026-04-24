import type { Locale } from "@/config/site";
import type { CmsPage } from "@/types/cms";
import { CmsPageSections } from "./page-sections";

export function CmsPageView({ page, locale }: { page: CmsPage; locale: Locale }) {
  return <CmsPageSections locale={locale} sections={page.sections} />;
}
