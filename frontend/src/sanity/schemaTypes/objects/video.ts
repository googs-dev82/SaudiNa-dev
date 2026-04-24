import { defineField, defineType } from "sanity";

export const videoType = defineType({
  name: "video",
  title: "Uploaded Video",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "Video File",
      type: "file",
      options: {
        accept: "video/*",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Video Title",
      type: "localizedString",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
    },
    prepare({ title }) {
      return {
        title: title || "Uploaded Video",
      };
    },
  },
});
