const json = (response, statusCode, body) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
};

const clean = (value, maxLength = 1200) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

const normalizeContact = (value) => clean(value, 200)
  .normalize("NFKC")
  .replace(/\s+/g, "")
  .replace(/[‐‑‒–—―ー−]/g, "-")
  .toLowerCase();

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const hasSmtpConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
const fallbackAutoReplyUrl =
  process.env.FALLBACK_AUTOREPLY_URL || "https://formsubmit.co/ajax/0b239698323990ed50d174f1b83077b0";

const normalizePhone = (value) => clean(value, 80)
  .normalize("NFKC")
  .replace(/[^\d+]/g, "");

const toE164JapanPhone = (value) => {
  const phone = normalizePhone(value);
  if (!phone) return "";
  if (phone.startsWith("+")) return phone;
  if (phone.startsWith("81")) return `+${phone}`;
  if (phone.startsWith("0")) return `+81${phone.slice(1)}`;
  return phone;
};

const isValidPhone = (value) => /^\+?\d{10,15}$/.test(normalizePhone(value));

const hasSmsConfig = () => Boolean(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_FROM_NUMBER
);

const sendSms = async ({ to, body }) => {
  if (!hasSmsConfig()) {
    return { ok: false, skipped: true, reason: "sms_config_missing" };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const params = new URLSearchParams({
    To: toE164JapanPhone(to),
    From: fromNumber,
    Body: body
  });

  const smsResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });

  if (smsResponse.ok) return { ok: true, provider: "twilio" };

  return {
    ok: false,
    provider: "twilio",
    status: smsResponse.status,
    body: await smsResponse.text().catch(() => "")
  };
};

const sendEmail = async (resendApiKey, payload) => fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${resendApiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
});

const getRequestHeader = (request, headerName) => {
  if (typeof request.headers?.get === "function") {
    return request.headers.get(headerName) || "";
  }

  return request.headers?.[headerName] || request.headers?.[headerName.toLowerCase()] || "";
};

const parseContactRequestBody = (request) => {
  if (typeof request.body === "object" && request.body) return request.body;
  if (typeof request.body !== "string") return {};

  const rawBody = request.body.trim();
  if (!rawBody) return {};

  const contentType = getRequestHeader(request, "content-type").toLowerCase();

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody));
  }

  if (contentType.includes("application/json") || rawBody.startsWith("{")) {
    return JSON.parse(rawBody);
  }

  if (rawBody.includes("=")) {
    return Object.fromEntries(new URLSearchParams(rawBody));
  }

  return null;
};

const sendSmtpEmail = async (payload) => {
  const nodemailer = require("nodemailer");
  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL || process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER,
    to: payload.to.join(","),
    replyTo: payload.reply_to,
    subject: payload.subject,
    text: payload.text
  });
};

const sendTransactionalEmail = async (payload) => {
  if (hasSmtpConfig()) {
    try {
      await sendSmtpEmail(payload);
      return { ok: true, provider: "smtp" };
    } catch (error) {
      return {
        ok: false,
        provider: "smtp",
        status: 500,
        body: error instanceof Error ? error.message : String(error)
      };
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    return { ok: false, provider: "none", status: 500, body: "送信設定が未完了です。" };
  }

  const response = await sendEmail(resendApiKey, payload);

  if (response.ok) {
    return { ok: true, provider: "resend" };
  }

  return {
    ok: false,
    provider: "resend",
    status: response.status,
    body: await response.text().catch(() => "")
  };
};

const sendFallbackAutoReply = async ({ email, name, subject, text, summary }) => {
  if (!fallbackAutoReplyUrl || !email) {
    return { ok: false, provider: "formsubmit", status: 400, body: "fallback_not_configured" };
  }

  const response = await fetch(fallbackAutoReplyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      email,
      name,
      _subject: subject,
      _template: "table",
      _captcha: "false",
      _autoresponse: text,
      message: summary || text
    })
  });

  if (response.ok) {
    return { ok: true, provider: "formsubmit" };
  }

  return {
    ok: false,
    provider: "formsubmit",
    status: response.status,
    body: await response.text().catch(() => "")
  };
};

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { message: "POSTのみ対応しています。" });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail =
    process.env.SMTP_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    "株式会社HAYASHI CREATIVE <onboarding@resend.dev>";

  if (!toEmail || (!resendApiKey && !hasSmtpConfig())) {
    return json(response, 500, { message: "送信設定が未完了です。" });
  }

  let body;
  try {
    body = parseContactRequestBody(request);
  } catch {
    return json(response, 400, { message: "送信内容を読み取れませんでした。" });
  }

  if (!body) {
    return json(response, 400, { message: "送信内容を読み取れませんでした。" });
  }

  const contact = normalizeContact(body.contact || body.email || body.tel);
  const isContactEmail = isEmail(contact);
  const company = clean(body.company, 120);
  const suppliedName = clean(body.name, 80);
  const name = suppliedName || "お申し込み者";
  const phone = normalizePhone(body.phone || body.tel);
  const topic = clean(body.topic, 300);
  const message = clean(body.message, 2000);
  const sourcePage = clean(body.source_page, 200);
  const sourceLabel = clean(body.source_label, 200);
  const campaign = clean(body.campaign, 200);
  const offer = clean(body.offer, 300);
  const preferredMonth = clean(body.preferred_month, 120);
  const referrer = clean(body.referrer, 400);
  const currentUrl = clean(body.current_url, 400);

  if (!contact) {
    return json(response, 400, { message: "メールアドレスを入力してください。" });
  }

  if (!isContactEmail) {
    return json(response, 400, { message: "メールアドレスの形式を確認してください。" });
  }

  if (!company) {
    return json(response, 400, { message: "会社名を入力してください。" });
  }

  if (!suppliedName) {
    return json(response, 400, { message: "お名前を入力してください。" });
  }

  if (!phone) {
    return json(response, 400, { message: "電話番号を入力してください。" });
  }

  if (!isValidPhone(phone)) {
    return json(response, 400, { message: "電話番号の形式を確認してください。" });
  }

  const subjectPrefix = campaign || "30分診断";
  const subject = `${subjectPrefix}の申し込み｜${company || name}`;
  const text = [
    "株式会社HAYASHI CREATIVEのLPから申し込みがありました。",
    "",
    `連絡先：${contact}`,
    "連絡先種別：メールアドレス",
    `電話番号：${phone}`,
    `お名前：${name}`,
    `会社名：${company || "未入力"}`,
    `相談の概略：${topic || "未選択"}`,
    `希望参加月：${preferredMonth || "未入力"}`,
    "",
    "流入情報：",
    `流入元ラベル：${sourceLabel || "未設定"}`,
    `流入ページ：${sourcePage || "未設定"}`,
    `キャンペーン：${campaign || "未設定"}`,
    `特典：${offer || "未設定"}`,
    `現在URL：${currentUrl || "未取得"}`,
    `参照元：${referrer || "direct/未取得"}`,
    "",
    "相談したい内容：",
    message || "未入力",
    "",
    `希望：${topic || campaign || "30分無料診断"}`
  ].join("\n");

  const resendPayload = {
    from: fromEmail,
    to: [toEmail],
    subject,
    text
  };

  resendPayload.reply_to = contact;

  const resendResponse = await sendTransactionalEmail(resendPayload);

  if (!resendResponse.ok) {
    console.error("Contact email error", {
      provider: resendResponse.provider,
      status: resendResponse.status,
      body: resendResponse.body
    });
    return json(response, 502, { message: "メール送信に失敗しました。送信設定を確認してください。" });
  }

  let autoReplySent = false;

  const autoReplyText = [
    suppliedName ? `${suppliedName} 様` : "お申し込み者様",
      "",
      "株式会社HAYASHI CREATIVEです。",
      "30分無料診断のお申し込みを受け付けました。",
      "",
      "内容を確認し、通常1〜2営業日以内にご連絡します。",
      "",
      "弊社からの返信が届くよう、迷惑メールフォルダの確認と、以下の差出人からの受信許可をお願いします。",
      `差出人：${fromEmail}`,
      "",
      "ご相談内容：",
      topic || "未選択",
      "",
      "補足：",
      message || "未入力",
      "",
      "フォームから送信できない場合や返信が届かない場合は、ページ内のLINE QRコードから「30分診断希望」と送ってください。",
      "",
      "株式会社HAYASHI CREATIVE"
  ].join("\n");

  const autoReplyResponse = await sendTransactionalEmail({
    from: fromEmail,
    to: [contact],
    reply_to: toEmail,
    subject: "30分無料診断のお申し込みを受け付けました",
    text: autoReplyText
  });

  if (autoReplyResponse.ok) {
    autoReplySent = true;
  } else {
    const errorText = autoReplyResponse.body || "";
    console.error("Auto reply email error", {
      provider: autoReplyResponse.provider,
      status: autoReplyResponse.status,
      body: errorText
    });

    const fallbackResponse = await sendFallbackAutoReply({
      email: contact,
      name,
      subject: "30分無料診断のお申し込みを受け付けました",
      text: autoReplyText,
      summary: [
        "受付確認メールの補助送信です。",
        "",
        `お名前：${name}`,
        `メールアドレス：${contact}`,
        `会社名：${company || "未入力"}`,
        `相談の概略：${topic || "未選択"}`,
        "",
        "相談したい内容：",
        message || "未入力"
      ].join("\n")
    });

    if (fallbackResponse.ok) {
      autoReplySent = true;
    } else {
      console.error("Fallback auto reply email error", {
        provider: fallbackResponse.provider,
        status: fallbackResponse.status,
        body: fallbackResponse.body
      });
    }

    if (!autoReplySent) await sendTransactionalEmail({
      from: fromEmail,
      to: [toEmail],
      reply_to: contact,
      subject: `要対応：申込者への受付確認メール未送信｜${company || name}`,
      text: [
        "申込者への受付確認メールが送信できませんでした。",
        "Resendの送信制限、送信元ドメイン未認証、または宛先側の制限が原因の可能性があります。",
        "",
        "この申込者には手動で受付完了の連絡をしてください。",
        "",
        `連絡先：${contact}`,
        `お名前：${name}`,
        `会社名：${company || "未入力"}`,
        `相談の概略：${topic || "未選択"}`,
        "",
        "相談したい内容：",
        message || "未入力",
        "",
        "自動返信エラー：",
        `status: ${autoReplyResponse.status}`,
        errorText || "詳細なし"
      ].join("\n")
    }).catch((error) => {
      console.error("Auto reply fallback notice error", error);
    });
  }

  return json(response, 200, {
    ok: true,
    autoReplySent,
    autoReplyEligible: true,
    smsAutoReplySent: false,
    smsAutoReplySkipped: true
  });
};
