import { appendFile, readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import crypto from "crypto";
import { list, put } from "@vercel/blob";

export const eventNames = [
  "page_view",
  "cta_click",
  "nav_click",
  "form_start",
  "form_submit_attempt",
  "form_submit_success",
  "form_submit_error",
  "calendar_booked",
] as const;

export type EventName = (typeof eventNames)[number];

type AnalyticsEvent = {
  event?: string;
  label?: string;
  href?: string;
};

type EventPayload = {
  event: string;
  label?: string;
  href?: string;
};

type Summary = {
  ok: boolean;
  site: string;
  siteLabel: string;
  storageConfigured: boolean;
  storage: "vercel_blob" | "temporary";
  counts: Record<EventName, number>;
  totalEvents: number;
  topButtons: Array<{ label: string; count: number }>;
  updatedAt: string;
  message?: string;
};

const analyticsFilePath = path.join(tmpdir(), "lp-analytics-events.jsonl");
const summaryPathname = "analytics/two-days-summary.json";
const eventPrefix = "analytics/two-days-events/";

const emptyCounts = () =>
  Object.fromEntries(eventNames.map((name) => [name, 0])) as Record<EventName, number>;

const emptySummary = (): Summary => ({
  ok: true,
  site: "two-days",
  siteLabel: "2日間キャンプ",
  storageConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  storage: process.env.BLOB_READ_WRITE_TOKEN ? "vercel_blob" : "temporary",
  counts: emptyCounts(),
  totalEvents: 0,
  topButtons: [],
  updatedAt: new Date().toISOString(),
});

const parseEvents = async () => {
  const raw = await readFile(analyticsFilePath, "utf8").catch(() => "");
  if (!raw.trim()) return [] as AnalyticsEvent[];

  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line) as AnalyticsEvent;
      } catch {
        return null;
      }
    })
    .filter(Boolean) as AnalyticsEvent[];
};

const summaryFromEvents = (events: AnalyticsEvent[]) => {
  const summary = emptySummary();
  const buttonLabels: Record<string, number> = {};

  for (const event of events) {
    if (eventNames.includes(event.event as EventName)) {
      summary.counts[event.event as EventName] += 1;
    }

    if (event.event === "cta_click" || event.event === "nav_click") {
      const label = event.label || event.href || "不明";
      buttonLabels[label] = (buttonLabels[label] || 0) + 1;
    }
  }

  summary.totalEvents = events.length;
  summary.topButtons = Object.entries(buttonLabels)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  return summary;
};

const readBlobSummary = async () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
  const result = await list({ prefix: summaryPathname, limit: 1 });
  const blob = result.blobs.find((item) => item.pathname === summaryPathname);
  if (!blob) return null;

  const response = await fetch(blob.url, { cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json()) as Summary;
};

const readBlobEvents = async () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [] as AnalyticsEvent[];

  const events: AnalyticsEvent[] = [];
  let cursor: string | undefined;

  do {
    const result = await list({ prefix: eventPrefix, limit: 1000, cursor });
    cursor = result.cursor;

    const pageEvents = await Promise.all(
      result.blobs.map(async (blob) => {
        const response = await fetch(blob.url, { cache: "no-store" }).catch(() => null);
        if (!response?.ok) return null;
        return response.json().catch(() => null);
      }),
    );

    events.push(...(pageEvents.filter(Boolean) as AnalyticsEvent[]));
  } while (cursor);

  return events;
};

const mergeSummaries = (base: Summary, addition: Summary) => {
  const next = {
    ...emptySummary(),
    ...base,
    counts: { ...emptyCounts(), ...(base.counts || {}) },
    topButtons: [...(base.topButtons || [])],
  };

  for (const [event, count] of Object.entries(addition.counts || {})) {
    if (event in next.counts) next.counts[event as EventName] += count;
  }
  next.totalEvents = Number(next.totalEvents || 0) + Number(addition.totalEvents || 0);

  for (const item of addition.topButtons || []) {
    const existing = next.topButtons.find((button) => button.label === item.label);
    if (existing) existing.count += item.count;
    else next.topButtons.push({ ...item });
  }
  next.topButtons = next.topButtons.sort((a, b) => b.count - a.count).slice(0, 8);
  next.updatedAt = new Date().toISOString();
  return next;
};

export const readSummary = async () => {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const legacySummary = await readBlobSummary().catch((error: unknown) => {
      console.error("lp_analytics_blob_read_failed", error);
      return null;
    });
    const blobEvents = await readBlobEvents().catch((error: unknown) => {
      console.error("lp_analytics_blob_events_read_failed", error);
      return [] as AnalyticsEvent[];
    });
    const eventSummary = summaryFromEvents(blobEvents);
    const summary = mergeSummaries(legacySummary || emptySummary(), eventSummary);
    return { ...summary, storageConfigured: true, storage: "vercel_blob" as const };
  }

  return {
    ...summaryFromEvents(await parseEvents()),
    storageConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    storage: process.env.BLOB_READ_WRITE_TOKEN ? ("vercel_blob" as const) : ("temporary" as const),
    message: process.env.BLOB_READ_WRITE_TOKEN
      ? ""
      : "永続保存先が未設定です。本番では数字が消えるため、Vercel Blobの設定が必要です。",
  };
};

export const saveLocalEvent = async (payload: Record<string, string>) => {
  await appendFile(analyticsFilePath, `${JSON.stringify(payload)}\n`, "utf8").catch((error: unknown) => {
    console.error("lp_analytics_local_save_failed", error);
  });
};

const upsertButton = (items: Array<{ label: string; count: number }>, key: string) => {
  const existing = items.find((item) => item.label === key);
  if (existing) {
    existing.count += 1;
    return items;
  }
  items.push({ label: key, count: 1 });
  return items.sort((a, b) => b.count - a.count).slice(0, 8);
};

const addEventToSummary = (summary: Summary | null, eventPayload: EventPayload) => {
  const next = {
    ...emptySummary(),
    ...(summary || {}),
    counts: { ...emptyCounts(), ...(summary?.counts || {}) },
    topButtons: [...(summary?.topButtons || [])],
  };

  if (eventNames.includes(eventPayload.event as EventName)) {
    next.counts[eventPayload.event as EventName] += 1;
  }
  next.totalEvents = Number(next.totalEvents || 0) + 1;

  if (eventPayload.event === "cta_click" || eventPayload.event === "nav_click") {
    upsertButton(next.topButtons, eventPayload.label || eventPayload.href || "不明");
  }

  next.storageConfigured = true;
  next.storage = "vercel_blob";
  next.updatedAt = new Date().toISOString();
  delete next.message;
  return next;
};

export const savePersistentEvent = async (eventPayload: EventPayload) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;

  const eventPathname = `${eventPrefix}${new Date().toISOString()}-${crypto.randomUUID()}.json`;
  await put(eventPathname, JSON.stringify(eventPayload), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  return true;
};
