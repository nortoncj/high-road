import type { StructureResolver } from "sanity/structure";

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("post").title("Blog posts"),
      S.documentTypeListItem("caseStudy").title("Case studies"),
      S.listItem()
        .title("Industries")
        .schemaType("industry")
        .child(S.documentTypeList("industry").title("Industries").defaultOrdering([{ field: "sortOrder", direction: "asc" }])),
      S.divider(),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("tag").title("Tags"),
    ]);
