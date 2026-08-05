import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";
import test from "node:test";

test("Vite build emits a Vercel-servable app", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const assets = await readdir(new URL("../dist/assets/", import.meta.url));

  assert.match(html, /<div id="root"><\/div>/);
  assert.match(html, /type="module"/);
  assert.match(html, /Stok dan Klaim/);
  assert.ok(assets.some((file) => file.endsWith(".js")));
  assert.ok(assets.some((file) => file.endsWith(".css")));
  await access(new URL("../dist/icon.png", import.meta.url));
});

test("Vercel config points production to dist", async () => {
  const config = JSON.parse(
    await readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  );
  const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8"),
  );

  assert.equal(config.buildCommand, "npm run build");
  assert.equal(config.outputDirectory, "dist");
  assert.equal(packageJson.scripts.build, "vite build");
  assert.equal(packageJson.scripts.dev, "vite --host 127.0.0.1");
});
