import { createServer } from "http";
import { readFile, readdir } from "fs/promises";
import sanitizeFilename from "sanitize-filename";
import ReactMarkdown from "react-markdown";
import React from "react";
import { Comment } from "./comment.js";

// This is a server to host data-local resources like databases and RSC.

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    await sendJSX(res, <Router url={url} />);
  } catch (err) {
    console.error(err);
    res.statusCode = err.statusCode ?? 500;
    res.end();
  }
}).listen(8081);

function Router({ url }) {
  let page;
  if (url.pathname === "/") {
    page = <BlogIndexPage />;
  } else {
    const postSlug = sanitizeFilename(url.pathname.slice(1));

    /** ====== */
    page = <React.Fragment key={url.pathname}>
      <BlogPostPage postSlug={postSlug} />
    </React.Fragment>
    /** ====== */

  }
  return <BlogLayout>{page}</BlogLayout>;
}

async function BlogIndexPage() {
  const postFiles = await readdir("./posts");
  const postSlugs = postFiles.map((file) =>
    file.slice(0, file.lastIndexOf("."))
  );
  return (
    <section>
      <h1>Welcome to my blog</h1>
      <div>
        {postSlugs.map((slug) => (
          <Post key={slug} slug={slug} />
        ))}
      </div>
    </section>
  );
}

function BlogPostPage({ postSlug }) {
  return (
    <>
      <Post slug={postSlug} />
      <Comment slug={postSlug} />
      </>
  );
}

async function Post({ slug }) {
  let content;
  try {

    content = await readFile("./posts/" + slug + ".md", "utf8");

  } catch (err) {
    throwNotFound(err);
  }
  return (
    <section>
      <h2>
        <a href={"/" + slug}>{slug}</a>
      </h2>
      <article><ReactMarkdown>{content}</ReactMarkdown></article>
      </section>
  );
}

/** ====== */
async function BlogSelect() {
  const postFiles = await readdir("./posts");
  const postSlugs = postFiles.map((file) =>
    file.slice(0, file.lastIndexOf("."))
  );
  return (

      <select id="selectPost" style={{ float: 'right' }}>
        <option value="" disabled selected>Select an option</option>
        {postSlugs.map((slug) => (
          <option key={slug} value={slug}>
            {slug}
          </option>
        ))}
      </select>


  );
}
/** ====== */


function BlogLayout({ children }) {
  const author = "Jae Doe";
  return (
    <html>
      <body>
        <nav>
          <a href="/">Home</a>
          <BlogSelect />
          <hr />
          <input />
          <hr />
        </nav>
        <main>{children}</main>
        <Footer author={author} />
        </body>
    </html>
  );
}

function Footer({ author }) {
  return (
    <footer>
      <><hr /><div /></>
      <p>
        <i>
          (c) {author} {new Date().getFullYear()}
        </i>
      </p>
    </footer>
  );
}

async function sendJSX(res, jsx) {
  const clientJSX = await renderJSXToClientJSX(jsx);
  const clientJSXString = JSON.stringify(clientJSX, stringifyJSX);
  res.setHeader("Content-Type", "application/json");
  res.end(clientJSXString);
}

function throwNotFound(cause) {
  const notFound = new Error("Not found.", { cause });
  notFound.statusCode = 404;
  throw notFound;
}

function stringifyJSX(key, value) {
  if (value === Symbol.for("react.element")) {
    return "$RE";

  } else if (value === Symbol.for('react.fragment')) {
    return "$RF";

  } else if (typeof value === "string" && value.startsWith("$")) {
    return "$" + value;
  } else {
    return value;
  }
}

async function renderJSXToClientJSX(jsx) {
  if (
    typeof jsx === "string" ||
    typeof jsx === "number" ||
    typeof jsx === "boolean" ||
    jsx == null
  ) {
    return jsx;
  } else if (Array.isArray(jsx)) {
    return Promise.all(jsx.map((child) => renderJSXToClientJSX(child)));
  } else if (jsx != null && typeof jsx === "object") {
    if (jsx.$$typeof === Symbol.for("react.element")) {

      if (jsx.type === Symbol.for('react.fragment')) {
        return {
          ...jsx,
          props: await renderJSXToClientJSX(jsx.props),
        };
      }

      if (typeof jsx.type === "string") {
        return {
          ...jsx,
          props: await renderJSXToClientJSX(jsx.props),
        };
      } else if (typeof jsx.type === "function") {
        const Component = jsx.type;
        const props = jsx.props;
        const returnedJsx = await Component(props);
        return renderJSXToClientJSX(returnedJsx);
      } else throw new Error("Not implemented.");
    } else {
      return Object.fromEntries(
        await Promise.all(
          Object.entries(jsx).map(async ([propName, value]) => [
            propName,
            await renderJSXToClientJSX(value),
          ])
        )
      );
    }
  } else throw new Error("Not implemented");
}
