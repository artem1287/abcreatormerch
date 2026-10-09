const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const types = { ".html":"text/html", ".css":"text/css", ".js":"text/javascript", ".svg":"image/svg+xml" };

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = path.join(root, p);
  fs.readFile(file, (err, data) => {
    if (err){ res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store, no-cache, must-revalidate"
    });
    res.end(data);
  });
}).listen(5178, () => console.log("Serving merch-site on http://localhost:5178"));
