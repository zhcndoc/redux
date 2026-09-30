---
id: examples
title: 示例
description: '介绍 > 示例：Redux 交互示例应用'
---

# 示例

Redux 在其 [源码](https://github.com/reduxjs/redux/tree/master/examples) 中附带了一些示例。这些示例多数也可以在 [CodeSandbox](https://codesandbox.io) 上找到，这是一款在线编辑器，可以让你在线试玩示例。

这些示例分为两组。[Redux Toolkit 示例](#redux-toolkit-examples)展示了我们当前推荐的 Redux 应用编写方式；[传统示例](#legacy-examples)则使用较旧版本的 Redux 和 React Redux 编写。它们仍可运行，也有助于理解 Redux 核心 API 如何配合使用，但其中的模式已不推荐用于新代码。

## Redux Toolkit 示例 {#redux-toolkit-examples}

### Counter

运行 [Counter](https://github.com/reduxjs/redux/tree/master/examples/counter) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/counter
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

这是 Redux Toolkit 与 React 配合使用的最基础示例。它使用 `createSlice` 定义计数器 slice、通过 `configureStore` 配置 store、使用 `useSelector` 读取状态、使用 `useDispatch` 派发 action，并包含一个模拟从服务器获取值的异步 thunk。

该示例包含测试。

### Counter (TypeScript)

运行 [Counter TS](https://github.com/reduxjs/redux/tree/master/examples/counter-ts) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/counter-ts
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter-ts)：

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter-ts/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

这是使用 TypeScript 编写的同一 Counter 示例。它展示了如何从 store 推断 `RootState` 和 `AppDispatch` 类型，以及如何定义预设类型的 `useAppSelector` 和 `useAppDispatch` hooks，详见 [TypeScript 使用指南](../usage/UsageWithTypescript.md)。

该示例包含测试。

### 项目模板

[`reduxjs/redux-templates`](https://github.com/reduxjs/redux-templates) 仓库包含我们官方的 React + Redux Toolkit + TypeScript 项目模板，包括 Vite 模板和 Expo 模板。我们建议以这些模板作为新 Redux 应用的起点。

### Redux Essentials 示例应用

[Redux Essentials 教程](../tutorials/essentials/part-1-overview-concepts.md)使用 Redux Toolkit 和 RTK Query 构建了一个小型社交媒体应用。完整项目位于 [`reduxjs/redux-essentials-example-app`](https://github.com/reduxjs/redux-essentials-example-app) 仓库中，并为每个教程章节提供了对应分支。

## 传统示例 {#legacy-examples}

:::caution

这些示例使用 React 17、Redux 4 和 React Redux 7 编写，采用 `createStore`、手写 action 类型和 action creator、基于 switch 的 reducer，以及 `connect()` 容器组件。这些模式仍然可用，但新应用建议使用上面的 Redux Toolkit 示例和 [Redux Essentials 教程](../tutorials/essentials/part-1-overview-concepts.md)。

:::

### Counter Vanilla

运行 [Counter Vanilla](https://github.com/reduxjs/redux/tree/master/examples/counter-vanilla) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/counter-vanilla
```

然后在浏览器中打开 `index.html`。

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter-vanilla)：

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter-vanilla/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

此示例不需要构建系统或视图库，用于展示在 ES5 中使用原始 Redux API 的方式。

### Todos

运行 [Todos](https://github.com/reduxjs/redux/tree/master/examples/todos) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/todos
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todos):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/todos/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

此示例展示 reducer 如何将 action 的处理委托给其他 reducer，以及 [React Redux](https://github.com/reduxjs/react-redux) 的 `connect()` 如何从展示组件生成容器组件。

该示例包含测试。

### Shopping Cart

运行 [Shopping Cart](https://github.com/reduxjs/redux/tree/master/examples/shopping-cart) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/shopping-cart
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/shopping-cart):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/shopping-cart/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

此示例展示了应用规模增长后会用到的重要 Redux 惯用模式。具体来说，它展示了如何按 ID 归一化存储实体、如何分层组合 reducer，以及如何将 selector 与 reducer 放在一起定义，以封装对状态形状的了解。示例还演示了如何使用 [Redux Logger](https://github.com/LogRocket/redux-logger) 记录日志，以及如何使用 [Redux Thunk](https://github.com/reduxjs/redux-thunk) middleware 有条件地派发 action。

### Tree View

运行 [Tree View](https://github.com/reduxjs/redux/tree/master/examples/tree-view) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/tree-view
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/tree-view):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/tree-view/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

该示例演示了如何渲染深度嵌套的树视图，并将其状态以归一化形式表示，从而使 reducer 更新方便。优秀的渲染性能通过容器组件只细粒度地订阅它们所渲染的树节点实现。

该示例包含测试。
