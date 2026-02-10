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

该包包含预编译的 ESM 构建，可以直接在浏览器中作为 [`<script type="module">` 标签](https://unpkg.com/redux/dist/redux.browser.mjs) 使用。

## 补充包

### React-Redux

你很可能还需要 [用于 React 的 `react-redux` 绑定](https://github.com/reduxjs/react-redux)

```bash
npm install react-redux
```

请注意，与 Redux 本身不同，Redux 生态系统中的许多包不提供 UMD 构建，因此我们建议使用模块打包器，如 [Vite](https://vitejs.dev/) 和 [Webpack](https://webpack.js.org/)，以获得更舒适的开发体验。

### Redux DevTools 扩展

Redux Toolkit 的 `configureStore` 会自动设置与 [Redux DevTools](https://github.com/reduxjs/redux-devtools/tree/main/extension) 的集成。你需要安装浏览器扩展来查看 store 状态和操作：

- Redux DevTools 扩展：
  - [Chrome 版 Redux DevTools 扩展](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - [Firefox 版 Redux DevTools 扩展](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

如果你使用 React，还需要安装 React DevTools 扩展：

- React DevTools 扩展：
  - [Chrome 版 React DevTools 扩展](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
  - [Firefox 版 React DevTools 扩展](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

## 创建 React Redux 应用

启动 React 和 Redux 新应用的推荐方式是使用 [我们官方的 Vite Redux+TS 模板](https://github.com/reduxjs/redux-templates)，或使用 [Next.js 的 `with-redux` 模板](https://github.com/vercel/next.js/tree/canary/examples/with-redux) 创建新项目。

这两个模板都已为各自的构建工具适当配置了 Redux Toolkit 和 React-Redux，并附带一个小型示例应用，演示如何使用 Redux Toolkit 的多个功能。

```bash
# 使用我们的 Redux+TS Vite 模板
# （使用 `degit` 工具克隆并提取模板）
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app

# 使用 Next.js 的 `with-redux` 模板
npx create-next-app --example with-redux my-app
```

我们当前没有官方的 React Native 模板，但推荐以下 React Native 和 Expo 的模板：

- https://github.com/rahsheen/react-native-template-redux-typescript
- https://github.com/rahsheen/expo-template-redux-typescript

## Redux 核心

单独安装 `redux` 核心包：

```bash
# NPM
npm install redux

# Yarn
yarn add redux
```

如果你不使用打包器，可以[访问 unpkg 上的这些文件](https://unpkg.com/redux/)、下载它们，或让你的包管理器指向它们。