import Image from "next/image";
import type { Locale } from "@/config/site";
import { urlForImage } from "@/sanity/lib/image";
import type { CmsImage } from "@/types/cms";
import { getLocalizedValue } from "@/types/cms";

export function CmsImageView({
  image,
  locale,
  className,
  fill = false,
  width = 1200,
  height = 800,
  sizes,
}: {
  image?: CmsImage;
  locale: Locale;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
}) {
  const assetRef = image?.asset?._ref;
  const src = assetRef
    ? assetRef.startsWith("http")
      ? assetRef
      : urlForImage(image).url()
    : null;

  if (!src) {
    return null;
  }

  const alt = getLocalizedValue(image?.alt, locale) ?? "SaudiNA content image";

  if (fill) {
    return <Image alt={alt} className={className} fill sizes={sizes} src={src} />;
  }

  return <Image alt={alt} className={className} height={height} sizes={sizes} src={src} width={width} />;
}
