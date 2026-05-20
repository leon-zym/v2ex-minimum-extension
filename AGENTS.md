# V2EX Minimum Extension — AI Agent 规则

## 项目概述

针对 [V2EX](https://www.v2ex.com) 的浏览器插件。以极简方式增强浏览体验，不破坏网站原有的布局、样式和交互。

## 技术栈

- **框架**: WXT（基于 Vite），Manifest V3
- **语言**: TypeScript 严格模式
- **UI**: React（复杂 UI）+ 原生 DOM（简单操作）
- **样式**: Tailwind CSS + Shadow DOM（插件 UI）；命名空间 CSS（页面修改）
- **存储**: chrome.storage.local
- **测试**: Vitest + Gherkin BDD
- **目标浏览器**: Chrome + Safari macOS

## 开发流程

功能开发必须遵循 BDD 范式——先写行为描述和测试，再写实现代码。

每个新功能按以下顺序完成：

1. `tests/features/<name>.feature` — 用中文 Gherkin 描述用户行为
2. `tests/steps/<name>.test.ts` — 编写步骤定义和测试
3. `src/features/<name>/index.ts` — 实现功能，导出 `FeatureDefinition`
4. `src/features/registry.ts` — 在 `featureRegistry` 数组中添加元数据
5. `src/features/index.ts` — 在 `featureModules` 数组中注册运行时定义
6. 使用 chrome-devtools MCP 在真实浏览器中验证效果

## 开发规则

### WXT 框架

- 入口点放在 `src/entrypoints/`，WXT 按文件名自动识别类型，不手动修改 manifest
- Content Script 使用 `defineContentScript`，Background 使用 `defineBackground`
- `pnpm dev` 启动后加载 `.output/chrome-mv3-dev` 目录即可 HMR 热更新

### DOM

- 不删除原有 DOM 节点，只追加或修改属性
- 添加的元素使用 `data-v2ex-min` 属性标记，便于识别和清理
- 优先解析当前页面 DOM 获取数据，[V2EX API](https://www.v2ex.com/help/api) 仅在 DOM 无法满足时使用
- 选择器尽量使用语义化属性（V2EX 页面结构可能变化）
- 使用 `waitForElement` 等待动态加载的元素，使用 `isV2exPage` 检查页面类型
- 事件监听器必须在 cleanup 函数中移除

### 样式

- 不删除网站原有的 CSS 类或样式
- 所有注入的 CSS 选择器以 `v2ex-min-` 或 `[data-v2ex-min]` 为命名空间
- 注入到宿主页面的插件 UI 必须使用 Shadow DOM 隔离（`createShadowRootUi` + Tailwind CSS）
- 避免 `!important`，除非覆盖目标有明确的 `!important`

### 架构

- `setup` 函数必须返回 `cleanup` 函数，用于功能禁用时清理副作用
- 每个 feature 独立目录，高内聚低耦合
- 导入路径使用 `~` 别名指向 `src/` 目录

### 测试

- `.feature` 文件使用中文 Gherkin 语法（`# language: zh-CN`），放在 `tests/features/`
- 步骤定义放在 `tests/steps/`，使用 Vitest 的 `describe/it` 包装场景，正则匹配步骤文本
- 单元/集成测试用 `pnpm test` 运行，E2E 验证用 chrome-devtools MCP 在真实浏览器中触发

## 文件组织

```
src/
├── entrypoints/       # WXT 入口点（content script, popup, background）
├── features/          # 功能模块（每个功能一个目录）
│   ├── registry.ts    # 功能元数据注册表（Popup 共享）
│   └── index.ts       # 功能运行时注册
├── components/        # 共享 React 组件
├── hooks/             # React Hooks
├── lib/               # 工具库（storage, feature-manager, dom-utils）
├── styles/            # 页面样式覆盖
├── assets/            # 静态资源（Tailwind CSS 入口等）
└── types/             # TypeScript 类型定义
tests/
├── features/          # Gherkin .feature 文件
├── steps/             # 步骤定义和测试文件
└── support/           # 测试辅助工具
```

## 移动端兼容性

- 架构层面预留 iOS Safari 兼容性
- V2EX 网站根据浏览器 UA 返回不同布局，功能实现时需考虑桌面端和移动端两种 DOM 结构
- 当前阶段仅在桌面端（Chrome + Safari macOS）验证
