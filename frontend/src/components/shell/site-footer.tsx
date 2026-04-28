import Link from "next/link";

import { getLocalizedHref } from "@/components/cms/cms-link";
import type { Locale } from "@/config/site";
import type { CmsFooterColumn, CmsSiteSettings } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";

export function SiteFooter({ locale, settings }: { locale: Locale; settings: CmsSiteSettings }) {
  return (
    <footer className="mt-12 border-t border-secondary/15 bg-[linear-gradient(180deg,rgba(88,129,87,0.10),rgba(253,252,249,0.98))] pt-12 pb-8">
      <div className="mx-auto mb-10 grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-[1.4fr_0.8fr_0.8fr] md:px-8">
        <div className="max-w-md space-y-4">
          <div className="flex items-center gap-3">
            <BrandMark />
            <span className="text-base font-bold text-foreground">{getLocalizedValue(settings.siteTitle, locale)}</span>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{getLocalizedValue(settings.footerBlurb, locale)}</p>
        </div>

        {settings.footerColumns.map((column) => (
          <FooterColumn key={column.title.en} column={column} locale={locale} />
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-secondary/15 px-4 pt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground md:flex-row md:px-8">
        <span>{getLocalizedValue(settings.footerCopyright, locale)}</span>
        <div className="flex flex-wrap justify-center gap-3">
          {settings.socialLinks.map((item) => (
            <a
              className="rounded-full border border-secondary/20 bg-white/65 px-3 py-1.5 text-foreground transition hover:border-secondary/40 hover:bg-white hover:text-secondary"
              key={item.platform}
              href={item.href}
              rel="noreferrer"
              target="_blank"
            >
              {item.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function BrandMark() {
  return (
    <span aria-label="NA" className="flex size-10 shrink-0 items-center justify-center rounded-full border border-secondary/25 bg-white text-xs font-bold tracking-tight text-primary shadow-sm ring-4 ring-secondary/10">
      NA
    </span>
  );
}

function FooterColumn({ column, locale }: { column: CmsFooterColumn; locale: Locale }) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{getLocalizedValue(column.title, locale)}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {column.links.map((link) => (
          <li key={link.href + link.label.en}>
            <Link href={getLocalizedHref(link.href, locale)} className="hover:text-secondary">
              {getLocalizedValue(link.label, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
