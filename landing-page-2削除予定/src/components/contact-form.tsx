"use client";

import { FormEvent, useState } from "react";
import { trackEvent } from "./cta-link";
import { EmployeeSelect, Field } from "./form-controls";
import { formDataToLeadPayload, getLeadSubmitErrorMessage, submitLeadForm } from "@/lib/lead-form";

const calendarUrl = process.env.NEXT_PUBLIC_CALENDAR_URL;

export function ContactForm() {
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleStart = () => {
    if (!started) {
      setStarted(true);
      trackEvent("form_start", { form: "diagnosis" });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage("");
    const form = event.currentTarget;
    const payload = formDataToLeadPayload(form, {
      sourcePage: "社長業務AI化診断",
      pagePath: window.location.href,
    });

    try {
      trackEvent("form_submit_attempt", { form: "diagnosis" });

      await submitLeadForm(payload);

      trackEvent("form_submit", { form: "diagnosis" });
      trackEvent("form_submit_success", { form: "diagnosis" });
      setSubmitted(true);
      form.reset();
    } catch (error) {
      trackEvent("form_submit_error", { form: "diagnosis" });
      setErrorMessage(getLeadSubmitErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="diagnosis-form"
      aria-labelledby="diagnosis-form-heading"
      className="scroll-mt-8 bg-white p-6 shadow-[0_18px_60px_rgba(16,42,67,0.14)] sm:p-8 lg:p-10"
    >
      <p className="section-kicker">社長業務AI化診断</p>
      <h2 id="diagnosis-form-heading" className="text-3xl font-black leading-tight sm:text-4xl">
        30分で、社長が抱えている業務を一緒に整理します。
      </h2>
      <p className="mt-4 leading-8 text-[#27445C]">
        入力後、診断予約の日程選択へ進みます。まずは自社で最初に変えるべき業務を明確にする時間です。
      </p>
      <ul className="mt-5 space-y-2 border-l-4 border-[#F26A21] bg-[#F7F4EE] px-5 py-4 text-sm font-bold leading-7 text-[#102A43]">
        <li>社長の時間を奪っている業務を整理します</li>
        <li>最初に仕組み化すべき一業務を確認します</li>
        <li>社員に任せるための判断基準を見つけます</li>
      </ul>

      <form className="mt-8 space-y-5" onFocus={handleStart} onSubmit={handleSubmit}>
        <Field label="会社名" name="company" required />
        <Field label="氏名" name="name" required />
        <Field label="役職（任意）" name="role" />
        <Field label="連絡先（メールアドレス）" name="email" type="email" required />
        <EmployeeSelect label="従業員数" />
        <label className="block">
          <span className="form-label">現在もっとも困っている業務</span>
          <textarea
            name="issue"
            rows={5}
            className="form-input resize-y"
            placeholder="例：見積確認、社員からの質問対応、メール返信、教育、日々の判断など"
          />
        </label>
        <Field label="電話番号（任意）" name="phone" type="tel" />

        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-14 w-full bg-[#102A43] px-6 py-4 text-base font-black text-white transition hover:bg-[#173a5a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "送信中..." : "診断予約へ進む"}
        </button>
      </form>

      {errorMessage ? (
        <div className="mt-8 border-l-4 border-[#B42318] bg-[#FFF3F0] p-5">
          <h3 className="text-xl font-black text-[#7A271A]">送信に失敗しました。</h3>
          <p className="mt-2 leading-7 text-[#7A271A]">{errorMessage}</p>
        </div>
      ) : null}

      {submitted ? (
        <div className="mt-8 border-l-4 border-[#16803C] bg-[#F7F4EE] p-5">
          <h3 className="text-xl font-black">
            送信しました。次の案内に沿って日程を調整してください。
          </h3>
          {calendarUrl ? (
            <>
              <p className="mt-2 leading-7 text-[#27445C]">
                続けて日程を選択すると、予約が完了します。
              </p>
              <a
                href={calendarUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent("calendar_open", { source: "form_success" })}
                className="mt-4 inline-flex min-h-12 items-center justify-center bg-[#F26A21] px-5 py-3 font-black text-white"
              >
                診断予約の日程を選ぶ
              </a>
            </>
          ) : (
            <p className="mt-2 leading-7 text-[#27445C]">
              内容を確認し、日程調整のご案内をメールでお送りします。
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
