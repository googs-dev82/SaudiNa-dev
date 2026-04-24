import { defineField, defineType } from "sanity";

export const richTextBlockType = defineType({
  name: "richTextBlock",
  title: "Rich text block",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "localizedString" }),
    defineField({
      name: "body",
      title: "Body",
      type: "localizedRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tone",
      title: "Tone",
      type: "string",
      options: {
        list: [
          { title: "Default", value: "default" },
          { title: "Muted", value: "muted" },
          { title: "Accent", value: "accent" },
        ],
      },
      initialValue: "default",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
    },
  },
});
