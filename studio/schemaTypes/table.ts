export default {
  name: "table",
  type: "object",
  title: "Table",
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
};
