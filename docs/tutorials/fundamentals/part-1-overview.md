---
id: part-1-overview
title: 'Redux 基础，第 1 部分：Redux 概述'
sidebar_label: 'Redux 概述'
description: 'Redux 官方基础教程：学习使用 Redux 的基础知识'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

<!-- prettier-ignore -->
import FundamentalsWarning from "../../components/_FundamentalsWarning.mdx";

:::tip 你将学到什么

- Redux 是什么以及你为什么可能想使用它
- 构成 Redux 应用的基本部分

:::

## 介绍

欢迎进入 Redux 基础教程！**本教程将向你介绍使用 Redux 的核心概念、原则和模式**。完成后，你应该能理解构成 Redux 应用的不同部分、使用 Redux 时数据的流动方式，以及我们构建 Redux 应用的标准推荐模式。

在本教程的第 1 部分，我们将简单地看一个最小的可运行 Redux 应用示例，了解其组成部分；在[第 2 部分：Redux 概念和数据流](./part-2-concepts-data-flow.md)中，我们将详细探讨这些组件以及 Redux 应用中的数据流动。

从[第 3 部分：状态、动作和 Reducer](./part-3-state-actions-reducers.md)开始，我们将利用这些知识构建一个小型示例应用，演示这些部分如何协同工作，并讨论 Redux 实际工作的方式。在我们“手工”构建完整示例应用后，让你能清楚看到发生了什么，我们会介绍一些常用的 Redux 标准模式和抽象。最后，我们将展示这些底层示例如何转化为我们推荐在实际应用中使用的更高层模式。

### 如何阅读本教程

**本教程将教你“Redux 是如何工作的”**，以及 _为什么这些模式会出现_。

<FundamentalsWarning />

一旦你理解了所有部分如何衔接，我们将介绍如何使用 Redux Toolkit 来简化操作。**Redux Toolkit 是构建生产级 Redux 应用的推荐方式**，它基于本教程中介绍的所有概念构建而成。一旦你掌握了这里讲的核心概念，你将更有效地使用 Redux Toolkit。

我们尽量使这些解释适合初学者，但确实需要假设你已经具备一定的基础知识，这样才能专注于解释 Redux 本身。**本教程假定你已了解以下内容**：

:::important 前提条件

- 熟悉 [HTML 与 CSS](https://internetingishard.netlify.app/html-and-css/index.html)。
- 熟悉 [ES2015 语法和特性](https://www.taniarascia.com/es6-syntax-and-feature-overview/)
- 理解 [数组和对象扩展运算符](https://javascript.info/rest-parameters-spread#spread-syntax)
- 了解 React 相关术语：[JSX](https://react.dev/learn/writing-markup-with-jsx)、[函数组件](https://react.dev/learn/your-first-component)、[Props](https://react.dev/learn/passing-props-to-a-component)、[状态](https://react.dev/learn/state-a-components-memory)和[Hooks](https://react.dev/reference/react)
- 了解 [异步 JavaScript](https://javascript.info/promise-basics) 和 [发送 HTTP 请求](https://javascript.info/fetch)

:::

**如果你对这些内容还不太熟悉，建议先花些时间掌握它们，然后再回来学习 Redux**。我们等你准备好了！

最后，请确保你在浏览器中安装了 React 和 Redux DevTools 扩展：

- React DevTools 扩展：
  - [Chrome 版 React DevTools 扩展](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
  - [Firefox 版 React DevTools 扩展](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- Redux DevTools 扩展：
  - [Chrome 版 Redux DevTools 扩展](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - [Firefox 版 Redux DevTools 扩展](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

## 什么是 Redux？

首先理解“Redux”到底是什么是很有帮助的。它做什么？帮助我解决什么问题？为什么我要用它？

**Redux 是一种管理和更新全局应用状态的模式和库，其中 UI 触发称为“动作（actions）”的事件来描述发生了什么，独立的更新逻辑称为“Reducer”用来响应这些动作更新状态**。它作为整个应用需要共享状态的集中式存储，规定了状态只能以可预测的方式被更新的规则。

### 为什么要用 Redux？

Redux 帮助你管理“全局”状态——应用中多个部分都需要访问的状态。

**Redux 提供的模式和工具让你更容易理解什么时候、在哪里、为何以及如何更新你的应用状态，以及在状态变化时你的应用逻辑如何表现**。Redux 指导你编写可预测、易测试的代码，从而给你信心，保证应用按预期工作。

### 什么时候该用 Redux？

Redux 帮助你处理共享状态管理，但像所有工具一样，它有利有弊。需要学习更多概念，写更多代码。它也为代码增加了一些间接层，并要求遵守一定的限制。这是在短期和长期生产力之间的权衡。

Redux 更适合以下情况：

- 你有大量需要跨应用多个地方使用的状态
- 应用状态随着时间频繁更新
- 更新状态的逻辑可能比较复杂
- 应用代码库中等规模或大型，且可能由多人协作开发

**并非所有应用都需要 Redux。请根据你构建的应用类型，思考哪些工具最适合解决你面临的问题。**

:::info 想了解更多？

如果你不确定 Redux 是否适合你的应用，下面资源能提供更多指导：

- **[何时（及何时不）使用 Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)**
- **[Redux 之道，第 1 部分 - 实现与意图](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**
- **[Redux 常见问答：什么时候该用 Redux？](../../faq/General.md#when-should-i-use-redux)**
- **[你可能不需要 Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**

:::

### Redux 库和工具

Redux 是一个小型独立的 JS 库，但常与其他几个包一起使用：

#### Redux Toolkit

[**Redux Toolkit**](https://redux-toolkit.js.org) 是我们推荐的编写 Redux 逻辑的方法。它包含了一些我们认为构建 Redux 应用时必不可少的包和函数。Redux Toolkit 集成了我们的最佳实践，大大简化了大多数 Redux 任务，防止常见错误，让编写 Redux 应用更便捷。

#### React-Redux

Redux 可以和任何 UI 框架集成，最常见的是和 React 一起使用。[**React-Redux**](https://react-redux.js.org/) 是我们的官方包，它让 React 组件能与 Redux store 交互，读取部分状态并分发动作来更新 store。

#### Redux DevTools 扩展

[**Redux DevTools 扩展**](https://github.com/reduxjs/redux-devtools/tree/main/extension) 显示 Redux store 中状态随时间变化的历史记录。它能帮助你有效调试应用，包括使用强大的“时间旅行调试”技术。

## Redux 基础

现在你知道什么是 Redux，让我们简要看一下构成 Redux 应用的部分，以及它是如何工作的。

:::info

本页其余内容仅聚焦 Redux 核心库（`redux` 包）。后面教程中会陆续介绍其他 Redux 相关包。

:::

### Redux Store

每个 Redux 应用的核心是 **store**。Store 是一个容器，保存着应用的全局 **状态**。

Store 是一个 JavaScript 对象，但它有一些特殊的函数和能力，使它不同于普通的全局对象：

- 你绝不能直接修改存储在 Redux store 里的状态
- 触发状态更新的唯一方式是创建一个简单的 **动作** 对象，描述“应用中发生了什么”，然后 **dispatch** 这个动作到 store，告诉它发生了什么
- 当动作被 dispatch，store 会执行根 **reducer** 函数，基于旧状态和该动作计算新状态
- 最后，store 通知所有 **订阅者** 状态已更新，这样 UI 才能用新数据重绘

### Redux 核心示例应用

让我们来看一个最小可用的 Redux 应用示例——一个简单的计数器应用：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/dank-architecture-lr7k1?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-fundamentals-core-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

由于 Redux 是一个独立的 JS 库且无依赖，该示例仅通过加载 Redux 库的一个脚本标签编写，UI 使用基础的 JS 和 HTML。实际上，Redux 通常通过 [NPM 安装 Redux 包](../../introduction/Installation.md)，UI 使用像 [React](https://reactjs.org) 这样的库构建。

:::info

[第 5 部分：UI 和 React](./part-5-ui-and-react.md) 展示了如何将 Redux 和 React 结合使用。

:::

让我们将这个示例拆解成各个部分，看看发生了什么。

#### 状态、动作和 Reducer

我们先定义一个初始的 **状态** 值，描述应用：

```js
// 定义应用的初始状态值
const initialState = {
  value: 0
}
```

该应用只会追踪一个数字，代表当前计数器的值。

Redux 应用通常以一个 JS 对象作为根状态，内部包含其他值。

然后，定义一个 **reducer** 函数。Reducer 接收两个参数，当前的 `state` 和描述发生了什么的 `action` 对象。Redux 应用启动时还没有状态，所以我们为该 reducer 提供 `initialState` 作为默认值：

```js
// 创建一个“reducer”函数，用于确定应用中发生变化时的新状态
function counterReducer(state = initialState, action) {
  // Reducer 通常根据动作类型决定如何更新状态
  switch (action.type) {
    case 'counter/incremented':
      return { ...state, value: state.value + 1 }
    case 'counter/decremented':
      return { ...state, value: state.value - 1 }
    default:
      // 如果 reducer 不关心这个动作类型，则返回不变的状态
      return state
  }
}
```

动作对象总有一个 `type` 字段，这是你提供的字符串，用作动作的唯一名称。`type` 应该是可读的名字，让任何人看到代码都能理解。在这里，我们用“counter”作为动作类型的前半部分，后半部分描述“发生了什么”。我们的计数器被“增加”了，所以写成 `'counter/incremented'`。

根据动作类型，我们要么返回一个全新的对象作为新的 `state`，要么返回现有的 `state`（如果状态无需变化）。注意我们通过 _不可变_ 方式更新状态：复制现有状态并更新副本，而非直接修改原对象。

#### Store

有了 reducer 函数后，我们可以调用 Redux 库的 `createStore` API 创建一个 **store** 实例。

```js
// 调用 `createStore` 创建 Redux store，
// 并使用 `counterReducer` 作为更新逻辑
const store = Redux.createStore(counterReducer)
```

我们将 reducer 函数传给 `createStore`，该函数负责生成初始状态，以及之后的所有状态更新。

#### UI

任何应用，其用户界面都会展示当前状态。当用户进行操作时，应用更新数据并使用新数据重新渲染 UI。

```js
// 我们的“用户界面”是单个 HTML 元素中的一些文本
const valueEl = document.getElementById('value')

// 每当 store 状态改变时，调用该函数读取最新状态并更新 UI
function render() {
  const state = store.getState()
  valueEl.innerHTML = state.value.toString()
}

// 使用初始数据渲染 UI
render()
// 并订阅 store 变化，未来数据改变时自动重新渲染 UI
store.subscribe(render)
```

在这个小例子里，我们只是用简单的 HTML 元素展示 UI，一个 `<div>` 显示当前的值。

于是，我们写了一个函数 `render`，它调用 `store.getState()` 获取最新状态，然后将该值更新到 UI。

Redux store 允许我们调用 `store.subscribe()` 注册订阅函数，每次 store 更新时调用。我们将 `render` 传给订阅，这样状态更新时自动用最新值更新界面。

Redux 本身是可独立使用的库，因此可配合任何 UI 框架。

#### 发送动作（Dispatch Actions）

最后，我们需要响应用户输入，创建描述发生了什么的 **动作** 对象，并 **dispatch** 给 store。当调用 `store.dispatch(action)`，store 即运行 reducer，计算新状态，并调用订阅函数更新 UI。

```js
// 通过“dispatch”动作对象响应用户输入，
// 动作描述了应用中“发生了什么”
document.getElementById('increment').addEventListener('click', function () {
  store.dispatch({ type: 'counter/incremented' })
})

document.getElementById('decrement').addEventListener('click', function () {
  store.dispatch({ type: 'counter/decremented' })
})

document
  .getElementById('incrementIfOdd')
  .addEventListener('click', function () {
    // 也可以基于状态写逻辑决定是否 dispatch
    if (store.getState().value % 2 !== 0) {
      store.dispatch({ type: 'counter/incremented' })
    }
  })

document
  .getElementById('incrementAsync')
  .addEventListener('click', function () {
    // 还能写异步逻辑，在延迟后 dispatch 动作
    setTimeout(function () {
      store.dispatch({ type: 'counter/incremented' })
    }, 1000)
  })
```

这里我们 dispatch 动作，使 reducer 让计数器值加 1 或减 1。

也可以编写代码仅在特定条件满足时 dispatch，或写异步代码，在延迟后 dispatch。

### 数据流

我们用下面的图总结 Redux 应用中的数据流。这表示：

- 动作被派发响应用户交互（如点击）
- store 运行 reducer 计算新状态
- UI 读取新状态，显示新数据

（如果这些部分还不太明白也不必担心！记住这幅图，随着教程深入你会明白这些部分如何配合。）

![Redux 数据流图](/img/tutorials/essentials/ReduxDataFlowDiagram.gif)

## 你学到了什么

这个计数器示例虽小，但展示了一个真正 Redux 应用的工作部分。
**接下来章节会在这些基础部分上进行深入扩展。**

带着这些，来回顾下我们目前学到了什么：

:::tip 小结

- **Redux 是管理全局应用状态的库**
  - 通常和 React-Redux 配合使用，实现 React 与 Redux 集成
  - Redux Toolkit 是编写 Redux 逻辑的标准方式
- **Redux 的更新模式将“发生了什么”与“状态变化方式”分离**
  - _动作（Actions）_ 是含有 `type` 字段的简单对象，描述应用中“发生了什么”
  - _Reducer_ 是函数，基于前一状态和动作计算新状态
  - Redux _store_ 每当动作被 _dispatch_ 时执行根 reducer
- **Redux 使用“单向数据流”应用架构**
  - 状态描述某时刻应用的状态，UI 依据此状态渲染
  - 当应用中发生某事：
    - UI 派发动作
    - store 运行 reducer，状态依据发生的事情更新
    - store 通知 UI 状态已改变
  - UI 基于新状态重新渲染

:::

## 接下来？

现在你知道了 Redux 应用的基本组成部分，下一步请前往[第 2 部分：Redux 概念和数据流](./part-2-concepts-data-flow.md)，我们将更详细讲解 Redux 应用中的数据流向。