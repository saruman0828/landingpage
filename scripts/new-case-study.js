const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const caseStudiesDir = path.join(rootDir, "case-studies");
const templatePath = path.join(caseStudiesDir, "_template.html");

const usage = [
  "Usage:",
  "  npm run new:case-study -- <slug>",
  "  npm run new:case-study -- <slug> --from <existing-case.html>",
  "",
  "Examples:",
  "  npm run new:case-study -- invoice-followup",
  "  npm run new:case-study -- field-safety --from field-report.html"
].join("\n");

const args = process.argv.slice(2);
const slug = args[0];

if (!slug || slug === "-h" || slug === "--help") {
  console.log(usage);
  process.exit(slug ? 0 : 1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("Slug must use lowercase letters, numbers, and hyphens only.");
  process.exit(1);
}

let sourcePath = templatePath;
const fromIndex = args.indexOf("--from");
if (fromIndex !== -1) {
  const sourceName = args[fromIndex + 1];
  if (!sourceName) {
    console.error("--from requires an existing case-study HTML filename.");
    process.exit(1);
  }
  if (sourceName.includes("/") || sourceName.includes("\\") || !sourceName.endsWith(".html")) {
    console.error("--from must be a filename under case-studies, such as field-report.html.");
    process.exit(1);
  }
  if (sourceName === "index.html" || sourceName.startsWith("_")) {
    console.error("--from must point to a published article, not index.html or a template.");
    process.exit(1);
  }
  sourcePath = path.join(caseStudiesDir, sourceName);
}

if (!fs.existsSync(sourcePath)) {
  console.error(`Source template not found: ${path.relative(rootDir, sourcePath)}`);
  process.exit(1);
}

const targetPath = path.join(caseStudiesDir, `${slug}.html`);
if (fs.existsSync(targetPath)) {
  console.error(`Target already exists: ${path.relative(rootDir, targetPath)}`);
  process.exit(1);
}

let html = fs.readFileSync(sourcePath, "utf8");

if (sourcePath !== templatePath) {
  html = html.replace("</head>", "  <meta name=\"robots\" content=\"noindex\" />\n</head>");
  html = html.replace(/<title>(.*?)<\/title>/, "<title>TODO_CASE_STUDY $1</title>");
}

fs.writeFileSync(targetPath, html, "utf8");

console.log(`Created ${path.relative(rootDir, targetPath)}`);
console.log("Next steps:");
console.log("1. Replace every TODO_CASE_STUDY marker.");
console.log("2. Add a card to case-studies/index.html.");
console.log("3. Run npm run check:case-studies.");
