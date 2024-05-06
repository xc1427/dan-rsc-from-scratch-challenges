import { createServer } from "http";
import { readFile } from "fs/promises";
import { renderToString } from "react-dom/server";

import { retrieveFormValue } from './form.js';

/** ====== */
import { actionTransform } from './actionTransform.js';
/** ====== */

// This is a server to host CDN distributed resources like static files and SSR.
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    /** ====== */
    if (req.method === 'POST' && url.pathname === '/__action') {
      const actionMetadata = await retrieveFormValue(req);
      const { moduleName, functionName, params } = actionMetadata;
      try {
        const module = await import(`../${moduleName}`);
        const fn = module[functionName];
        const result = await fn.call(null, JSON.parse(params));
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(result));
        return;
      } catch (err) {
        console.error(err);
        res.statusCode = 400;
        res.end();
        return;
      }
    }

    if (url.pathname.endsWith('.js')) {
        const fileContent = await readFile(`./${url.pathname}`, "utf8");
        const content = actionTransform(fileContent, url.pathname.slice(1));
        res.setHeader("Content-Type", "text/javascript");
        res.end(content);
        return;
    }
    /** ====== */

    if (url.pathname === "/favicon.ico") {
      res.setHeader("Content-Type", "image/svg+xml");
      res.end(
        `<svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
           <ellipse style="fill:red; stroke:none" cx="12" cy="12" rx="5" ry="5"></ellipse>
         </svg>`
      );
      return;
    }
    const response = await fetch("http://127.0.0.1:8081" + url.pathname);
    if (!response.ok) {
      res.statusCode = response.status;
      res.end();
      return;
    }
    const clientJSXString = await response.text();
    if (url.searchParams.has("jsx")) {
      res.setHeader("Content-Type", "application/json");
      res.end(clientJSXString);
    } else {
      const clientJSX = JSON.parse(clientJSXString, parseJSX);
      let html = renderToString(clientJSX);
      html += `<script>window.__INITIAL_CLIENT_JSX_STRING__ = `;
      html += JSON.stringify(clientJSXString).replace(/</g, "\\u003c");
      html += `</script>`;
      html += `
        <script type="importmap">
          {
            "imports": {
              "react": "https://esm.sh/react@18.3.0-canary-c3048aab4-20240326",
              "react-dom/client": "https://esm.sh/react-dom@18.3.0-canary-c3048aab4-20240326/client"
            }
          }
        </script>
        <script type="module" src="/client.js"></script>
      `;
      res.setHeader("Content-Type", "text/html");
      res.end(html);
    }
  } catch (err) {
    console.error(err);
    res.statusCode = err.statusCode ?? 500;
    res.end();
  }
}).listen(8080);

function parseJSX(key, value) {
  if (value === "$RE") {
    return Symbol.for("react.element");
  }

  else if (value === "$RF") {
    return Symbol.for("react.fragment");
  }

  else if (typeof value === "string" && value.startsWith("$$")) {
    return value.slice(1);
  } else {
    return value;
  }
}