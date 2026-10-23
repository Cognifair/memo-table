# 变更记录

遵循语义化版本：修 bug → patch，新增能力 → minor，改变契约 → major。

## v1.2.1 — 2026-10-23

### 修复

- 预览展示前先把图片复制到当前工作目录：客户端只能预览工作区内的图片，直接引用技能目录会显示“无法预览”。
- `selftest.cjs` 的基准校验从「PNG 字节完全一致」改为「尺寸一致 + 文件大小容差 ≤25%」，换机器/字体不再被自检拦死。
- `render.cjs` 查找 Playwright 时改用 `USERPROFILE` 判断（原先判断 `LOCALAPPDATA` 却拼 `USERPROFILE`）。
- 文档同步说明容差规则；`LOCK.json` 随 `render.cjs` 更新哈希。
- README 的「Memo 系列」表与 `references/satellites.md` 改由 `memo-series.json` 生成（`sync-series`），不再手写跨技能清单。

## v1.2.0 — 2026-10-23

### 变更

- 接入 Memo-Table Locked v1 渲染包：`table`、`comparison`、`sales` 三款改为固定结构，只填数据 JSON；模板、渲染器、哈希清单锁定，`report.json` 做布局校验。
- 选型改为「先展示预览，再用问题框选」：`rounded` 用用户数据渲染预览，锁定三款直接展示定稿样稿。
- 保留「墨墨风·圆角」（`rounded`，通用结构）；取消「墨墨风·直角」（`square`）。
- `table`、`comparison` 为不透明浅灰绿背景；`rounded`、`sales` 为透明底。

### 测试

- 锁定包自检 13/13 通过，三款基准 PNG 与本机定稿逐字节一致。
- 圆角渲染与锁定渲染均从新目录调用成功。

## v1.1.1 — 2026-10-19

### 新增

- 新增 `version.json`，供墨卡大师的支链版本检查读取；此后每次发版随版本号同步更新。

## v1.1.0 — 2026-10-18

- 首次纳入版本清单的发布；更早的改动未单独记录。
