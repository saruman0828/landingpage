(() => {
  const renderAdoptionSteps = () => `
    <section class="blog-section">
      <p class="eyebrow">自社で始めるなら</p>
      <h2>まずは、毎週くり返している1作業から見直します。</h2>
      <div class="blog-adoption-steps">
        <div><span>Step 1</span><strong>くり返し発生する作業を1つ選ぶ</strong><p>頻度が高く、材料が残っていて、時間を測れるものから始めます。</p></div>
        <div><span>Step 2</span><strong>AIに渡す材料を固定する</strong><p>フォルダ、メール条件、写真の置き場、入力項目を決めます。</p></div>
        <div><span>Step 3</span><strong>確認しやすい形を決める</strong><p>一覧表、返信下書き、チェックリスト、報告書など、担当者が直しやすい形にします。</p></div>
        <div><span>Step 4</span><strong>人が見る判断を決める</strong><p>金額、契約、安全、個人情報、外部送信など、必ず人が確認する点を先に決めます。</p></div>
      </div>
    </section>`;

  const renderCaseReturn = () => `
    <a class="blog-case-return" href="index.html">
      <img src="../images/338_webref_case_study_card_grid.png" alt="改善事例の一覧イメージ" loading="lazy" />
      <span>改善事例 一覧へ戻る</span>
    </a>`;

  const renderCaseCta = () => `
    ${renderCaseReturn()}
    <section class="blog-cta">
      <p class="eyebrow">相談</p>
      <h2>自社業務を自動化する</h2>
      <p>写真、メール、Excel、メモなど実際の材料を見ながら、AIに渡す準備と人が確認する判断を分けます。</p>
      <a class="button primary large" href="../index.html#contact">30分無料診断</a>
    </section>`;

  document.querySelectorAll("[data-case-study-adoption]").forEach((mount) => {
    mount.outerHTML = renderAdoptionSteps();
  });

  document.querySelectorAll("[data-case-study-cta]").forEach((mount) => {
    mount.outerHTML = renderCaseCta();
  });
})();
