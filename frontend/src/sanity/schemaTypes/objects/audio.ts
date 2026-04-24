import { defineField, defineType } from "sanity";

export const audioType = defineType({
  name: "audio",
  title: "Uploaded Audio",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "Audio File",
      type: "file",
      options: {
        accept: "audio/*",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Audio Title",
      type: "localizedString",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
    },
    prepare({ title }) {
      return {
        title: title || "Uploaded Audio",
      };
    },
  },
});
