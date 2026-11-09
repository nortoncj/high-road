import { defineCliConfig } from "sanity/cli";

// For `npx sanity ...` commands (login, the seed script). Same project and dataset as the site.
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
});
