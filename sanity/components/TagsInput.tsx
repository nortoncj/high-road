import { useState } from "react";
import { Box, Button, Flex, Stack, Text, TextInput } from "@sanity/ui";
import {
  insert,
  setIfMissing,
  useClient,
  type ArrayOfObjectsInputProps,
  type InputProps,
  type Reference,
} from "sanity";
import { apiVersion } from "../../lib/sanity/env";

/**
 * The Tags field on posts and case studies, plus a box to add several at once:
 * "seo, local search, google business profile". Tags that already exist (same title or slug) are reused,
 * missing ones are created and published, and all of them are added to the field.
 */

type TagRef = Reference & { _key: string };

// Same rules as the slug field's default: lowercase, dashes for spaces, URL-safe, 96 max.
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);

const newKey = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");

// Typed as InputProps so defineField accepts it; the field is always an array of tag references.
export function TagsInput(inputProps: InputProps) {
  const props = inputProps as ArrayOfObjectsInputProps;
  const { onChange, readOnly, renderDefault } = props;
  const value = (props.value ?? []) as TagRef[];
  const client = useClient({ apiVersion });
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const addTags = async () => {
    // Commas or new lines, so a pasted column from a spreadsheet works too. Titles must be 2–30 characters.
    const seen = new Set<string>();
    const wanted = text
      .split(/[,\n]/)
      .map((t) => t.trim().replace(/\s+/g, " "))
      .filter((t) => {
        const slug = slugify(t);
        if (!slug || seen.has(slug)) return false;
        seen.add(slug);
        return true;
      });
    const skipped = wanted.filter((t) => t.length < 2 || t.length > 30);
    const titles = wanted.filter((t) => !skipped.includes(t));
    if (!titles.length) {
      setMessage(
        skipped.length
          ? `Tags must be 2–30 characters: ${skipped.join(", ")}`
          : null,
      );
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const existing = await client.fetch<
        { _id: string; title: string; slug: string | null }[]
      >(
        `*[_type == "tag" && !(_id in path("drafts.**")) && (lower(title) in $lower || slug.current in $slugs)]{_id, title, "slug": slug.current}`,
        {
          lower: titles.map((t) => t.toLowerCase()),
          slugs: titles.map(slugify),
        },
      );
      const find = (t: string) =>
        existing.find(
          (e) =>
            e.title.toLowerCase() === t.toLowerCase() || e.slug === slugify(t),
        );

      const missing = titles.filter((t) => !find(t));
      if (missing.length) {
        const tx = client.transaction();
        for (const t of missing)
          tx.createIfNotExists({
            _id: `tag-${slugify(t)}`,
            _type: "tag",
            title: t,
            slug: { _type: "slug", current: slugify(t) },
          });
        await tx.commit();
      }

      const ids = titles.map((t) => find(t)?._id ?? `tag-${slugify(t)}`);
      const current = new Set(value.map((r) => r._ref));
      const refs: TagRef[] = [...new Set(ids)]
        .filter((id) => !current.has(id))
        .map((id) => ({ _key: newKey(), _type: "reference", _ref: id }));
      if (refs.length)
        onChange([setIfMissing([]), insert(refs, "after", [-1])]);

      setText("");
      setMessage(
        [
          `Added ${refs.length} tag${refs.length === 1 ? "" : "s"}${missing.length ? ` (${missing.length} new)` : ""}.`,
          skipped.length
            ? `Skipped, not 2–30 characters: ${skipped.join(", ")}.`
            : "",
        ]
          .filter(Boolean)
          .join(" "),
      );
    } catch (err) {
      setMessage(
        `Couldn't add tags: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack gap={3}>
      {renderDefault(props)}
      <Flex gap={2}>
        <Box flex={1}>
          <TextInput
            fontSize={1}
            placeholder="Add several: seo, local search, google business profile"
            value={text}
            disabled={readOnly || busy}
            onChange={(e) => setText(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void addTags();
              }
            }}
          />
        </Box>
        <Button
          text="Add tags"
          mode="ghost"
          fontSize={1}
          loading={busy}
          disabled={readOnly || !text.trim()}
          onClick={() => void addTags()}
        />
      </Flex>
      {message ? (
        <Text size={1} muted>
          {message}
        </Text>
      ) : null}
    </Stack>
  );
}
