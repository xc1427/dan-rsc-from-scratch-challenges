import { hydrateRoot } from "react-dom/client";

const jsxContentMap = new Map();
const initialJSX = getInitialClientJSX();
let currentPathname = window.location.pathname;
jsxContentMap.set(currentPathname, initialJSX);

const root = hydrateRoot(document, initialJSX);

/**
 *
 * @param {string} pathname - the pathname to navigate to
 * @param {boolean} prioritizeCache - whether to prioritize cache over fetching
 * @returns
 */
async function navigate(pathname, prioritizeCache = false) {
  currentPathname = pathname;
  let clientJSX = null;
  if (prioritizeCache && jsxContentMap.has(pathname)) {
    clientJSX = jsxContentMap.get(pathname);
  } else {
    clientJSX = await fetchClientJSX(pathname);
  }
  jsxContentMap.set(pathname, clientJSX);
  root.render(clientJSX);
}


function getInitialClientJSX() {
  const clientJSX = JSON.parse(window.__INITIAL_CLIENT_JSX_STRING__, parseJSX);
  return clientJSX;
}

async function fetchClientJSX(pathname) {
  const response = await fetch(pathname + "?jsx");
  const clientJSXString = await response.text();
  const clientJSX = JSON.parse(clientJSXString, parseJSX);
  return clientJSX;
}

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

window.addEventListener(
  "click",
  (e) => {
    if (e.target.tagName !== "A") {
      return;
    }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
      return;
    }
    const href = e.target.getAttribute("href");
    if (!href.startsWith("/")) {
      return;
    }
    e.preventDefault();
    window.history.pushState(null, null, href);
    navigate(href);
  },
  true
);

window.addEventListener("popstate", () => {
  navigate(window.location.pathname, true);
});
