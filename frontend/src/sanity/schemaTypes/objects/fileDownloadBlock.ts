import { defineField, defineType } from "sanity";

export const fileDownloadBlockType = defineType({
  name: "fileDownloadBlock",
  title: "File Download Block",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "localizedString" }),
    defineField({ name: "body", title: "Body", type: "localizedText" }),
    defineField({ name: "buttonLabel", title: "Button Label", type: "localizedString" }),
    defineField({
      name: "file",
      title: "File Attachment",
      type: "file",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: "title.en",
    },
    prepare({ title }) {
      return {
        title: title || "File Download Block",
      };
    },
  },
});
