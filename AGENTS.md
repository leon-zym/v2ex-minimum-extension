# V2EX Minimum Extension — AI Agent 全局规则

## 项目定位

针对 [V2EX](https://www.v2ex.com)（UGC 社区论坛）的浏览器插件。以"最小化"、"极简"的形态增强网站原有功能。

## 技术栈

| 类别       | 选型                                                           |
| ---------- | -------------------------------------------------------------- |
| 框架       | WXT（基于 Vite）                                               |
| 语言       | TypeScript                                                     |
| UI         | React（复杂 UI）+ 原生 DOM（简单操作）                         |
| 样式       | Tailwind CSS + Shadow DOM（插件 UI）；命名空间 CSS（页面修改） |
| 包管理     | pnpm                                                           |
| Manifest   | V3                                                             |
| 存储       | chrome.storage.local                                           |
| 测试       | Vitest + Gherkin BDD                                           |
| 目标浏览器 | Chrome + Safari macOS                                          |

## 核心原则

- 每个功能都是小范围增强，做"锦上添花"而非"伤筋动骨"的改动
- 不删除、不覆盖网站原有的 DOM 节点、CSS 类、网络请求行为
- 添加的 DOM 元素使用 `data-v2ex-min` 属性标记；注入的 CSS 以 `v2ex-min-` 为命名空间前缀
- 插件自有 UI 必须使用 Shadow DOM 封装，避免样式污染
- 不使用 `!important`，除非覆盖目标有明确的 `!important`
- 优先解析页面 DOM 获取数据，[V2EX API 2.0](https://www.v2ex.com/help/api) 仅在 DOM 无法满足时按需使用
- 功能实现时需考虑桌面端和移动端两种 DOM 结构（当前阶段仅在桌面端验证）

## 开发流程（BDD 驱动）

项目遵循 BDD（行为驱动开发）范式：先用业务行为描述需求，再驱动实现，最后验证结果。

1. **描述行为**：在 `tests/features/` 用中文 Gherkin（`# language: zh-CN`）编写 `.feature` 文件
2. **定义步骤**：在 `tests/steps/` 编写步骤定义（Vitest `describe/it` + 正则匹配）
3. **实现功能**：在 `src/features/<name>/index.ts` 实现，导出 `FeatureDefinition`
4. **注册功能**：在 `src/features/registry.ts` 注册元数据，在 `src/features/index.ts` 注册运行时定义
5. **浏览器验证**：用 chrome-devtools MCP 在真实浏览器中验证效果

## 架构要点

- 每个功能通过 Feature Toggle 系统管理，用户可在 Popup 中逐个启用/禁用
- 功能状态持久化到 `chrome.storage.local`，跨会话保持
- 新增功能必须实现 `FeatureDefinition` 接口（`id`、`setup`、`cleanup`）

## 代码约定

- 导入路径使用 `~` 别名（指向 `src/`）
- 入口点放在 `src/entrypoints/`，WXT 按文件名自动识别，不要手动修改 manifest
- `setup` 函数必须返回 `cleanup` 函数，清理事件监听器和 DOM 副作用
- 插件自有 UI 使用 `createShadowRootUi` + Tailwind CSS
- V2EX 页面结构可能随时变化，选择器应尽量使用语义化属性

## 禁止项

- 不要拦截、修改、重放网站原有的网络请求
- 不要往 V2EX 页面注入未经 Shadow DOM 隔离的 React 组件
- 不要在 Content Script 中使用 `eval` 或动态注入 `<script>` 标签
- 不要跳过 BDD 流程直接实现功能——先有 `.feature` 文件描述行为，再写代码
