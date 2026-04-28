import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/config/site";
import { locationsService } from "@/services/locations.service";

export default async function RegionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const regions = await locationsService.listRegions();
  const areas = await locationsService.listAreas();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">{locale === "ar" ? "المناطق" : "Regions"}</p>
        <h1 className="mt-3 text-4xl font-bold text-primary">{locale === "ar" ? "المناطق والمجالات المحلية" : "Regions and local areas"}</h1>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {regions.map((region) => (
          <Card key={region.id} className="rounded-lg border-secondary/15 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/35 hover:shadow-md">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-primary">{locale === "ar" ? region.nameAr : region.nameEn}</h2>
              <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
                {areas.filter((area) => area.regionId === region.id).map((area) => (
                  <li key={area.id} className="rounded-lg bg-secondary/5 px-3 py-2">{locale === "ar" ? area.nameAr : area.nameEn}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
