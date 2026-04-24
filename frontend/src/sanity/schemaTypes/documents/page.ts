import { defineArrayMember, defineField, defineType } from "sanity";

export const pageType = defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title.en",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "localizedText",
    }),
    defineField({
      name: "pageType",
      title: "Page type",
      type: "string",
      options: {
        list: [
          { title: "Home", value: "home" },
          { title: "Generic", value: "generic" },
          { title: "About", value: "about" },
          { title: "Literature", value: "literature" },
        ],
      },
      initialValue: "generic",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
    defineField({
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        defineArrayMember({ type: "heroBlock" }),
        defineArrayMember({ type: "richTextBlock" }),
        defineArrayMember({ type: "mediaBlock" }),
        defineArrayMember({ type: "ctaBlock" }),
        defineArrayMember({ type: "videoBlock" }),
        defineArrayMember({ type: "audioBlock" }),
        defineArrayMember({ type: "fileDownloadBlock" }),
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "slug.current",
    },
  },
});
