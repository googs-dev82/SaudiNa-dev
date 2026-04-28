import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays, HeartHandshake, MapPin, ShieldCheck } from "lucide-react";

import { CmsPortableText } from "@/components/cms/cms-portable-text";
import { getCmsHref } from "@/components/cms/cms-link";
import type { Locale } from "@/config/site";
import type { CmsCtaBlock, CmsHeroBlock, CmsPage, CmsRichTextBlock } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";

function findSection<T extends CmsHeroBlock | CmsRichTextBlock | CmsCtaBlock>(
  page: CmsPage,
  type: T["_type"],
) {
  return page.sections.find((section): section is T => section._type === type);
}

function ActionLink({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      className={
        variant === "primary"
          ? "inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-secondary px-6 text-sm font-semibold text-secondary-foreground shadow-sm transition hover:bg-secondary/90"
          : "inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/45 bg-white/85 px-6 text-sm font-semibold text-foreground shadow-sm transition hover:bg-white"
      }
      href={href}
    >
      {label}
      <ArrowUpRight data-icon="inline-end" />
    </Link>
  );
}

export function HomeCmsPage({ page, locale }: { page: CmsPage; locale: Locale }) {
  const hero = findSection<CmsHeroBlock>(page, "heroBlock");
  const firstSteps = findSection<CmsRichTextBlock>(page, "richTextBlock");
  const cta = findSection<CmsCtaBlock>(page, "ctaBlock");
  const isArabic = locale === "ar";

  const labels = isArabic
    ? {
        fellowship: "زمالة المدمنين المجهولين",
        confidential: "سرية واحترام",
        meetings: "الاجتماعات",
        meetingsText: "اعثر على اجتماع قريب أو مناسب لوقتك.",
        newcomer: "للقادمين الجدد",
        newcomerText: "تعرف على ما يمكن توقعه في أول اجتماع.",
        literature: "الأدبيات",
        literatureText: "اقرأ مواد التعافي والدعم المتاحة.",
        daily: "فقط لليوم",
        dailyText: "خطوة واحدة كافية لبدء يوم مختلف.",
        kingdom: "حضور في المملكة",
        safe: "مجتمع آمن",
        practical: "دعم عملي",
      }
    : {
        fellowship: "Narcotics Anonymous Fellowship",
        confidential: "Confidential and respectful",
        meetings: "Meetings",
        meetingsText: "Find a nearby meeting or one that fits your time.",
        newcomer: "Newcomers",
        newcomerText: "Learn what to expect when you attend for the first time.",
        literature: "Literature",
        literatureText: "Read recovery and support materials.",
        daily: "Just for today",
        dailyText: "One step is enough to begin a different day.",
        kingdom: "Across the Kingdom",
        safe: "Safe fellowship",
        practical: "Practical support",
      };

  const quickPaths = [
    {
      title: labels.meetings,
      body: labels.meetingsText,
      href: `/${locale}/meetings`,
      icon: MapPin,
    },
    {
      title: labels.newcomer,
      body: labels.newcomerText,
      href: `/${locale}/about`,
      icon: HeartHandshake,
    },
    {
      title: labels.literature,
      body: labels.literatureText,
      href: `/${locale}/literature`,
      icon: BookOpen,
    },
  ];

  return (
    <main className="overflow-hidden bg-background">
      <section className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-foreground text-white">
        <Image
          alt={isArabic ? "منظر هادئ مستوحى من المملكة" : "Calm Saudi-inspired recovery landscape"}
          className="absolute inset-0 object-cover"
          fill
          priority
          sizes="100vw"
          src="/saudina-home-hero.png"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,34,29,0.94)_0%,rgba(18,34,29,0.78)_42%,rgba(18,34,29,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,rgba(253,252,249,0)_0%,#fdfcf9_100%)]" />

        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-center gap-10 px-4 py-20 md:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/82 backdrop-blur">
              <ShieldCheck data-icon="inline-start" />
              {getLocalizedValue(hero?.eyebrow, locale) ?? labels.fellowship}
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl">
              {getLocalizedValue(hero?.title, locale) ?? getLocalizedValue(page.title, locale)}
            </h1>
            {hero?.body ? (
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/82 md:text-lg">
                {getLocalizedValue(hero.body, locale)}
              </p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              {hero?.primaryCta ? (
                <ActionLink href={getCmsHref(hero.primaryCta, locale)} label={getLocalizedValue(hero.primaryCta.label, locale) ?? labels.meetings} />
              ) : null}
              {hero?.secondaryCta ? (
                <ActionLink
                  href={getCmsHref(hero.secondaryCta, locale)}
                  label={getLocalizedValue(hero.secondaryCta.label, locale) ?? labels.newcomer}
                  variant="secondary"
                />
              ) : null}
            </div>
          </div>

        </div>
      </section>

      <section className="relative mx-auto -mt-10 grid max-w-7xl gap-4 px-4 md:grid-cols-3 md:px-8">
        {quickPaths.map((item) => (
          <Link
            key={item.title}
            className="group rounded-lg border border-border/60 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md"
            href={item.href}
          >
            <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
              <item.icon data-icon="inline-start" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">{item.title}</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.body}</p>
          </Link>
        ))}
      </section>

      {firstSteps ? (
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
              {labels.daily}
            </p>
            {firstSteps.title ? (
              <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                {getLocalizedValue(firstSteps.title, locale)}
              </h2>
            ) : null}
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              {labels.dailyText}
            </p>
          </div>
          <div className="rounded-lg border border-border/55 bg-white p-6 shadow-sm md:p-8">
            <CmsPortableText className="space-y-5 text-base leading-8 text-muted-foreground" locale={locale} value={firstSteps.body} />
          </div>
        </section>
      ) : null}

      {cta ? (
        <section className="bg-[linear-gradient(180deg,#fdfcf9_0%,rgba(88,129,87,0.12)_100%)] px-4 py-20 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-lg border border-secondary/20 bg-white p-6 shadow-sm md:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              {cta.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
                  {getLocalizedValue(cta.eyebrow, locale)}
                </p>
              ) : null}
              <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-foreground md:text-4xl">
                {getLocalizedValue(cta.title, locale)}
              </h2>
              {cta.body ? (
                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {getLocalizedValue(cta.body, locale)}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              {cta.actions.map((action) => (
                <ActionLink
                  key={`${action.href}-${action.label.en}`}
                  href={getCmsHref(action, locale)}
                  label={getLocalizedValue(action.label, locale) ?? action.href}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-12 md:px-8">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-secondary/20 bg-[linear-gradient(135deg,rgba(88,129,87,0.10),rgba(253,252,249,0.96))] p-6 shadow-sm">
            <CalendarDays className="mb-5 text-secondary" data-icon="inline-start" />
            <h2 className="text-2xl font-semibold text-foreground">{labels.confidential}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {hero?.body ? getLocalizedValue(hero.body, locale) : labels.meetingsText}
            </p>
          </div>
          <div className="rounded-lg border border-secondary/25 bg-[linear-gradient(135deg,#315c3f,#588157)] p-6 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">{labels.fellowship}</p>
            <h2 className="mt-3 text-2xl font-semibold">{getLocalizedValue(page.title, locale)}</h2>
            <p className="mt-3 text-sm leading-7 text-white/78">{getLocalizedValue(page.summary, locale)}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
