import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./lib/sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

// The Studio lives in the admin at /admin/content (app/(admin)/admin/(dashboard)/content).
export default defineConfig({
  name: "webtech-ninjas",
  title: "WebTech Ninjas",
  basePath: "/admin/content",
  projectId,
  dataset,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  schema: { types: schemaTypes },
});
