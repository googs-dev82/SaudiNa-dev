import { defineField, defineType } from "sanity";

export const resourceContentType = defineType({
  name: "resourceContent",
  title: "Resource editorial content",
  type: "document",
  fields: [
    defineField({
      name: "resourceKey",
      title: "Backend resource key",
      type: "string",
      description: "Reference the operational resource by ID or stable code. Do not upload governed files here.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Editorial title",
      type: "localizedString",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Editorial description",
      type: "localizedText",
    }),
    defineField({
      name: "body",
      title: "Editorial body",
      type: "localizedRichText",
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "seo",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      subtitle: "resourceKey",
    },
  },
});
