const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { list, put } = require("@vercel/blob");

const analyticsFilePath = path.join(os.tmpdir(), "lp-analytics-events.jsonl");
const summaryPathname = "analytics/main-summary.json";
const eventPrefix = "analytics/main-events/";

const eventNames = [
  "page_view",
  "cta_click",
  "nav_click",
  "form_start",
  "form_submit_attempt",
  "form_submit_success",
  "form_submit_error",
  "calendar_open",
  "calendar_booked",
  "case_view",
  "case_open",
  "outbound_click",
  "scroll_depth",
  "copy_view",
  "lead_completed"
];

const emptyCounts = () => Object.fromEntries(eventNames.map((name) => [name, 0]));

const createEmptySummary = () => ({
  ok: true,
  site: "main",
  siteLabel: "メインページ",
  storageConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  storage: process.env.BLOB_READ_WRITE_TOKEN ? "vercel_blob" : "temporary",
  counts: emptyCounts(),
  totalEvents: 0,
  topButtons: [],
  topCaseArticles: [],
  copyVersions: [],
  updatedAt: new Date().toISOString()
});

const parseEvents = async () => {
  const raw = await fs.readFile(analyticsFilePath, "utf8").catch(() => "");
  if (!raw.trim()) return [];

  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
};

const summaryFromEvents = (events) => {
  const summary = createEmptySummary();
  const buttonLabels = {};
  const caseArticles = {};
  const copyVersions = {};

  for (const event of events) {
    if (eventNames.includes(event.event)) {
      summary.counts[event.event] += 1;
    }

    if (event.event === "cta_click" || event.event === "nav_click") {
      const label = event.label || event.href || "不明";
      buttonLabels[label] = (buttonLabels[label] || 0) + 1;
    }

    if (event.event === "case_view") {
      const article = event.article || event.path || "不明";
      caseArticles[article] = (caseArticles[article] || 0) + 1;
    }

    if (event.event === "copy_view" || event.event === "lead_completed") {
      const version = event.version || "unknown";
      copyVersions[version] ||= { views: 0, leads: 0 };
      if (event.event === "copy_view") copyVersions[version].views += 1;
      if (event.event === "lead_completed") copyVersions[version].leads += 1;
    }
  }

  summary.totalEvents = events.length;
  summary.topButtons = Object.entries(buttonLabels)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  summary.topCaseArticles = Object.entries(caseArticles)
    .map(([article, count]) => ({ article, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  summary.copyVersions = Object.entries(copyVersions).map(([version, values]) => ({
    version,
    ...values,
    conversionRate: values.views ? Number(((values.leads / values.views) * 100).toFixed(2)) : 0
  }));

  return summary;
};

const getBlobSummaryUrl = async () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return "";
  const result = await list({ prefix: summaryPathname, limit: 1 });
  const blob = result.blobs.find((item) => item.pathname === summaryPathname);
  return blob?.url || "";
};

const readBlobSummary = async () => {
  const url = await getBlobSummaryUrl();
  if (!url) return null;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  return response.json();
};

const readBlobEvents = async () => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return [];

  const events = [];
  let cursor;

  do {
    const result = await list({ prefix: eventPrefix, limit: 1000, cursor });
    cursor = result.cursor;

    const pageEvents = await Promise.all(
      result.blobs.map(async (blob) => {
        const response = await fetch(blob.url, { cache: "no-store" }).catch(() => null);
        if (!response?.ok) return null;
        return response.json().catch(() => null);
      })
    );

    events.push(...pageEvents.filter(Boolean));
  } while (cursor);

  return events;
};

const mergeSummaries = (base, addition) => {
  const next = {
    ...createEmptySummary(),
    ...base,
    counts: { ...emptyCounts(), ...(base?.counts || {}) },
    topButtons: [...(base?.topButtons || [])],
    topCaseArticles: [...(base?.topCaseArticles || [])],
    copyVersions: [...(base?.copyVersions || [])]
  };

  for (const [event, count] of Object.entries(addition.counts || {})) {
    if (event in next.counts) next.counts[event] += count;
  }
  next.totalEvents = Number(next.totalEvents || 0) + Number(addition.totalEvents || 0);

  for (const item of addition.topButtons || []) {
    const existing = next.topButtons.find((button) => button.label === item.label);
    if (existing) existing.count += item.count;
    else next.topButtons.push({ ...item });
  }
  next.topButtons = next.topButtons.sort((a, b) => b.count - a.count).slice(0, 8);

  for (const item of addition.topCaseArticles || []) {
    const existing = next.topCaseArticles.find((article) => article.article === item.article);
    if (existing) existing.count += item.count;
    else next.topCaseArticles.push({ ...item });
  }
  next.topCaseArticles = next.topCaseArticles.sort((a, b) => b.count - a.count).slice(0, 8);

  for (const item of addition.copyVersions || []) {
    const existing = next.copyVersions.find((version) => version.version === item.version);
    if (existing) {
      existing.views += item.views || 0;
      existing.leads += item.leads || 0;
      existing.conversionRate = existing.views ? Number(((existing.leads / existing.views) * 100).toFixed(2)) : 0;
    } else {
      next.copyVersions.push({ ...item });
    }
  }

  next.updatedAt = new Date().toISOString();
  return next;
};

const readSummary = async () => {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const legacySummary = await readBlobSummary().catch((error) => {
      console.error("lp_analytics_blob_read_failed", error);
      return null;
    });
    const blobEvents = await readBlobEvents().catch((error) => {
      console.error("lp_analytics_blob_events_read_failed", error);
      return [];
    });
    const eventSummary = summaryFromEvents(blobEvents);
    const summary = mergeSummaries(legacySummary || createEmptySummary(), eventSummary);
    return { ...summary, storageConfigured: true, storage: "vercel_blob" };
  }

  const events = await parseEvents();
  return {
    ...summaryFromEvents(events),
    storageConfigured: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    storage: process.env.BLOB_READ_WRITE_TOKEN ? "vercel_blob" : "temporary",
    message: process.env.BLOB_READ_WRITE_TOKEN
      ? ""
      : "永続保存先が未設定です。本番では数字が消えるため、Vercel Blobの設定が必要です。"
  };
};

const upsertCountList = (items, key, field = "label") => {
  const existing = items.find((item) => item[field] === key);
  if (existing) {
    existing.count += 1;
    return items;
  }
  items.push({ [field]: key, count: 1 });
  return items.sort((a, b) => b.count - a.count).slice(0, 8);
};

const addEventToSummary = (summary, eventPayload) => {
  const next = {
    ...createEmptySummary(),
    ...summary,
    counts: { ...emptyCounts(), ...(summary?.counts || {}) },
    topButtons: [...(summary?.topButtons || [])],
    topCaseArticles: [...(summary?.topCaseArticles || [])],
    copyVersions: [...(summary?.copyVersions || [])]
  };

  if (eventNames.includes(eventPayload.event)) {
    next.counts[eventPayload.event] += 1;
  }
  next.totalEvents = Number(next.totalEvents || 0) + 1;

  if (eventPayload.event === "cta_click" || eventPayload.event === "nav_click") {
    upsertCountList(next.topButtons, eventPayload.label || eventPayload.href || "不明");
  }

  if (eventPayload.event === "case_view") {
    upsertCountList(next.topCaseArticles, eventPayload.article || eventPayload.path || "不明", "article");
  }

  if (eventPayload.event === "copy_view" || eventPayload.event === "lead_completed") {
    const version = eventPayload.version || "unknown";
    const existing = next.copyVersions.find((item) => item.version === version);
    const item = existing || { version, views: 0, leads: 0, conversionRate: 0 };
    if (eventPayload.event === "copy_view") item.views += 1;
    if (eventPayload.event === "lead_completed") item.leads += 1;
    item.conversionRate = item.views ? Number(((item.leads / item.views) * 100).toFixed(2)) : 0;
    if (!existing) next.copyVersions.push(item);
  }

  next.storageConfigured = true;
  next.storage = "vercel_blob";
  next.updatedAt = new Date().toISOString();
  delete next.message;
  return next;
};

const saveLocalEvent = async (payload) => {
  await fs.appendFile(analyticsFilePath, `${JSON.stringify(payload)}\n`, "utf8").catch((error) => {
    console.error("lp_analytics_local_save_failed", error);
  });
};

const savePersistentEvent = async (eventPayload) => {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;

  const eventPathname = `${eventPrefix}${new Date().toISOString()}-${crypto.randomUUID()}.json`;
  await put(eventPathname, JSON.stringify(eventPayload), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json"
  });
  return true;
};

module.exports = {
  eventNames,
  readSummary,
  saveLocalEvent,
  savePersistentEvent
};
