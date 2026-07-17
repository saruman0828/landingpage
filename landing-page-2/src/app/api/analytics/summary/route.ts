import { NextResponse } from "next/server";
import { readSummary } from "../store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await readSummary().catch((error: unknown) => {
    console.error("lp_analytics_summary_failed", error);
    return {
      ok: false,
      site: "two-days",
      siteLabel: "2日間キャンプ",
      message: "集計を読み取れませんでした。",
    };
  });

  return NextResponse.json(summary, {
    status: summary.ok === false ? 500 : 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
