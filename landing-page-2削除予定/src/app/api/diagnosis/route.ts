import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { leadLabels, normalizeLeadPayload, validateLeadPayload } from "@/lib/lead-form";

export const runtime = "nodejs";

const mainContactApi = "https://ai-business-lp.vercel.app/api/contact";

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const fallbackAutoReplyUrl =
  process.env.FALLBACK_AUTOREPLY_URL || "https://formsubmit.co/ajax/0b239698323990ed50d174f1b83077b0";

const createLogId = () => randomUUID().slice(0, 8);

const cleanLogError = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;

  return String(value instanceof Error ? value.message : value)
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[email]")
    .replace(/\+?\d[\d\s().-]{8,}\d/g, "[phone]")
    .slice(0, 240);
};

const logDiagnosisEvent = ({
  id,
  startedAt,
  step,
  ok,
  provider,
  status,
  error,
}: {
  id: string;
  startedAt: number;
  step: string;
  ok: boolean;
  provider?: string;
  status?: number | string;
  error?: unknown;
}) => {
  const payload: Record<string, string | number | boolean> = {
    id,
    step,
    ok,
    elapsedMs: Date.now() - startedAt,
  };
  const cleanedError = cleanLogError(error);

  if (provider) payload.provider = provider;
  if (status !== undefined) payload.status = status;
  if (cleanedError) payload.error = cleanedError;

  if (ok) {
    console.info("diagnosis_event", JSON.stringify(payload));
  } else {
    console.error("diagnosis_event", JSON.stringify(payload));
  }
};

type EmailPayload = {
  from: string;
  to: string[];
  subject: string;
  text: string;
  reply_to?: string;
};

const sendEmail = async (resendApiKey: string, payload: EmailPayload) =>
  fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

const sendSmtpEmail = async (payload: EmailPayload) => {
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER,
    to: payload.to.join(","),
    replyTo: payload.reply_to,
    subject: payload.subject,
    text: payload.text,
  });
};

const sendTransactionalEmail = async (payload: EmailPayload) => {
  if (hasSmtpConfig()) {
    try {
      await sendSmtpEmail(payload);
      return { ok: true, provider: "smtp" };
    } catch (error: unknown) {
      return {
        ok: false,
        provider: "smtp",
        status: 500,
        body: error instanceof Error ? error.message : String(error),
      };
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return { ok: false, provider: "none", status: 500, body: "送信設定が未完了です。" };
  }

  let response: Response;
  try {
    response = await sendEmail(resendApiKey, payload);
  } catch (error: unknown) {
    return {
      ok: false,
      provider: "resend",
      status: 500,
      body: error instanceof Error ? error.message : String(error),
    };
  }

  if (response.ok) {
    return { ok: true, provider: "resend" };
  }

  return {
    ok: false,
    provider: "resend",
    status: response.status,
    body: await response.text().catch(() => ""),
  };
};

const sendFallbackAutoReply = async ({
  email,
  name,
  subject,
  text,
  summary,
}: {
  email: string;
  name: string;
  subject: string;
  text: string;
  summary: string;
}) => {
  if (!fallbackAutoReplyUrl || !email) {
    return { ok: false, provider: "formsubmit", status: 400, body: "fallback_not_configured" };
  }

  let response: Response;
  try {
    response = await fetch(fallbackAutoReplyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email,
        name,
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _autoresponse: text,
        message: summary,
      }),
    });
  } catch (error: unknown) {
    return {
      ok: false,
      provider: "formsubmit",
      status: 500,
      body: error instanceof Error ? error.message : String(error),
    };
  }

  if (response.ok) {
    return { ok: true, provider: "formsubmit" };
  }

  return {
    ok: false,
    provider: "formsubmit",
    status: response.status,
    body: await response.text().catch(() => ""),
  };
};

export async function POST(request: Request) {
  const startedAt = Date.now();
  const id = createLogId();
  logDiagnosisEvent({ id, startedAt, step: "received", ok: true });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    logDiagnosisEvent({ id, startedAt, step: "validate", ok: false, error: "invalid_json" });
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const validation = validateLeadPayload(body);
  if (!validation.ok) {
    logDiagnosisEvent({ id, startedAt, step: "validate", ok: false, error: validation.error });
    return NextResponse.json(
      { ok: false, error: validation.error, missing: validation.missing },
      { status: 400 },
    );
  }

  const normalizedLead = normalizeLeadPayload(body);
  const lead = {
    ...normalizedLead,
    pagePath: normalizedLead.pagePath || request.headers.get("referer") || "不明",
  };
  const receivedAt = new Date().toISOString();

  logDiagnosisEvent({ id, startedAt, step: "validate", ok: true });

  if (process.env.DIAGNOSIS_NOTIFY_WEBHOOK) {
    try {
      const webhookResponse = await fetch(process.env.DIAGNOSIS_NOTIFY_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "diagnosis_lead",
          lead,
          receivedAt,
        }),
      });

      logDiagnosisEvent({
        id,
        startedAt,
        step: "notify_webhook",
        ok: webhookResponse.ok,
        status: webhookResponse.status,
        error: webhookResponse.ok ? undefined : "webhook_http_error",
      });
    } catch (error: unknown) {
      logDiagnosisEvent({ id, startedAt, step: "notify_webhook", ok: false, error });
    }
  }

  const topic =
    lead.sourcePage.includes("2日間") || lead.sourcePage.includes("最短2日AI集中キャンプ")
      ? "最短2日AI集中キャンプ申し込み"
      : "AI実装相談問い合わせ";

  const adminSubject = `${topic}｜${lead.company || lead.name}`;
  const message = [
    "LPから問い合わせがありました。",
    `申込元: ${topic}`,
    "",
    ...Object.entries(lead).map(([key, value]) => `${leadLabels[key] ?? key}: ${value || "未入力"}`),
    "",
    `受信日時: ${receivedAt}`,
  ].join("\n");

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.SMTP_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    "株式会社HAYASHI CREATIVE <onboarding@resend.dev>";
  const hasEmailConfig = Boolean(toEmail && (resendApiKey || hasSmtpConfig()));
  const autoReplyText = [
    `${lead.name} 様`,
    "",
    "株式会社HAYASHI CREATIVEです。",
    "最短2日AI集中キャンプのお申し込みを受け付けました。",
    "",
    "内容を確認し、通常1〜2営業日以内にご連絡します。",
    "",
    "お申し込み内容：",
    `会社名：${lead.company}`,
    `氏名：${lead.name}`,
    `役職：${lead.role || "未入力"}`,
    `従業員数：${lead.employees || "未入力"}`,
    `電話番号：${lead.phone || "未入力"}`,
    "",
    "相談内容：",
    lead.issue || "未入力",
    "",
    "このメールにお心当たりがない場合は、そのまま破棄してください。",
    "",
    "株式会社HAYASHI CREATIVE",
  ].join("\n");
  const fallbackSummary = [
    "受付確認メールの補助送信です。",
    "",
    `会社名：${lead.company}`,
    `氏名：${lead.name}`,
    `メールアドレス：${lead.email}`,
    `申込元：${lead.sourcePage}`,
    "",
    "相談内容：",
    lead.issue || "未入力",
  ].join("\n");
  const sendFormSubmitFallback = () =>
    sendFallbackAutoReply({
      email: lead.email,
      name: lead.name,
      subject: adminSubject,
      text: autoReplyText,
      summary: message,
    });

  if (hasEmailConfig && toEmail) {
    const adminResponse = await sendTransactionalEmail({
      from: fromEmail,
      to: [toEmail],
      reply_to: lead.email,
      subject: adminSubject,
      text: message,
    });

    if (!adminResponse.ok) {
      logDiagnosisEvent({
        id,
        startedAt,
        step: "admin_email",
        ok: false,
        provider: adminResponse.provider,
        status: adminResponse.status,
        error: adminResponse.body,
      });

      const fallbackResponse = await sendFormSubmitFallback();
      if (fallbackResponse.ok) {
        logDiagnosisEvent({
          id,
          startedAt,
          step: "fallback",
          ok: true,
          provider: fallbackResponse.provider,
        });
        logDiagnosisEvent({ id, startedAt, step: "completed", ok: true });
        return NextResponse.json({
          ok: true,
          provider: "formsubmit",
          autoReplySent: true,
          smsAutoReplySent: false,
          smsAutoReplySkipped: true,
        });
      }

      logDiagnosisEvent({
        id,
        startedAt,
        step: "fallback",
        ok: false,
        provider: fallbackResponse.provider,
        status: fallbackResponse.status,
        error: fallbackResponse.body,
      });
      return NextResponse.json({ ok: false, error: "email_failed" }, { status: 502 });
    }

    logDiagnosisEvent({
      id,
      startedAt,
      step: "admin_email",
      ok: true,
      provider: adminResponse.provider,
    });

    const autoReplyResponse = await sendTransactionalEmail({
      from: fromEmail,
      to: [lead.email],
      reply_to: toEmail,
      subject: "最短2日AI集中キャンプのお申し込みを受け付けました",
      text: autoReplyText,
    });

    let autoReplySent = false;

    if (!autoReplyResponse.ok) {
      logDiagnosisEvent({
        id,
        startedAt,
        step: "auto_reply",
        ok: false,
        provider: autoReplyResponse.provider,
        status: autoReplyResponse.status,
        error: autoReplyResponse.body,
      });

      const fallbackResponse = await sendFallbackAutoReply({
        email: lead.email,
        name: lead.name,
        subject: "最短2日AI集中キャンプのお申し込みを受け付けました",
        text: autoReplyText,
        summary: fallbackSummary,
      });

      if (fallbackResponse.ok) {
        logDiagnosisEvent({
          id,
          startedAt,
          step: "fallback",
          ok: true,
          provider: fallbackResponse.provider,
        });
        autoReplySent = true;
      } else {
        logDiagnosisEvent({
          id,
          startedAt,
          step: "fallback",
          ok: false,
          provider: fallbackResponse.provider,
          status: fallbackResponse.status,
          error: fallbackResponse.body,
        });
      }

      if (!autoReplySent) await sendTransactionalEmail({
        from: fromEmail,
        to: [toEmail],
        reply_to: lead.email,
        subject: `要対応：申込者への受付確認メール未送信｜${lead.company || lead.name}`,
        text: [
          "申込者への受付確認メールが送信できませんでした。",
          "Resendの送信制限、送信元ドメイン未認証、または宛先側の制限が原因の可能性があります。",
          "",
          "この申込者には手動で受付完了の連絡をしてください。",
          "",
          ...Object.entries(lead).map(([key, value]) => `${leadLabels[key] ?? key}: ${value || "未入力"}`),
          "",
          "自動返信エラー：",
          `status: ${autoReplyResponse.status}`,
          `provider: ${autoReplyResponse.provider}`,
          autoReplyResponse.body || "詳細なし",
        ].join("\n"),
      }).catch((error: unknown) => {
        logDiagnosisEvent({ id, startedAt, step: "auto_reply_notice", ok: false, error });
      });
    } else {
      logDiagnosisEvent({
        id,
        startedAt,
        step: "auto_reply",
        ok: true,
        provider: autoReplyResponse.provider,
      });
      autoReplySent = true;
    }

    logDiagnosisEvent({ id, startedAt, step: "completed", ok: true });
    return NextResponse.json({
      ok: true,
      autoReplySent,
      smsAutoReplySent: false,
      smsAutoReplySkipped: true,
    });
  }

  try {
    const response = await fetch(mainContactApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: lead.company,
        name: lead.name,
        email: lead.email,
        contact: lead.email,
        phone: lead.phone,
        topic,
        message,
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text().catch(() => "");
      logDiagnosisEvent({
        id,
        startedAt,
        step: "proxy_contact_api",
        ok: false,
        provider: "main_contact_api",
        status: response.status,
        error: responseBody,
      });

      const fallbackResponse = await sendFormSubmitFallback();
      if (fallbackResponse.ok) {
        logDiagnosisEvent({
          id,
          startedAt,
          step: "fallback",
          ok: true,
          provider: fallbackResponse.provider,
        });
        logDiagnosisEvent({ id, startedAt, step: "completed", ok: true });
        return NextResponse.json({
          ok: true,
          provider: "formsubmit",
          autoReplySent: true,
          smsAutoReplySent: false,
          smsAutoReplySkipped: true,
        });
      }

      logDiagnosisEvent({
        id,
        startedAt,
        step: "fallback",
        ok: false,
        provider: fallbackResponse.provider,
        status: fallbackResponse.status,
        error: fallbackResponse.body,
      });
      return NextResponse.json({ ok: false, error: "email_failed" }, { status: 502 });
    }

    logDiagnosisEvent({
      id,
      startedAt,
      step: "proxy_contact_api",
      ok: true,
      provider: "main_contact_api",
      status: response.status,
    });

    const result = await response.json().catch(() => ({ ok: true }));

    if (!result.autoReplySent) {
      logDiagnosisEvent({
        id,
        startedAt,
        step: "auto_reply",
        ok: false,
        provider: "main_contact_api",
        error: "proxied_api_did_not_confirm_auto_reply",
      });

      const fallbackResponse = await sendFallbackAutoReply({
        email: lead.email,
        name: lead.name,
        subject: "最短2日AI集中キャンプのお申し込みを受け付けました",
        text: autoReplyText,
        summary: fallbackSummary,
      });

      if (fallbackResponse.ok) {
        logDiagnosisEvent({
          id,
          startedAt,
          step: "fallback",
          ok: true,
          provider: fallbackResponse.provider,
        });
        logDiagnosisEvent({ id, startedAt, step: "completed", ok: true });
        return NextResponse.json({
          ok: true,
          proxied: true,
          provider: "formsubmit",
          autoReplySent: true,
          smsAutoReplySent: false,
          smsAutoReplySkipped: true,
        });
      }

      logDiagnosisEvent({
        id,
        startedAt,
        step: "fallback",
        ok: false,
        provider: fallbackResponse.provider,
        status: fallbackResponse.status,
        error: fallbackResponse.body,
      });
      return NextResponse.json({ ok: true, proxied: true, autoReplySent: false });
    }

    logDiagnosisEvent({
      id,
      startedAt,
      step: "auto_reply",
      ok: true,
      provider: "main_contact_api",
    });
    logDiagnosisEvent({ id, startedAt, step: "completed", ok: true });
    return NextResponse.json({
      ok: true,
      proxied: true,
      autoReplySent: true,
      smsAutoReplySent: Boolean(result.smsAutoReplySent),
      smsAutoReplySkipped: Boolean(result.smsAutoReplySkipped),
    });
  } catch (error: unknown) {
    logDiagnosisEvent({
      id,
      startedAt,
      step: "proxy_contact_api",
      ok: false,
      provider: "main_contact_api",
      error,
    });
    const fallbackResponse = await sendFormSubmitFallback();
    if (fallbackResponse.ok) {
      logDiagnosisEvent({
        id,
        startedAt,
        step: "fallback",
        ok: true,
        provider: fallbackResponse.provider,
      });
      logDiagnosisEvent({ id, startedAt, step: "completed", ok: true });
      return NextResponse.json({
        ok: true,
        provider: "formsubmit",
        autoReplySent: true,
        smsAutoReplySent: false,
        smsAutoReplySkipped: true,
      });
    }

    logDiagnosisEvent({
      id,
      startedAt,
      step: "fallback",
      ok: false,
      provider: fallbackResponse.provider,
      status: fallbackResponse.status,
      error: fallbackResponse.body,
    });
    return NextResponse.json({ ok: false, error: "email_failed" }, { status: 502 });
  }
}
