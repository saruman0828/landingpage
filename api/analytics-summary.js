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
  "calendar_booked"
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

  for (const event of events) {
    if (eventNames.includes(event.event)) {
      counts[event.event] += 1;
    }

    if (event.event === "cta_click" || event.event === "nav_click") {
      const label = event.label || event.href || "不明";
      buttonLabels[label] = (buttonLabels[label] || 0) + 1;
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
    updatedAt: new Date().toISOString()
  });
};
