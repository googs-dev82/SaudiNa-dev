import { defineArrayMember, defineType } from "sanity";

export const richTextType = defineType({
  name: "richText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [{ title: "Bullet", value: "bullet" }],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt text",
          type: "localizedString",
        },
      ],
    }),
    defineArrayMember({ type: "youtube" }),
    defineArrayMember({ type: "video" }),
    defineArrayMember({ type: "audio" }),
    defineArrayMember({ type: "fileAttachment" }),
  ],
});
