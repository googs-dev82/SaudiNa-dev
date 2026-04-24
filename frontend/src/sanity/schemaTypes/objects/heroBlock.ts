import { defineField, defineType } from "sanity";

export const heroBlockType = defineType({
  name: "heroBlock",
  title: "Hero block",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "localizedString" }),
    defineField({
      name: "title",
      title: "Title",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "body", title: "Body", type: "localizedText" }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "link" }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "link" }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt text", type: "localizedString" }],
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "string",
      options: {
        list: [
          { title: "Ocean", value: "ocean" },
          { title: "Sand", value: "sand" },
          { title: "Sage", value: "sage" },
        ],
      },
      initialValue: "ocean",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "eyebrow.en",
      media: "image",
    },
  },
});
