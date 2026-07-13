(() => {
  const caseTitle = document.querySelector(".blog-hero h1")?.textContent?.trim() || "この事例";
  const caseFile = window.location.pathname.split("/").pop()?.replace(/\.html$/, "") || "case-study";
  const themeFor = (file) => {
    if (/accounting|subsidy/.test(file)) return "経理・照合";
    if (/customer|insurance|clinic|hotel|call-summary/.test(file)) return "問い合わせ初動";
    if (/recruiting|salon|store-shift/.test(file)) return "採用・予約";
    if (/field|care|school|shop-manual|retail/.test(file)) return "報告・記録";
    if (/fax-order/.test(file)) return "受注・帳票";
    if (/quote|procurement|legal/.test(file)) return "見積・購買";
    if (/delivery|restaurant|agriculture|manufacturing|food-expiry/.test(file)) return "在庫・配車・計画";
    return "業務改善";
  };
  const theme = themeFor(caseFile);
  const params = new URLSearchParams({ case: caseFile, title: caseTitle, theme });

  const renderAdoptionSteps = () => `
    <section class="blog-section">
      <p class="eyebrow">自社で始めるなら</p>
      <h2>毎週繰り返す仕事を一つ選び、少ない件数で試します。</h2>
      <div class="blog-adoption-steps">
        <div><span>1</span><strong>試す仕事と件数を決める</strong><p>毎週時間を取られる仕事から一つ選び、最初は一部署・数件に絞ります。</p></div>
        <div><span>2</span><strong>AIへ入れてよい情報を決める</strong><p>会社が利用を認めたAIだけを使います。個人名や機密情報は必要な分だけに絞り、保存・学習設定と閲覧権限も先に決めます。</p></div>
        <div><span>3</span><strong>入力物と完成形を決める</strong><p>写真、メール、帳票、メモのどれを読み込ませ、一覧、報告書、返信案のどれを作るか決めます。</p></div>
        <div><span>4</span><strong>原本と比べて誤りを記録する</strong><p>担当者が金額、契約、安全、個人情報、送信文面を原本と見比べ、誤りと修正時間を記録します。</p></div>
      </div>
    </section>`;

  const renderCaseCta = () => `
    <p class="blog-case-return"><a href="index.html">ほかの改善事例から、近い仕事を探す</a></p>
    <section class="blog-cta">
      <p class="eyebrow">相談</p>
      <h2>自社業務を自動化する</h2>
      <p>負担になっている作業を一つお聞かせください。今ある資料で試せる進め方をご案内します。</p>
      <a class="button primary large" data-case-cta href="../index.html?${params.toString()}#contact">30分無料診断</a>
    </section>`;

  document.querySelectorAll("[data-case-study-adoption]").forEach((mount) => { mount.outerHTML = renderAdoptionSteps(); });
  document.querySelectorAll("[data-case-study-cta]").forEach((mount) => { mount.outerHTML = renderCaseCta(); });
})();
