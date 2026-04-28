import { Download } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/config/site";
import { resourcesService } from "@/services/resources.service";

export default async function ResourcesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const resources = await resourcesService.list();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">{locale === "ar" ? "المكتبة" : "Library"}</p>
        <h1 className="mt-3 text-4xl font-bold text-primary">{locale === "ar" ? "الموارد والأدبيات" : "Resources and literature"}</h1>
        <p className="mt-3 text-lg leading-8 text-muted-foreground">{locale === "ar" ? "مكتبة عامة للمواد الداعمة والقراءات الأساسية للتعافي والمساندة." : "A public library of support materials and core literature for recovery and healthy support."}</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {resources.map((resource) => (
          <Card key={resource.id} className="rounded-lg border-secondary/15 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/35 hover:shadow-md">
            <CardContent className="flex h-full flex-col justify-between gap-5 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary">{locale === "ar" ? resource.category.nameAr : resource.category.nameEn}</p>
                <h2 className="mt-3 text-2xl font-bold text-primary">{locale === "ar" ? resource.titleAr : resource.titleEn}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{locale === "ar" ? resource.descriptionAr : resource.descriptionEn}</p>
              </div>
              <a className="inline-flex w-fit items-center gap-2 rounded-lg bg-secondary/10 px-4 py-2 font-medium text-primary transition hover:bg-secondary/15" href={`/${locale}/resources/${resource.id}/download`}>
                <Download className="h-4 w-4" />
                {locale === "ar" ? "الحصول على الملف" : "Get file"}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
