# V2EX Minimum Extension

极简增强 [V2EX](https://www.v2ex.com) 浏览体验的浏览器插件。

以最小化、无侵入的方式优化网站的交互和样式，不破坏原有布局和功能。

## 功能

- [x] **评论按感谢排序** — 在帖子页面将评论按感谢数量从多到少排序，支持多页合并排序

更多功能持续开发中。

## 技术栈

- **框架**：[WXT](https://wxt.dev)（基于 Vite）
- **语言**：TypeScript
- **UI**：React + Tailwind CSS（Shadow DOM 隔离）
- **Manifest**：V3
- **测试**：Vitest + Gherkin BDD
- **目标浏览器**：Chrome、Safari

## 开发

### 环境要求

- Node.js >= 18
- pnpm >= 8

### 安装依赖

```bash
pnpm install
```

### 启动开发模式

```bash
# Chrome（默认）
pnpm dev

# Firefox
pnpm dev:firefox

# Safari
pnpm dev:safari
```

启动后，在 Chrome 中打开 `chrome://extensions`，启用「开发者模式」，点击「加载已解压的扩展程序」，选择 `.output/chrome-mv3-dev` 目录。

### 构建

```bash
# 构建 Chrome 版本
pnpm build

# 构建 Safari 版本
pnpm build:safari

# 打包 ZIP（用于发布）
pnpm zip
```

### 测试

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch
```

## 项目结构

```
src/
├── entrypoints/       # WXT 入口（content script, popup, background）
├── features/          # 功能模块（每个功能独立目录）
├── components/        # 共享 React 组件
├── hooks/             # React Hooks
├── lib/               # 工具库
├── styles/            # 页面样式覆盖
├── assets/            # 静态资源
└── types/             # 类型定义
tests/
├── features/          # Gherkin .feature 文件
├── steps/             # 步骤定义
└── support/           # 测试辅助
```

开发规范和功能开发流程详见 [AGENTS.md](AGENTS.md)。

## 许可证

MIT
