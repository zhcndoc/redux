---
id: part-2-concepts-data-flow
title: 'Redux 基础，第二部分：概念与数据流'
sidebar_label: 'Redux 概念与数据流'
description: '官方 Redux 基础教程：学习 Redux 关键术语及 Redux 应用中的数据流'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

<!-- prettier-ignore -->
import FundamentalsWarning from "../../components/_FundamentalsWarning.mdx";

:::tip 你将学到的内容

- 使用 Redux 的关键术语和概念
- 数据在 Redux 应用中的流动方式

:::

## 介绍

在 [第一部分：Redux 概述](./part-1-overview.md) 中，我们讨论了什么是 Redux，为什么可能想用它，以及列出了通常与 Redux 核心一起使用的其他 Redux 库。我们还看到了一个工作中的 Redux 应用的小示例，以及构成该应用的各个部分。最后，我们简要提到了 Redux 中使用的一些术语和概念。

在本部分中，我们将更详细地探讨这些术语和概念，并详细讲解数据如何在 Redux 应用中流动。

<FundamentalsWarning />

## 背景概念

在深入实际代码之前，让我们先聊聊使用 Redux 需要了解的一些术语和概念。

### 状态管理

让我们先看一个小的 React 计数器组件。它在组件状态中追踪一个数字，并在按钮点击时递增该数字：

```jsx
function Counter() {
  // 状态：计数器的值
  const [counter, setCounter] = useState(0)

  // 操作：当发生某事时导致状态更新的代码
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

这是一款自包含的应用，由以下部分组成：

- **状态**，驱动我们应用的真实来源；
- **视图**，基于当前状态的 UI 声明描述
- **操作**，应用中基于用户输入发生的事件，并触发状态更新

这是 **“单向数据流”** 的一个小示例：

- 状态描述了应用在某一具体时间点的状态
- UI 根据该状态渲染
- 当发生一些事情（例如用户点击按钮），状态基于发生的事件进行更新
- UI 根据新的状态重新渲染

![单向数据流](/img/tutorials/essentials/one-way-data-flow.png)

然而，当我们有 **多个组件需要共享并使用同一状态** 时，尤其是这些组件位于应用不同部分时，这种简单性可能会失效。有时可以通过 ["提升状态"](https://react.dev/learn/sharing-state-between-components) 到父组件来解决，但这并非总是有用。

一种解决方式是将共享状态从组件中抽离出来，放到组件树之外的集中位置。通过这种方式，我们的组件树变成了一个庞大的“视图”，任何组件都可以访问状态或触发操作，无论它们在树中的位置！

通过定义和分离状态管理相关的概念并强制执行保持视图与状态独立的规则，我们赋予代码更多结构性和可维护性。

这就是 Redux 的基本理念：在你的应用中有一个单一的集中存放全局状态的地方，以及特定的模式来更新该状态，从而使代码更可预测。

### 不可变性

“可变”意味着“可更改”。如果某物是“不可变”的，则它永远不会被更改。

JavaScript 对象和数组默认都是可变的。如果我创建了一个对象，可以更改它字段的内容。如果我创建了一个数组，也可以更改数组的内容：

```js
const obj = { a: 1, b: 2 }
// 外部仍是同一个对象，但内容已更改
obj.b = 3

const arr = ['a', 'b']
// 同理，我们可以更改这个数组的内容
arr.push('c')
arr[1] = 'd'
```

这称为 _修改_ 对象或数组。内存中是相同的对象或数组引用，但对象内部的内容已改变。

**为了不可变地更新值，你的代码必须先 _复制_ 现有的对象/数组，然后修改这些副本**。

我们可以用 JavaScript 的数组/对象扩展运算符手动完成，也可以使用返回新数组副本而非修改原数组的数组方法：

```js
const obj = {
  a: {
    // 为安全更新 obj.a.c，必须复制每一部分
    c: 3
  },
  b: 2
}

const obj2 = {
  // 复制 obj
  ...obj,
  // 重写 a
  a: {
    // 复制 obj.a
    ...obj.a,
    // 重写 c
    c: 42
  }
}

const arr = ['a', 'b']
// 创建 arr 的新副本，末尾追加 "c"
const arr2 = arr.concat('c')

// 或者，我们也可以复制原数组：
const arr3 = arr.slice()
// 并修改副本：
arr3.push('c')
```

**Redux 期望所有状态更新都以不可变方式进行**。稍后我们会讲解在哪些场景及如何做到这一点，以及一些更简便的不可变更新写法。

:::info 想了解更多？

有关 JavaScript 中不可变性实现的更多信息，参见：

- [JavaScript 引用的可视化指南](https://daveceddia.com/javascript-references/)
- [React 和 Redux 中的不可变性：完整指南](https://daveceddia.com/react-redux-immutability-guide/)

:::

## Redux 术语

继续之前，你需要熟悉一些重要的 Redux 术语：

### 操作（Actions）

**操作**是一个普通的 JavaScript 对象，带有一个 `type` 字段。**你可以把操作看作描述应用中发生了某事的事件**。

`type` 字段应为一个字符串，用来给该操作一个描述性名称，如 `"todos/todoAdded"`。我们通常将类型字符串写作 `"domain/eventName"`，其中第一部分是该操作所属的功能或类别，第二部分是具体发生的事件。

操作对象可以带有其他字段，包含关于发生事件的附加信息。按惯例，我们将该信息放在名为 `payload` 的字段中。

一个典型操作对象如下：

```js
const addTodoAction = {
  type: 'todos/todoAdded',
  payload: 'Buy milk'
}
```

### 处理器（Reducers）

**处理器**是一个函数，接收当前的 `state` 和一个 `action` 对象，决定是否需要更新状态，并返回新的状态：(state, action) => newState。**你可以将 reducer 看作一个事件监听器，根据接收到的操作（事件）类型处理事件。**

:::info

“Reducer”函数得名于它们类似于传递给 [`Array.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) 方法的回调函数。

:::

Reducers 必须 _始终_ 遵循以下规则：

- 它们只应根据传入的 `state` 和 `action` 参数计算新的状态值
- 不允许修改已有的 `state`，必须通过复制现有状态并修改副本来做 _不可变更新_
- 不得执行任何异步逻辑、计算随机值或产生其他“副作用”

稍后我们会详细讲解 reducer 的规则，包括原因及正确遵守方法。

reducer 函数内部的逻辑通常遵循以下步骤：

- 判断该 reducer 是否关心这个操作
  - 如果关心，则复制 state，更新副本后返回
- 否则，返回现有状态不变

以下是一个简短示例，展示 reducer 应遵循的步骤：

```js
const initialState = { value: 0 }

function counterReducer(state = initialState, action) {
  // 判断是否关心该操作
  if (action.type === 'counter/incremented') {
    // 若关心，则复制 `state`
    return {
      ...state,
      // 并用新值更新副本
      value: state.value + 1
    }
  }
  // 否则返回现有状态不变
  return state
}
```

Reducers 可以使用任何种类的逻辑来决定新状态，例如 `if/else`、`switch`、循环等。

<DetailedExplanation title="详细解释：为什么叫 'Reducers'？" >

[`Array.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce) 方法允许你处理一个值数组，依次处理数组中的每个元素，并返回一个最终结果。你可以把它想象成“把数组归约为一个值”。

`Array.reduce()` 接收一个回调函数作为参数，该函数会为数组中的每一项调用一次，有两个参数：

- `previousResult`，回调上次返回的值
- `currentItem`，当前数组中的项

首次调用回调函数时没有 `previousResult`，因此我们需要提供一个初始值用作第一次的 `previousResult`。

例如，如果我们想计算数值数组的总和，可写出如下 reduce 回调：

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

注意，这个 `addNumbers` “reduce 回调”函数不用自己维护任何状态。它取前一次结果和当前项，处理后返回一个新结果。

**Redux 的 reducer 函数正是这种“reduce 回调”函数的概念！** 它接受一个“前一次结果”（state）和“当前项”（action 对象），基于这些参数决定新的状态值并返回。

如果我们把 Redux 操作组成一个数组，调用 `reduce()` 并传入 reducer 函数，也会得到最终结果：

```js
const actions = [
  { type: 'counter/incremented' },
  { type: 'counter/incremented' },
  { type: 'counter/incremented' }
]

const initialState = { value: 0 }

const finalResult = actions.reduce(counterReducer, initialState)
console.log(finalResult)
// {value: 3}
```

我们可以说 **Redux reducer 将一系列操作（随时间推移）“归约”为一个状态**。区别在于，`Array.reduce()` 是一次性完成，而 Redux 是在你的应用运行期间持续执行。

</DetailedExplanation>

### 存储（Store）

当前的 Redux 应用状态存在于一个叫做 **store** 的对象中。

创建 store 时需要传入一个 reducer，store 有个方法叫 `getState`，它返回当前状态值：

```js
import { configureStore } from '@reduxjs/toolkit'

const store = configureStore({ reducer: counterReducer })

console.log(store.getState())
// {value: 0}
```

### 分发（Dispatch）

Redux store 有个叫做 `dispatch` 的方法。**更新状态的唯一方式是调用 `store.dispatch()` 并传入一个操作对象**。store 会调用 reducer 函数，并将返回的新状态保存下来，我们可以通过 `getState()` 读取最新状态：

```js
store.dispatch({ type: 'counter/incremented' })

console.log(store.getState())
// {value: 1}
```

**你可以把分发操作看作应用中的“触发事件”**。某些事情发生了，我们通知 store。reducers 像事件监听器，当监听到感兴趣的操作时，更新相应状态。

### 选择器（Selectors）

**选择器**是能从 store 状态中提取特定信息的函数。随着应用变大，这可以避免在应用不同部分重复逻辑，读取相同数据：

```js
const selectCounterValue = state => state.value

const currentValue = selectCounterValue(store.getState())
console.log(currentValue)
// 2
```

## 核心概念与原则

整体上，我们可以用三个核心概念总结 Redux 的设计意图：

### 单一数据源

应用的 **全局状态** 存储在一个单一的 **store** 对象中。应用中的数据不应存在多个副本，而只应有一个真实来源。

这使得调试和检查应用状态的变化变得更简单，也将需要与整个应用交互的逻辑集中起来。

:::tip

这并不意味着应用中的 _所有_ 状态都必须存放在 Redux store！应根据状态的使用地点，决定其属于 Redux 还是 UI 组件本地状态。

:::

### 状态是只读的

改变状态的唯一方式是派发一个 **操作（action）**，它是描述发生了什么的对象。

这样可以防止 UI 意外覆盖数据，也更便于追踪状态更新的原因。由于操作是普通 JS 对象，可以被日志记录、序列化、存储，甚至在调试或测试时重放。

### 通过纯 reducer 函数更改状态

为了指定如何根据操作更新状态树，你需要编写 **reducer** 函数。Reducer 是纯函数，接收前一个状态和一个操作，返回下一个状态。你可以将 reducer 拆分成更小的函数帮助完成任务，或编写可复用的 reducer 用于常见工作。

## Redux 应用的数据流

之前我们谈到“单向数据流”，描述了下述更新应用的步骤：

- 状态描述某一时间点应用的情况
- UI 根据该状态渲染
- 发生某事（比如用户点击按钮），状态基于事件更新
- UI 根据新状态重新渲染

对 Redux 来说，我们可以将这些步骤更详细地拆分：

- 初始化设置：
  - 使用根 reducer 函数创建 Redux store
  - store 调用根 reducer 一次，返回值保存为初始 `state`
  - UI 首次渲染时，组件访问当前 Redux store 状态，基于数据决定渲染内容。组件还订阅未来 store 的更新，以便得知状态是否更改
- 更新：
  - 应用中发生事件，例如用户点击按钮
  - 应用代码向 Redux store 分发一个操作，如 `dispatch({type: 'counter/incremented'})`
  - store 再次调用 reducer，传入之前的 `state` 和当前 `action`，并将返回值保存为新的 `state`
  - store 通知订阅的所有 UI 部件 store 已更新
  - 需要状态数据的组件检查其依赖的状态部分是否有变动
  - 看到其数据变化的组件强制使用新数据重新渲染，更新屏幕显示内容

下图形象展示了该数据流：

![Redux 数据流示意图](/img/tutorials/essentials/ReduxDataFlowDiagram.gif)

## 你学到了什么

:::tip 总结

- **Redux 的设计意图可概括为三大原则**
  - 全局应用状态存储于单一 store 中
  - store 状态对应用其他部分是只读的
  - 使用 reducer 函数响应操作更新状态
- **Redux 采用“单向数据流”应用架构**
  - 状态描述应用某一时刻情况，UI 根据状态渲染
  - 应用发生事件时：
    - UI 分发操作
    - store 执行 reducer，基于事件更新状态
    - store 通知 UI 状态变更
  - UI 根据新状态重新渲染

:::

## 接下来？

你现在应该熟悉描述 Redux 应用各部分的关键概念和术语了。

接下来，让我们开始构建一个新的 Redux 应用，看看这些部分如何协同工作，详见 [第三部分：状态、动作与 Reducers](./part-3-state-actions-reducers)。
