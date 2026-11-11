import { defineType } from "sanity";
import { newTable, TableInput } from "../components/TableInput";

export default defineType({
  name: "table",
  type: "object",
  title: "Table",
  // A spreadsheet-style grid instead of nested row/cell arrays. Same data shape either way.
  components: { input: TableInput },
  initialValue: newTable,
  fields: [
    {
      name: "rows",
      type: "array",
      title: "Rows",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "cells",
              type: "array",
              title: "Cells",
              of: [{ type: "string" }],
            },
          ],
        },
      ],
    },
  ],
});
