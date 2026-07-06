"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "./cta-link";

const employeeOptions = ["5名未満", "5〜10名", "11〜30名", "31〜50名", "51名以上"];

const sourcePageLabels: Record<string, string> = {
  a: "A案LP：現場改善型",
  b: "最短2日AI集中キャンプ：2日間AIキャンプLP",
  c: "C案LP：経営者解放・仕組み継承型",
};

const thanksPath = "/thanks";

const sendFallbackAutoReply = async (payload: Record<string, FormDataEntryValue | string>) => {
  const email = String(payload.email || "");
  if (!email) return;

  const name = String(payload.name || "お申し込み者");
  await fetch("https://formsubmit.co/ajax/0b239698323990ed50d174f1b83077b0", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email,
      name,
      _subject: "最短2日AI集中キャンプのお申し込み",
      _template: "table",
      _autoresponse: [
        `${name} 様`,
        "",
        "株式会社HAYASHI CREATIVEです。",
        "最短2日AI集中キャンプのお申し込みを受け付けました。",
        "",
        "内容を確認し、通常1〜2営業日以内にご連絡します。",
        "",
        "お申し込み内容：",
        `会社名：${String(payload.company || "未入力")}`,
        `役職：${String(payload.role || "未入力")}`,
        `従業員数：${String(payload.employees || "未入力")}`,
        `電話番号：${String(payload.phone || "未入力")}`,
        "",
        "相談内容：",
        String(payload.issue || "未入力"),
        "",
        "株式会社HAYASHI CREATIVE",
      ].join("\n"),
      message: [
        "受付確認メールの補助送信です。",
        "",
        `会社名：${String(payload.company || "未入力")}`,
        `氏名：${name}`,
        `メールアドレス：${email}`,
        `申込元：${String(payload.sourcePage || "最短2日AI集中キャンプ")}`,
        "",
        "相談内容：",
        String(payload.issue || "未入力"),
      ].join("\n"),
    }),
  }).catch(() => null);
};

type VariantFormProps = {
  variant: string;
  leadText: string;
  kicker?: string;
  title?: string;
  issueLabel?: string;
  issuePlaceholder?: string;
  submitLabel?: string;
};

export function VariantForm({
  variant,
  leadText,
  kicker = "AI実装相談",
  title = "最初に仕組みに変える業務を、30分で整理します。",
  issueLabel = "今いちばん「またか」と感じる作業",
  issuePlaceholder = "例：見積の確認、メール返信、社員からの質問、教育、現場確認など",
  submitLabel = "AI実装相談を予約する",
}: VariantFormProps) {
  const [started, setStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStart = () => {
    if (!started) {
      setStarted(true);
      trackEvent("form_start", { form: "ai_implementation", variant });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;

    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const formData = new FormData(form);
    const payload = {
      ...Object.fromEntries(formData.entries()),
      variant,
      sourcePage: sourcePageLabels[variant] ?? "AI実装LP",
      pagePath: window.location.href,
    };

    try {
      trackEvent("form_submit_attempt", { form: "ai_implementation", variant });

      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("submit_failed");
      }

      const result = await response.json().catch(() => ({ autoReplySent: false }));
      if (!result.autoReplySent) {
        await sendFallbackAutoReply(payload);
      }

      trackEvent("form_submit", { form: "ai_implementation", variant });
      trackEvent("form_submit_success", { form: "ai_implementation", variant });
      form.reset();
      window.location.href = `${thanksPath}?source=${encodeURIComponent(sourcePageLabels[variant] ?? "AI実装LP")}`;
    } catch {
      trackEvent("form_submit_error", { form: "ai_implementation", variant });
      setErrorMessage(
        "送信できませんでした。受付確認メールを送る設定を確認しています。お急ぎの場合は直接ご連絡ください。",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="diagnosis-form"
      aria-labelledby={`${variant}-form-heading`}
      className="scroll-mt-8 border border-[#D8D1C6] bg-white p-6 shadow-[0_18px_60px_rgba(16,42,67,0.12)] sm:p-8"
    >
      <p className="section-kicker">{kicker}</p>
      <h2 id={`${variant}-form-heading`} className="text-3xl font-black leading-tight">
        {title}
      </h2>
      <p className="mt-4 leading-8 text-[#27445C]">{leadText}</p>

      <form className="mt-8" onFocus={handleStart} onSubmit={handleSubmit}>
        <input type="hidden" name="variant" value={variant} />
        <input type="hidden" name="sourcePage" value={sourcePageLabels[variant] ?? "AI実装LP"} />
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="会社名"
            name="company"
            autoComplete="organization"
            placeholder="例：株式会社HAYASHI CREATIVE"
            required
          />
          <Field
            label="氏名"
            name="name"
            autoComplete="name"
            placeholder="例：林 勝"
            required
          />
          <Field
            label="役職"
            note="任意"
            name="role"
            autoComplete="organization-title"
            placeholder="例：代表取締役"
          />
          <Field
            label="連絡先"
            note="受付確認メールをお送りします"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="例：info@example.com"
            required
          />
          <label className="block">
            <span className="form-label">
              従業員数
              <span className="ml-2 text-sm font-bold text-[#6B7D8F]">任意</span>
            </span>
            <select name="employees" className="form-input">
              <option value="">選択してください</option>
              {employeeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <Field
            label="電話番号"
            note="任意"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="例：090-0000-0000"
          />
          <label className="block md:col-span-2">
            <span className="form-label">
              {issueLabel}
              <span className="ml-2 text-sm font-bold text-[#6B7D8F]">任意</span>
            </span>
            <textarea
              name="issue"
              rows={5}
              className="form-input resize-y"
              placeholder={issuePlaceholder}
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 min-h-14 w-full bg-[#F26A21] px-6 py-4 text-base font-black text-white shadow-[0_14px_30px_rgba(242,106,33,0.28)] transition hover:bg-[#d95715] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "送信中..." : submitLabel}
        </button>
      </form>

      {errorMessage ? (
        <div className="mt-8 border-l-4 border-[#B42318] bg-[#FFF3F0] p-5">
          <h3 className="text-xl font-black text-[#7A271A]">送信に失敗しました。</h3>
          <p className="mt-2 leading-7 text-[#7A271A]">{errorMessage}</p>
        </div>
      ) : null}
    </section>
  );
}

function Field({
  label,
  note,
  name,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
  required = false,
}: {
  label: string;
  note?: string;
  name: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "email" | "tel" | "text" | "url" | "none" | "numeric" | "decimal" | "search";
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="form-label">
        {label}
        {note ? <span className="ml-2 text-sm font-bold text-[#6B7D8F]">{note}</span> : null}
      </span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        required={required}
        className="form-input"
      />
    </label>
  );
}
