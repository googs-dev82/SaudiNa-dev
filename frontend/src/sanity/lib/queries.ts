export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle,
  siteDescription,
  navigation[]{
    label,
    "href": href
  },
  footerBlurb,
  footerColumns[]{
    title,
    links[]{
      label,
      "href": href
    }
  },
  footerCopyright,
  socialLinks[]{
    platform,
    href
  }
}`;

export const pageBySlugQuery = `*[_type == "page" && slug.current == $slug][0]{
  "id": _id,
  "slug": slug.current,
  title,
  summary,
  seo,
  sections[]{
    ...,
    image{
      ...,
      alt
    },
    primaryCta{
      ...,
      "href": href
    },
    secondaryCta{
      ...,
      "href": href
    },
    actions[]{
      ...,
      "href": href
    }
  }
}`;

export const articlesQuery = `*[_type == "article"] | order(publishedAt desc){
  "id": _id,
  "slug": slug.current,
  type,
  title,
  description,
  dateLabel,
  image{
    ...,
    alt
  }
}`;

export const faqsQuery = `*[_type == "faq"] | order(_createdAt asc){
  "id": _id,
  question,
  answer,
  category
}`;
