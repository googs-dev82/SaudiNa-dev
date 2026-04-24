import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { singletonActions, singletonNewDocumentOptions, structure } from "./src/sanity/structure";

// Use fallback values if environment variables are not yet defined
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  title: "SaudiNA Content Studio",

  plugins: [
    structureTool({ structure }),
    visionTool(),
  ],
  document: {
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === "global" ? singletonNewDocumentOptions(prev) : prev,
    actions: (prev, context) =>
      context.schemaType === "siteSettings"
        ? prev.filter((action) => action.action && singletonActions.has(action.action))
        : prev,
  },

  schema: {
    types: schemaTypes,
  },
});
