import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

// Same project and dataset as the site's NEXT_PUBLIC_SANITY_* vars. Set them in studio/.env.
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? "";
const dataset = process.env.SANITY_STUDIO_DATASET ?? "";

export default defineConfig({
  name: "webtech-ninjas",
  title: "WebTech Ninjas",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: "2026-10-01" })],
  schema: { types: schemaTypes },
});
