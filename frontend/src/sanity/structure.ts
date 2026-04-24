import type { StructureResolver } from "sanity/structure";

const singletonTypes = new Set(["siteSettings"]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("SaudiNA Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId("siteSettings"),
        ),
      S.divider(),
      S.listItem()
        .title("Core Pages")
        .child(
          S.list()
            .title("Core Pages")
            .items([
              S.listItem()
                .title("Home Page")
                .child(
                  S.document()
                    .schemaType("page")
                    .documentId("page-home"),
                ),
              S.listItem()
                .title("About Page")
                .child(
                  S.document()
                    .schemaType("page")
                    .documentId("page-about"),
                ),
              S.listItem()
                .title("Literature Page")
                .child(
                  S.document()
                    .schemaType("page")
                    .documentId("page-literature"),
                ),
              S.listItem()
                .title("Generic Pages")
                .child(
                  S.documentList()
                    .title("Generic Pages")
                    .schemaType("page")
                    .filter('_type == "page" && pageType == "generic"'),
                ),
            ]),
        ),
      S.listItem()
        .title("Articles")
        .child(S.documentTypeList("article").title("Articles")),
      S.listItem()
        .title("FAQs")
        .child(S.documentTypeList("faq").title("FAQs")),
      S.listItem()
        .title("Resource Editorial Content")
        .child(S.documentTypeList("resourceContent").title("Resource Editorial Content")),
    ]);

export const singletonActions = new Set(["publish", "discardChanges", "restore"]);
export const singletonNewDocumentOptions = (prev: { templateId: string }[]) =>
  prev.filter((item) => !singletonTypes.has(item.templateId));
