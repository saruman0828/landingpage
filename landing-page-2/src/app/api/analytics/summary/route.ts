import { readFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const analyticsFilePath = path.join(tmpdir(), "lp-analytics-events.jsonl");

const eventNames = [
  "page_view",
  "cta_click",
  "nav_click",
  "form_start",
  "form_submit_attempt",
  "form_submit_success",
  "form_submit_error",
  "calendar_booked",
] as const;

type EventName = (typeof eventNames)[number];

type AnalyticsEvent = {
  event?: string;
  label?: string;
  href?: string;
};

const emptyCounts = () =>
  Object.fromEntries(eventNames.map((name) => [name, 0])) as Record<EventName, number>;

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

export async function GET() {
  const events = await parseEvents();
  const counts = emptyCounts();
  const buttonLabels: Record<string, number> = {};

  for (const event of events) {
    if (eventNames.includes(event.event as EventName)) {
      counts[event.event as EventName] += 1;
    }

    if (event.event === "cta_click" || event.event === "nav_click") {
      const label = event.label || event.href || "不明";
      buttonLabels[label] = (buttonLabels[label] || 0) + 1;
    }
  }

  return NextResponse.json(
    {
      ok: true,
      site: "two-days",
      siteLabel: "2日間キャンプ",
      counts,
      totalEvents: events.length,
      topButtons: Object.entries(buttonLabels)
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
      updatedAt: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
