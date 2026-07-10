const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const analyticsFilePath = path.join(os.tmpdir(), "lp-analytics-events.jsonl");

const json = (response, statusCode, body) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
};

const clean = (value, maxLength = 500) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const cleanUrl = (value, maxLength = 240) => {
  const normalized = clean(value, maxLength);
  if (!normalized || normalized.startsWith("#")) return normalized;
  return normalized.split(/[?#]/, 1)[0];
};

const allowedEvents = new Set([
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
]);

const forwardWebhook = async (payload) => {
  if (!process.env.ANALYTICS_WEBHOOK_URL) return;

  await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch((error) => {
    console.error("lp_analytics_webhook_failed", error);
  });
};

const saveLocalEvent = async (payload) => {
  await fs.appendFile(analyticsFilePath, `${JSON.stringify(payload)}\n`, "utf8").catch((error) => {
    console.error("lp_analytics_local_save_failed", error);
  });
};

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { ok: false, message: "POSTのみ対応しています。" });
  }

  let body = {};
  try {
    body = typeof request.body === "string" ? JSON.parse(request.body || "{}") : request.body || {};
  } catch {
    return json(response, 400, { ok: false, message: "イベント内容を読み取れませんでした。" });
  }

  const event = clean(body.event, 80);
  if (!allowedEvents.has(event)) {
    return json(response, 400, { ok: false, message: "未対応のイベントです。" });
  }

  const eventPayload = {
    event,
    page: cleanUrl(body.page, 240),
    path: cleanUrl(body.path, 240),
    title: clean(body.title, 160),
    location: clean(body.location, 120),
    label: clean(body.label, 160),
    href: cleanUrl(body.href, 240),
    form: clean(body.form, 80),
    variant: clean(body.variant, 80),
    version: clean(body.version, 80),
    article: clean(body.article, 180),
    target: cleanUrl(body.target, 240),
    depth: Number.isFinite(Number(body.depth)) ? Number(body.depth) : null,
    sourcePage: cleanUrl(body.sourcePage, 160),
    sessionId: clean(body.sessionId, 80),
    referrer: cleanUrl(body.referrer, 240),
    userAgent: clean(request.headers["user-agent"], 240),
    ipCountry: clean(request.headers["x-vercel-ip-country"], 80),
    createdAt: new Date().toISOString()
  };

  console.info("lp_analytics", eventPayload);
  await saveLocalEvent(eventPayload);
  await forwardWebhook(eventPayload);

  return json(response, 200, { ok: true });
};
