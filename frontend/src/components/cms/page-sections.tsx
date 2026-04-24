import Link from "next/link";
import type { Locale } from "@/config/site";
import type { CmsPageSection } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";
import { CmsImageView } from "./cms-image";
import { CmsLinkText, getCmsHref } from "./cms-link";
import { CmsPortableText } from "./cms-portable-text";
import { getSanityFileUrl } from "@/sanity/lib/file";

const heroThemeClass: Record<string, string> = {
  ocean: "bg-background",
  sand: "bg-accent/25",
  sage: "bg-muted/40",
};

export function CmsPageSections({ sections, locale }: { sections: CmsPageSection[]; locale: Locale }) {
  return (
    <div>
      {sections.map((section) => {
        switch (section._type) {
          case "heroBlock":
            return (
              <section key={section._key} className={`relative overflow-hidden ${heroThemeClass[section.theme ?? "ocean"]}`}>
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                  <div className="space-y-6">
                    {section.eyebrow ? (
                      <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
                        {getLocalizedValue(section.eyebrow, locale)}
                      </p>
                    ) : null}
                    <h1 className="text-4xl font-bold leading-tight text-primary md:text-6xl">
                      {getLocalizedValue(section.title, locale)}
                    </h1>
                    {section.body ? (
                      <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                        {getLocalizedValue(section.body, locale)}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-4">
                      {section.primaryCta ? (
                        section.primaryCta.kind === "external" ? (
                          <a
                            className="hero-gradient inline-flex h-14 items-center rounded-xl px-8 text-base font-medium text-primary-foreground"
                            href={getCmsHref(section.primaryCta, locale)}
                            rel={section.primaryCta.openInNewTab ? "noreferrer" : undefined}
                            target={section.primaryCta.openInNewTab ? "_blank" : undefined}
                          >
                            {getLocalizedValue(section.primaryCta.label, locale)}
                          </a>
                        ) : (
                          <Link
                            className="hero-gradient inline-flex h-14 items-center rounded-xl px-8 text-base font-medium text-primary-foreground"
                            href={getCmsHref(section.primaryCta, locale)}
                          >
                            {getLocalizedValue(section.primaryCta.label, locale)}
                          </Link>
                        )
                      ) : null}
                      {section.secondaryCta ? (
                        section.secondaryCta.kind === "external" ? (
                          <a
                            className="inline-flex h-14 items-center rounded-xl border border-border/40 bg-white px-8 text-base font-medium text-primary"
                            href={getCmsHref(section.secondaryCta, locale)}
                            rel={section.secondaryCta.openInNewTab ? "noreferrer" : undefined}
                            target={section.secondaryCta.openInNewTab ? "_blank" : undefined}
                          >
                            {getLocalizedValue(section.secondaryCta.label, locale)}
                          </a>
                        ) : (
                          <Link
                            className="inline-flex h-14 items-center rounded-xl border border-border/40 bg-white px-8 text-base font-medium text-primary"
                            href={getCmsHref(section.secondaryCta, locale)}
                          >
                            {getLocalizedValue(section.secondaryCta.label, locale)}
                          </Link>
                        )
                      ) : null}
                    </div>
                  </div>
                  <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-white/50 editorial-shadow">
                    <CmsImageView
                      className="object-cover"
                      fill
                      image={section.image}
                      locale={locale}
                      sizes="(max-width: 1024px) 100vw, 42vw"
                    />
                  </div>
                </div>
              </section>
            );
          case "richTextBlock":
            return (
              <section key={section._key} className="mx-auto max-w-4xl px-4 py-16 md:px-8">
                {section.title ? (
                  <h2 className="mb-6 text-4xl font-bold text-primary">
                    {getLocalizedValue(section.title, locale)}
                  </h2>
                ) : null}
                <CmsPortableText className="space-y-5" locale={locale} value={section.body} />
              </section>
            );
          case "mediaBlock": {
            const imageFirst = section.layout === "imageLeft";
            const content = (
              <div className="space-y-5">
                {section.title ? (
                  <h2 className="text-4xl font-bold text-primary">{getLocalizedValue(section.title, locale)}</h2>
                ) : null}
                {section.body ? (
                  <p className="text-lg leading-8 text-muted-foreground">{getLocalizedValue(section.body, locale)}</p>
                ) : null}
              </div>
            );

            return (
              <section key={section._key} className="mx-auto max-w-7xl px-4 py-16 md:px-8">
                <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                  {imageFirst ? (
                    <>
                      <div className="relative min-h-[320px] overflow-hidden rounded-3xl editorial-shadow">
                        <CmsImageView className="object-cover" fill image={section.image} locale={locale} sizes="(max-width: 1024px) 100vw, 50vw" />
                      </div>
                      {content}
                    </>
                  ) : (
                    <>
                      {content}
                      <div className="relative min-h-[320px] overflow-hidden rounded-3xl editorial-shadow">
                        <CmsImageView className="object-cover" fill image={section.image} locale={locale} sizes="(max-width: 1024px) 100vw, 50vw" />
                      </div>
                    </>
                  )}
                </div>
              </section>
            );
          }
          case "ctaBlock":
            return (
              <section key={section._key} className="mx-auto max-w-7xl px-4 py-16 md:px-8">
                <div className="soft-gradient-blue rounded-3xl border border-white/50 p-10 editorial-shadow md:p-16">
                  {section.eyebrow ? (
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-secondary">
                      {getLocalizedValue(section.eyebrow, locale)}
                    </p>
                  ) : null}
                  <h2 className="mt-3 text-4xl font-bold text-primary">{getLocalizedValue(section.title, locale)}</h2>
                  {section.body ? (
                    <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                      {getLocalizedValue(section.body, locale)}
                    </p>
                  ) : null}
                  <div className="mt-8 flex flex-wrap gap-4">
                    {section.actions.map((action) => (
                      <CmsLinkText
                        key={`${action.href}-${action.label.en}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground hover:bg-primary/90"
                        link={action}
                        locale={locale}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          case "videoBlock": {
            let videoUrl: string | null = null;
            let isYouTube = false;

            if (section.provider === "youtube" && section.youtubeUrl) {
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
              const match = section.youtubeUrl.match(regExp);
              if (match && match[2].length === 11) {
                videoUrl = `https://www.youtube.com/embed/${match[2]}`;
                isYouTube = true;
              }
            } else if (section.provider === "upload" && section.videoFile?.asset?._ref) {
              videoUrl = getSanityFileUrl(section.videoFile.asset._ref);
            }

            return (
              <section key={section._key} className="mx-auto max-w-5xl px-4 py-16 md:px-8">
                <div className="mb-10 space-y-6 text-center">
                  {section.title ? (
                    <h2 className="text-4xl font-bold text-primary">{getLocalizedValue(section.title, locale)}</h2>
                  ) : null}
                  {section.body ? (
                    <p className="mx-auto max-w-3xl text-lg leading-8 text-muted-foreground">{getLocalizedValue(section.body, locale)}</p>
                  ) : null}
                </div>
                {videoUrl && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] bg-black editorial-shadow">
                    {isYouTube ? (
                      <iframe
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute left-0 top-0 size-full border-0"
                        src={videoUrl}
                        title={getLocalizedValue(section.title, locale) ?? "Video"}
                      />
                    ) : (
                      <video
                        className="size-full"
                        controls
                        preload="metadata"
                        src={videoUrl}
                        title={getLocalizedValue(section.title, locale)}
                      />
                    )}
                  </div>
                )}
              </section>
            );
          }
          case "audioBlock": {
            const url = section.audioFile?.asset?._ref ? getSanityFileUrl(section.audioFile.asset._ref) : null;
            
            return (
              <section key={section._key} className="mx-auto max-w-3xl px-4 py-16 md:px-8">
                <div className="rounded-3xl bg-muted/30 p-8 editorial-shadow md:p-12">
                  <div className="mb-8 space-y-4">
                    {section.title ? (
                      <h2 className="text-3xl font-bold text-primary">{getLocalizedValue(section.title, locale)}</h2>
                    ) : null}
                    {section.body ? (
                      <p className="text-lg leading-8 text-muted-foreground">{getLocalizedValue(section.body, locale)}</p>
                    ) : null}
                  </div>
                  {url && <audio className="w-full" controls preload="metadata" src={url} />}
                </div>
              </section>
            );
          }
          case "fileDownloadBlock": {
            const url = section.file?.asset?._ref ? getSanityFileUrl(section.file.asset._ref) : null;
            
            return (
              <section key={section._key} className="mx-auto max-w-4xl px-4 py-16 md:px-8">
                <div className="flex flex-col items-center justify-between gap-8 rounded-3xl border border-secondary/20 bg-secondary/5 p-8 editorial-shadow md:flex-row md:p-12">
                  <div className="max-w-xl space-y-4">
                    {section.title ? (
                      <h2 className="text-3xl font-bold text-primary">{getLocalizedValue(section.title, locale)}</h2>
                    ) : null}
                    {section.body ? (
                      <p className="text-lg leading-8 text-muted-foreground">{getLocalizedValue(section.body, locale)}</p>
                    ) : null}
                  </div>
                  {url && (
                    <a
                      className="inline-flex shrink-0 items-center gap-3 rounded-xl bg-secondary px-8 py-4 font-semibold text-secondary-foreground transition hover:opacity-90"
                      download
                      href={url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <svg className="size-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {getLocalizedValue(section.buttonLabel, locale) ?? "Download"}
                    </a>
                  )}
                </div>
              </section>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
