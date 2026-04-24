import { defineField, defineType } from "sanity";

export const mediaBlockType = defineType({
  name: "mediaBlock",
  title: "Media block",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "localizedString" }),
    defineField({ name: "body", title: "Body", type: "localizedText" }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [{ name: "alt", title: "Alt text", type: "localizedString" }],
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      options: {
        list: [
          { title: "Image left", value: "imageLeft" },
          { title: "Image right", value: "imageRight" },
          { title: "Full bleed", value: "fullBleed" },
        ],
      },
      initialValue: "imageRight",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      media: "image",
    },
  },
});
