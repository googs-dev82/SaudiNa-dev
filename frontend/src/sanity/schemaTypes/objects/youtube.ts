import { defineField, defineType } from "sanity";

export const youtubeType = defineType({
  name: "youtube",
  title: "YouTube Embed",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "YouTube URL",
      type: "url",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      title: "Title (for screen readers)",
      type: "localizedString",
    }),
  ],
  preview: {
    select: {
      url: "url",
      title: "title.en",
    },
    prepare({ url, title }) {
      return {
        title: title || "YouTube Video",
        subtitle: url,
      };
    },
  },
});
