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
      <h2>まずは、手間や判断が集中する1作業から試せます。</h2>
      <div class="blog-adoption-steps">
        <div><span>1</span><strong>負担になっている作業を一つ選ぶ</strong><p>時間がかかる、迷いやすい、担当者へ集中する仕事から、試す範囲を一つ決めます。</p></div>
        <div><span>2</span><strong>入力する情報を安全な範囲に絞る</strong><p>会社が利用を認めたAIだけを使い、個人名や機密情報は必要な分だけにします。可能なら匿名化し、保存・学習設定と閲覧権限も事前に決めます。決まるまでは実データを入力しません。</p></div>
        <div><span>3</span><strong>使う資料と下書きの形を決める</strong><p>写真、メール、帳票、メモのうち、何を読み込ませて何を作るかを決めます。</p></div>
        <div><span>4</span><strong>一件だけ試し、担当者が見る点を決める</strong><p>金額、契約、安全、個人情報、外部送信は、担当者が内容を見直してから使います。</p></div>
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
