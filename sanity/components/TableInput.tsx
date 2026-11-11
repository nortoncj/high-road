import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { AddIcon, TrashIcon } from "@sanity/icons";
import { Button, Card, Flex, Stack, Text, TextInput } from "@sanity/ui";
import { insert, set, setIfMissing, unset, useFormValue, type ObjectInputProps } from "sanity";

/**
 * The editor for the `table` type (Enhanced Table → Table Data): a grid of cells instead of nested arrays.
 * Tab moves cell to cell, Tab in the last cell adds a row, Enter and the arrow keys move up and down,
 * and pasting from a spreadsheet fills as many cells as you copied. The data shape doesn't change:
 * rows[].cells[] of strings, which components/blog/PortableBody.tsx renders.
 */

type Row = { _key: string; cells?: string[] };
type TableValue = { rows?: Row[] };

const newKey = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => b.toString(16).padStart(2, "0")).join("");
const emptyRow = (columns: number): Row => ({ _key: newKey(), cells: Array<string>(columns).fill("") });

/** New tables start as 3×3: a header row and two to fill. */
export const newTable = (): { rows: Row[] } => ({ rows: [emptyRow(3), emptyRow(3), emptyRow(3)] });

/** A row's cells, padded with empty strings to `columns`. Older rows can be shorter than the widest one. */
const padded = (row: Row, columns: number) => [...(row.cells ?? []), ...Array<string>(Math.max(0, columns - (row.cells?.length ?? 0))).fill("")];

// Remove buttons sit outside the Tab order so Tab only visits cells.
const controlCell = { width: 1, padding: 2, textAlign: "center" } as const;

export function TableInput({ value, onChange, path, schemaType, readOnly }: ObjectInputProps<TableValue>) {
  const rows = value?.rows ?? [];
  const columns = Math.max(1, ...rows.map((r) => r.cells?.length ?? 0));
  // The header toggle is a sibling field on the Enhanced Table block. It defaults to on.
  const hasHeaderRow = useFormValue([...path.slice(0, -1), "hasHeaderRow"]) !== false;

  const grid = useRef<HTMLDivElement>(null);
  // A cell to focus once the row it's in exists (after Tab or Enter adds one).
  const pendingFocus = useRef<string | null>(null);

  const cellInput = (r: number, c: number) => grid.current?.querySelector<HTMLInputElement>(`[data-cell="${r}:${c}"]`);
  const focusCell = (r: number, c: number) => {
    const input = cellInput(r, c);
    if (input) input.focus();
    else pendingFocus.current = `${r}:${c}`;
  };

  useEffect(() => {
    if (!pendingFocus.current) return;
    const [r, c] = pendingFocus.current.split(":").map(Number);
    const input = cellInput(r, c);
    if (input) {
      pendingFocus.current = null;
      input.focus();
    }
  });

  const replaceRows = (next: Row[]) => onChange([setIfMissing({ _type: schemaType.name }), set(next, ["rows"])]);

  const setCell = (r: number, c: number, text: string) => {
    const row = rows[r];
    if ((row.cells?.length ?? 0) > c) return onChange(set(text, ["rows", { _key: row._key }, "cells", c]));
    const cells = padded(row, columns);
    cells[c] = text;
    onChange(set(cells, ["rows", { _key: row._key }, "cells"]));
  };

  const addRow = () => onChange([setIfMissing({ _type: schemaType.name }), setIfMissing([], ["rows"]), insert([emptyRow(columns)], "after", ["rows", -1])]);
  const removeRow = (r: number) => onChange(unset(["rows", { _key: rows[r]._key }]));
  const addColumn = () => replaceRows(rows.map((row) => ({ ...row, cells: [...padded(row, columns), ""] })));
  const removeColumn = (c: number) => replaceRows(rows.map((row) => ({ ...row, cells: padded(row, columns).filter((_, i) => i !== c) })));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    const lastRow = r === rows.length - 1;
    if (e.key === "Tab" && !e.shiftKey && lastRow && c === columns - 1) {
      e.preventDefault();
      addRow();
      focusCell(r + 1, 0);
    } else if (e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (lastRow && e.key === "Enter") addRow();
      if (!lastRow || e.key === "Enter") focusCell(r + 1, c);
    } else if (e.key === "ArrowUp" && r > 0) {
      e.preventDefault();
      focusCell(r - 1, c);
    }
  };

  // A copied range from Sheets, Excel or Numbers arrives as tab-separated lines.
  const onPaste = (e: ClipboardEvent<HTMLInputElement>, r: number, c: number) => {
    const text = e.clipboardData.getData("text/plain");
    if (!/[\t\n]/.test(text)) return;
    e.preventDefault();
    const pasted = text.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n").map((line) => line.split("\t"));
    const width = Math.max(columns, c + Math.max(...pasted.map((line) => line.length)));
    const height = Math.max(rows.length, r + pasted.length);
    replaceRows(
      Array.from({ length: height }, (_, i) => {
        const row = rows[i] ?? emptyRow(width);
        const cells = padded(row, width);
        pasted[i - r]?.forEach((cell, j) => (cells[c + j] = cell));
        return { ...row, cells };
      }),
    );
  };

  if (!rows.length) {
    return (
      <Card padding={3} radius={2} border>
        <Flex align="center" justify="space-between" gap={3}>
          <Text size={1} muted>
            This table is empty.
          </Text>
          <Button icon={AddIcon} text="Create table" mode="ghost" fontSize={1} disabled={readOnly} onClick={() => replaceRows(newTable().rows)} />
        </Flex>
      </Card>
    );
  }

  return (
    <Stack gap={3}>
      <Card ref={grid} border radius={2} overflow="auto">
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, c) => (
                <th key={c} style={controlCell}>
                  <Button
                    icon={TrashIcon}
                    mode="bleed"
                    fontSize={0}
                    padding={2}
                    tabIndex={-1}
                    title={`Remove column ${c + 1}`}
                    aria-label={`Remove column ${c + 1}`}
                    disabled={readOnly || columns === 1}
                    onClick={() => removeColumn(c)}
                  />
                </th>
              ))}
              <th style={controlCell} />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={row._key}>
                {Array.from({ length: columns }, (_, c) => (
                  <td key={c} style={{ padding: 2, minWidth: "8rem" }}>
                    <TextInput
                      data-cell={`${r}:${c}`}
                      aria-label={`Row ${r + 1}, column ${c + 1}`}
                      fontSize={1}
                      padding={2}
                      weight={hasHeaderRow && r === 0 ? "semibold" : "regular"}
                      value={row.cells?.[c] ?? ""}
                      readOnly={readOnly}
                      onChange={(e) => setCell(r, c, e.currentTarget.value)}
                      onKeyDown={(e) => onKeyDown(e, r, c)}
                      onPaste={(e) => onPaste(e, r, c)}
                    />
                  </td>
                ))}
                <td style={controlCell}>
                  <Button
                    icon={TrashIcon}
                    mode="bleed"
                    fontSize={0}
                    padding={2}
                    tabIndex={-1}
                    title={`Remove row ${r + 1}`}
                    aria-label={`Remove row ${r + 1}`}
                    disabled={readOnly || rows.length === 1}
                    onClick={() => removeRow(r)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Flex gap={2} wrap="wrap" align="center">
        <Button icon={AddIcon} text="Add row" mode="ghost" fontSize={1} disabled={readOnly} onClick={addRow} />
        <Button icon={AddIcon} text="Add column" mode="ghost" fontSize={1} disabled={readOnly} onClick={addColumn} />
        <Text size={1} muted>
          Tab to the next cell. Tab in the last cell adds a row. Paste from a spreadsheet to fill several cells.
        </Text>
      </Flex>
    </Stack>
  );
}
