import { defineField, defineType } from "sanity";

export const localizedRichTextType = defineType({
  name: "localizedRichText",
  title: "Localized rich text",
  type: "object",
  fields: [
    defineField({
      name: "en",
      title: "English",
      type: "richText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "ar",
      title: "Arabic",
      type: "richText",
      validation: (rule) => rule.required(),
    }),
  ],
});
