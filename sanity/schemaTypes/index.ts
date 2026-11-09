import type { SchemaTypeDefinition } from "sanity";
import { calloutCard, checklist } from "./blocks";
import caseStudy from "./case-study";
import category from "./category";
import industry from "./industry";
import post from "./post";
import table from "./table";
import tag from "./tag";

export const schemaTypes: SchemaTypeDefinition[] = [post, caseStudy, industry, category, tag, table, calloutCard, checklist];
