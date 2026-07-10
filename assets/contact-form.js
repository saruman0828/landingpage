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

  const createFieldHeader = (field) => {
    const header = createElement("span", { className: "field-label" });
    header.appendChild(document.createTextNode(field.label || ""));

    if (field.required) {
      header.appendChild(createElement("span", {
        className: "form-required",
        text: "*",
        "aria-label": "必須"
      }));
    }

    return header;
  };

  const createLabel = (field) => {
    const label = createElement("label", { className: field.wide ? "wide" : "" });
    label.appendChild(createFieldHeader(field));

    if (field.note && field.note !== "必須" && field.note !== "任意") {
      label.appendChild(createElement("span", { className: "field-note", text: field.note }));
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
      phoneInput.setCustomValidity("電話番号の形式を確認してください。空欄でも送信できます。");
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

        await response.json().catch(() => ({}));

        if (typeof config.onSubmitSuccess === "function") {
          config.onSubmitSuccess(payload);
        }
        try {
          window.sessionStorage.setItem("lp_pending_conversion", JSON.stringify({
            form: config.id || "contact",
            createdAt: Date.now()
          }));
        } catch {}
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
