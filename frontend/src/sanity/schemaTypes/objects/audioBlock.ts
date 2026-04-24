import { defineField, defineType } from "sanity";

export const audioBlockType = defineType({
  name: "audioBlock",
  title: "Audio Block",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "localizedString" }),
    defineField({ name: "body", title: "Body", type: "localizedText" }),
    defineField({
      name: "audioFile",
      title: "Audio File",
      type: "file",
      options: { accept: "audio/*" },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title.en",
    },
    prepare({ title }) {
      return {
        title: title || "Audio Block",
      };
    },
  },
});
