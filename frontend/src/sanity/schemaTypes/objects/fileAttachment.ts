import { defineField, defineType } from "sanity";

export const fileAttachmentType = defineType({
  name: "fileAttachment",
  title: "File Attachment",
  type: "object",
  fields: [
    defineField({
      name: "file",
      title: "File (PDF, Doc, etc)",
      type: "file",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "label",
      title: "Download Label",
      type: "localizedString",
    }),
  ],
  preview: {
    select: {
      title: "label.en",
    },
    prepare({ title }) {
      return {
        title: title || "File Attachment",
      };
    },
  },
});
