import Link from "next/link";

export const metadata = {
  title: "受付完了｜株式会社HAYASHI CREATIVE",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThanksPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#EEF5F9] px-5 py-12 text-[#17324A]">
      <section className="w-full max-w-2xl bg-white px-7 py-12 text-center shadow-[0_18px_50px_rgba(17,45,68,0.14)] sm:px-10">
        <div
          aria-hidden="true"
          className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-[#DCFFE8] text-4xl font-black text-[#146D3A]"
        >
          ✓
        </div>
        <p className="mb-3 text-sm font-black tracking-[0.12em] text-[#F26A21]">受付完了</p>
        <h1 className="text-3xl font-black leading-tight text-[#102A43] sm:text-4xl">
          お申し込みを受け付けました。
        </h1>
        <p className="mx-auto mt-5 max-w-lg leading-8">
          内容を確認し、通常1〜2営業日以内にご連絡します。
        </p>
        <div className="mx-auto mt-7 max-w-lg bg-[#F3F8FB] px-5 py-4 text-sm font-bold leading-7 text-[#486077]">
          受付確認メールが見当たらない場合は、迷惑メールフォルダもご確認ください。
        </div>
        <Link href="/two-days" className="mt-8 inline-flex font-black text-[#102A43]">
          最短2日AI集中キャンプのページへ戻る
        </Link>
      </section>
    </main>
  );
}
