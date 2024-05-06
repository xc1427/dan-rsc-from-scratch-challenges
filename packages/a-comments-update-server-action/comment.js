import { writeFile, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import chalk from 'chalk';
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

/** ====== */

/**
 * output something to terminal
 */
export async function printAction(actionData) {
  'use server';
  console.info(chalk.blue.bgRed.bold(actionData));
}

/**
 * save comment exposed as a server action
 * @param {*} actionData - submitted data
 */
export async function saveCommentAction(actionData) {
  'use server';
  await makeCommentDir();
  await saveComment(actionData);
  return { message: 'ok' };
}

/** ====== */

async function saveComment({ slug, comment: newComment }) {
  const commentFilePath = getCommentDir(slug);
  try {
    if (!existsSync(commentFilePath)) {
      await writeFile(commentFilePath, '[]', 'utf8');
    }
    const comment = JSON.parse(await readFile(commentFilePath, 'utf8'));
    comment.push(newComment);
    await writeFile(commentFilePath, JSON.stringify(comment), 'utf8');
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function makeCommentDir() {
  try {
    const commentDirPath = path.join('.', commentDirname);
    if (existsSync(commentDirPath)) {
      return;
    }
    await mkdir(commentDirname);
  } catch (err) {
    if (err.code !== "EEXIST") {
      console.error(err);
      throw err;
    }
  }
}