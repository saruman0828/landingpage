const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const caseStudiesDir = path.join(rootDir, "case-studies");

const bannedImageCopy = [
  "場面です",
  "場面として",
  "見せます",
  "写っています",
  "している様子",
  "確認している様子",
  "確認する場面",
  "確認している場面",
  "分けている場面",
  "同じ机で確認",
  "肩越し",
  "レジ横の端末"
];

const bannedPublicCopy = [
  "ある日のナラティブ",
  "読みどころ",
  "御社なら、どの作業をAIへ渡せるか。",
  "30分無料診断を申し込む",
  "改善後に見えるもの"
];

const htmlFiles = fs
  .readdirSync(caseStudiesDir)
  .filter((fileName) => fileName.endsWith(".html"))
  .map((fileName) => path.join(caseStudiesDir, fileName))
  .sort();

const errors = [];

const lineNumberForIndex = (text, index) => text.slice(0, index).split(/\r?\n/).length;

const report = (filePath, line, message) => {
  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, "/");
  errors.push(`${relativePath}:${line} ${message}`);
};

const existsRelativeTo = (filePath, reference) => {
  if (/^(https?:|mailto:|tel:|data:|#)/.test(reference)) return true;
  return fs.existsSync(path.resolve(path.dirname(filePath), reference));
};

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const lines = html.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const isImageAdjacent =
      line.includes("<img ") ||
      line.includes("<figcaption>") ||
      line.includes("<span>改善後の状態</span>");

    if (isImageAdjacent) {
      for (const phrase of bannedImageCopy) {
        if (line.includes(phrase)) {
          report(filePath, lineNumber, `画像周辺の断定表現を避けてください: ${phrase}`);
        }
      }
    }

    for (const phrase of bannedPublicCopy) {
      if (line.includes(phrase)) {
        report(filePath, lineNumber, `公開文に残さない表現です: ${phrase}`);
      }
    }
  });

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = match[0];
    const line = lineNumberForIndex(html, match.index || 0);
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    const alt = tag.match(/\balt="([^"]*)"/)?.[1];

    if (!src) {
      report(filePath, line, "img に src がありません。");
    } else if (!existsRelativeTo(filePath, src)) {
      report(filePath, line, `画像ファイルが見つかりません: ${src}`);
    }

    if (alt === undefined) {
      report(filePath, line, "img に alt がありません。");
    } else if (!alt.endsWith("イメージ")) {
      report(filePath, line, `画像 alt は場面断定を避け、原則「〜イメージ」で終えてください: ${alt}`);
    }
  }

  for (const match of html.matchAll(/\bhref="([^"]+\.html)(#[^"]*)?"/g)) {
    const href = match[1];
    const line = lineNumberForIndex(html, match.index || 0);
    if (!existsRelativeTo(filePath, href)) {
      report(filePath, line, `リンク先HTMLが見つかりません: ${href}`);
    }
  }
}

if (errors.length > 0) {
  console.error(`case-studies check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`case-studies check passed: ${htmlFiles.length} HTML files`);
