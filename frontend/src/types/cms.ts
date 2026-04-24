import type { PortableTextBlock } from "@portabletext/react";
import type { Locale } from "@/config/site";

export interface CmsLocalizedString {
  ar: string;
  en: string;
}

export interface CmsLocalizedRichText {
  ar: PortableTextBlock[];
  en: PortableTextBlock[];
}

export interface CmsImage {
  asset?: {
    _ref?: string;
    _type?: string;
  };
  alt?: CmsLocalizedString;
}

export interface CmsLink {
  kind: "internal" | "external";
  label: CmsLocalizedString;
  href: string;
  openInNewTab?: boolean;
}

export interface CmsSeo {
  title?: CmsLocalizedString;
  description?: CmsLocalizedString;
  noIndex?: boolean;
}

export interface CmsHeroBlock {
  _key: string;
  _type: "heroBlock";
  eyebrow?: CmsLocalizedString;
  title: CmsLocalizedString;
  body?: CmsLocalizedText;
  primaryCta?: CmsLink;
  secondaryCta?: CmsLink;
  image?: CmsImage;
  theme?: "ocean" | "sand" | "sage";
}

export interface CmsLocalizedText {
  ar: string;
  en: string;
}

export interface CmsRichTextBlock {
  _key: string;
  _type: "richTextBlock";
  title?: CmsLocalizedString;
  body: CmsLocalizedRichText;
  tone?: "default" | "muted" | "accent";
}

export interface CmsMediaBlock {
  _key: string;
  _type: "mediaBlock";
  title?: CmsLocalizedString;
  body?: CmsLocalizedText;
  image: CmsImage;
  layout?: "imageLeft" | "imageRight" | "fullBleed";
}

export interface CmsCtaBlock {
  _key: string;
  _type: "ctaBlock";
  eyebrow?: CmsLocalizedString;
  title: CmsLocalizedString;
  body?: CmsLocalizedText;
  actions: CmsLink[];
}

export interface CmsFileAsset {
  asset?: {
    _ref?: string;
    _type?: string;
  };
}

export interface CmsYoutube {
  _type: "youtube";
  url: string;
  title?: CmsLocalizedString;
}

export interface CmsVideo {
  _type: "video";
  file?: CmsFileAsset;
  title?: CmsLocalizedString;
}

export interface CmsAudio {
  _type: "audio";
  file?: CmsFileAsset;
  title?: CmsLocalizedString;
}

export interface CmsFileAttachment {
  _type: "fileAttachment";
  file?: CmsFileAsset;
  label?: CmsLocalizedString;
}

export interface CmsVideoBlock {
  _key: string;
  _type: "videoBlock";
  title?: CmsLocalizedString;
  body?: CmsLocalizedText;
  provider: "youtube" | "upload";
  youtubeUrl?: string;
  videoFile?: CmsFileAsset;
}

export interface CmsAudioBlock {
  _key: string;
  _type: "audioBlock";
  title?: CmsLocalizedString;
  body?: CmsLocalizedText;
  audioFile?: CmsFileAsset;
}

export interface CmsFileDownloadBlock {
  _key: string;
  _type: "fileDownloadBlock";
  title?: CmsLocalizedString;
  body?: CmsLocalizedText;
  buttonLabel?: CmsLocalizedString;
  file?: CmsFileAsset;
}

export type CmsPageSection =
  | CmsHeroBlock
  | CmsRichTextBlock
  | CmsMediaBlock
  | CmsCtaBlock
  | CmsVideoBlock
  | CmsAudioBlock
  | CmsFileDownloadBlock;

export interface CmsPage {
  id: string;
  slug: string;
  title: CmsLocalizedString;
  summary?: CmsLocalizedText;
  seo?: CmsSeo;
  sections: CmsPageSection[];
}

export interface CmsArticleCard {
  id: string;
  slug: string;
  type: string;
  title: CmsLocalizedString;
  description: CmsLocalizedText;
  dateLabel: CmsLocalizedString;
  image?: CmsImage;
}

export interface CmsFaqItem {
  id: string;
  question: CmsLocalizedString;
  answer: CmsLocalizedRichText;
  category?: string;
}

export interface CmsNavItem {
  label: CmsLocalizedString;
  href: string;
}

export interface CmsFooterColumn {
  title: CmsLocalizedString;
  links: CmsNavItem[];
}

export interface CmsSocialLink {
  platform: string;
  href: string;
}

export interface CmsSiteSettings {
  siteTitle: CmsLocalizedString;
  siteDescription: CmsLocalizedText;
  navigation: CmsNavItem[];
  footerBlurb: CmsLocalizedText;
  footerColumns: CmsFooterColumn[];
  footerCopyright: CmsLocalizedString;
  socialLinks: CmsSocialLink[];
}

export const getLocalizedValue = <T>(
  value: { ar: T; en: T } | undefined,
  locale: Locale,
) => value?.[locale];
