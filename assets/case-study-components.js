(() => {
  const currentFile = window.location.pathname.split("/").pop() || "index.html";

  const relatedLinks = [
    ["field-report.html", "帰社後の報告を軽く"],
    ["store-shift.html", "閉店後のシフト迷いを減らす"],
    ["quote-flow.html", "見積前の探し物を減らす"],
    ["shop-manual.html", "店長への質問を減らす"],
    ["customer-support.html", "返信できる順に並べる"],
    ["accounting-check.html", "月末の差異だけ見る"],
    ["recruiting-scorecard.html", "面接メモを比べやすく"],
    ["clinic-reception.html", "朝の問診確認を静かに"],
    ["sales-follow.html", "商談後すぐ次の一手へ"],
    ["index.html", "すべての改善ケースを見る"],
  ];

  const renderRelatedLinks = () => `
    <aside class="blog-toc">
      <span>近い悩みから読む</span>
      ${relatedLinks
        .map(([href, label]) => `<a${href === currentFile ? ' class="is-current"' : ""} href="${href}">${label}</a>`)
        .join("")}
    </aside>`;

  const renderAdoptionSteps = () => `
    <section class="blog-section">
      <p class="eyebrow">真似する順番</p>
      <h2>最初は、毎週必ず発生する1作業だけで十分です。</h2>
      <div class="blog-adoption-steps">
        <div><span>Step 1</span><strong>繰り返し発生する作業を1つ選ぶ</strong><p>頻度が高く、材料が残っていて、時間を測れるものから始めます。</p></div>
        <div><span>Step 2</span><strong>AIに渡す材料を固定する</strong><p>フォルダ、メール条件、写真の置き場、入力項目を決めます。</p></div>
        <div><span>Step 3</span><strong>出力の型を決める</strong><p>一覧表、返信下書き、チェックリスト、報告書など確認しやすい形にします。</p></div>
        <div><span>Step 4</span><strong>承認点を明文化する</strong><p>どこから人が見るか、どこから外へ出してよいかを先に決めます。</p></div>
      </div>
    </section>`;

  const renderCaseCta = () => `
    <section class="blog-cta">
      <p class="eyebrow">自社に置き換える</p>
      <h2>御社なら、どの作業をAIへ渡せるか。</h2>
      <p>いきなり全社導入ではなく、毎週発生する1業務から、材料、出力、承認点を整理します。</p>
      <a class="button primary large" href="../index.html#contact">30分無料診断を申し込む</a>
    </section>`;

  document.querySelectorAll("[data-case-study-toc]").forEach((mount) => {
    mount.outerHTML = renderRelatedLinks();
  });

  document.querySelectorAll("[data-case-study-adoption]").forEach((mount) => {
    mount.outerHTML = renderAdoptionSteps();
  });

  document.querySelectorAll("[data-case-study-cta]").forEach((mount) => {
    mount.outerHTML = renderCaseCta();
  });
})();
