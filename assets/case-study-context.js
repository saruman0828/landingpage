(() => {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");
  const theme = params.get("theme");
  const caseId = params.get("case");
  if (!title || !caseId) return;
  const intake = document.getElementById("contact-intake");
  if (intake) {
    const notice = document.createElement("p");
    notice.className = "case-context-notice";
    notice.textContent = `「${title}」を見た方へ。事例の内容を引き継いで相談できます。`;
    intake.prepend(notice);
  }
  const form = document.getElementById("contact-form");
  if (!form) return;
  [["source_case_id", caseId], ["source_case_title", title], ["source_case_theme", theme || ""]].forEach(([name, value]) => {
    const input = document.createElement("input"); input.type = "hidden"; input.name = name; input.value = value; form.appendChild(input);
  });
  if (theme) {
    const topic = form.elements.topic;
    const preferred = theme === "経理・照合" ? "経理・事務担当として、確認や入力の抜け漏れに困っている" : theme === "問い合わせ初動" ? "営業・問い合わせ対応で、返信や見積確認を減らしたい" : "まず何をAIに任せられるか相談したい";
    if (topic?.querySelector(`option[value="${preferred}"]`)) topic.value = preferred;
  }
})();
