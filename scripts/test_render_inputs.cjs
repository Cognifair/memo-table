#!/usr/bin/env node
// Regression: untrusted fontFamily must be rejected before it reaches HTML/CSS.
const { spawnSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-table-input-"));
const input = path.join(dir, "in.json");
fs.writeFileSync(input, JSON.stringify({
  style: "rounded",
  title: "t",
  headers: ["a", "b"],
  rows: [["1", "2"]],
  fontFamily: "x;}</style><script>alert(1)</script>",
}));
const result = spawnSync(process.execPath, [path.join(__dirname, "render_table.cjs"), input, path.join(dir, "out.png")], { encoding: "utf8" });
fs.rmSync(dir, { recursive: true, force: true });
if (result.status === 0 || !/fontFamily must be/.test(result.stderr || "")) {
  console.error("fontFamily injection was not rejected:", result.status, result.stderr);
  process.exit(1);
}
console.log("fontFamily injection rejected");
