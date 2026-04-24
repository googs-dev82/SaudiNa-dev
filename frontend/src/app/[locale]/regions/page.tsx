import { Card, CardContent } from "@/components/ui/card";
import type { Locale } from "@/config/site";
import { locationsService } from "@/services/locations.service";

export default async function RegionsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const regions = await locationsService.listRegions();
  const areas = await locationsService.listAreas();

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <h1 className="text-4xl font-bold text-primary">{locale === "ar" ? "المناطق والمجالات المحلية" : "Regions and local areas"}</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {regions.map((region) => (
          <Card key={region.id} className="bg-white">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-primary">{locale === "ar" ? region.nameAr : region.nameEn}</h2>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {areas.filter((area) => area.regionId === region.id).map((area) => (
                  <li key={area.id}>{locale === "ar" ? area.nameAr : area.nameEn}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
