import Image from "next/image";
import { contentService } from "@/services/content.service";
import type { Locale } from "@/config/site";
import { getLocalizedValue } from "@/types/cms";
import { urlForImage } from "@/sanity/lib/image";

export default async function LiteraturePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const articles = await contentService.listArticles();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="text-4xl font-bold text-primary">{locale === "ar" ? "الأدبيات والمحتوى التحريري" : "Literature and editorial content"}</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {articles.map((article) => {
          const src = article.image?.asset?._ref?.startsWith("http")
            ? article.image.asset._ref
            : article.image
              ? urlForImage(article.image).url()
              : null;

          return (
            <article key={article.id} className="overflow-hidden rounded-3xl border border-border/30 bg-white editorial-shadow">
              <div className="relative h-56 w-full">
                {src ? <Image alt={getLocalizedValue(article.title, locale) ?? "Article image"} className="object-cover" fill sizes="(max-width: 768px) 100vw, 33vw" src={src} /> : null}
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">{article.type}</p>
                <h2 className="mt-3 text-2xl font-bold text-primary">{getLocalizedValue(article.title, locale)}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{getLocalizedValue(article.description, locale)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
