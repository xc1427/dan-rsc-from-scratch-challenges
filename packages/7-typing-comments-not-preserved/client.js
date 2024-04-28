import { hydrateRoot } from "react-dom/client";
import { useEffect, createElement } from 'react';

const root = hydrateRoot(document, getInitialClientJSX());

let currentPathname = window.location.pathname;

/** This is the technique to make form submit hijacked by client. */
function hijackFormSubmission() {
  function delay(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  console.info('form element found:', document.forms);

  const handleSumbit = async (e) => {
    e.preventDefault();
    const target = e.currentTarget;
    const formData = new FormData(target);
    const response = await fetch(target.action, {
      method: "POST",
      body: new URLSearchParams(formData),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },

    });
    if (response.ok) {

      // When running in gitpod/codespace environment, you need this because otherwise the subsequent request will fail.
      // I guess that is because there is some DDoS protection on the platform.
      await delay(1000);
      navigate(window.location.pathname);
    }
    target.reset();
  }
  for (const formElem of document.forms) {
    formElem.addEventListener("submit", handleSumbit);
  }

  function cleanup() {
    for (const formElem of document.forms) {
      formElem.removeEventListener("submit", handleSumbit);
    }
  }

  return cleanup;
}

function App({ children }) {
  useEffect(() => {
    const cleanupFn = hijackFormSubmission();
    return () => {
      cleanupFn();
    };
  });
  return children;
}


const cleanup = hijackFormSubmission();


async function navigate(pathname) {
  cleanup();

  currentPathname = pathname;
  const clientJSX = await fetchClientJSX(pathname);
  if (pathname === currentPathname) {

    // root.render(clientJSX);
    root.render(createElement(App, {}, [clientJSX]));
  }
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
  navigate(window.location.pathname);
});
