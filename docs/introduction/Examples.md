---
id: examples
title: 示例
description: '介绍 > 示例：Redux 交互示例应用'
---

# 示例

Redux 在其 [源码](https://github.com/reduxjs/redux/tree/master/examples) 中附带了一些示例。这些示例多数也可以在 [CodeSandbox](https://codesandbox.io) 上找到，这是一款在线编辑器，可以让你在线试玩示例。

## Counter Vanilla

运行 [Counter Vanilla](https://github.com/reduxjs/redux/tree/master/examples/counter-vanilla) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/counter-vanilla
open index.html
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter-vanilla):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter-vanilla/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

该示例不需要构建系统或视图库，旨在展示用 ES5 原生 Redux API 的用法。

## Counter

运行 [Counter](https://github.com/reduxjs/redux/tree/master/examples/counter) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/counter
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/counter):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

这是 Redux 与 React 结合使用的最基本示例。为简便起见，它在 store 变更时手动重新渲染 React 组件。实际项目中，你通常会想使用高性能的 [React Redux](https://github.com/reduxjs/react-redux) 绑定。

该示例包含测试。

## Todos

运行 [Todos](https://github.com/reduxjs/redux/tree/master/examples/todos) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/todos
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todos):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/todos/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

这是深入理解 Redux 中状态更新与组件交互的最佳示例。它展示了 reducer 如何将动作处理委托给其他 reducer，以及如何使用 [React Redux](https://github.com/reduxjs/react-redux) 从展示组件生成容器组件。

该示例包含测试。

## Todos with Undo

运行 [Todos with Undo](https://github.com/reduxjs/redux/tree/master/examples/todos-with-undo) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/todos-with-undo
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todos-with-undo):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/todos-with-undo/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

这是前一个示例的变体。它几乎相同，但额外展示了如何用 [Redux Undo](https://github.com/omnidan/redux-undo) 包装 reducer，从而仅需几行代码为应用添加撤销/重做功能。

## TodoMVC

运行 [TodoMVC](https://github.com/reduxjs/redux/tree/master/examples/todomvc) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/todomvc
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/todomvc):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/todomvc/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

这是经典的 [TodoMVC](http://todomvc.com/) 示例。它用于对比，但涵盖了与 Todos 示例相同的要点。

该示例包含测试。

## 购物车 (Shopping Cart)

运行 [Shopping Cart](https://github.com/reduxjs/redux/tree/master/examples/shopping-cart) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/shopping-cart
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/shopping-cart):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/shopping-cart/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

该示例展示了随着应用增长而变得重要的 Redux 典型模式。特别是，它演示了如何按 ID 以归一化方式存储实体，如何在多个层级组合 reducers，以及如何在 reducer 旁定义 selectors，以封装关于状态结构的知识。它还演示了使用 [Redux Logger](https://github.com/fcomb/redux-logger) 记录日志，以及用 [Redux Thunk](https://github.com/reduxjs/redux-thunk) 中间件有条件派发动作。

## Tree View

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

## Async

运行 [Async](https://github.com/reduxjs/redux/tree/master/examples/async) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/async
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/async):

<iframe class="codesandbox"src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/async/?codemirror=1&runonclick=1"sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

该示例展示了如何从异步 API 读取数据，根据用户输入获取数据，显示加载指示器，缓存响应数据以及使缓存失效。使用了 [Redux Thunk](https://github.com/reduxjs/redux-thunk) 中间件封装异步副作用。

## Universal

运行 [Universal](https://github.com/reduxjs/redux/tree/master/examples/universal) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/universal
npm install
npm start
```

这是一个使用 Redux 和 React 的 [服务端渲染](../usage/ServerRendering.md) 基础示范。它展示了如何在服务端准备初始 store 状态，并传递给客户端，以便客户端 store 可以从现有状态启动。

## Real World

运行 [Real World](https://github.com/reduxjs/redux/tree/master/examples/real-world) 示例：

```sh
git clone https://github.com/reduxjs/redux.git

cd redux/examples/real-world
npm install
npm start
```

或者查看 [sandbox](https://codesandbox.io/s/github/reduxjs/redux/tree/master/examples/real-world):

<iframe class="codesandbox" src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/real-world/?codemirror=1&runonclick=1" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>

这是最复杂的示例，设计得非常紧凑。涵盖了保持获取的实体到归一化缓存，实施自定义中间件处理 API 调用，渲染部分加载数据、分页、缓存响应、显示错误信息以及路由。此外还包含了 Redux DevTools。

## 更多示例

你可以在 [Redux 应用和示例](https://github.com/markerikson/redux-ecosystem-links/blob/master/apps-and-examples.md) 页面找到更多示例，该页面属于 [Redux 附加组件目录](https://github.com/markerikson/redux-ecosystem-links)。