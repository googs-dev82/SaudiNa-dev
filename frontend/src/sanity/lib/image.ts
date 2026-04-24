import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "../env";

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || "",
  dataset: dataset || "",
});

export const urlForImage = (source: unknown) => {
  if (typeof source === "string") {
    return {
      url: () => source,
    };
  }

  return imageBuilder.image(source as Parameters<typeof imageBuilder.image>[0]).auto("format").fit("max");
};
