export const leadRequiredFields = ["company", "name", "email"] as const;

export const leadLabels: Record<string, string> = {
  company: "会社名",
  name: "氏名",
  role: "役職",
  email: "メールアドレス",
  employees: "従業員数",
  issue: "相談内容",
  phone: "電話番号",
  variant: "LP種別",
  sourcePage: "送信元ページ",
  pagePath: "送信元URL",
};

export type LeadPayload = Record<string, FormDataEntryValue | string>;

export class LeadFormError extends Error {
  status: number;
  code: string;
  missing: string[];

  constructor({
    status,
    code,
    missing = [],
    message,
  }: {
    status: number;
    code: string;
    missing?: string[];
    message?: string;
  }) {
    super(message || code);
    this.name = "LeadFormError";
    this.status = status;
    this.code = code;
    this.missing = missing;
  }
}

export const clean = (value: unknown, maxLength = 1200) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
};

export const normalizeEmail = (value: unknown) =>
  clean(value, 200)
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[‐‑‒–—―ー−]/g, "-")
    .toLowerCase();

export const normalizePhone = (value: unknown) =>
  clean(value, 80)
    .normalize("NFKC")
    .replace(/[‐‑‒–—―ー−－ｰ]/g, "")
    .replace(/[^\d+]/g, "");

export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const isValidPhone = (value: string) => /^\+?\d{10,15}$/.test(normalizePhone(value));

export const formDataToLeadPayload = (
  form: HTMLFormElement,
  extra: Record<string, string> = {},
): LeadPayload => ({
  ...Object.fromEntries(new FormData(form).entries()),
  ...extra,
});

export const normalizeLeadPayload = (body: Record<string, unknown>) => {
  const email = normalizeEmail(body.email);
  const phone = normalizePhone(body.phone);

  return {
    company: clean(body.company, 120),
    name: clean(body.name, 80),
    role: clean(body.role, 80),
    email,
    employees: clean(body.employees, 80),
    issue: clean(body.issue, 2000),
    phone,
    variant: clean(body.variant, 80) || "unknown",
    sourcePage: clean(body.sourcePage, 120) || "不明",
    pagePath: clean(body.pagePath, 300),
  };
};

export const validateLeadPayload = (body: Record<string, unknown>) => {
  const missing = leadRequiredFields.filter((field) => !String(body[field] ?? "").trim());

  if (missing.length > 0) {
    return { ok: false as const, error: "missing_fields", missing };
  }

  const email = normalizeEmail(body.email);
  if (!isEmail(email)) {
    return { ok: false as const, error: "invalid_email", missing: [] };
  }

  const phone = normalizePhone(body.phone);
  if (phone && !isValidPhone(phone)) {
    return { ok: false as const, error: "invalid_phone", missing: [] };
  }

  return { ok: true as const, lead: normalizeLeadPayload(body) };
};

export const getLeadSubmitErrorMessage = (error: unknown) => {
  if (error instanceof LeadFormError) {
    if (error.code === "missing_fields") {
      const labels = error.missing.map((field) => leadLabels[field] || field).join("、");
      return `${labels || "必須項目"}を入力してください。`;
    }

    if (error.code === "invalid_email") {
      return "メールアドレスの形式を確認してください。";
    }

    if (error.code === "invalid_phone") {
      return "電話番号の形式を確認してください。電話番号は任意です。空欄でも送信できます。";
    }
  }

  return "送信できませんでした。時間をおいて再度お試しください。お急ぎの場合は直接ご連絡ください。";
};

export const submitLeadForm = async (payload: LeadPayload) => {
  const response = await fetch("/api/diagnosis", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new LeadFormError({
      status: response.status,
      code: typeof result.error === "string" ? result.error : "submit_failed",
      missing: Array.isArray(result.missing) ? result.missing.map(String) : [],
    });
  }

  return result as { ok?: boolean; autoReplySent?: boolean };
};
