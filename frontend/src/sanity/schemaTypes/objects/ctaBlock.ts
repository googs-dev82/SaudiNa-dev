import { defineArrayMember, defineField, defineType } from "sanity";

export const ctaBlockType = defineType({
  name: "ctaBlock",
  title: "CTA block",
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
    defineField({
      name: "actions",
      title: "Actions",
      type: "array",
      of: [defineArrayMember({ type: "link" })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: {
      title: "title.en",
    },
  },
});
