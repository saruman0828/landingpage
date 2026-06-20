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
const isPhone = (value) => {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15 && /^[+()\d-]+$/.test(value);
};

module.exports = async (request, response) => {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return json(response, 405, { message: "POSTのみ対応しています。" });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "株式会社HAYASHI CREATIVE <onboarding@resend.dev>";

  if (!resendApiKey || !toEmail) {
    return json(response, 500, { message: "送信設定が未完了です。" });
  }

  let body = {};
  if (typeof request.body === "string") {
    try {
      body = JSON.parse(request.body);
    } catch {
      return json(response, 400, { message: "送信内容を読み取れませんでした。" });
    }
  } else if (typeof request.body === "object" && request.body) {
    body = request.body;
  }

  const contact = normalizeContact(body.contact || body.email || body.tel);
  const isContactEmail = isEmail(contact);
  const isContactPhone = isPhone(contact);
  const company = clean(body.company, 120);
  const name = clean(body.name, 80);
  const topic = clean(body.topic, 300);
  const message = clean(body.message, 2000);

  if (!contact || !name) {
    return json(response, 400, { message: "連絡先とお名前を入力してください。" });
  }

  if (!isContactEmail && !isContactPhone) {
    return json(response, 400, { message: "メールアドレスまたは電話番号の形式を確認してください。" });
  }

  const subject = `30分診断の申し込み｜${company || name}`;
  const text = [
    "株式会社HAYASHI CREATIVEのLPから30分診断の申し込みがありました。",
    "",
    `連絡先：${contact}`,
    `連絡先種別：${isContactEmail ? "メールアドレス" : "電話番号"}`,
    `お名前：${name}`,
    `会社名：${company || "未入力"}`,
    `相談の概略：${topic || "未選択"}`,
    "",
    "相談したい内容：",
    message || "未入力",
    "",
    "希望：30分無料診断"
  ].join("\n");

  const resendPayload = {
    from: fromEmail,
    to: [toEmail],
    subject,
    text
  };

  if (isContactEmail) {
    resendPayload.reply_to = contact;
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(resendPayload)
  });

  if (!resendResponse.ok) {
    const errorText = await resendResponse.text().catch(() => "");
    console.error("Resend email error", {
      status: resendResponse.status,
      body: errorText
    });
    return json(response, 502, { message: "メール送信に失敗しました。送信設定を確認してください。" });
  }

  return json(response, 200, { ok: true });
};
