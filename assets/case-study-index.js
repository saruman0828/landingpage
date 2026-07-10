(() => {
  const themes = {
    "field-report":"報告・記録","care-handoff":"報告・記録","school-parent":"報告・記録","shop-manual":"教育・社内FAQ","retail-inventory-faq":"教育・社内FAQ","customer-support":"問い合わせ初動","ec-returns":"問い合わせ初動","insurance-claim-intake":"問い合わせ初動","clinic-reception":"問い合わせ初動","clinic-followup":"問い合わせ初動","hotel-multilingual":"問い合わせ初動","accounting-check":"経理・照合","accounting-reconciliation":"経理・照合","subsidy-files":"申請・書類確認","quote-flow":"見積・購買","procurement-compare":"見積・購買","legal-contract":"見積・購買","recruiting-flow":"採用・予約","recruiting-scorecard":"採用・予約","salon-booking":"採用・予約","store-shift":"採用・予約","delivery-dispatch":"在庫・配車・計画","restaurant-prep":"在庫・配車・計画","agriculture-packing":"在庫・配車・計画","manufacturing-quality":"在庫・配車・計画","property-maintenance":"報告・記録","sales-follow":"見積・購買","sales-lost-follow":"見積・購買","npo-volunteer":"採用・予約","bcp-checklist":"申請・書類確認"
  };
  const grid = document.querySelector(".case-grid"); if (!grid) return;
  const cards = [...grid.querySelectorAll(".case-card")];
  cards.forEach((card) => { const id = card.getAttribute("href")?.replace(/\.html$/, "") || ""; const theme = themes[id] || "業務改善"; card.dataset.theme = theme; card.querySelector("span")?.insertAdjacentHTML("afterend", `<span class="case-type">改善イメージ</span><span class="case-theme">${theme}</span>`); });
  const controls = document.createElement("div"); controls.className = "case-filter"; controls.innerHTML = `<p>止まっている仕事から選ぶ</p><div>${["すべて", ...new Set(Object.values(themes))].map((theme) => `<button type="button" data-theme="${theme}"${theme === "すべて" ? ' aria-pressed="true"' : ""}>${theme}</button>`).join("")}</div>`; grid.before(controls);
  const more = document.createElement("button"); more.type = "button"; more.className = "case-more button secondary"; more.textContent = "さらに事例を見る"; grid.after(more);
  const apply = (theme) => { cards.forEach((card, index) => { card.hidden = !(theme === "すべて" || card.dataset.theme === theme) || (theme === "すべて" && index > 8); }); more.hidden = theme !== "すべて" || cards.length <= 9; controls.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.theme === theme))); };
  more.addEventListener("click", () => { cards.forEach((card) => { card.hidden = false; }); more.hidden = true; });
  controls.addEventListener("click", (event) => { const button = event.target.closest("button[data-theme]"); if (button) apply(button.dataset.theme); }); apply("すべて");
})();
