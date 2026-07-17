import { NextResponse } from "next/server";
import { eventNames, saveLocalEvent, savePersistentEvent } from "./store";

export const runtime = "nodejs";

const allowedEvents = new Set<string>(eventNames);

const clean = (value: unknown, maxLength = 500) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const event = clean(body.event, 80);
  if (!allowedEvents.has(event)) {
    return NextResponse.json({ ok: false, error: "unsupported_event" }, { status: 400 });
  }

  const eventPayload = {
    event,
    page: clean(body.page, 240),
    path: clean(body.path, 240),
    title: clean(body.title, 160),
    location: clean(body.location, 120),
    label: clean(body.label, 160),
    href: clean(body.href, 240),
    form: clean(body.form, 80),
    variant: clean(body.variant, 80),
    sourcePage: clean(body.sourcePage, 160),
    sessionId: clean(body.sessionId, 80),
    referrer: clean(body.referrer, 240),
    userAgent: clean(request.headers.get("user-agent"), 240),
    ipCountry: clean(request.headers.get("x-vercel-ip-country"), 80),
    createdAt: new Date().toISOString(),
  };

  console.info("lp_analytics", eventPayload);
  await saveLocalEvent(eventPayload);
  const persisted = await savePersistentEvent(eventPayload).catch((error: unknown) => {
    console.error("lp_analytics_persistent_save_failed", error);
    return false;
  });

  if (process.env.ANALYTICS_WEBHOOK_URL) {
    await fetch(process.env.ANALYTICS_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventPayload),
    }).catch((error: unknown) => {
      console.error("lp_analytics_webhook_failed", error);
    });
  }

  return NextResponse.json({ ok: persisted, persisted }, { status: persisted ? 200 : 500 });
}
