import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { leadLabels, normalizeLeadPayload, validateLeadPayload } from "@/lib/lead-form";

const mainContactApi = "https://ai-business-lp.vercel.app/api/contact";

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const fallbackAutoReplyUrl =
  process.env.FALLBACK_AUTOREPLY_URL || "https://formsubmit.co/ajax/0b239698323990ed50d174f1b83077b0";

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

  const response = await fetch(fallbackAutoReplyUrl, {
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
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const validation = validateLeadPayload(body);
  if (!validation.ok) {
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

  console.info("diagnosis_lead", {
    ...lead,
    receivedAt,
  });

  if (process.env.DIAGNOSIS_NOTIFY_WEBHOOK) {
    await fetch(process.env.DIAGNOSIS_NOTIFY_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "diagnosis_lead",
        lead,
        receivedAt,
      }),
    }).catch((error: unknown) => {
      console.error("diagnosis_webhook_failed", error);
    });
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
      console.error("diagnosis_admin_email_failed", {
        status: adminResponse.status,
        provider: adminResponse.provider,
        body: adminResponse.body,
      });

      const fallbackResponse = await sendFormSubmitFallback();
      if (fallbackResponse.ok) {
        return NextResponse.json({
          ok: true,
          provider: "formsubmit",
          autoReplySent: true,
          smsAutoReplySent: false,
          smsAutoReplySkipped: true,
        });
      }

      console.error("diagnosis_fallback_contact_failed", {
        status: fallbackResponse.status,
        provider: fallbackResponse.provider,
        body: fallbackResponse.body,
      });
      return NextResponse.json({ ok: false, error: "email_failed" }, { status: 502 });
    }

    const autoReplyResponse = await sendTransactionalEmail({
      from: fromEmail,
      to: [lead.email],
      reply_to: toEmail,
      subject: "最短2日AI集中キャンプのお申し込みを受け付けました",
      text: autoReplyText,
    });

    let autoReplySent = false;

    if (!autoReplyResponse.ok) {
      console.error("diagnosis_auto_reply_failed", {
        status: autoReplyResponse.status,
        provider: autoReplyResponse.provider,
        body: autoReplyResponse.body,
      });

      const fallbackResponse = await sendFallbackAutoReply({
        email: lead.email,
        name: lead.name,
        subject: "最短2日AI集中キャンプのお申し込みを受け付けました",
        text: autoReplyText,
        summary: fallbackSummary,
      });

      if (fallbackResponse.ok) {
        autoReplySent = true;
      } else {
        console.error("diagnosis_fallback_auto_reply_failed", {
          status: fallbackResponse.status,
          provider: fallbackResponse.provider,
          body: fallbackResponse.body,
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
        console.error("diagnosis_auto_reply_fallback_notice_failed", error);
      });
    } else {
      autoReplySent = true;
    }

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
      console.error("diagnosis_proxy_failed", {
        status: response.status,
        body: responseBody,
      });

      const fallbackResponse = await sendFormSubmitFallback();
      if (fallbackResponse.ok) {
        return NextResponse.json({
          ok: true,
          provider: "formsubmit",
          autoReplySent: true,
          smsAutoReplySent: false,
          smsAutoReplySkipped: true,
        });
      }

      console.error("diagnosis_proxy_fallback_failed", {
        status: fallbackResponse.status,
        provider: fallbackResponse.provider,
        body: fallbackResponse.body,
      });
      return NextResponse.json({ ok: false, error: "email_failed" }, { status: 502 });
    }

    const result = await response.json().catch(() => ({ ok: true }));

    if (!result.autoReplySent) {
      console.error("diagnosis_proxy_auto_reply_failed", {
        reason: "proxied_api_did_not_confirm_auto_reply",
      });
      return NextResponse.json({ ok: true, proxied: true, autoReplySent: false });
    }

    return NextResponse.json({
      ok: true,
      proxied: true,
      autoReplySent: true,
      smsAutoReplySent: Boolean(result.smsAutoReplySent),
      smsAutoReplySkipped: Boolean(result.smsAutoReplySkipped),
    });
  } catch (error: unknown) {
    console.error("diagnosis_proxy_error", error);
    const fallbackResponse = await sendFormSubmitFallback();
    if (fallbackResponse.ok) {
      return NextResponse.json({
        ok: true,
        provider: "formsubmit",
        autoReplySent: true,
        smsAutoReplySent: false,
        smsAutoReplySkipped: true,
      });
    }

    console.error("diagnosis_proxy_error_fallback_failed", {
      status: fallbackResponse.status,
      provider: fallbackResponse.provider,
      body: fallbackResponse.body,
    });
    return NextResponse.json({ ok: false, error: "email_failed" }, { status: 502 });
  }
}
