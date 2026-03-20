#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import https from "node:https";

const ROOT = process.cwd();
const targets = [
  {
    key: "hero",
    name: "framer-hero",
    url: "https://steppay.framer.website",
    out: path.join(ROOT, "public", "framer-hero", "index.html"),
  },
  {
    key: "card",
    name: "framer-card",
    url: "https://steppaycard.framer.website",
    out: path.join(ROOT, "public", "framer-card", "index.html"),
  },
  {
    key: "scratch",
    name: "framer-scratch",
    url: "https://steppayscratch.framer.website",
    out: path.join(ROOT, "public", "framer-scratch", "index.html"),
  },
  {
    key: "pro",
    name: "framer-pro",
    url: "https://steppaypro.framer.website",
    out: path.join(ROOT, "public", "framer-pro", "index.html"),
  },
];

const args = new Set(process.argv.slice(2));
const requested =
  args.size === 0
    ? targets
    : targets.filter((t) => args.has(`--${t.key}`) || args.has(t.name));

if (requested.length === 0) {
  console.error("No targets selected.");
  console.error(
    "Usage: node scripts/refresh-framer-embeds.mjs [--hero] [--card] [--scratch] [--pro]"
  );
  process.exit(1);
}

async function fetchUrl(url) {
  if (typeof fetch === "function") {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url} (${res.status})`);
    }
    return await res.text();
  }

  return await new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "step-pay-refresh/1.0" } }, (res) => {
      const { statusCode, headers } = res;
      if (statusCode && statusCode >= 300 && statusCode < 400 && headers.location) {
        const next = new URL(headers.location, url).toString();
        res.resume();
        fetchUrl(next).then(resolve, reject);
        return;
      }
      if (!statusCode || statusCode >= 400) {
        res.resume();
        reject(new Error(`Failed to fetch ${url} (${statusCode ?? "unknown"})`));
        return;
      }
      res.setEncoding("utf8");
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
  });
}

function looksLikeHtml(content) {
  return /<!doctype html/i.test(content) && /<html/i.test(content);
}

async function writeIfChanged(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  let existing = null;
  try {
    existing = await fs.readFile(filePath, "utf8");
  } catch (err) {
    if (err?.code !== "ENOENT") throw err;
  }
  if (existing === content) {
    return false;
  }
  await fs.writeFile(filePath, content, "utf8");
  return true;
}

let updated = 0;
for (const target of requested) {
  const html = await fetchUrl(target.url);
  if (!looksLikeHtml(html)) {
    throw new Error(`Unexpected response for ${target.name}.`);
  }
  const changed = await writeIfChanged(target.out, html);
  if (changed) {
    updated += 1;
    console.log(`Updated ${target.name} -> ${path.relative(ROOT, target.out)}`);
  } else {
    console.log(`No changes for ${target.name}`);
  }
}

console.log(`Done. ${updated}/${requested.length} updated.`);
