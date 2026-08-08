import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appSource = await readFile(
  new URL("../app/stock-claim-app.tsx", import.meta.url),
  "utf8",
);
const cssSource = await readFile(
  new URL("../app/globals.css", import.meta.url),
  "utf8",
);
const schemaSource = await readFile(
  new URL("../db/schema.ts", import.meta.url),
  "utf8",
);

test("monitoring klaim template keeps requested customer, total, claim types, and attachment picker", () => {
  assert.match(appSource, /"NAMA CUSTOMER"/);
  assert.match(appSource, /"TOTAL"/);
  assert.match(appSource, /worksheet\["L2"\] = \{ t: "n", f: "J2\+K2" \}/);
  assert.match(appSource, /jenisKlaim: "Promosi"/);
  assert.match(appSource, /jenisKlaim: "Jasa Manajemen"/);
  assert.match(appSource, /jenisKlaim: "Reimbursement"/);
  assert.match(appSource, /jenisKlaim: "Klaim Barang"/);
  assert.match(appSource, /jenisKlaim: "Sub Dist Gaji"/);
  assert.match(appSource, /jenisKlaim: "Lainnya"/);
  assert.match(appSource, /type="file"/);
  assert.match(appSource, /multiple/);
  assert.match(appSource, /handleClaimAttachmentFiles/);
  assert.match(cssSource, /attachment-picker-box/);
  assert.match(schemaSource, /namaCustomer: text\("nama_customer"\)/);
  assert.match(schemaSource, /total: real\("total"\)/);
});

test("rekap beli upload accepts common exported header aliases and skips stale session locks", () => {
  assert.match(appSource, /headerAliases/);
  assert.match(appSource, /"NO FP": \["NO FAKTUR PAJAK"/);
  assert.match(appSource, /"TGL FP": \["TANGGAL FP"/);
  assert.match(appSource, /"SJ VENDOR": \["NO SJ VENDOR"/);
  assert.match(appSource, /parseSheet\(file, definition\)/);
  assert.match(appSource, /ACTIVE_SESSION_TTL_MS = 2 \* 60 \* 1000/);
  assert.match(appSource, /ACTIVE_SESSION_HEARTBEAT_MS = 25 \* 1000/);
  assert.match(appSource, /sessionStorageKey\(username: string\)/);
  assert.match(appSource, /releaseActiveSession\(session\)/);
});
