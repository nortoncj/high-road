"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TbAlertTriangle, TbLoader2, TbTrash } from "react-icons/tb";
import { studioPage } from "@/content/admin";
import { cancelStudioJob, deleteAssets, deleteThread, sendStudioMessage, updateThread } from "@/lib/admin/studio-actions";
import { formats, lines, textModeLabel, type FormatId, type Zone } from "@/lib/admin/studio-logic";
import { dollars } from "@/lib/admin/studio-models";
import { pendingStatuses, type AssetView, type ComposerPayload, type JobView, type MessageView, type PresetView, type ThreadState } from "@/lib/admin/studio-types";
import { cn } from "@/lib/admin/utils";
import { Button } from "@/components/admin/ui/button";
import { AssetTile } from "./AssetTile";
import { Composer, defaultsFor, type ComposerState } from "./Composer";
import { Lightbox } from "./Lightbox";
import { TextLayerEditor } from "./TextLayerEditor";

const POLL_MS = 3000;
const REFRESH_LINKS_MS = 30 * 60_000; // preview links last an hour

function Elapsed({ since }: { since: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
  return <span className="tabular-nums">{`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`}</span>;
}

function Pending({ job, onCancel }: { job: JobView; onCancel: () => void }) {
  const t = studioPage.thread;
  const label = job.status === "queued" ? t.queued : job.status === "finalizing" ? t.saving : t.making;
  return (
    <div className="flex max-w-md flex-col gap-2">
      <div className="bg-secondary relative w-full max-w-xs overflow-hidden rounded-xl" style={{ aspectRatio: (job.ratio ?? "1:1").replace(":", " / ") }}>
        <div className="from-secondary via-sea-foam/60 to-secondary absolute inset-0 animate-pulse bg-gradient-to-br" />
      </div>
      <p className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
        <TbLoader2 aria-hidden="true" className="size-3.5 animate-spin" />
        {label}
        {job.label ? <span>· {job.label}</span> : null}· <Elapsed since={job.createdAt} />· {t.estimate(dollars(job.costCents))}
        {job.status !== "finalizing" ? (
          <button type="button" onClick={onCancel} className="hover:text-negative underline-offset-2 hover:underline">
            {t.cancel}
          </button>
        ) : null}
      </p>
    </div>
  );
}

/** Groups messages into runs: each user message alone, consecutive assistant messages together. */
function runs(ms: MessageView[]): MessageView[][] {
  const out: MessageView[][] = [];
  for (const m of ms) {
    const last = out[out.length - 1];
    if (m.role === "assistant" && last && last[0].role === "assistant") last.push(m);
    else out.push([m]);
  }
  return out;
}

function UserBubble({ m, assets }: { m: MessageView; assets: Record<string, AssetView> }) {
  const meta = m.meta as { format?: FormatId; ratio?: string; textMode?: keyof typeof textModeLabel; editing?: boolean; cost?: number };
  const chips = [meta.format ? formats[meta.format]?.label : null, meta.ratio, meta.textMode && meta.textMode !== "none" ? textModeLabel[meta.textMode] : null, meta.editing ? "Edit" : null].filter(Boolean);
  const atts = m.assetIds.map((id) => assets[id]).filter(Boolean);
  return (
    <div className="ml-auto flex max-w-[min(36rem,90%)] flex-col items-end gap-1.5">
      {chips.length ? <p className="text-muted-foreground text-[11px]">{chips.join(" · ")}</p> : null}
      {m.body ? <p className="bg-primary text-primary-foreground rounded-2xl rounded-br-md px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p> : null}
      {atts.length ? (
        <div className="flex flex-wrap justify-end gap-1.5">
          {atts.map((a) => (
            <span key={a.id} className="size-14 overflow-hidden rounded-lg border">
              {a.kind === "video" ? <video src={a.url} className="size-full object-cover" muted preload="metadata" /> : <img src={a.url} alt="" className="size-full object-cover" loading="lazy" />}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function StudioThread({ initial, presets, initialFormat }: { initial: ThreadState; presets: PresetView[]; initialFormat?: FormatId }) {
  const router = useRouter();
  const t = studioPage.thread;
  const [state, setState] = useState(initial);
  const [composer, setComposer] = useState<ComposerState>(() => defaultsFor(initialFormat && formats[initialFormat] ? initialFormat : "free"));
  const [view, setView] = useState<number | null>(null);
  const [textFor, setTextFor] = useState<AssetView | null>(null);
  const [title, setTitle] = useState(initial.thread.title);
  const bottom = useRef<HTMLDivElement>(null);
  const id = state.thread.id;
  const preset = presets.find((p) => p.id === state.thread.presetId) ?? null;

  const pending = Object.values(state.jobs).some((j) => pendingStatuses.includes(j.status));

  const refresh = useCallback(async () => {
    const res = await fetch(`/admin/studio/api/threads/${id}`, { cache: "no-store" });
    if (res.ok) setState((await res.json()) as ThreadState);
  }, [id]);

  useEffect(() => {
    const ms = pending ? POLL_MS : REFRESH_LINKS_MS;
    const timer = setInterval(refresh, ms);
    return () => clearInterval(timer);
  }, [pending, refresh]);

  // Scroll to the newest when something new lands.
  const count = state.messages.length + Object.values(state.jobs).filter((j) => j.status === "done").length;
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [count]);

  // Everything you can step through in the preview, in chat order. Carousel slides open as one set.
  const viewable = useMemo(() => {
    const seen = new Set<string>();
    const out: AssetView[] = [];
    for (const m of state.messages) {
      if (m.role !== "assistant") continue;
      for (const aid of m.assetIds) {
        const a = state.assets[aid];
        if (!a || seen.has(a.id)) continue;
        if (a.groupId && a.origin === "slide") {
          if (seen.has(`g:${a.groupId}`)) continue;
          seen.add(`g:${a.groupId}`);
        }
        seen.add(a.id);
        out.push(a);
      }
    }
    return out;
  }, [state]);
  const slidesOf = useCallback((g: string) => Object.values(state.assets).filter((a) => a.groupId === g && a.origin === "slide").sort((a, b) => (a.slideIndex ?? 0) - (b.slideIndex ?? 0)), [state.assets]);
  const open = (a: AssetView) => {
    const i = viewable.findIndex((x) => x.id === a.id || (a.groupId && x.groupId === a.groupId));
    setView(i < 0 ? null : i);
  };

  async function send(p: ComposerPayload): Promise<boolean> {
    const r = await sendStudioMessage(id, p);
    if (!r.ok) {
      toast.error(r.error);
      return false;
    }
    await refresh();
    return true;
  }

  async function remove(a: AssetView) {
    const label = a.groupId && a.origin === "slide" ? "this whole carousel" : "this file";
    if (!window.confirm(`Delete ${label}? It's removed from storage too.`)) return;
    const r = await deleteAssets([a.id]);
    if (!r.ok) toast.error(r.error);
    await refresh();
  }

  const editThis = (a: AssetView) => setComposer((p) => ({ ...(p.format === "video" ? defaultsFor("free", p) : p), base: a }));
  const animate = (a: AssetView) => setComposer((p) => ({ ...defaultsFor("video", p), base: a, ratio: (a.ratio === "16:9" ? "16:9" : a.ratio === "1:1" ? "1:1" : "9:16") as ComposerState["ratio"] }));

  /** Prefill the text editor with the words you typed for that piece. */
  function textInitial(a: AssetView): { headline?: string; sub?: string; cta?: string; zone?: Zone } {
    const userMsgs = state.messages.filter((m) => m.role === "user");
    const meta = (userMsgs[userMsgs.length - 1]?.meta ?? {}) as { fields?: Record<string, string> };
    const f = meta.fields ?? {};
    if (a.origin === "slide" && a.slideIndex) return { headline: lines(f.slides)[a.slideIndex - 1] ?? "", zone: "top" };
    return {
      headline: f.headline || f.quote || f.title || f.offer || "",
      sub: f.quote ? (f.author ? `- ${f.author}` : "") : f.headline && f.offer ? f.offer : "",
      cta: f.cta ?? "",
      zone: (a.format && formats[a.format as FormatId]?.defaultZone) || "bottom",
    };
  }

  return (
    <div className="flex min-h-[calc(100svh-9rem)] flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title !== state.thread.title && updateThread(id, { title }).then(() => setState((s) => ({ ...s, thread: { ...s.thread, title } })))}
          aria-label={studioPage.thread.rename}
          className="font-display focus-visible:bg-card min-w-0 flex-1 rounded-md bg-transparent px-1 py-0.5 text-xl font-semibold tracking-tight outline-none sm:text-2xl"
        />
        <select
          aria-label="Brand preset"
          value={state.thread.presetId ?? ""}
          onChange={async (e) => {
            const v = e.target.value || null;
            await updateThread(id, { presetId: v });
            setState((s) => ({ ...s, thread: { ...s.thread, presetId: v } }));
          }}
          className="bg-card border-input h-9 max-w-[12rem] rounded-md border px-2 text-sm"
        >
          <option value="">No brand</option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 text-xs font-medium tabular-nums">
          {studioPage.spend(dollars(state.spend.monthCents), state.spend.capCents ? dollars(state.spend.capCents) : null)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-negative"
          onClick={async () => {
            if (!window.confirm(t.confirmDelete)) return;
            const r = await deleteThread(id);
            if (!r.ok) toast.error(r.error);
            else router.push("/admin/studio");
          }}
        >
          <TbTrash aria-hidden="true" />
          <span className="hidden sm:inline">{t.delete}</span>
        </Button>
      </div>

      {!state.ready.fal || !state.ready.storage ? (
        <p className="bg-warning-soft text-warning flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm">
          <TbAlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {[!state.ready.fal && studioPage.setup.fal, !state.ready.storage && studioPage.setup.storage].filter(Boolean).join(" ")}
        </p>
      ) : null}

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-6" aria-live="polite">
        {state.messages.length === 0 ? <p className="text-muted-foreground mx-auto my-10 max-w-sm text-center text-sm">{t.empty}</p> : null}
        {runs(state.messages).map((run) =>
          run[0].role === "user" ? (
            <UserBubble key={run[0].id} m={run[0]} assets={state.assets} />
          ) : (
            // One send can come back as several results (ad angles): they sit side by side.
            <div key={run[0].id} className="flex flex-wrap items-start gap-3">
              {run.map((m) => {
          const job = m.jobId ? state.jobs[m.jobId] : undefined;
          if (job && pendingStatuses.includes(job.status)) {
            const cancel = async () => {
              await cancelStudioJob(job.id);
              await refresh();
            };
            return (
              <div key={m.id} className="w-[min(100%,17rem)]">
                <Pending job={job} onCancel={cancel} />
              </div>
            );
          }
          const items = m.assetIds.map((aid) => state.assets[aid]).filter(Boolean);
          const failed = (m.meta as { error?: boolean }).error || job?.status === "failed";
          const slides = items.filter((a) => a.origin === "slide");
          const others = items.filter((a) => a.origin !== "slide" && !(slides.length && a.label === "Full strip"));
          const wide = slides.length > 0 || failed || others.length > 1 || (!others.length && Boolean(m.body));
          const landscape = others[0] && (others[0].width ?? 1) > (others[0].height ?? 1);
          return (
            <div key={m.id} className={cn("flex flex-col gap-2", wide ? "w-full" : landscape ? "w-[min(100%,30rem)]" : "w-[min(100%,17rem)]")}>
              {m.body ? (
                <p className={cn("max-w-xl text-sm", failed ? "bg-negative-soft text-negative rounded-lg px-3 py-2" : "text-muted-foreground")}>{m.body}</p>
              ) : null}
              {slides.length ? (
                <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Carousel slides">
                  {slides.map((a) => (
                    <AssetTile key={a.id} a={a} className="w-40 shrink-0 snap-start sm:w-48" onOpen={() => open(a)} onEdit={() => editThis(a)} onText={() => setTextFor(a)} onDelete={() => remove(a)} />
                  ))}
                </div>
              ) : null}
              {others.length ? (
                <div className={cn("grid gap-2", others.length === 1 ? "grid-cols-1" : "max-w-3xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}>
                  {others.map((a) => (
                    <AssetTile key={a.id} a={a} onOpen={() => open(a)} onEdit={() => editThis(a)} onText={() => setTextFor(a)} onAnimate={() => animate(a)} onDelete={() => remove(a)} selected={composer.base?.id === a.id} />
                  ))}
                </div>
              ) : null}
            </div>
          );
              })}
            </div>
          ),
        )}
        <div ref={bottom} />
      </div>

      {/* Composer stays at the bottom of the screen */}
      <div className="sticky bottom-0 z-10 -mx-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Composer threadId={id} state={composer} setState={setComposer} onSend={send} hasPreset={Boolean(preset && (preset.logoKey || preset.referenceKeys.length))} />
      </div>

      {view !== null && viewable[view] ? (
        <Lightbox
          items={viewable}
          index={view}
          onIndex={setView}
          onClose={() => setView(null)}
          slidesOf={slidesOf}
          threadId={id}
          onFrameSaved={(a) => (refresh(), setComposer((p) => ({ ...p, attachments: [...p.attachments, a] })))}
        />
      ) : null}
      {textFor ? (
        <TextLayerEditor asset={textFor} preset={preset} initial={textInitial(textFor)} threadId={id} onClose={() => setTextFor(null)} onSaved={() => refresh()} />
      ) : null}
    </div>
  );
}
