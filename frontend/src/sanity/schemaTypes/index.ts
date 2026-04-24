import { articleType } from "./documents/article";
import { faqType } from "./documents/faq";
import { pageType } from "./documents/page";
import { resourceContentType } from "./documents/resourceContent";
import { siteSettingsType } from "./documents/siteSettings";
import { ctaBlockType } from "./objects/ctaBlock";
import { heroBlockType } from "./objects/heroBlock";
import { linkType } from "./objects/link";
import { localizedRichTextType } from "./objects/localizedRichText";
import { localizedStringType } from "./objects/localizedString";
import { localizedTextType } from "./objects/localizedText";
import { mediaBlockType } from "./objects/mediaBlock";
import { richTextBlockType } from "./objects/richTextBlock";
import { richTextType } from "./objects/richText";
import { seoType } from "./objects/seo";
import { youtubeType } from "./objects/youtube";
import { videoType } from "./objects/video";
import { audioType } from "./objects/audio";
import { fileAttachmentType } from "./objects/fileAttachment";
import { videoBlockType } from "./objects/videoBlock";
import { audioBlockType } from "./objects/audioBlock";
import { fileDownloadBlockType } from "./objects/fileDownloadBlock";

export const schemaTypes = [
  localizedStringType,
  localizedTextType,
  richTextType,
  localizedRichTextType,
  seoType,
  linkType,
  heroBlockType,
  richTextBlockType,
  mediaBlockType,
  ctaBlockType,
  siteSettingsType,
  pageType,
  articleType,
  faqType,
  resourceContentType,
  youtubeType,
  videoType,
  audioType,
  fileAttachmentType,
  videoBlockType,
  audioBlockType,
  fileDownloadBlockType,
];
