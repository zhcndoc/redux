---
id: part-1-overview-concepts
title: 'Redux 基础篇 第1部分：Redux 概述与概念'
sidebar_label: 'Redux 概述与概念'
description: 'Redux 官方基础教程：学习如何以正确方式使用 Redux'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 你将学到

- Redux 是什么，以及为什么你可能想使用它
- 关键的 Redux 术语和概念
- 数据如何在 Redux 应用中流动

:::

## 介绍

欢迎来到 Redux 基础教程！**本教程将向你介绍 Redux，并教你如何使用它的正确方式，采用我们最新推荐的工具和最佳实践**。完成本教程后，你应该能够开始使用这里学到的工具和模式构建你自己的 Redux 应用。

在本教程的第1部分，我们将涵盖使用 Redux 所需了解的关键概念和术语，在[第2部分：Redux 应用结构](./part-2-app-structure.md)中，我们将检查一个典型的 React + Redux 应用，了解各部分如何协作。

从[第3部分：基本 Redux 数据流](./part-3-data-flow.md)开始，我们将利用所学知识构建一个带有一些真实世界功能的小型社交媒体信息流应用，看看这些部分在实际中如何工作，并讨论使用 Redux 的一些重要模式和指南。

### 如何阅读本教程

本教程重点展示如何以**正确方式**使用 Redux，并在过程中解释相关概念，以便你能正确地构建 Redux 应用。

我们努力使解释适合初学者，但也需要假设你已经具备以下知识：

:::important 先决条件

- 熟悉 [HTML 和 CSS](https://internetingishard.netlify.app/html-and-css/index.html)
- 熟悉 [ES2015 语法和特性](https://www.taniarascia.com/es6-syntax-and-feature-overview/)
- 了解 React 术语：[JSX](https://react.dev/learn/writing-markup-with-jsx)、[函数组件](https://react.dev/learn/your-first-component)、[Props](https://react.dev/learn/passing-props-to-a-component)、[状态](https://react.dev/learn/state-a-components-memory)和[Hooks](https://react.dev/reference/react)
- 了解[异步 JavaScript](https://javascript.info/promise-basics)和[发起 HTTP 请求](https://javascript.info/fetch)
- 具备[TypeScript 语法及用法基础](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

:::

**如果你尚未熟悉这些主题，我们建议你先花些时间熟悉它们，然后再回来学习 Redux。我们会等你准备好！**

你还应确保浏览器中已安装 React 和 Redux DevTools 扩展：

- React DevTools 扩展：
  - [Chrome 版 React DevTools 扩展](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
  - [Firefox 版 React DevTools 扩展](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- Redux DevTools 扩展：
  - [Chrome 版 Redux DevTools 扩展](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en)
  - [Firefox 版 Redux DevTools 扩展](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)

## 什么是 Redux？

首先了解 “Redux” 究竟是什么很有帮助。它能做什么？能帮我解决什么问题？为什么我会想用它？

**Redux 是一种用于管理和更新全局应用状态的模式和库，UI 会触发称为“actions（动作）”的事件来描述发生了什么，独立的更新逻辑称为“reducers（归约器）”用来响应这些事件更新状态。** 它作为整个应用需要共享状态的集中存储，且有规则保证状态只能以可预测的方式更新。

### 为什么我要使用 Redux？

Redux 帮助你管理“全局”状态，即应用中多个部分都需要访问的状态。

**Redux 提供的模式和工具让你更容易理解状态在应用中何时、何地、为何以及如何被更新，以及状态变化时应用逻辑的行为。** Redux 引导你编写可预测且可测试的代码，从而增强你对应用正常运行的信心。

### 什么时候用 Redux？

Redux 有助于管理共享状态，但像任何工具一样，它有权衡。你需要学习更多概念，写更多代码。它也让代码结构增添了一些间接层，并要求你遵守一定的限制。这是短期与长期开发效率的权衡。

在以下情况下，Redux 更为有用：

- 你有大量的应用状态需要在多个地方使用
- 应用状态随时间频繁更新
- 更新状态的逻辑可能复杂
- 应用代码体量中等或大型，且多个开发者协作

**并非所有应用都需要 Redux。花些时间考虑你正在构建的应用类型，决定用什么工具最适合解决你的问题。**

:::info 想了解更多？

如果你不确定 Redux 是否适合你的应用，这些资源会提供更多指导：

- **[何时（及何时不）选用 Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)**
- **[Redux 的道，第一部分－实现与意图](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**
- **[Redux FAQ：我什么时候该用 Redux？](../../faq/General.md#when-should-i-use-redux)**
- **[你可能不需要 Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**

:::

### Redux 库和工具

Redux 核心是一个小巧独立的 JS 库。它通常与以下包一同使用：

#### Redux Toolkit

[**Redux Toolkit**](https://redux-toolkit.js.org) 是我们推荐的编写 Redux 逻辑的标准方案。它包含了构建 Redux 应用必需的包和函数。Redux Toolkit 集成了我们的最佳实践，简化了大部分 Redux 任务，防止常见错误，使编写 Redux 应用更容易。

#### React-Redux

Redux 可以和任何 UI 框架集成，最常用的是 React。[**React-Redux**](https://react-redux.js.org/) 是我们官方提供的包，允许你的 React 组件与 Redux store 交互——读取 state 片段并分发 actions 来更新 store。

#### Redux DevTools 扩展

[**Redux DevTools 扩展**](https://github.com/reduxjs/redux-devtools/tree/main/extension) 显示 Redux store 中状态变化的历史。它让你高效调试应用，包括使用强大的“时间旅行调试”等技术。

## Redux 术语与概念

在看代码之前，我们先来谈谈使用 Redux 需要了解的一些术语和概念。

### 状态管理

我们从一个简单的 React 计数器组件开始。它在组件状态中跟踪一个数字，并在点击按钮时增加数字：

```jsx
function Counter() {
  // 状态：计数值
  const [counter, setCounter] = useState(0)

  // Action：当某事发生时导致状态更新的代码
  const increment = () => {
    setCounter(prevCounter => prevCounter + 1)
  }

  // 视图：UI 定义
  return (
    <div>
      Value: {counter} <button onClick={increment}>Increment</button>
    </div>
  )
}
```

这是一个自包含的应用，有以下部分：

- **状态**，驱动应用的事实真相
- **视图**，基于当前状态的 UI 声明式描述
- **动作**，源自用户输入等的事件，触发状态更新

这体现了**“单向数据流”**的一个小示例：

- 状态描述应用某一时刻的情况
- UI 基于状态渲染
- 当发生某事（如用户点击按钮），根据发生的事更新状态
- UI 根据新状态重新渲染

![单向数据流](/img/tutorials/essentials/one-way-data-flow.png)

然而，当**多个不同部分的组件都需要共享和使用同一个状态**时，这种简单方式会崩溃，特别是这些组件分散在应用不同位置时。有时可通过“[状态提升](https://react.dev/learn/sharing-state-between-components)”到父组件解决，但并不总是有效。

一种解决方案是把共享状态从组件中抽取，放到组件树外的集中位置。这样，我们的组件树就变成了一个“大视图”，任意组件都能访问状态或触发动作，无论它们在树中的哪个位置！

通过定义和分离状态管理相关的概念，并强制规则保持视图和状态的独立性，我们让代码具备更多结构化和可维护性。

这就是 Redux 的基本思想：在应用中有一个集中放置全局状态的地方，并在更新状态时遵循特定模式，使代码更具可预测性。

### 不可变性（Immutability）

“可变”（mutable）是“可改变”的意思。“不可变”（immutable）则表示永远无法被改变。

JavaScript 对象和数组默认都是可变的。创建一个对象后，可以修改其字段；创建数组后，也能修改其内容：

```js
const obj = { a: 1, b: 2 }
// 外部引用仍是同一个对象，但内容已变
obj.b = 3

const arr = ['a', 'b']
// 同样，我们可以改变数组内容
arr.push('c')
arr[1] = 'd'
```

这称为**对对象或数组进行“变异”**。内存中引用相同，但内容已变。

**若想以不可变方式更新值，你的代码必须先 _复制_ 现有对象/数组，然后修改复制品**。

我们可以用 JavaScript 的对象/数组展开运算符，以及返回新数组而非修改原数组的方法来实现：

```js
const obj = {
  a: {
    // 为安全更新 obj.a.c，必须复制每一级
    c: 3
  },
  b: 2
}

const obj2 = {
  // 复制 obj
  ...obj,
  // 覆盖 a
  a: {
    // 复制 obj.a
    ...obj.a,
    // 覆盖 c
    c: 42
  }
}

const arr = ['a', 'b']
// 创建新数组副本，末尾增加 'c'
const arr2 = arr.concat('c')

// 或复制原数组：
const arr3 = arr.slice()
// 然后修改复制品：
arr3.push('c')
```

**React 和 Redux 都期待所有状态更新都是不可变完成的**。稍后我们会详细讲述为何重要，以及如何更轻松地编写不可变更新逻辑。

:::info 想了解更多？

想了解 JavaScript 中不可变性的更多内容，请参考：

- [JavaScript 中引用的可视化指南](https://daveceddia.com/javascript-references/)
- [React 和 Redux 中的不可变性：完整指南](https://daveceddia.com/react-redux-immutability-guide/)

:::

### 术语

继续之前，有些 Redux 重要术语需要你理解：

#### Action（动作）

**动作是一个普通的 JavaScript 对象，拥有 `type` 字段。**你可以把动作看作描述应用中发生了什么的事件。

`type` 字段应为字符串，用于给动作命名，如 `"todos/todoAdded"`。通常我们写成 `"domain/eventName"` 格式，前半部分是该动作所属的功能或範畴，后半是具体事件。

动作对象还可以带有其他字段，携带关于发生事件的附加信息，惯例是用 `payload` 字段存放。

示例动作对象：

```js
const addTodoAction = {
  type: 'todos/todoAdded',
  payload: '买牛奶'
}
```

#### Action Creator（动作创建函数）

**动作创建函数是生成并返回动作对象的函数。**我们通常使用它们来避免每次都手写动作对象：

```js
const addTodo = text => {
  return {
    type: 'todos/todoAdded',
    payload: text
  }
}
```

#### Reducer（归约函数）

**Reducer 是一个函数，接收当前的 `state` 和一个 `action` 对象，判断是否需要更新状态并返回新状态：`(state, action) => newState`。**你可以把 reducer 看作事件监听器，根据收到的动作类型处理事件。

:::info

“Reducer” 名称来源于其与 [`Array.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) 方法的相似性。

:::

Reducer 必须始终遵守以下规则：

- 它们只能基于 `state` 和 `action` 参数计算新状态值
- 不允许修改原有的 `state`，必须通过_不可变方式_复制并更新状态副本
- 必须是纯函数——不能执行异步逻辑、产生随机值或其它副作用

后续我们会详细讲述 reducer 规则及如何遵守。

Reducer 内的逻辑通常按以下步骤执行：

- 检查是否处理当前动作
  - 若是，复制 state，修改副本，返回新状态
- 否则，返回原状态

这是一个简单的 reducer 示例，展示每个 reducer 应遵守的流程：

```js
const initialState = { value: 0 }

function counterReducer(state = initialState, action) {
  // 检查是否处理当前动作
  if (action.type === 'counter/increment') {
    // 若是，复制 state
    return {
      ...state,
      // 并更新副本中值
      value: state.value + 1
    }
  }
  // 否则返回原状态不变
  return state
}
```

Reducer 内可以用任意逻辑决定新状态：如 `if/else`、`switch`、循环等。

<DetailedExplanation title="详细解释：为何称为 'Reducer'？" >

[`Array.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) 方法让你对数组中的每个元素依次处理，返回单个最终结果。你可以把它看作“把数组缩减为一个值”。

`Array.reduce()` 接受一个回调函数，调用时遍历数组元素。回调接收两个参数：

- `previousResult`：回调上次返回的结果
- `currentItem`：当前数组元素

第一次调用时无 `previousResult`，需要提供一个初始值作为首个 `previousResult`。

例如要求数组求和，我们可以这样写：

```js
const numbers = [2, 5, 8]

const addNumbers = (previousResult, currentItem) => {
  console.log({ previousResult, currentItem })
  return previousResult + currentItem
}

const initialValue = 0

const total = numbers.reduce(addNumbers, initialValue)
// {previousResult: 0, currentItem: 2}
// {previousResult: 2, currentItem: 5}
// {previousResult: 7, currentItem: 8}

console.log(total)
// 15
```

注意 `addNumbers` 回调函数不需维护自身状态，只是接收两个参数，返回新的结果。

**Redux 的 reducer 函数就是同样的思想！** 它接收“上次结果”（`state`）和“当前项”（`action`），基于这两个参数判断新状态并返回。

如果我们构造一组 Redux 动作，调用 `reduce()` 并传入 reducer 函数，结果如下：

```js
const actions = [
  { type: 'counter/increment' },
  { type: 'counter/increment' },
  { type: 'counter/increment' }
]

const initialState = { value: 0 }

const finalResult = actions.reduce(counterReducer, initialState)
console.log(finalResult)
// {value: 3}
```

也就是说，**Redux 的 reducers 是把一组动作（随时间发生）“归约”为一个状态”**。区别是 `Array.reduce()` 是一次性完成，Redux 随应用生命周期分步完成。

</DetailedExplanation>

#### Store（状态仓库）

当前 Redux 应用状态存放于名为 **store** 的对象中。

store 由传入的 reducer 创建，并提供 `getState` 方法返回当前状态：

```js
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({ reducer: counterReducer })

console.log(store.getState())
// {value: 0}
```

#### Dispatch（派发）

Redux store 提供 `dispatch` 方法。**更新状态的唯一方式是调用 `store.dispatch()` 并传入动作对象。** store 会运行 reducer，保存新状态，通过 `getState()` 可获取更新值：

```js
store.dispatch({ type: 'counter/increment' })

console.log(store.getState())
// {value: 1}
```

**你可把派发动作看作“触发应用事件”**。发生了什么，我们希望 store 知晓。Reducers 类似事件监听器，收到感兴趣的动作时更新状态。

一般使用动作创建函数派发合适动作：

```js
const increment = () => {
  return {
    type: 'counter/increment'
  }
}

store.dispatch(increment())

console.log(store.getState())
// {value: 2}
```

#### Selector（选择器）

**选择器是能够从 store 状态中提取特定信息的函数。** 随着应用变大，这有利于避免重复逻辑，不同地方需要读取相同数据时复用：

```js
const selectCounterValue = state => state.value

const currentValue = selectCounterValue(store.getState())
console.log(currentValue)
// 2
```

### Redux 应用数据流

前面讲过“单向数据流”，即状态驱动 UI 渲染、事件更新状态、UI 重新渲染的步骤。

针对 Redux，我们可以更细分这些步骤：

- 初始设置：
  - 使用根 reducer 创建 Redux store
  - store 调用根 reducer 一次，保存返回值作为初始 `state`
  - UI 第一次渲染时，组件访问当前 Redux store 状态数据，决定渲染内容，同时订阅未来状态更新，以便得知变化
- 更新流程：
  - 应用发生事件，如用户点击按钮
  - 应用代码派发动作到 Redux store，如 `dispatch({type: 'counter/increment'})`
  - store 用先前的 `state` 和当前 `action` 再次执行 reducer，保存返回的新状态
  - store 通知已订阅的 UI 组件状态已更新
  - 需订阅状态的组件检查其相关状态是否变化
  - 若变化，组件强制使用新状态重新渲染，更新屏幕显示内容

下图展示该数据流视觉化过程：

![Redux 数据流图](/img/tutorials/essentials/ReduxDataFlowDiagram.gif)

## 你学到了什么

Redux 确实有许多新术语和概念需要记住。回顾一下我们刚才覆盖的内容：

:::tip 总结

- **Redux 是用于管理应用全局状态的库**
  - 通常结合 React-Redux 库将 Redux 与 React 集成
  - Redux Toolkit 是编写 Redux 逻辑的标准方式
- **Redux 的更新模式将“发生了什么”与“状态如何变化”分离**
  - _动作_ 是带 `type` 字段的纯对象，描述应用中“发生了什么”
  - _Reducer_ 是函数，基于之前状态和动作计算新状态
  - Redux _store_ 在动作 _被派发_ 时运行根 reducer
- **Redux 采用“单向数据流”活动结构**
  - 状态描述某时刻应用状况，UI 基于状态渲染
  - 当应用中发生事件：
    - UI 派发动作
    - store 运行 reducers 更新状态
    - store 通知 UI 状态已变
  - UI 基于新状态重新渲染

:::

## 下一步？

我们已经看过 Redux 应用的各个组成部分。接下来，继续阅读[第2部分：Redux Toolkit 应用结构](./part-2-app-structure.md)，我们将通过一个完整可运行的示例，观察各个部分的契合方式。