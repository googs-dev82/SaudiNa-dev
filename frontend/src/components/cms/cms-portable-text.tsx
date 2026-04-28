import { PortableText, type PortableTextComponents } from "@portabletext/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/config/site";
import { urlForImage } from "@/sanity/lib/image";
import { getSanityFileUrl } from "@/sanity/lib/file";
import type { CmsLocalizedRichText, CmsYoutube, CmsVideo, CmsAudio, CmsFileAttachment } from "@/types/cms";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2 className="text-3xl font-bold text-primary">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-bold text-primary">{children}</h3>,
    blockquote: ({ children }) => <blockquote className="border-s-4 border-secondary/30 ps-6 text-xl italic text-primary/80">{children}</blockquote>,
    normal: ({ children }) => <p className="text-lg leading-8 text-muted-foreground">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="space-y-3 ps-5 text-lg text-muted-foreground">{children}</ul>,
  },
  listItem: {
    bullet: ({ children }) => <li className="list-disc">{children}</li>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href ?? "#";
      const external = href.startsWith("http");

      if (external) {
        return (
          <a className="font-semibold text-primary underline-offset-4 hover:underline" href={href} rel="noreferrer" target="_blank">
            {children}
          </a>
        );
      }

      return (
        <Link className="font-semibold text-primary underline-offset-4 hover:underline" href={href}>
          {children}
        </Link>
      );
    },
  },
  types: {
    image: ({ value }) => {
      const imageBuilder = urlForImage(value);
      const src = "width" in imageBuilder ? imageBuilder.width(1200).height(700).url() : imageBuilder.url();
      const alt = value?.alt?.en ?? "SaudiNA editorial image";
      return (
        <div className="overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={alt} className="h-auto w-full object-cover" loading="lazy" src={src} />
        </div>
      );
    },
    youtube: ({ value }: { value: CmsYoutube }) => {
      if (!value?.url) return null;
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = value.url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;

      if (!videoId) return null;
      const title = value?.title?.en ?? "YouTube video";

      return (
        <div className="relative my-6 aspect-video w-full overflow-hidden rounded-lg bg-black editorial-shadow">
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute left-0 top-0 size-full border-0"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
          />
        </div>
      );
    },
    video: ({ value }: { value: CmsVideo }) => {
      if (!value?.file?.asset?._ref) return null;
      const url = getSanityFileUrl(value.file.asset._ref);
      if (!url) return null;

      return (
        <div className="relative my-6 overflow-hidden rounded-lg bg-black editorial-shadow">
          <video
            className="w-full"
            controls
            preload="metadata"
            src={url}
            title={value?.title?.en}
          />
        </div>
      );
    },
    audio: ({ value }: { value: CmsAudio }) => {
      if (!value?.file?.asset?._ref) return null;
      const url = getSanityFileUrl(value.file.asset._ref);
      if (!url) return null;

      return (
        <div className="my-6 rounded-lg border border-secondary/10 bg-secondary/5 p-6 editorial-shadow">
          {value?.title?.en ? <p className="mb-4 font-semibold text-primary">{value.title.en}</p> : null}
          <audio className="w-full" controls preload="metadata" src={url} />
        </div>
      );
    },
    fileAttachment: ({ value }: { value: CmsFileAttachment }) => {
      if (!value?.file?.asset?._ref) return null;
      const url = getSanityFileUrl(value.file.asset._ref);
      if (!url) return null;

      return (
        <a
          className="my-4 inline-flex items-center gap-3 rounded-lg border border-secondary/40 bg-secondary/10 px-5 py-3 font-medium text-primary transition hover:bg-secondary/20"
          download
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          <svg className="size-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {value?.label?.en ?? "Download Attachment"}
        </a>
      );
    },
  },
};

export function CmsPortableText({
  value,
  locale,
  className,
}: {
  value?: CmsLocalizedRichText;
  locale: Locale;
  className?: string;
}) {
  const blocks = value?.[locale];

  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <PortableText components={components} value={blocks} />
    </div>
  );
}
