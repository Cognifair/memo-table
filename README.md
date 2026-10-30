# 墨记表格制作 Memo-Table

> 🌐 [墨卡大师 · 专业制卡工作流](https://moka-master.app.workbuddy.host/?sharecode=ZYHGDS4GEB)

将文字或已有表格转换为透明 PNG、锁定样式的产品表格/对比图/销售列表，或可直接复制的 LaTeX array 代码。调用名为 `$memo-table`，版本以 [SKILL.md](SKILL.md) 的 `metadata.version` 为准。

## 六种样式

| 样式 | 实现 | 结构 |
|---|---|---|
| 墨墨风·圆角（`rounded`） | `scripts/render_table.cjs`；复杂结构另做非锁定布局适配 | 现有 JSON：单层表头、等长行数组；合并与层级另做适配验收 |
| 产品表格·指标卡（`table`） | `scripts/locked/render.cjs` | 固定：4 列 + 2 个指标 |
| 市场份额对比（`comparison`） | `scripts/locked/render.cjs` | 固定：5 列（标签、3 值、差值） |
| 销售列表·透明底（`sales`） | `scripts/locked/render.cjs` | 固定：6 个字段 |
| LaTeX 三线表 | 直接输出代码 | 仅三条横线 |
| LaTeX 网格表 | 直接输出代码 | 有竖线、逐行横线 |

**选型方式**：先根据材料的合并关系、表头层级、列语义和文本密度，说明各样式“推荐 / 有条件推荐 / 不推荐”的原因，再展示预览供选择。`rounded` 结构匹配时用用户数据渲染；复杂合并表可先做同风格的非锁定适配小样。锁定三款展示明确标注的示例，不硬套字段或补造指标。已指定样式不重复询问，但仍检查适配性。

圆角墨墨简约风可作为图片路线的通用布局方向；这不表示现有 JSON 渲染器原生支持所有复杂表格。按需调整非锁定布局后，仍需检查合并范围、表头层级与阅读效果。详见 [材料适配说明](references/style-selection.md)。

## 安装与使用

适合把已有文字或表格制作成图片/表格代码；不负责知识拆解、Markji 账户操作或 TXT 文件容器。图片渲染需已安装的 Node.js、Playwright、Chrome/Edge 和相应字体；本技能不自动安装依赖。

将本仓库克隆到所用客户端的技能目录，目录名为 `memo-table`。例如在该技能目录的父目录中执行：

```text
git clone https://github.com/Cognifair/memo-table.git memo-table
```

Codex / WorkBuddy 安装或更新后新开会话或重启客户端。使用时可直接说：

> 使用 $memo-table，把这份概念对照表做成圆角图片；先判断材料结构是否需要布局适配。

主要目录：`SKILL.md` 为执行规则，`references/` 为选型与 LaTeX 说明，`scripts/` 为渲染与测试入口；`scripts/locked/` 为不可随意改动的固定样式包。

> 直角墨墨风（`square`）已在 v1.2.0 取消。
>
> `table`、`comparison` 是不透明浅灰绿背景；`rounded`、`sales` 是透明底。

## 圆角路线（通用结构）

```json
{
  "title": "概念对照",
  "style": "rounded",
  "headers": ["项目", "概念 A", "概念 B"],
  "rows": [["特征", "说明 A", "说明 B"]]
}
```

```text
node scripts/render_table.cjs input.json output.png output.html
```

默认 2000 px 宽；可选 `width`、`fontFamily`、`theme`（`accent`/`light`/`deep`/`white`）。该脚本只处理 `rounded`，其它样式会提示改用锁定渲染器。

## 锁定三款（固定结构）

模板、渲染器与哈希清单已锁定，**只填数据 JSON，不改样式**。数据结构以 [scripts/locked/examples](scripts/locked/examples) 为准：

- `table`：`headers` 恰好 `["NO","Item Preview","Date","Income"]`；每行 4 个字符串；`metrics` 恰好 2 条 `{value, caption}`。
- `comparison`：`headers` 恰好 5 项（标签、3 个值、差值）；每行 5 个字符串。
- `sales`：`rows` 每项含 `name`、`description`、`value1`、`value2`、`year`、`status`。

```text
node scripts/locked/render.cjs input.json <新输出目录>
```

输出目录必须不存在或为空；生成 `output.png`、`output.html`、`input.json`、`report.json`。检查 `report.json` 的 `pass` 为 true，再打开 PNG 视觉验收。失败按报错修数据，不改模板、不重算哈希。

首次在新环境使用先跑基准自检：

```text
node scripts/locked/selftest.cjs <新目录>
```

基准只校验尺寸与容差（文件大小差异 ≤25%），不要求跨机器逐字节相同；尺寸不符或超出容差时停止并检查字体/浏览器，不改基准图。

## LaTeX 路线

只输出裸 `array` 环境，不加 Markdown 代码围栏、数学定界符或标题解释；不使用 `tabular`、`longtable` 或额外宏包。中文、化学式直接书写，结晶水间隔号使用 `·`。

三线表严格只有三条横线；网格表逐行画横线。已明确进入 LaTeX 路线、但线型追问后仍含糊或让 AI 决定时，默认三线表，并在代码前用一行说明默认选择；没有回答不等于同意默认。

正确模板与检查规则见 [references/array-tables.md](references/array-tables.md)。该约定是本技能的交付要求，不代表所有 LaTeX 平台的通用限制，也不代表已经在墨墨客户端验证渲染。

生成表格不等于已上传或插入卡片；图片的 HTML 是本地编辑源，不直接写进 Markji 正文。

## Memo 系列

<!-- memo-series:begin -->
| 技能 | 职责 |
|---|---|
| [墨卡大师 Memo-Cardest](https://github.com/Cognifair/memo-cardest) | 核心制卡：知识拆解、题型、正文语法与牌组操作 |
| [Memo-MinerUOCR](https://github.com/Cognifair/memo-mineruocr) | 扫描件与大 PDF 识别、拆分并合并 Markdown |
| [墨记文档导入 Memo-Txtimporter](https://github.com/Cognifair/memo-txtimporter) | TXT 容器格式、分卡校验与图片回填 |
| [迁墨 Memo-Ankitransfer](https://github.com/Cognifair/memo-ankitransfer) | Anki 图片挖空转墨墨原生遮罩 |
| [Memo-QAhelper](https://github.com/Cognifair/memo-qahelper) | 墨墨记忆卡使用答疑（官方百科与论坛） |
| [卡跳跳 Memo-CardLink](https://github.com/Cognifair/memo-cardlink) | 卡片单向跳转、双向互链与 Card 引用审计（原 Memo-Link） |
<!-- memo-series:end -->

## License

[MIT](LICENSE)
