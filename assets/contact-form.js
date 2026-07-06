(function () {
  const DEFAULT_ENDPOINT = "/api/contact";
  const DEFAULT_SUCCESS_URL = "/thanks.html";

  const normalizeEmail = (value) => String(value || "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[‐‑‒–—―ー−]/g, "-")
    .toLowerCase();

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const normalizePhone = (value) => String(value || "")
    .normalize("NFKC")
    .replace(/[‐‑‒–—―ー−－ｰ]/g, "")
    .replace(/[^\d+]/g, "");

  const isPhone = (value) => /^\+?\d{10,15}$/.test(normalizePhone(value));

  class SubmitError extends Error {
    constructor(message) {
      super(message || "submit_failed");
      this.name = "SubmitError";
    }
  }

  const createElement = (tagName, attributes = {}, children = []) => {
    const element = document.createElement(tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      if (value === undefined || value === null || value === false) return;
      if (key === "className") {
        element.className = value;
        return;
      }
      if (key === "text") {
        element.textContent = value;
        return;
      }
      if (key === "required") {
        element.required = Boolean(value);
        return;
      }
      element.setAttribute(key, value);
    });

    children.filter(Boolean).forEach((child) => element.appendChild(child));
    return element;
  };

  const createLabel = (field) => {
    const label = createElement("label", { className: field.wide ? "wide" : "" });
    label.appendChild(document.createTextNode(field.label || ""));

    if (field.note) {
      label.appendChild(createElement("span", { text: field.note }));
    }

    if (field.type === "select") {
      const select = createElement("select", { name: field.name, required: field.required });

      if (field.emptyLabel !== undefined) {
        select.appendChild(createElement("option", { value: "", text: field.emptyLabel }));
      }

      (field.options || []).forEach((option) => {
        const value = typeof option === "string" ? option : option.value;
        const text = typeof option === "string" ? option : option.label;
        select.appendChild(createElement("option", { value, text }));
      });

      label.appendChild(select);
      return label;
    }

    if (field.type === "textarea") {
      label.appendChild(createElement("textarea", {
        name: field.name,
        placeholder: field.placeholder,
        required: field.required
      }));
      return label;
    }

    const isEmailField = field.type === "email";
    label.appendChild(createElement("input", {
      type: isEmailField ? "text" : (field.type || "text"),
      name: field.name,
      autocomplete: field.autocomplete,
      inputmode: isEmailField ? "email" : field.inputmode,
      placeholder: field.placeholder,
      required: field.required
    }));

    return label;
  };

  const prepareEmailInput = (form) => {
    const emailInput = form.elements.email;
    if (!emailInput) return true;

    emailInput.value = normalizeEmail(emailInput.value);
    emailInput.setCustomValidity("");

    if (!emailInput.value) {
      emailInput.setCustomValidity("メールアドレスを入力してください。");
      return false;
    }

    if (!isEmail(emailInput.value)) {
      emailInput.setCustomValidity("メールアドレスの形式を確認してください。");
      return false;
    }

    return true;
  };

  const preparePhoneInput = (form) => {
    const phoneInput = form.elements.phone || form.elements.tel;
    if (!phoneInput) return true;

    phoneInput.value = normalizePhone(phoneInput.value);
    phoneInput.setCustomValidity("");

    if (phoneInput.value && !isPhone(phoneInput.value)) {
      phoneInput.setCustomValidity("電話番号の形式を確認してください。電話番号は任意です。空欄でも送信できます。");
      return false;
    }

    return true;
  };

  const readErrorMessage = async (response, fallback) => {
    const fallbackMessage = fallback || "送信できませんでした。時間をおいて再度お試しください。";
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await response.json().catch(() => null);
      return body && typeof body.message === "string" ? body.message : fallbackMessage;
    }

    const text = await response.text().catch(() => "");
    const message = text.trim();
    if (!message || /<\s*!doctype|<\s*html|<\s*body|<\s*h1/i.test(message)) {
      return fallbackMessage;
    }

    return message.slice(0, 160);
  };

  const sendFallbackAutoReply = async (payload, fallback) => {
    if (!fallback || !fallback.url) return;

    const name = payload.name || "お申し込み者";
    await fetch(fallback.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({
        email: payload.email,
        name,
        _subject: fallback.subject || "30分無料診断のお申し込み",
        _template: "table",
        _autoresponse: [
          `${name} 様`,
          "",
          "株式会社HAYASHI CREATIVEです。",
          "お申し込みを受け付けました。",
          "",
          "内容を確認し、通常1〜2営業日以内にご連絡します。",
          "",
          "ご相談内容：",
          payload.topic || "未選択",
          "",
          "補足：",
          payload.message || "未入力",
          "",
          "株式会社HAYASHI CREATIVE"
        ].join("\n"),
        message: [
          "受付確認メールの補助送信です。",
          "",
          `お名前：${name}`,
          `メールアドレス：${payload.email}`,
          `相談の概略：${payload.topic || "未選択"}`,
          "",
          "補足：",
          payload.message || "未入力"
        ].join("\n")
      })
    }).catch(() => null);
  };

  const mount = (target, config = {}) => {
    const root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) return;

    const form = createElement("form", {
      className: "contact-form",
      id: config.id,
      novalidate: "novalidate"
    });
    const grid = createElement("div", { className: "form-grid" });

    Object.entries(config.hidden || {}).forEach(([name, value]) => {
      form.appendChild(createElement("input", { type: "hidden", name, value }));
    });

    (config.fields || []).forEach((field) => grid.appendChild(createLabel(field)));
    form.appendChild(grid);

    const button = createElement("button", {
      className: config.submitClass || "button primary large",
      type: "submit",
      text: config.submitText || "送信する"
    });
    const status = createElement("p", {
      className: "form-status",
      id: config.statusId,
      role: "status",
      "aria-live": "polite"
    });

    form.appendChild(button);
    form.appendChild(status);
    root.replaceChildren(form);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const isValid = prepareEmailInput(form) && preparePhoneInput(form);
      if (!isValid || !form.reportValidity()) return;

      const originalText = button.textContent;
      const payload = Object.fromEntries(new FormData(form).entries());

      if (config.includePageContext !== false) {
        payload.referrer = document.referrer || "direct";
        payload.current_url = window.location.href;
      }

      if (typeof config.onSubmitAttempt === "function") {
        config.onSubmitAttempt(payload);
      }

      status.dataset.state = "";
      status.textContent = "送信中です。";
      button.disabled = true;
      button.textContent = "送信中...";

      try {
        const response = await fetch(config.endpoint || DEFAULT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new SubmitError(await readErrorMessage(response, config.errorText));
        }

        const result = await response.json().catch(() => ({ autoReplySent: false }));
        if (!result.autoReplySent && payload.email) {
          await sendFallbackAutoReply(payload, config.fallbackAutoReply);
        }

        if (typeof config.onSubmitSuccess === "function") {
          config.onSubmitSuccess(payload);
        }
        window.location.href = config.successUrl || DEFAULT_SUCCESS_URL;
      } catch (error) {
        if (typeof config.onSubmitError === "function") {
          config.onSubmitError(payload, error);
        }
        status.dataset.state = "error";
        status.textContent =
          error instanceof SubmitError
            ? error.message
            : (config.errorText || "送信できませんでした。時間をおいて再度お試しください。");
        button.disabled = false;
        button.textContent = originalText;
      }
    });
  };

  window.ContactForm = { mount };
}());
