import Image from "next/image";
import { CtaLink } from "./cta-link";
import { TrackingBoot } from "./tracking-boot";
import { VariantForm } from "./variant-form";

type VariantConfig = {
  id: "a" | "b" | "c";
  path: string;
  label: string;
  audience?: string;
  headline: string;
  lead: string;
  visual: string;
  visualAlt: string;
  contextLine?: string;
  ctaText?: string;
  ctaNote?: string;
  premise: string;
  proofKicker?: string;
  proofTitle?: string | null;
  proofIntro?: string | null;
  proofRows: Array<[string, string, string]>;
  showProofSection?: boolean;
  painTitle: string;
  painBody: string;
  fitKicker?: string;
  fitTitle?: string;
  transformKicker?: string;
  transformTitle: string;
  transformRows: Array<[string, string]>;
  fitRows?: Array<[string, string]>;
  deliverableTitle?: string;
  deliverableRows?: Array<[string, string]>;
  processTitle: string;
  processRows: Array<[string, string]>;
  operatorTitle: string;
  operatorBody: string;
  operatorScope?: string;
  useMainTeamProfile?: boolean;
  finalKicker?: string;
  formLead: string;
  formKicker?: string;
  formTitle?: string;
  formIssueLabel?: string;
  formIssuePlaceholder?: string;
  formSubmitLabel?: string;
  finalTitle: string;
  finalBody: string;
};

const sharedIndustries = "建設・不動産・士業・人材・飲食・買取・地域密着型サービス業";

export const variants: Record<"a" | "b" | "c", VariantConfig> = {
  a: {
    id: "a",
    path: "/variant-a",
    label: "A：現場改善型",
    headline: "現場で迷う確認を、持ち帰らずに即断できる仕組みに変える。",
    lead:
      "見積、工程、返信、教育。社長の判断基準を現場で使える確認リストと手順に落とし込み、「またか」という確認待ちを減らします。",
    visual: "/images/problem-construction-field-approval.jpg",
    visualAlt: "建設現場の確認事項を整理する中小企業の業務風景",
    premise:
      "「またこの確認か」と感じる作業は、AI化のサインです。ツールを増やす前に、会社に持ち帰らなくても現場で判断できる基準を整えます。",
    proofIntro:
      "根拠として扱える数字は、業務単位の変化だけを掲載します。会社名や人物名は公開許可がある場合のみ扱います。",
    proofRows: [
      ["不動産会社", "毎朝1〜2時間", "リサーチ、メール確認、返信業務の負担を大きく削減"],
      ["古美術・買取業", "毎日約1時間", "相場チェック業務を大幅に短縮"],
      ["建設業", "仮見積・工程確認・法令確認", "社長の判断補助として整理"],
    ],
    painTitle: "現場で判断できる会社は、社長への確認待ちで止まりません。",
    painBody:
      "人が増えるほど、見積の確認、現場からの相談、教育、メール返信の確認が社長に戻ります。必要なのは人員追加だけではなく、社長の判断基準を現場で使える状態にすることです。",
    transformTitle: "2日で現場の確認待ちをこう変えます。",
    transformRows: [
      ["判断の分岐", "現場で確認できる条件、例外、上長確認ラインを作る"],
      ["返信・見積", "よくある文面と確認項目を、その場で使える形にする"],
      ["教育", "新人や担当者が同じ質問を繰り返さない手順にする"],
    ],
    processTitle: "現場改善型の2日間",
    processRows: [
      ["1日目", "現場から会社に持ち帰っている確認を洗い出し、最初に減らす業務を1つ決める"],
      ["2日目", "判断基準、確認リスト、社員用手順を作り、翌日から現場で試せる状態にする"],
    ],
    operatorTitle: "現場の言葉を、社員が使える手順にします。",
    operatorBody:
      "担当者はAIツールの紹介ではなく、社長の業務棚卸し、判断基準の言語化、社員が使う手順書づくりまで行います。地域企業の現場業務を前提に、無理に大きなシステム導入へ寄せません。",
    formLead:
      "いま会社に持ち帰っている確認や「またか」と感じる確認待ちを教えてください。最初に現場で即断できる一業務を整理します。",
    finalTitle: "現場改善の相談です。AIツールを売る時間ではありません。",
    finalBody:
      "相談で見るのは、会社に持ち帰っている確認、見積、工程、返信、教育です。現場で即断できる基準に変えられるかを確認します。",
  },
  b: {
    id: "b",
    path: "/variant-b",
    label: "AIマスター2日間集中キャンプ",
    audience: "経営者・幹部向け",
    headline: "2日で学ぶ\nAIマスター集中強化キャンプ",
    lead:
      "時間が無い経営者や、これからシステム開発を目指す方へ。\n短期間でAIをマスターする実践的な集中講座です。\nchatGPTやCodex、Claude Codeを使ったバイブコーディングやAIエージェントの作り方まで、これからのAI時代の最先端を学んで頂きます。",
    visual: "/images/workshop-process-mapping.jpg",
    visualAlt: "経営者と幹部がAI活用を業務に落とし込む集中講座イメージ",
    contextLine:
      "対象：経営者、役員、幹部、幹部候補、これからAI時代の開発力を身につけたい方。\n目的：0からAIエージェントを作れる入口まで短期で引き上げること。",
    ctaText: "AIマスター集中キャンプの相談を予約する",
    ctaNote: "30分で、参加目的、現在のAI経験、2日間で作りたいテーマを整理します。",
    premise:
      "今から必要なのは、AIの知識を聞くことではなく、自分で使い、作り、仕事へ落とし込む力です。\n短期間で差をつけるには、生成AIの基本、指示設計、バイブコーディング、AIエージェント作成まで一気通貫で体験する必要があります。",
    proofKicker: "2日間で見える到達イメージ",
    proofTitle: null,
    proofIntro: null,
    proofRows: [
      ["業務AIエージェント", "メール・資料・確認業務", "自分の仕事を題材に、AIへ任せる流れを設計できる"],
      ["バイブコーディング", "Codex・Claude Code", "自然文で指示しながら、画面や簡単な仕組みを作る感覚をつかむ"],
      ["AI活用の判断力", "経営・幹部・開発初学者", "何をAIに任せ、どこを人が確認するか判断できるようにする"],
    ],
    showProofSection: false,
    painTitle: "AI時代は、知っている人ではなく、使って作れる人が先に進みます。",
    painBody:
      "動画や本で少し学んでも、実際の仕事や開発に使えなければ意味がありません。\n忙しい経営者や幹部候補に必要なのは、遠回りの独学ではなく、2日間で全体像をつかみ、AIエージェント作成まで実際に手を動かすことです。",
    fitKicker: "こんな方にオススメ",
    fitTitle:
      "時間がない、忙しい、要点だけ学びたい、\n独学が苦手、そんな方に。",
    transformKicker: "2日間で習得すること",
    transformTitle: "0から始めて、AIエージェントを作る流れまで2日で進めます。",
    transformRows: [
      ["AIの基本理解", "生成AIで何ができるか、何が苦手か、経営・幹部業務でどう使うかを短時間でつかむ"],
      ["指示の出し方", "目的、条件、資料、出力形式を整理し、AIに仕事を任せる指示へ変える"],
      ["業務の分解", "メール、資料、確認、教育などの業務を、AIエージェントに任せられる単位へ分ける"],
      ["AIエージェント作成", "自社業務を題材に、入力、処理、出力、確認ポイントまで含めた原型を作る"],
    ],
    fitRows: [
      [
        "最短２日間",
        "2日間だけ用意してください。\n経営者、役員、幹部、幹部候補、これからシステム開発を目指す方。\nパーソナルトレーナーのようにマンツーマン指導で単純作業の自動化を目指します。",
      ],
    ],
    deliverableTitle: "2日後に、AI時代の最先端を体験した経営者になっています。",
    deliverableRows: [
      ["AIエージェント設計図", "何をAIに任せるか。\nどんな入力と出力にするかを整理します。"],
      ["実務プロンプト集", "ChatGPT、Codex、Claude Codeで使う\n実践的な指示文を作ります。"],
      ["バイブコーディング体験", "自然文で指示しながら、\nAIと一緒に作る流れを体験します。"],
      ["次の実践計画", "講座後に伸ばすスキル、作る題材、\n仕事への使い道を決めます。"],
    ],
    processTitle: "2日間で見える到達イメージと進め方",
    processRows: [
      ["1日目", "ChatGPTなどの生成AIの基本、実務プロンプト、業務分解を学びます。\nその上で、AIエージェント化するテーマをひとつ決めます。"],
      ["2日目", "Codex、Claude Codeを使ったバイブコーディングを体験します。\nAIエージェント作成の原型づくりまで進めます。"],
      ["到達イメージ", "メール、資料、確認業務などを題材にします。\nAIへ任せる流れを自分で設計できる状態を目指します。"],
      [
        "講座後・サポート",
        "ゴールを決めて、自分でAI社員を増やして行きましょう。\nそのために集中キャンプ受講後は１ヶ月間、私達がマンツーマンでサポートを致します。\nオンライン会議アプリや、ビデオ通話で私達に壁打ちしながら継続的にAIを使いこなすためのお手伝いをさせて頂きます。",
      ],
    ],
    operatorTitle: "AIを使うだけで終わらず、作る側の入口まで引き上げます。",
    operatorBody:
      "担当者はAIツールの機能説明だけで終わらせません。\n経営者、幹部、幹部候補、開発を目指す方が、自分の業務や作りたいものを題材に、AIへ指示を出し、AIエージェント作成の流れを体験するところまで伴走します。",
    operatorScope:
      "生成AIの基本理解 / 実務プロンプト作成 / バイブコーディング / AIエージェント設計 / 原型作成 / 次の実践計画",
    useMainTeamProfile: true,
    finalKicker: "事前相談",
    formLead:
      "まずはweb相談を申し込んで下さい。参加予定の経営者・幹部、AIを使いたい業務、2日間で扱いたいテーマを教えてください。キャンプで扱う内容と到達点を整理します。",
    formKicker: "AIマスター2日間集中キャンプ",
    formTitle: "まずは30分無料相談。",
    formIssueLabel: "相談内容",
    formIssuePlaceholder: "例：幹部会議の資料作成、営業メール、見積補助、採用文面、社員教育、問い合わせ返信など",
    formSubmitLabel: "30分無料診断を申し込む",
    finalTitle: "短期でAIをマスターしたい方向けの事前相談です。",
    finalBody:
      "無料相談では、現在のAI経験、2日間で学びたい内容、作ってみたいAIエージェントや業務テーマをお聞きします。\n参加人数、対象者、到達点を整理します。",
  },
  c: {
    id: "c",
    path: "/variant-c",
    label: "C：経営者解放・仕組み継承型",
    headline: "社長の「またか」を減らし、判断基準を会社に残す。",
    lead:
      "見積、返信、教育、確認。社長の頭の中にある判断基準を、AIと社員が再現できる形に整え、経営判断の時間を取り戻します。",
    visual: "/images/succession-operations-binder.jpg",
    visualAlt: "業務手順書と判断基準をまとめたファイル",
    premise:
      "「社長に聞けば分かる」は便利ですが、会社が伸びるほど社長の時間を奪います。属人化した判断を、社員が迷った時に使える基準へ変えます。",
    proofIntro:
      "根拠のある数字だけを出し、許可のない顧客名や口コミは使いません。数字がない業務は、変えられる作業内容として示します。",
    proofRows: [
      ["不動産会社", "毎朝1〜2時間", "リサーチ、メール確認、返信業務の負担を大きく削減"],
      ["古美術・買取業", "毎日約1時間", "相場チェック業務を大幅に短縮"],
      ["建設業", "仮見積・工程確認・法令確認", "判断補助の基準を整理"],
    ],
    painTitle: "社長の判断が言語化されていないと、同じ確認が何度も戻ってきます。",
    painBody:
      "ベテランの勘、社長の経験、業界特有の注意点。これらが言葉になっていないと、社員は毎回聞くしかありません。継承すべきなのは作業だけでなく、判断基準です。",
    transformTitle: "社長の時間を取り戻しながら、会社に残すもの。",
    transformRows: [
      ["判断基準", "社員が迷った時に見るチェック項目"],
      ["業務手順", "誰が見ても同じ順番で進められる流れ"],
      ["改善の型", "30日後に見直せる運用計画"],
    ],
    processTitle: "経営者解放・仕組み継承型の2日間",
    processRows: [
      ["1日目", "社長の頭の中にある判断基準、例外対応、よくある質問を棚卸しする"],
      ["2日目", "社員が使える手順書、確認リスト、AIで再現する文面や判断補助を作る"],
    ],
    operatorTitle: "社長の経験を、会社の資産として残します。",
    operatorBody:
      "担当者は業務を聞き取り、判断の背景まで整理します。単なるマニュアル作成ではなく、社員が使い続けられる形まで落とし込みます。",
    formLead:
      "社長にしか説明できない判断や、社員から何度も聞かれる作業を教えてください。減らすべき雑務と残すべき仕組みを整理します。",
    finalTitle: "経営者解放と仕組み継承の相談です。",
    finalBody:
      "相談で見るのは、社長の時間を奪っている雑務と、会社に残すべき判断基準です。AIと社員が再現できる形に変えられるかを確認します。",
  },
};

export function LandingVariant({ config }: { config: VariantConfig }) {
  const isSuccession = config.id === "c";
  const audience = config.audience ?? "社員5名〜50名の中小企業経営者へ";
  const contextLine =
    config.contextLine ?? `「またか」と感じる作業はAI化のサインです。対象業種：${sharedIndustries}`;
  const ctaText = config.ctaText ?? "AI実装相談を予約する";
  const ctaNote = config.ctaNote ?? "30分で、最初に仕組みに変える業務を一緒に整理します。";

  return (
    <main className="bg-[#F7F4EE] text-[#102A43]">
      <TrackingBoot />
      <section className="relative overflow-hidden bg-[#102A43] text-white">
        <div className="absolute inset-0">
          <Image
            src={config.visual}
            alt={config.visualAlt}
            fill
            priority
            sizes="100vw"
            className={`object-cover opacity-40 ${
              config.id === "b" ? "object-[58%_center]" : isSuccession ? "object-[62%_center]" : "object-[58%_center]"
            }`}
          />
          <div className="absolute inset-0 bg-[#102A43]/78" />
          <div className="absolute inset-y-0 left-0 w-3/5 bg-gradient-to-r from-[#102A43] via-[#102A43]/92 to-transparent" />
        </div>
        {config.id === "b" ? (
          <a
            href="/"
            className="absolute right-5 top-5 z-10 text-sm font-bold text-white/58 underline-offset-4 transition hover:text-white/82 hover:underline sm:right-8 lg:right-12"
          >
            メインページへ戻る
          </a>
        ) : null}
        <div
          className="relative mx-auto flex min-h-[92svh] max-w-7xl flex-col justify-center px-5 py-[4.5rem] sm:px-8 sm:py-20 lg:px-12"
        >
          <div className={isSuccession ? "border-l border-white/18 pl-5 sm:pl-8" : ""}>
            <p
              className={`mb-6 border-[#F26A21] text-sm font-black tracking-[0.12em] text-[#F7F4EE] ${
                "border-l-4 pl-4"
              }`}
            >
              {config.label} / {audience}
            </p>
            <h1
              className={`whitespace-pre-line break-words text-[2.25rem] font-black leading-[1.16] [overflow-wrap:anywhere] sm:text-5xl sm:leading-[1.14] lg:text-6xl ${
                "max-w-4xl"
              }`}
            >
              {config.headline}
            </h1>
            <p
              className={`mt-6 whitespace-pre-line break-words text-base font-bold leading-8 text-[#F7F4EE] [overflow-wrap:anywhere] sm:text-xl sm:leading-9 ${
                "max-w-3xl"
              }`}
            >
              {config.lead}
            </p>
            <p
              className={`mt-5 whitespace-pre-line break-words text-sm leading-7 text-white/78 [overflow-wrap:anywhere] sm:text-base sm:leading-8 ${
                "max-w-3xl"
              }`}
            >
              {contextLine}
            </p>
            <div className="mt-9">
              <CtaLink href="#diagnosis-form" location={`${config.id}_hero`}>
                {ctaText}
              </CtaLink>
              <p className="mt-4 text-sm leading-7 text-white/72">
                {ctaNote}
              </p>
              {config.id === "b" ? (
                <p className="mt-3 text-sm font-black leading-6 text-[#FFB4A8]">
                  ※各月ごとの制限人数に達し次第募集を停止致します。
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {config.deliverableRows ? (
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.82fr_1.18fr] lg:px-12">
            <div>
              <p className="section-kicker">成果物</p>
              <h2 className="section-title">
                {config.deliverableTitle ?? "講座資料ではなく、翌週から試す実装セットを残します。"}
              </h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-[#D8D1C6] bg-[#D8D1C6] sm:grid-cols-2">
              {config.deliverableRows.map(([title, body]) => (
                <div key={title} className="bg-[#F7F4EE] p-6 sm:p-8">
                  <h3 className="text-xl font-black">{title}</h3>
                  <p className="mt-4 whitespace-pre-line leading-8 text-[#27445C]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
          <div>
            <p className="section-kicker">最初に見るポイント</p>
            <h2 className="section-title">{config.painTitle}</h2>
          </div>
          <div className="space-y-7 text-lg leading-9 text-[#27445C]">
            <p className="whitespace-pre-line">{config.painBody}</p>
            <div className="whitespace-pre-line border-l-4 border-[#F26A21] bg-[#F7F4EE] px-6 py-5 font-bold text-[#102A43]">
              {config.premise}
            </div>
          </div>
        </div>
      </section>

      {config.fitRows ? (
        <section className="bg-[#F7F4EE] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <p className="section-kicker">{config.fitKicker ?? "受講前に決めること"}</p>
            <h2 className="section-title max-w-4xl whitespace-pre-line">
              {config.fitTitle ?? "AIを学ぶ目的を、社内で使わせる業務に絞ります。"}
            </h2>
            <div
              className={`mt-10 grid gap-px overflow-hidden border border-[#D8D1C6] bg-[#D8D1C6] ${
                config.fitRows.length === 1 ? "md:grid-cols-1" : "md:grid-cols-3"
              }`}
            >
              {config.fitRows.map(([title, body]) => (
                <div key={title} className="bg-white p-6 sm:p-8">
                  <h3 className="text-2xl font-black">{title}</h3>
                  <p className="mt-4 whitespace-pre-line leading-8 text-[#27445C]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <p className="section-kicker">{config.transformKicker ?? "2日で変える対象"}</p>
          <h2 className="section-title max-w-4xl">{config.transformTitle}</h2>
          <div className="mt-10 divide-y divide-[#D8D1C6] border-y border-[#D8D1C6] bg-white">
            {config.transformRows.map(([title, body]) => (
              <div key={title} className="grid gap-3 px-5 py-6 sm:grid-cols-[180px_1fr] sm:px-8">
                <h3 className="text-xl font-black">{title}</h3>
                <p className="whitespace-pre-line leading-8 text-[#27445C]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {config.showProofSection === false ? null : (
        <section className="bg-[#102A43] py-16 text-white sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
            <p className="section-kicker text-[#F26A21]">{config.proofKicker ?? "実績の根拠"}</p>
            {config.proofTitle !== null ? (
              <h2 className="section-title max-w-4xl text-white">
                {config.proofTitle ?? "業務ごとに変えられるポイントを整理します。"}
              </h2>
            ) : null}
            {config.proofIntro !== null ? (
              <p className="mt-6 max-w-3xl leading-8 text-white/76">{config.proofIntro}</p>
            ) : null}
            <div className="mt-10 overflow-hidden border border-white/16">
              {config.proofRows.map(([industry, number, result]) => (
                <div
                  key={`${industry}-${number}`}
                  className="grid gap-3 border-b border-white/14 px-5 py-6 last:border-b-0 sm:grid-cols-[160px_180px_1fr] sm:px-8"
                >
                  <p className="font-black text-white">{industry}</p>
                  <p className="font-black text-[#F7F4EE]">{number}</p>
                  <p className="leading-8 text-white/76">{result}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-12">
          <div>
            <p className="section-kicker">実装の流れ</p>
            <h2 className="section-title">{config.processTitle}</h2>
          </div>
          <div className="space-y-8">
            {config.processRows.map(([day, body]) => (
              <div key={day} className="border-t border-[#D8D1C6] pt-6">
                <p className="text-3xl font-black text-[#F26A21]">{day}</p>
                <p className="mt-3 whitespace-pre-line text-lg leading-9 text-[#27445C]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          {config.useMainTeamProfile ? (
            <>
              <div className="max-w-4xl">
                <p className="section-kicker">担当者とご支援体制</p>
                <h2 className="section-title">私たちが担当します。</h2>
              </div>
              <div className="mt-10 grid gap-6">
                <article className="grid gap-6 border border-[#D8D1C6] bg-white p-5 shadow-[0_18px_60px_rgba(16,42,67,0.10)] sm:p-6 md:grid-cols-[170px_1fr] lg:grid-cols-[190px_1fr]">
                  <Image
                    src="/main/assets/hayashi-masaru-square.jpg"
                    alt="林 勝の顔写真"
                    width={190}
                    height={190}
                    className="h-[150px] w-[150px] object-cover sm:h-[170px] sm:w-[170px] lg:h-[190px] lg:w-[190px]"
                  />
                  <div>
                    <p className="section-kicker mb-2">代表</p>
                    <h3 className="text-2xl font-black leading-tight sm:text-3xl">林 勝</h3>
                    <p className="mt-4 break-words leading-8 text-[#27445C] [overflow-wrap:anywhere]">
                      1979年岡山県岡山市生まれ。
                      <br />
                      株式会社HAYASHI CREATIVE代表。
                      <br />
                      飲食、物販、不動産、水上スポーツ、ビジネスコンサルなど5つのビジネスを立ち上げ、すべて利益をあげることに成功。現場で売上と利益を作ってきた経営者目線で、御社の業務改善を行います。
                    </p>
                    <p className="mt-3 break-words leading-8 text-[#27445C] [overflow-wrap:anywhere]">
                      AIを活用して経営、社員の育成、管理を省力化するだけでなく、現場経営の目線をもって、どこを仕組み化すれば利益につながるかまでサポートできます。
                    </p>
                    <ul className="mt-4 list-disc space-y-2 break-words pl-5 leading-7 text-[#27445C] [overflow-wrap:anywhere]">
                      <li>5つの事業を立ち上げ、すべて利益化</li>
                      <li>経営、社員育成、管理の省力化を支援</li>
                      <li>AI活用とビジネス判断を組み合わせた顧問支援</li>
                      <li>東京大学大学院工学系研究科 松尾・岩澤研究室主宰「大規模言語モデル応用編 集中講義 2025」修了・最終審査合格</li>
                    </ul>
                  </div>
                </article>
                <article className="grid gap-6 border border-[#D8D1C6] bg-white p-5 shadow-[0_18px_60px_rgba(16,42,67,0.10)] sm:p-6 md:grid-cols-[170px_1fr] lg:grid-cols-[190px_1fr]">
                  <Image
                    src="/main/assets/brother-avatar.jpg"
                    alt="AIとシステム設計を担当する人物の漫画風イラスト"
                    width={190}
                    height={190}
                    className="h-[150px] w-[150px] object-cover sm:h-[170px] sm:w-[170px] lg:h-[190px] lg:w-[190px]"
                  />
                  <div>
                    <p className="section-kicker mb-2">AIをビジネスに応用、仕組み化するプロ</p>
                    <h3 className="text-2xl font-black leading-tight sm:text-3xl">林　兄</h3>
                    <p className="mt-4 break-words leading-8 text-[#27445C] [overflow-wrap:anywhere]">
                      東京でシステムエンジニアとして20年以上、AI活用スタートアップのCTOを務めています。
                    </p>
                    <p className="mt-3 break-words leading-8 text-[#27445C] [overflow-wrap:anywhere]">
                      防衛庁システムの開発や、高レベルのセキュリティと正確性が必要な領域で開発責任者を担当。ベンチャー企業ではフルスタックCTOとして設計・開発、精度改善まで一貫して担当し、GoogleのAIスタートアップ支援に正式採択されました。
                    </p>
                    <p className="mt-3 break-words leading-8 text-[#27445C] [overflow-wrap:anywhere]">
                      現在は東京大学のAI講義にて在籍講師をしながら、中小企業のAI（Artificial Intelligence、人工知能）活用による社会課題解決に取り組んでいます。
                    </p>
                    <ul className="mt-4 list-disc space-y-2 break-words pl-5 leading-7 text-[#27445C] [overflow-wrap:anywhere]">
                      <li>業務フロー整理</li>
                      <li>マニュアル・チェックリスト作成</li>
                      <li>AIに入力する指示文の設計</li>
                      <li>システム化できる業務の見極め</li>
                    </ul>
                  </div>
                </article>
              </div>
            </>
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1fr_0.95fr]">
              <div>
                <p className="section-kicker">誰がやるか</p>
                <h2 className="section-title">{config.operatorTitle}</h2>
                <p className="mt-6 whitespace-pre-line text-lg leading-9 text-[#27445C]">{config.operatorBody}</p>
                <div className="mt-8 border-y border-[#D8D1C6] py-6">
                  <p className="font-black">担当領域</p>
                  <p className="mt-2 leading-8 text-[#27445C]">
                    {config.operatorScope ??
                      "業務棚卸し / 判断基準の言語化 / 社員用手順書 / AIエージェント設計 / AIで再現する文面・確認リスト / 30日間の実行計画"}
                  </p>
                </div>
              </div>
              <Image
                src="/main/assets/hayashi-masaru.jpg"
                alt="AI実装相談を担当する業務改善支援者"
                width={760}
                height={760}
                className="max-h-[520px] w-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F7F4EE] py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-12">
          <div>
            <p className="section-kicker">{config.finalKicker ?? "相談する内容"}</p>
            <h2 className="section-title">{config.finalTitle}</h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-9 text-[#27445C]">
              {config.finalBody}
            </p>
            <div className="mt-8">
              <CtaLink href="#diagnosis-form" location={`${config.id}_final`}>
                {ctaText}
              </CtaLink>
              {config.id === "b" ? (
                <p className="mt-3 text-sm font-black leading-6 text-[#C33124]">
                  ※各月ごとの制限人数に達し次第募集を停止致します。
                </p>
              ) : null}
            </div>
          </div>
          <VariantForm
            variant={config.id}
            leadText={config.formLead}
            kicker={config.formKicker}
            title={config.formTitle}
            issueLabel={config.formIssueLabel}
            issuePlaceholder={config.formIssuePlaceholder}
            submitLabel={config.formSubmitLabel ?? ctaText}
          />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D8D1C6] bg-white/96 px-4 py-3 shadow-[0_-12px_30px_rgba(16,42,67,0.14)] backdrop-blur md:hidden">
        <CtaLink href="#diagnosis-form" location={`${config.id}_sticky`}>
          {ctaText}
        </CtaLink>
      </div>
    </main>
  );
}
