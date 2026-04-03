# V2EX Minimum Extension — AI Agent 全局规则

## 项目概述

`v2ex-minimum-extension` 是一个针对 [V2EX](https://www.v2ex.com) 网站的浏览器插件。V2EX 是一个 UGC 形式的创意工作者社区论坛，用户可以发帖、评论、回复。

本插件以"最小化"、"极简"的形态拓展网站原有功能，不破坏和大改动网站原有的布局、样式、交互和功能。

## 项目目标

- 以极简方式增强 V2EX 的浏览和使用体验
- 每个功能都是小范围增强，优化现有交互和样式
- 保持高度可扩展性，新功能通过 Feature Toggle 系统注册即用
- 尊重网站原有设计，做"锦上添花"而非"伤筋动骨"的改动

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | WXT（基于 Vite） |
| 语言 | TypeScript |
| UI | React（复杂 UI）+ 原生 DOM（简单操作） |
| 样式 | Tailwind CSS + Shadow DOM（插件 UI）；命名空间 CSS（页面修改） |
| 包管理 | pnpm |
| Manifest | V3 |
| 存储 | chrome.storage.local |
| 测试 | Vitest + Gherkin BDD |
| 目标浏览器 | Chrome + Safari macOS |

## 开发规范

### 功能开发流程

1. 在 `tests/features/` 下用 Gherkin 语法（中文）编写 `.feature` 文件描述用户行为
2. 在 `tests/steps/` 下编写对应的步骤定义和测试
3. 在 `src/features/` 下创建独立的功能目录
4. 在 `src/features/registry.ts` 中注册功能元数据
5. 在 `src/features/index.ts` 中注册功能的运行时定义
6. 使用 chrome-devtools MCP 在真实浏览器中验证效果

### 代码风格

- 使用 TypeScript 严格模式
- 导入路径使用 `~` 别名指向 `src/` 目录
- 功能模块保持高内聚低耦合，每个 feature 是独立的
- CSS 类名使用 `v2ex-min-` 前缀避免与网站样式冲突
- 插件自有 UI 组件使用 Shadow DOM 隔离

### 文件组织

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

### 新增功能模板

每个新功能需要：

1. **功能元数据**：在 `src/features/registry.ts` 的 `featureRegistry` 数组中添加
2. **功能定义**：创建 `src/features/<feature-name>/index.ts` 并导出 `FeatureDefinition`
3. **注册入口**：在 `src/features/index.ts` 中 import 并添加到 `featureModules` 数组
4. **BDD 场景**：在 `tests/features/<feature-name>.feature` 中描述行为
5. **步骤定义**：在 `tests/steps/<feature-name>.test.ts` 中实现测试

### 数据获取策略

- 优先解析当前页面 DOM 获取数据
- V2EX API 2.0 仅在 DOM 无法满足时按需使用
- API 文档参考：https://www.v2ex.com/help/api

### 样式修改原则

- 不删除网站原有的 CSS 类或样式
- 修改现有样式时使用足够特异性的选择器
- 所有注入的 CSS 选择器以 `v2ex-min-` 或 `[data-v2ex-min]` 为命名空间
- 插件自有 UI 元素必须使用 Shadow DOM 封装
- 不使用 `!important`，除非覆盖目标有明确的 `!important`

### 移动端兼容性

- 架构层面预留 iOS Safari 兼容性
- V2EX 网站根据浏览器 UA 返回不同布局
- 功能实现时需考虑桌面端和移动端两种 DOM 结构
- 当前阶段仅在桌面端（Chrome + Safari macOS）验证
