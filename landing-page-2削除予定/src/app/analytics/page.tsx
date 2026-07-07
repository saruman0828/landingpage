import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "LP分析ページ｜株式会社HAYASHI CREATIVE",
  robots: {
    index: false,
    follow: false,
  },
};

type Counts = {
  page_view: number;
  cta_click: number;
  nav_click: number;
  form_start: number;
  form_submit_attempt: number;
  form_submit_success: number;
  form_submit_error: number;
  calendar_open: number;
  calendar_booked: number;
};

type Summary = {
  ok: boolean;
  site: string;
  siteLabel: string;
  counts: Counts;
  totalEvents: number;
  topButtons: Array<{ label: string; count: number }>;
  updatedAt: string;
};

const emptyCounts: Counts = {
  page_view: 0,
  cta_click: 0,
  nav_click: 0,
  form_start: 0,
  form_submit_attempt: 0,
  form_submit_success: 0,
  form_submit_error: 0,
  calendar_open: 0,
  calendar_booked: 0,
};

const emptySummary = (site: string, siteLabel: string): Summary => ({
  ok: false,
  site,
  siteLabel,
  counts: emptyCounts,
  totalEvents: 0,
  topButtons: [],
  updatedAt: new Date().toISOString(),
});

const percent = (value: number, total: number) => {
  if (!total) return "0%";
  return `${Math.round((value / total) * 1000) / 10}%`;
};

const fetchSummary = async (url: string, fallback: Summary) => {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return fallback;
    return (await response.json()) as Summary;
  } catch {
    return fallback;
  }
};

const mainSummaryUrl = "https://ai-business-lp.vercel.app/api/analytics-summary";

export default async function AnalyticsPage() {
  const [main, camp] = await Promise.all([
    fetchSummary(mainSummaryUrl, emptySummary("main", "メインページ")),
    fetchSummary(
      `${process.env.NEXT_PUBLIC_SITE_URL || "https://ai-keiei-implementation-2days-ab.vercel.app"}/api/analytics/summary`,
      emptySummary("two-days", "2日間キャンプ"),
    ),
  ]);

  const summaries = [main, camp];
  const totals = summaries.reduce(
    (acc, item) => ({
      pageViews: acc.pageViews + item.counts.page_view,
      buttonClicks: acc.buttonClicks + item.counts.cta_click + item.counts.nav_click,
      formStarts: acc.formStarts + item.counts.form_start,
      submitAttempts: acc.submitAttempts + item.counts.form_submit_attempt,
      completed: acc.completed + item.counts.form_submit_success,
      errors: acc.errors + item.counts.form_submit_error,
      events: acc.events + item.totalEvents,
    }),
    {
      pageViews: 0,
      buttonClicks: 0,
      formStarts: 0,
      submitAttempts: 0,
      completed: 0,
      errors: 0,
      events: 0,
    },
  );

  return (
    <main className="min-h-screen bg-[#F7F4EE] px-5 py-10 text-[#102A43] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="border-b border-[#D8D1C6] pb-8">
          <p className="section-kicker">LP分析ページ</p>
          <h1 className="max-w-5xl text-4xl font-black leading-tight sm:text-5xl">
            ページの反応を、数字で確認します。
          </h1>
          <p className="mt-5 max-w-4xl text-lg font-bold leading-9 text-[#27445C]">
            リンク先に行かなくても、このページで「見られた数」「ボタンを押した数」「申込完了数」を確認できます。
            数字はこの集計機能を公開した後からたまります。
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/two-days" className="bg-[#102A43] px-5 py-3 font-black text-white">
              2日間キャンプへ戻る
            </Link>
            <a href="/" className="border border-[#D8D1C6] bg-white px-5 py-3 font-black">
              メインページへ戻る
            </a>
          </div>
        </header>

        <section className="py-10">
          <h2 className="text-3xl font-black">全体の数字</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="見られた数" value={totals.pageViews} note="ページが開かれた回数" />
            <MetricCard label="ボタンを押した数" value={totals.buttonClicks} note="申込・移動ボタンのクリック" />
            <MetricCard label="入力を始めた数" value={totals.formStarts} note="フォームに触れた回数" />
            <MetricCard label="申込完了数" value={totals.completed} note="送信に成功した回数" strong />
          </div>
        </section>

        <section className="border-t border-[#D8D1C6] py-10">
          <h2 className="text-3xl font-black">反応率</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <RateCard
              title="ボタン反応率"
              value={percent(totals.buttonClicks, totals.pageViews)}
              detail={`${totals.buttonClicks} ÷ ${totals.pageViews}`}
              note="ページを見た人が、どれくらいボタンを押したか"
            />
            <RateCard
              title="フォーム到達率"
              value={percent(totals.formStarts, totals.pageViews)}
              detail={`${totals.formStarts} ÷ ${totals.pageViews}`}
              note="ページを見た人が、どれくらい入力まで進んだか"
            />
            <RateCard
              title="申込完了率"
              value={percent(totals.completed, totals.pageViews)}
              detail={`${totals.completed} ÷ ${totals.pageViews}`}
              note="ページを見た人が、どれくらい申込完了したか"
            />
          </div>
        </section>

        <section className="border-t border-[#D8D1C6] py-10">
          <h2 className="text-3xl font-black">ページ別の数字</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {summaries.map((summary) => (
              <PageSummary key={summary.site} summary={summary} />
            ))}
          </div>
        </section>

        <section className="border-t border-[#D8D1C6] py-10">
          <h2 className="text-3xl font-black">よく押されたボタン</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {summaries.map((summary) => (
              <article key={summary.site} className="bg-white p-6 shadow-[0_18px_50px_rgba(16,42,67,0.10)]">
                <h3 className="text-2xl font-black">{summary.siteLabel}</h3>
                {summary.topButtons.length > 0 ? (
                  <div className="mt-5 space-y-3">
                    {summary.topButtons.map((button) => (
                      <div key={button.label} className="flex items-center justify-between gap-4 border-b border-[#D8D1C6] pb-3">
                        <p className="font-bold leading-7 text-[#27445C]">{button.label}</p>
                        <p className="shrink-0 text-2xl font-black text-[#F26A21]">{button.count}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 leading-8 text-[#486077]">まだボタンの記録がありません。</p>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[#D8D1C6] py-10">
          <h2 className="text-3xl font-black">改善の見方</h2>
          <div className="mt-6 grid gap-4">
            <Advice
              title="見られているのに、ボタンが押されない"
              body="最初の見出し、ボタン文言、誰向けのページかを見直します。"
            />
            <Advice
              title="ボタンは押されるのに、入力が始まらない"
              body="フォーム直前の説明、入力項目の多さ、不安を消す文章を見直します。"
            />
            <Advice
              title="入力は始まるのに、申込完了しない"
              body="必須項目、エラー表示、送信処理、受付完了メールを優先して確認します。"
            />
            <Advice
              title="送信失敗が出ている"
              body="フォームやメール送信の不具合です。売上機会を逃すので最優先で修正します。"
            />
          </div>
        </section>

        <section className="border-t border-[#D8D1C6] py-10">
          <div className="bg-[#102A43] p-6 text-white sm:p-8">
            <h2 className="text-3xl font-black">注意点</h2>
            <p className="mt-4 max-w-4xl leading-8 text-white/80">
              この数字は、専用集計を公開した後からたまります。サーバーの入れ替わりで一時保存が消える場合があるため、
              長期保存したい場合は次にGoogleスプレッドシートへ自動保存する設定を入れるのが確実です。
            </p>
            <p className="mt-4 text-sm font-bold text-white/70">
              最終更新: {new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })} / 記録合計: {totals.events}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  note,
  strong = false,
}: {
  label: string;
  value: number;
  note: string;
  strong?: boolean;
}) {
  return (
    <article className={`${strong ? "bg-[#F26A21] text-white" : "bg-white"} p-6 shadow-[0_18px_50px_rgba(16,42,67,0.10)]`}>
      <p className={`text-sm font-black ${strong ? "text-white/80" : "text-[#486077]"}`}>{label}</p>
      <p className="mt-3 text-5xl font-black">{value.toLocaleString("ja-JP")}</p>
      <p className={`mt-3 leading-7 ${strong ? "text-white/86" : "text-[#486077]"}`}>{note}</p>
    </article>
  );
}

function RateCard({ title, value, detail, note }: { title: string; value: string; detail: string; note: string }) {
  return (
    <article className="border-l-4 border-[#F26A21] bg-white p-6">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-3 text-5xl font-black text-[#F26A21]">{value}</p>
      <p className="mt-3 bg-[#F7F4EE] px-4 py-3 font-black">{detail}</p>
      <p className="mt-3 leading-8 text-[#486077]">{note}</p>
    </article>
  );
}

function PageSummary({ summary }: { summary: Summary }) {
  const buttonClicks = summary.counts.cta_click + summary.counts.nav_click;
  return (
    <article className="bg-white p-6 shadow-[0_18px_50px_rgba(16,42,67,0.10)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">{summary.site}</p>
          <h3 className="text-3xl font-black">{summary.siteLabel}</h3>
        </div>
        <p className="bg-[#F7F4EE] px-4 py-2 text-sm font-black text-[#486077]">
          記録 {summary.totalEvents.toLocaleString("ja-JP")} 件
        </p>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <SmallNumber label="見られた数" value={summary.counts.page_view} />
        <SmallNumber label="ボタンを押した数" value={buttonClicks} />
        <SmallNumber label="入力を始めた数" value={summary.counts.form_start} />
        <SmallNumber label="申込完了数" value={summary.counts.form_submit_success} />
        <SmallNumber label="送信失敗数" value={summary.counts.form_submit_error} warning={summary.counts.form_submit_error > 0} />
        <SmallNumber label="申込完了率" valueText={percent(summary.counts.form_submit_success, summary.counts.page_view)} />
      </div>
    </article>
  );
}

function SmallNumber({
  label,
  value,
  valueText,
  warning = false,
}: {
  label: string;
  value?: number;
  valueText?: string;
  warning?: boolean;
}) {
  return (
    <div className={`${warning ? "bg-[#FFF1EE]" : "bg-[#F7F4EE]"} p-4`}>
      <p className="text-sm font-black text-[#486077]">{label}</p>
      <p className={`mt-1 text-3xl font-black ${warning ? "text-[#C33124]" : "text-[#102A43]"}`}>
        {valueText || Number(value || 0).toLocaleString("ja-JP")}
      </p>
    </div>
  );
}

function Advice({ title, body }: { title: string; body: string }) {
  return (
    <article className="bg-white p-6">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-2 leading-8 text-[#486077]">{body}</p>
    </article>
  );
}
