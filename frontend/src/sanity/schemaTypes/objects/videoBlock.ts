import { defineField, defineType } from "sanity";

export const videoBlockType = defineType({
  name: "videoBlock",
  title: "Video Block",
  type: "object",
  fields: [
    defineField({ name: "title", title: "Title", type: "localizedString" }),
    defineField({ name: "body", title: "Body", type: "localizedText" }),
    defineField({
      name: "provider",
      title: "Video Provider",
      type: "string",
      options: {
        list: [
          { title: "YouTube URL", value: "youtube" },
          { title: "Uploaded File", value: "upload" },
        ],
      },
      initialValue: "youtube",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      hidden: ({ parent }) => parent?.provider !== "youtube",
    }),
    defineField({
      name: "videoFile",
      title: "Video File",
      type: "file",
      options: { accept: "video/*" },
      hidden: ({ parent }) => parent?.provider !== "upload",
    }),
  ],
  preview: {
    select: {
      title: "title.en",
      provider: "provider",
      youtubeUrl: "youtubeUrl",
    },
    prepare({ title, provider, youtubeUrl }) {
      return {
        title: title || "Video Block",
        subtitle: provider === "youtube" ? youtubeUrl : "Uploaded MP4 File",
      };
    },
  },
});
