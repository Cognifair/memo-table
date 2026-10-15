# 墨记表格制作 Memo-Table

将文字或已有表格转换为墨墨风透明图片，或可直接复制的 LaTeX array 表格代码。调用名为 `$memo-table`，版本以 [SKILL.md](SKILL.md) 的 `metadata.version` 为准。

## 四种制作方式

| 模式 | 输出 |
|---|---|
| 墨墨风图片生成 直角 | 直角表格的透明 PNG 与可编辑 HTML |
| 墨墨风图片生成 圆角 | 32 px 外圆角表格的透明 PNG 与可编辑 HTML |
| LaTeX 表格生成 三线表 | 左对齐，无竖线，仅顶部、表头下、底部三条横线 |
| LaTeX 表格生成 网格表 | 居中，有竖线，每一行都有横线 |

用户没有明确完整模式时，先询问并等待回答；已经明确模式时不重复询问，不同时生成两套结果。输入数据与措辞优先保留，不擅自改写知识内容。

## 使用示例

> 使用 $memo-table，把这份对照内容做成墨墨风圆角图片。

> 使用 $memo-table，把下面的内容转换为 LaTeX 三线表。

## 图片路线

默认采用克制的绿色配色、透明背景、2000 px 宽度与适合中文阅读的字体；保留用户明确指定的样式。图片完成后需检查文字、截断、布局、透明通道和角落透明度。

渲染器需要已有 Node.js、Playwright 包和本地 Chrome、Edge 或 Chromium；不会自行安装浏览器。可通过 `MAIMEMO_TABLE_BROWSER` 指定已有浏览器的绝对路径。

输入示例：

```json
{
  "title": "概念对照",
  "cornerStyle": "square",
  "headers": ["项目", "概念 A", "概念 B"],
  "rows": [["特征", "说明 A", "说明 B"]]
}
```

运行已有环境中的渲染器：

```text
node scripts/render_table.cjs input.json output.png output.html
```

`cornerStyle` 可为 `square` 或 `rounded`；HTML 参数省略时保存在 PNG 旁边。可选输入字段包括 `width`、`fontFamily` 和 `theme`。样式资源见 [assets/table-theme.css](assets/table-theme.css)。

## LaTeX 路线

只输出裸 `array` 环境，不加 Markdown 代码围栏、数学定界符或标题解释；不使用 `tabular`、`longtable` 或额外宏包。中文、化学式直接书写，结晶水间隔号使用 `·`。

三线表严格只有三条横线；网格表逐行画横线。已明确进入 LaTeX 路线、但线型追问后仍含糊或让 AI 决定时，默认三线表，并在代码前用一行说明默认选择；没有回答不等于同意默认。

正确模板与检查规则见 [references/array-tables.md](references/array-tables.md)。该约定是本技能的交付要求，不代表所有 LaTeX 平台的通用限制，也不代表已经在墨墨客户端验证渲染。

## 与其他 Memo 技能的分工

- [墨卡大师 Memo-Cardest](https://github.com/Cognifair/memo-cardest)：知识拆解、题型设计与卡片正文语法。
- [墨记文档导入 Memo-Txtimporter](https://github.com/Cognifair/memo-txtimporter)：章节、分卡符和答案线组成的 TXT 文件容器。
- **Memo-Table**：只负责表格图片或代码，不管理卡片、牌组、账户 API 或 TXT 导入文档。

生成表格不等于已上传或插入卡片；图片的 HTML 是本地编辑源，不直接写进 Markji 正文。本技能没有接入本次另外三项技能的可选扩展更新框架，不会自动查版本或安装扩展。
