(() => {
  const caseTitle = document.querySelector(".blog-hero h1")?.textContent?.trim() || "この事例";
  const caseFile = window.location.pathname.split("/").pop()?.replace(/\.html$/, "") || "case-study";
  const themeFor = (file) => {
    if (/accounting|subsidy/.test(file)) return "経理・照合";
    if (/customer|ec-|insurance|clinic|hotel/.test(file)) return "問い合わせ初動";
    if (/recruiting|salon|store-shift/.test(file)) return "採用・予約";
    if (/field|care|school|shop-manual|retail/.test(file)) return "報告・記録";
    if (/quote|procurement|legal/.test(file)) return "見積・購買";
    if (/delivery|restaurant|agriculture|manufacturing/.test(file)) return "在庫・配車・計画";
    return "業務改善";
  };
  const theme = themeFor(caseFile);
  const params = new URLSearchParams({ case: caseFile, title: caseTitle, theme });

  const renderAdoptionSteps = () => `
    <section class="blog-section">
      <p class="eyebrow">自社で始めるなら</p>
      <h2>まずは、${theme}に関わる1作業から試せます。</h2>
      <div class="blog-adoption-steps">
        <div><span>1</span><strong>止まりやすい作業を一つ選ぶ</strong><p>毎週くり返す${theme}の仕事から、試す範囲を小さく決めます。</p></div>
        <div><span>2</span><strong>使う資料と下書きの形を決める</strong><p>写真、メール、帳票、メモのうち、何を読み込ませて何を作るかを決めます。</p></div>
        <div><span>3</span><strong>一件だけ試し、担当者が見る点を決める</strong><p>金額、契約、安全、個人情報、外部送信は、担当者が内容を見直してから使います。</p></div>
      </div>
    </section>`;

  const renderCaseCta = () => `
    <p class="blog-case-return"><a href="index.html">ほかの改善事例から、近い仕事を探す</a></p>
    <section class="blog-cta">
      <p class="eyebrow">相談</p>
      <h2>${caseTitle}に近い業務を相談する</h2>
      <p>見ていた事例の内容は相談フォームへ引き継がれます。自社との違いだけをお聞かせください。</p>
      <a class="button primary large" data-case-cta href="../index.html?${params.toString()}#contact">30分無料診断</a>
    </section>`;

  document.querySelectorAll("[data-case-study-adoption]").forEach((mount) => { mount.outerHTML = renderAdoptionSteps(); });
  document.querySelectorAll("[data-case-study-cta]").forEach((mount) => { mount.outerHTML = renderCaseCta(); });
  document.querySelectorAll(".blog-meta").forEach((meta) => { meta.insertAdjacentHTML("afterbegin", `<span>事例種別: 改善イメージ</span><span>テーマ: ${theme}</span>`); });
})();
