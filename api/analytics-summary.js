const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const analyticsFilePath = path.join(os.tmpdir(), "lp-analytics-events.jsonl");

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

const json = (response, statusCode, body) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
};

const emptyCounts = () => Object.fromEntries(eventNames.map((name) => [name, 0]));

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

module.exports = async (request, response) => {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return json(response, 405, { ok: false });
  }

  const events = await parseEvents();
  const counts = emptyCounts();
  const buttonLabels = {};
  const caseArticles = {};
  const copyVersions = {};

  for (const event of events) {
    if (eventNames.includes(event.event)) {
      counts[event.event] += 1;
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

  return json(response, 200, {
    ok: true,
    site: "main",
    siteLabel: "メインページ",
    counts,
    totalEvents: events.length,
    topButtons: Object.entries(buttonLabels)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    topCaseArticles: Object.entries(caseArticles)
      .map(([article, count]) => ({ article, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    copyVersions: Object.entries(copyVersions).map(([version, values]) => ({
      version,
      ...values,
      conversionRate: values.views ? Number(((values.leads / values.views) * 100).toFixed(2)) : 0
    })),
    updatedAt: new Date().toISOString()
  });
};
