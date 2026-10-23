# Memo-Table 锁定样式渲染包 v1

目的：让不同 agent 只填写内容，不重写已经确认的视觉样式。覆盖本次对话的三款样式；没有修改或安装任何现有 skill。其他旧样式不在此包内。

## 快速使用（给任何 agent）

> 阅读本包 AGENTS.md 和 README.md。选择对应 examples JSON，复制后只修改内容字段。不要改模板、渲染器和哈希清单。使用统一命令渲染到新目录，检查 report.json 并打开 PNG 验收。若失败请说明原因，不要重写 CSS 绕过。

在本包目录中运行 PowerShell：

```powershell
./render.ps1 -InputJson ./examples/sales.json -OutputDirectory ./result-sales
```

若执行策略限制脚本，可直接运行 Node（无需改变系统策略）：

```powershell
$env:NODE_PATH='C:/Users/Onoya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
& 'C:/Users/Onoya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' ./render.cjs ./examples/sales.json ./result-sales
```

输出目录必须新建或为空，防止失败时误把旧图当作新图。每次输出包括 output.png、output.html、input.json、report.json。失败返回非零退出码，不生成最终 PNG；根据报错修正数据结构或经用户同意拆分，不擅改样式或内容。

## 三种固定结构

| style | JSON 内容 | 固定设计 |
|---|---|---|
| table | title；4 项 headers；每行4个字符串（序号、名称、日期、金额）；恰好2个 metrics（value、caption） | 产品表格·指标卡，903 CSS px 宽，2倍输出；浅灰绿不透明外围，青绿底白柱图标，圆点无底块 |
| comparison | title；5项 headers；每行5个字符串（标签、3个值、差值） | 市场份额对比，949 CSS px 宽，2倍输出；深灰大卡，首行高亮，右上角圆点配灰绿胶囊底块 |
| sales | title；rows 中每项必须有 name、description、value1、value2、year、status，均为字符串 | 销售列表，1022 CSS px 宽，2倍输出；透明外围，末行青绿，圆点深灰底块 |

字段示例以 examples/ 中完整 JSON 为准。标题、数值和标点全是纯文本，支持中文、俄文、换行、长英文与 HTML 字符串。换行用 JSON 的 `\n`。没有的说明可填空字符串；不要漏字段或填数字类型。table 的序号来自数据；sales 序号自动产生。comparison 第一列恰为 X5 时保留样稿近似 SVG 标记，其他文本不套用品牌标记。

当前锁定结构刻意不支持任意列数、删除指标或自定义配色；不适用时应选择别的模板或让用户授权新设计，不能声称任意数据都能不变形塞入这三种固定结构。每次1–100行、每字段最多4000字符，超长画布超过16000 CSS px 拒绝生成，建议分图。

## 锁定和验收机制

- templates/ 是原始定稿 HTML，references/ 是原始定稿 PNG。
- LOCK.json 对模板和 render.cjs 做 SHA-256 校验。内容变更只能发生在数据 JSON；篡改模板会报错。这是误修改检测，不是不可破解的安全防护。
- 采用浏览器 DOM 的 textContent 写入数据，不拼接输入为 HTML；禁止外部网络请求。
- 字号、颜色、列宽、圆角、阴影、图标和圆点样式不变。仅确定性换行、增高标题区/行/卡片/画布；内容变多时总高度会增长，这不等于截图尺寸永久不变。
- 自动检测文本越界、横向溢出、单元格重叠、标题/圆点碰撞和画布越界；不以删字、截断、省略号或缩小字号解决。
- 新环境先运行基准测试：只校验尺寸与文件大小容差（≤25%），不要求跨机器逐字节一致；尺寸不符或超出容差则停止并检查字体/浏览器。这能发现操作系统、字体或浏览器差异，但不是跨机器像素永远相同的保证。
- 自动几何检查不能证明知识内容正确或所有字符都存在字形。正式图仍需视觉验收，尤其是生僻字、emoji 和不同电脑环境。

## 自检

```powershell
$env:NODE_PATH='C:/Users/Onoya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'
& 'C:/Users/Onoya/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' ./selftest.cjs ./new-test-output
```

涵盖三款原稿、长中文标题、连续英文、12行内容、单行、HTML特殊字符和非法字段等13个用例。本机验收结果见 QA-SUMMARY.json；三款原稿的 PNG 在本机通过尺寸与容差校验（不同机器允许渲染差异）。selftest 输出的压力测试数据并非用户真实内容。

运行依赖 Node.js、Playwright 和已安装的 Chrome/Edge。包不含浏览器、Node 或字体安装包，不会自动下载；本机已有 Codex 运行时可直接复用。其他电脑需要先准备等价环境，用 MEMO_TABLE_BROWSER 指定本地浏览器。字体或浏览器不同必须重新跑基准，不能绕过失败。

## 文件角色

- render.cjs / render.ps1：唯一正式渲染入口。
- templates/：三款锁定原稿。
- examples/：可复制并填写的数据结构。
- references/：三个定稿 PNG，不能用来冒充新数据的渲染结果。
- selftest.cjs / QA-SUMMARY.json：自动验收与本次结果。
- AGENTS.md：接手 agent 的执行约定。

这是一份独立交接工具包，不会自动更新 Memo-Table skill。集成时应让技能调用此渲染器，而不是让模型照着说明重新写样式。
