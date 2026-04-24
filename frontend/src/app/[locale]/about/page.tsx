import { notFound } from "next/navigation";
import { CmsPageView } from "@/components/cms/cms-page";
import type { Locale } from "@/config/site";
import { contentService } from "@/services/content.service";

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const page = await contentService.getPage("about");

  if (!page) {
    notFound();
  }

  return <CmsPageView locale={locale} page={page} />;
}
