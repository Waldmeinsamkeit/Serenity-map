# Serenity 人机协作学习画布

Serenity 是一个基于 React、TypeScript、Vite 和 tldraw SDK 构建的无限画布应用。它面向学习场景中的人机协作：用户用卡片和连线组织知识结构，AI 可以通过导出的语义上下文理解当前思维导图，并通过受约束的 JSON Patch 请求修改画布。

第一版不内置 agent、不调用模型、不保存 API key。项目只专注两件事：

- 把学习节点、关系和画布结构画清楚。
- 提供 AI 能读懂、能请求修改、但不能绕过 schema 的协议层。

## 功能概览

- 无限画布：基于 tldraw，支持缩放、拖拽、选择、编辑、箭头和连线。
- 学习卡片：每个卡片保存标题、摘要、正文、标签、状态和 AI 可读 metadata。
- 语义连线：支持表达相关、延伸、包含、对比、疑问等学习关系。
- Obsidian Markdown 导出：导出节点、边、选中节点、一跳/二跳上下文、wikilink、tags、frontmatter 和 Mermaid 逻辑图。
- Obsidian Markdown / AI Patch 导入：支持从 `.md` 或 JSON patch 新增、更新、删除、连接、断开连接、移动节点，并在应用前校验和预览。
- 本地保存：通过本地 Node API 将画布快照保存到根目录 `store/`。

## 目录结构

```text
serenity/
  scripts/
    dev.mjs              # 同时启动 Vite 和本地存储 API
    store-api.mjs        # 本地 Node API，读写 store/canvas-default.json
  src/
    ai/                  # AI Context / Obsidian Markdown 导出、patch 解析和校验
    canvas/              # tldraw 画布封装、本地存储客户端
    model/               # 学习节点、边、snapshot 和语义图模型
    App.tsx
    main.tsx
    styles.css
  store/                 # 本地画布数据目录
  package.json
  vite.config.ts
```

## 安装依赖

```bash
npm install
```

## 别人如何下载和使用

如果你把这个项目上传到 GitHub 或其他 Git 仓库，别人使用时不需要下载 `node_modules/`。正确流程是：

```bash
git clone <你的仓库地址>
cd serenity
npm install
npm run dev
```

Windows 下也可以在安装依赖后双击：

```text
start-serenity.bat
```

项目会优先打开：

- 前端画布：`http://localhost:5173/`
- 本地存储 API：`http://localhost:8787/`

如果端口已被占用，启动脚本会自动选择新的可用端口，并在终端窗口里显示实际地址。

需要提交到 Git 的是源码和配置，例如：

- `package.json`
- `package-lock.json`
- `src/`
- `scripts/`
- `skills/`
- `README.md`
- `start-serenity.bat`
- `vite.config.ts`

不需要提交：

- `node_modules/`
- `dist/`
- `.npm-cache/`
- `store/`
- `*.log`
- `*.err`

原因是 `node_modules/` 可以通过 `npm install` 自动恢复，`store/` 是每个用户自己的本地画布数据。

## 启动开发环境

```bash
npm run dev
```

Windows 下也可以直接双击根目录的 `start-serenity.bat`。

这个命令会同时启动：

- Vite 前端服务，优先使用 `http://localhost:5173/`
- 本地存储 API，优先使用 `http://localhost:8787/`

如果端口已被占用，启动脚本会自动顺延选择可用端口，并在终端里打印实际地址。Vite 会把前端的 `/api` 请求代理到本地存储 API。

## 使用方式

1. 打开 `http://localhost:5173/`。
2. 使用左上角工具栏新增学习卡片、连接两个选中的卡片，或从当前节点发散创建新节点。
3. 选中单个卡片后，在右侧检查器编辑标题、摘要、正文、标签和状态。
4. 点击导出 Obsidian Markdown，下载并预览当前画布的 vault-ready Markdown。
5. 点击导入 Obsidian Markdown，粘贴 `.md` 内容或选择文件，校验通过后应用到画布。
6. 按住空格键会临时切换为手型工具，用来拖动画布；松开后恢复原工具。

## 本地数据保存

运行 `npm run dev` 时，画布会在变化后自动防抖保存到：

```text
store/canvas-default.json
```

应用启动时会优先读取这个文件来恢复画布。如果只运行 `npm run dev:vite`，前端仍能打开，但不会启动本地 Node API，也就不能写入 `store/`。

也可以单独启动本地存储 API：

```bash
npm run store
```

## AI Context

AI Context 是给模型阅读的结构化画布摘要，包含：

- 当前画布摘要
- 所有学习节点的稳定 id、标题、内容、标签、状态和位置
- 所有连线和关系类型
- 当前选中节点
- 选中节点的一跳和二跳上下文
- Mermaid/Markdown 风格的轻量逻辑图文本

它用于让 AI 理解你的思维导图，但不会触发任何模型调用。

## AI Patch

AI Patch 是给模型请求修改画布的 JSON 合约。当前支持的操作包括：

- `addNode`
- `updateNode`
- `deleteNode`
- `connectNodes`
- `disconnectNodes`
- `moveNode`

Patch 会先经过解析、schema 校验、悬空连线检查、重复 id 检查和预览，然后才允许应用。AI 不能直接执行代码，也不能绕过 schema 修改画布。

## MCP Server

Serenity 提供一个本地 `stdio` MCP Server，方便 agent 读取画布语义图、导出 AI Context / Obsidian Markdown、校验 AI Patch 或 Markdown 导入，并在校验通过后写入本地画布快照。

启动命令：

```bash
npm run mcp
```

agent 配置示例：

```json
{
  "mcpServers": {
    "serenity": {
      "command": "node",
      "args": ["E:\\repo\\serenity\\scripts\\serenity-mcp.mjs"]
    }
  }
}
```

可用工具：

- `serenity_health`：返回项目路径、store 文件路径、快照状态、节点和边数量。
- `serenity_get_context`：返回 AI 可读语义上下文，支持 `json`、`markdown` 和 `obsidian`。
- `serenity_export_obsidian_markdown`：导出 Obsidian 可读取的 Markdown，包含 frontmatter、wikilink、tags、Mermaid、节点和边。
- `serenity_get_snapshot`：返回原始本地 tldraw 快照。
- `serenity_validate_patch`：校验 JSON AI Patch 或 Serenity Obsidian Markdown 字符串，不写入文件。
- `serenity_apply_patch`：校验并应用 JSON AI Patch 或 Serenity Obsidian Markdown 字符串，原子写入 `store/canvas-default.json`。
- `serenity_validate_markdown_import`：把 Serenity Obsidian Markdown 解析成 AI Patch operations 并校验，不写入文件。
- `serenity_apply_markdown_import`：解析、校验并应用 Serenity Obsidian Markdown 导入。
- `serenity_export_patch_template`：返回最小 patch 示例。

## Obsidian Markdown 导入 / 导出

前端左侧工具栏提供 Obsidian Markdown 导入和导出：

- 导出：调用 `src/ai/context.ts` 中的 `exportObsidianMarkdown(editor)`，生成 `.md` 文件并打开预览弹窗。
- 导入：支持粘贴 Markdown 或选择 `.md` 文件，调用 `src/ai/patch.ts` 中的 `parsePatchText(...)`，转换成 AI Patch operations，预览并校验后再应用。

MCP 侧使用同一套 Node core 合约：

- `exportObsidianMarkdownFromSnapshot(snapshot)`：从本地快照导出 vault-ready Markdown。
- `parsePatchTextInput(input, snapshot)`：同时接受 JSON AI Patch 和 Serenity Obsidian Markdown。
- 已存在 id 的 Markdown 节点会变成 `updateNode`，新 id 会变成 `addNode`。
- Markdown 中新的关系会变成 `connectNodes`，重复的 `fromId -> toId` 会跳过。

Obsidian Markdown 适合知识库留档、人工编辑和 round-trip；JSON AI Patch 仍适合 agent 直接、安全地修改画布。

## 构建和测试

```bash
npm run build
npm run test
```

`npm run build` 会执行 TypeScript 构建和 Vite 生产构建。

## 项目边界

Serenity 当前是一个协作界面和协议层，不负责：

- agent 编排
- 联网搜索
- 模型调用
- API key 管理
- 多人实时协作后端

这些能力可以在后续版本中接入，但第一版会保持画布和语义协议本身足够清晰、稳定和可验证。
