(() => {
  const themes = {
    "fax-order-intake":"受注・帳票","call-summary-log":"問い合わせ初動","food-expiry-intake":"在庫・配車・計画","field-report":"報告・記録","care-handoff":"報告・記録","school-parent":"報告・記録","shop-manual":"教育・社内FAQ","customer-support":"問い合わせ初動","insurance-claim-intake":"問い合わせ初動","clinic-reception":"問い合わせ初動","hotel-multilingual":"問い合わせ初動","accounting-check":"経理・照合","accounting-reconciliation":"経理・照合","quote-flow":"見積・購買","procurement-compare":"見積・購買","legal-contract":"申請・契約・書類","recruiting-flow":"人員・採用・予約","recruiting-scorecard":"人員・採用・予約","salon-booking":"人員・採用・予約","store-shift":"人員・採用・予約","delivery-dispatch":"在庫・配車・計画","restaurant-prep":"在庫・配車・計画","agriculture-packing":"在庫・配車・計画","manufacturing-quality":"点検・安全","property-maintenance":"報告・記録","sales-follow":"営業・追客"
  };
  const grid = document.querySelector(".case-grid"); if (!grid) return;
  const cards = [...grid.querySelectorAll(".case-card")];
  cards.forEach((card) => { const id = card.querySelector("h3 a")?.getAttribute("href")?.replace(/\.html$/, "") || ""; const theme = themes[id] || "業務改善"; card.dataset.theme = theme; });
  const controls = document.createElement("div"); controls.className = "case-filter"; controls.setAttribute("role", "group"); controls.setAttribute("aria-label", "事例を業務別に絞り込む"); controls.innerHTML = `<div>${["すべて", ...new Set(Object.values(themes))].map((theme) => `<button type="button" data-theme="${theme}"${theme === "すべて" ? ' aria-pressed="true"' : ' aria-pressed="false"'}>${theme}</button>`).join("")}</div>`; grid.before(controls);
  const apply = (theme) => { cards.forEach((card) => { card.hidden = !(theme === "すべて" || card.dataset.theme === theme); }); controls.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.theme === theme))); };
  controls.querySelectorAll("button[data-theme]").forEach((button) => { button.addEventListener("click", () => apply(button.dataset.theme)); }); apply("すべて");
})();
