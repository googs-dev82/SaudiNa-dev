import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/config/site";
import type { CmsFooterColumn, CmsSiteSettings } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";

export function SiteFooter({ locale, settings }: { locale: Locale; settings: CmsSiteSettings }) {
  return (
    <footer className="mt-24 bg-muted/40 pt-20 pb-10">
      <div className="mx-auto mb-16 grid max-w-7xl grid-cols-1 gap-12 px-4 md:grid-cols-4 md:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              alt="NA Logo"
              className="h-10 w-auto opacity-70"
              src="https://lh3.googleusercontent.com/aida/ADBb0uh_9yvlLd-ylpvX1XNStaoG_6qztx_3VGHDs1kUHqVhZmx45ncl5bccp6PftjS3xoMiELx5lVnSyIwvAmb-wIiut8XbibHn-ACiiqf-PF6y-00TTKO4zNQKd_OXFY9NW4_ysLOUilNFKo7s8vUVIO2-LBbBxMtSsGR9Dme0NzYKNJkLGq9lguo2ZPKlzu3dBQqalhXGhZewrQE8W8WSHPg5CgxWKPQqQzmbckGyXw1Ntei7WB_Cg1MvMkeUG3s8aXPP9ILaqZ3Q"
              width={96}
              height={40}
            />
            <span className="text-base font-bold text-primary">{getLocalizedValue(settings.siteTitle, locale)}</span>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{getLocalizedValue(settings.footerBlurb, locale)}</p>
        </div>

        {settings.footerColumns.map((column) => (
          <FooterColumn key={column.title.en} column={column} locale={locale} />
        ))}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-border/20 px-4 pt-8 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground md:flex-row md:px-8">
        <span>{getLocalizedValue(settings.footerCopyright, locale)}</span>
        <div className="flex gap-5">
          {settings.socialLinks.map((item) => (
            <a key={item.platform} href={item.href} rel="noreferrer" target="_blank">
              {item.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ column, locale }: { column: CmsFooterColumn; locale: Locale }) {
  return (
    <div className="space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{getLocalizedValue(column.title, locale)}</h4>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {column.links.map((link) => (
          <li key={link.href + link.label.en}>
            <Link href={link.href === "/" ? `/${locale}` : `/${locale}${link.href}`} className="hover:text-primary">
              {getLocalizedValue(link.label, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
