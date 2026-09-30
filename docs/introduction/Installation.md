---
id: installation
title: 安装
description: '介绍 > 安装：Redux 及相关包的安装说明'
---

# 安装

## Redux Toolkit

Redux Toolkit 包含 Redux 核心，以及其他我们认为构建 Redux 应用必备的关键包（例如 Redux Thunk 和 Reselect）。

它作为一个 NPM 包可用，适用于模块打包器或 Node 应用：

```bash
# NPM
npm install @reduxjs/toolkit

# Yarn
yarn add @reduxjs/toolkit
```

此包包含预编译的 ESM 版本，可直接在浏览器中通过 [`<script type="module">` 标签](https://unpkg.com/@reduxjs/toolkit/dist/redux-toolkit.browser.mjs)使用。

## 创建 React Redux 应用 {#create-a-react-redux-app}

使用 React 和 Redux 创建新应用时，推荐使用我们的[官方模板](https://github.com/reduxjs/redux-templates)。模板已针对相应构建工具配置好 Redux Toolkit 和 React-Redux，并附带一个小型示例应用，展示 Redux Toolkit 的多项功能。

可以使用 `tiged` 等工具克隆并提取模板：

```bash
# Vite + TypeScript
npx tiged reduxjs/redux-templates/packages/vite-template-redux my-app

# Expo + TypeScript
npx tiged reduxjs/redux-templates/packages/expo-template-redux-typescript my-app

# Standalone Redux Toolkit app structure example
npx tiged reduxjs/redux-templates/examples/rtk-app-structure-example my-app
```

对于 Next.js，请使用 [Next.js 的 `with-redux` 示例](https://github.com/vercel/next.js/tree/canary/examples/with-redux)，并参阅我们的 [Next.js 与 Redux 指南](../usage/nextjs.mdx)：

```bash
npx create-next-app --example with-redux my-app
```

## 补充包

### React-Redux

你很可能还需要 [用于 React 的 `react-redux` 绑定](https://github.com/reduxjs/react-redux)

```bash
npm install react-redux
```

请注意，与 Redux 本身不同，Redux 生态系统中的许多包不提供 UMD 构建，因此我们建议使用模块打包器，如 [Vite](https://vitejs.dev/) 和 [Webpack](https://webpack.js.org/)，以获得更舒适的开发体验。

### Redux DevTools 扩展

Redux Toolkit 的 `configureStore` 会自动设置与 [Redux DevTools](https://github.com/reduxjs/redux-devtools/tree/main/extension) 的集成。你需要安装浏览器扩展来查看 store 状态和操作：

- Redux DevTools Extension:
  - [Redux DevTools Extension for Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - [Redux DevTools Extension for Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)
  - [Redux DevTools Extension for Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei)

如果你使用 React，还需要安装 React DevTools 扩展：

- React DevTools 扩展：
  - [Chrome 版 React DevTools 扩展](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
  - [Firefox 版 React DevTools 扩展](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## Redux 核心

Redux Toolkit 已包含并重新导出 `redux` 核心包，因此大多数应用无需单独安装。若要单独安装 `redux` 核心包：

```bash
# NPM
npm install redux

# Yarn
yarn add redux
```

如果你不使用打包器，可以[访问 unpkg 上的这些文件](https://unpkg.com/redux/)、下载它们，或让你的包管理器指向它们。
