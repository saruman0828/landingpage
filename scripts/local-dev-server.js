const fs = require("fs");
const http = require("http");
const path = require("path");
const { pathToFileURL } = require("url");

const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8030);

const apiRoutes = {
  "/api/analytics": "../api/analytics.js",
  "/api/analytics-summary": "../api/analytics-summary.js",
  "/api/contact": "../api/contact.js"
};

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

const loadLocalEnv = () => {
  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(rootDir, fileName);
    if (!fs.existsSync(filePath)) continue;

    const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (!key || process.env[key] !== undefined) continue;

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
};

const readBody = (request) => new Promise((resolve, reject) => {
  const chunks = [];
  request.on("data", (chunk) => chunks.push(chunk));
  request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  request.on("error", reject);
});

const sendJson = (response, statusCode, body) => {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(body));
};

const handleApi = async (request, response, routePath) => {
  const route = apiRoutes[routePath];
  if (!route) return false;

  try {
    request.body = await readBody(request);
    const handlerPath = path.resolve(__dirname, route);
    delete require.cache[handlerPath];
    const handler = require(handlerPath);
    await handler(request, response);
  } catch (error) {
    console.error("local_api_error", error);
    if (!response.headersSent) {
      sendJson(response, 500, { ok: false, message: "ローカルAPIでエラーが発生しました。" });
    } else {
      response.end();
    }
  }

  return true;
};

const sendFile = (response, filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  response.statusCode = 200;
  response.setHeader("Content-Type", mimeTypes[extension] || "application/octet-stream");
  fs.createReadStream(filePath).pipe(response);
};

const handleStatic = (request, response, requestPath) => {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestPath);
  } catch {
    sendJson(response, 400, { ok: false, message: "URLを読み取れませんでした。" });
    return;
  }

  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^\/+/, "");
  const filePath = path.resolve(rootDir, relativePath);

  if (!filePath.startsWith(rootDir + path.sep) && filePath !== rootDir) {
    sendJson(response, 403, { ok: false, message: "Forbidden" });
    return;
  }

  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) {
      sendJson(response, 404, { ok: false, message: "Not found" });
      return;
    }

    sendFile(response, filePath);
  });
};

loadLocalEnv();

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://localhost");
  const routePath = url.pathname.replace(/\/$/, "");

  if (await handleApi(request, response, routePath)) return;
  handleStatic(request, response, url.pathname);
});

server.listen(port, () => {
  const url = `http://127.0.0.1:${port}/index.html`;
  console.log(`Local server with API routes: ${url}`);
  console.log(`Serving ${pathToFileURL(rootDir).href}`);
});
