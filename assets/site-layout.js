(() => {
  const currentScript = document.currentScript;
  const scriptSrc = currentScript ? currentScript.getAttribute("src") || "" : "";
  const rootPrefix = scriptSrc.includes("../assets/") ? "../" : "";
  const toRoot = (path) => `${rootPrefix}${path}`;

  if (!window.SiteAnalytics && !document.querySelector('script[data-site-analytics="shared"]')) {
    const analyticsScript = document.createElement("script");
    analyticsScript.src = toRoot("assets/analytics.js");
    analyticsScript.dataset.siteAnalytics = "shared";
    document.head.appendChild(analyticsScript);
  }

  const pageName = window.location.pathname.split("/").pop() || "index.html";

  const mainNav = [
    { label: "AI研修", href: toRoot("training.html"), key: "training", mobilePriority: true },
    { label: "実績", href: toRoot("index.html#results"), key: "results" },
    { label: "ご支援の進め方", href: toRoot("index.html#price"), key: "price" },
  ];

  const homepageNav = [
    { label: "サービス", href: "#results" },
    { label: "AI研修", href: toRoot("training.html") },
    { label: "実績", href: "#results" },
    { label: "流れ", href: "#price" },
  ];

  const inferActive = () => {
    if (pageName === "training.html") return "training";
    return "";
  };

  const renderMainHeader = (active) => `
    <header class="topbar">
      <a class="brand" href="${toRoot("index.html#hero")}">社長の右腕AI</a>
      <nav aria-label="主要ナビゲーション">
        ${mainNav
          .map((item) => `<a${item.mobilePriority ? ' class="mobile-priority"' : ""} href="${item.href}"${item.key === active ? ' aria-current="page"' : ""}>${item.label}</a>`)
          .join("")}
        <a class="nav-cta" href="${toRoot("index.html#contact")}">30分無料診断</a>
      </nav>
    </header>`;

  const renderHomepageHeader = () => `
    <header class="site-header">
      <a class="brand" href="#top" aria-label="株式会社HAYASHI CREATIVE トップへ">
        <span class="brand-mark">HC</span>
        <span>HAYASHI CREATIVE</span>
      </a>
      <nav class="site-nav" aria-label="主要ナビゲーション">
        ${homepageNav.map((item) => `<a href="${item.href}">${item.label}</a>`).join("")}
        <a class="nav-button" href="#contact">相談する</a>
      </nav>
    </header>`;

  const renderFooter = (variant) => `
    <footer${variant === "homepage" ? ' class="site-footer"' : ""}>
      <p>© 株式会社HAYASHI CREATIVE. All rights reserved.</p>
    </footer>`;

  document.querySelectorAll("[data-site-header]").forEach((mount) => {
    const variant = mount.dataset.siteHeader || "main";
    const active = mount.dataset.active || inferActive();
    mount.outerHTML = variant === "homepage" ? renderHomepageHeader() : renderMainHeader(active);
  });

  document.querySelectorAll("[data-site-footer]").forEach((mount) => {
    const variant = mount.dataset.siteFooter || "main";
    mount.outerHTML = renderFooter(variant);
  });
})();
