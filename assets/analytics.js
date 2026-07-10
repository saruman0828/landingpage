(() => {
  if (window.SiteAnalytics) return;

  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };

  const script = document.createElement("script");
  script.defer = true;
  script.src = "/_vercel/insights/script.js";
  script.dataset.siteAnalytics = "vercel";
  document.head.appendChild(script);

  const getSessionId = () => {
    try {
      const key = "lp_analytics_session_id";
      const existing = window.sessionStorage.getItem(key);
      if (existing) return existing;
      const generated = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      window.sessionStorage.setItem(key, generated);
      return generated;
    } catch {
      return "";
    }
  };

  const clean = (value, max = 120) => String(value || "").replace(/\s+/g, " ").trim().slice(0, max);

  const sendLegacyEvent = (payload) => {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon && navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }))) return;
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true
    }).catch(() => null);
  };

  const track = (event, details = {}, options = {}) => {
    const safeDetails = Object.fromEntries(
      Object.entries(details)
        .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value) || value === null)
        .slice(0, 2)
        .map(([key, value]) => [key, typeof value === "string" ? clean(value, 255) : value])
    );

    if (options.vercel !== false) window.va("event", { name: event, data: safeDetails });

    sendLegacyEvent({
      event,
      page: document.body.dataset.analyticsPage || "site",
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer || "",
      sessionId: getSessionId(),
      ...details
    });
  };

  window.SiteAnalytics = { track };

  const start = () => {
    const copyVersion = document.body.dataset.copyVersion || "";
    track("page_view", {}, { vercel: false });

    if (copyVersion) {
      try { window.sessionStorage.setItem("lp_copy_version", copyVersion); } catch {}
      track("copy_view", { version: copyVersion, page: window.location.pathname });
    }

    if (/\/case-studies\/[^/]+\.html$/.test(window.location.pathname) && !window.location.pathname.endsWith("/index.html")) {
      track("case_view", { article: document.title, path: window.location.pathname });
    }

    document.addEventListener("click", (clickEvent) => {
      const target = clickEvent.target instanceof Element ? clickEvent.target.closest("a, button") : null;
      if (!target) return;
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "";
      const label = clean(target.textContent || target.getAttribute("aria-label") || "", 120);
      const section = target.closest("section")?.id || "page";
      const isCaseLink = href.includes("case-studies/") || (window.location.pathname.includes("/case-studies/") && /\.html(?:#.*)?$/.test(href));
      const isExternal = /^https?:\/\//.test(href) && !href.startsWith(window.location.origin);
      const isNavigation = Boolean(target.closest("nav")) || target.classList.contains("nav-cta");
      const isCta = target.classList.contains("button") || target.classList.contains("nav-cta") || ["#contact", "#apply"].includes(href);

      if (isCaseLink) track("case_open", { label, target: href });
      else if (isExternal) track("outbound_click", { label, target: href });
      else if (isNavigation) track("nav_click", { label, location: section });
      else if (isCta) track("cta_click", { label, location: section });
    });

    const reached = new Set();
    window.addEventListener("scroll", () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (available <= 0) return;
      const percentage = Math.round((window.scrollY / available) * 100);
      [50, 90].forEach((depth) => {
        if (percentage >= depth && !reached.has(depth)) {
          reached.add(depth);
          track("scroll_depth", { depth, page: window.location.pathname });
        }
      });
    }, { passive: true });

    try {
      const pending = JSON.parse(window.sessionStorage.getItem("lp_pending_conversion") || "null");
      if (pending && window.location.pathname.endsWith("/thanks.html")) {
        track("lead_completed", {
          form: pending.form || "contact",
          version: window.sessionStorage.getItem("lp_copy_version") || "unknown"
        });
        window.sessionStorage.removeItem("lp_pending_conversion");
      }
    } catch {}
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
