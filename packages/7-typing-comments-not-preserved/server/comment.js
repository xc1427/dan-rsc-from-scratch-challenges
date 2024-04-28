import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { IncomingMessage } from 'http';
import { mkdir } from "fs/promises";

const commentDirname = '__comment';


/**
 * get comment dir name from slug
 * @param {*} slug - slug in url
 */
function getCommentDir(slug) {
    return path.join('.', commentDirname, slug + '.json');
}

export async function Comment({ slug }) {
    let comment = [];
    try {
        const commentRaw = await readFile(getCommentDir(slug), "utf8");
        comment = JSON.parse(commentRaw);
    } catch (error) {
        comment = [];
    }
    return (
        <div style={{ backgroundColor: "rgba(0,0,0,.10)", padding: "16px 8px" }}>
        <div>Comments:</div>
        <ul
            style={{
            listStyleType: "none",
            paddingInlineStart: "4px",
            // padding: "24px 16px 24px 16px",
            }}
        >
            {comment.map((elem, index) => {
            return (
                <li key={index} style={{ paddingBottom: "8px" }}>
                {elem}
                </li>
            );
            })}
        </ul>
        <form method="POST" encType="application/x-www-form-urlencoded" action='/comment'>
            <input type="text" name="comment" placeholder="Please leave your comment :)" style={{ width: '200px' }} />
            <input type="hidden" name="slug" value={slug} />
        </form>
        </div>
    );
}


export async function saveComment({ slug, comment: newComment }) {
  const commentFilePath = getCommentDir(slug);
  try {
    if (!existsSync(commentFilePath)) {
      await writeFile(commentFilePath, '[]', 'utf8');
    }
    const comment = JSON.parse(await readFile(commentFilePath, 'utf8'));
    comment.push(newComment);
    await writeFile(commentFilePath, JSON.stringify(comment), 'utf8');
  } catch (err) {
    return false;
  }
  return true;
}

/**
 *
 * @param {IncomingMessage} req
 * @returns {Promise}
 */
export function retrieveFormValue(req) {
  return new Promise((res, rej) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      console.info('request body is:', body);
      const formValues = new URLSearchParams(decodeEntities(body).trim());
      const formData = {};
      for (const [key, value] of formValues) {
        formData[key] = value;
      }
      console.info('submitted formData:', formData);
      res(formData);
    })
  });

}

function decodeEntities(encodedString) {
  var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
  var translate = {
      "nbsp":" ",
      "amp" : "&",
      "quot": "\"",
      "lt"  : "<",
      "gt"  : ">"
  };
  return encodedString.replace(translate_re, function(match, entity) {
      return translate[entity];
  }).replace(/&#(\d+);/gi, function(match, numStr) {
      var num = parseInt(numStr, 10);
      return String.fromCharCode(num);
  });
}

export async function makeCommentDir() {
  try {
    const commentDirPath = path.join('.', commentDirname);
    if (existsSync(commentDirPath)) {
      return;
    }
    await mkdir(commentDirname);
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error(err);
    }
  }
}