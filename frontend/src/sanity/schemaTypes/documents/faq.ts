import { defineField, defineType } from "sanity";

export const faqType = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fields: [
    defineField({
      name: "category",
      title: "Category",
      type: "string",
    }),
    defineField({
      name: "question",
      title: "Question",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "localizedRichText",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      of: [{ type: "string" }],
      description: "Used by the chatbot content-answer mode and editorial search.",
    }),
  ],
  preview: {
    select: {
      title: "question.en",
      subtitle: "category",
    },
  },
});
