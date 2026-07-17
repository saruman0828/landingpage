const { readSummary } = require("./analytics-store");

const json = (response, statusCode, body) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
};

module.exports = async (request, response) => {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return json(response, 405, { ok: false });
  }

  const summary = await readSummary().catch((error) => {
    console.error("lp_analytics_summary_failed", error);
    return {
      ok: false,
      site: "main",
      siteLabel: "メインページ",
      message: "集計を読み取れませんでした。"
    };
  });

  return json(response, summary.ok === false ? 500 : 200, summary);
};
