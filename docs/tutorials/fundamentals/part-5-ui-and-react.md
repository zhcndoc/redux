---
id: part-5-ui-react
title: 'Redux 基础，第五部分：UI 和 React'
sidebar_label: 'UI 和 React'
description: '官方 Redux 基础教程：学习如何将 Redux 与 React 一起使用'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 你将学到的内容

- Redux 存储是如何与 UI 协同工作的
- 如何将 Redux 与 React 一起使用

:::

## 介绍

在[第四部分：存储](./part-4-store.md)中，我们学习了如何创建 Redux 存储、派发动作以及读取当前状态。我们还了解了存储的内部工作原理，增强器和中间件如何让我们自定义存储以拥有额外能力，以及如何添加 Redux DevTools 方便我们在动作派发时查看应用内部状态。

本节中，我们将为我们的待办事项应用添加用户界面。我们将了解 Redux 如何与 UI 层整体协作，并特别讲解 Redux 与 React 的配合方式。

:::caution

请注意，**本页面及所有“基础”教程都讲解如何使用[我们的现代 React-Redux hooks API](https://react-redux.js.org/api/hooks)**。旧式的[`connect` API](https://react-redux.js.org/api/connect) 仍然可用，但如今我们希望所有 Redux 用户都使用 hooks API。

此外，本教程的其他页面故意展示了更传统的 Redux 逻辑模式，这些模式代码较多，目的是为了讲解 Redux 背后的原理和概念。而我们推荐用 Redux Toolkit 中的“现代 Redux”模式，这是构建 Redux 应用的推荐方式。

完整示例请参见[**“Redux 基础”教程**](../essentials/part-1-overview-concepts.md)，这里结合了 Redux Toolkit 和 React-Redux hooks，演示“如何正确使用 Redux”进行真实项目开发。

:::

## 将 Redux 与 UI 集成

Redux 是一个独立的 JS 库。正如我们之前看到的，你可以在没有用户界面时创建和使用 Redux 存储。这也意味着，**你可以将 Redux 与任何 UI 框架一起使用**（甚至不使用 _任何_ UI 框架），并能在客户端和服务器端运行。你可以用 React、Vue、Angular、Ember、jQuery 或纯 JavaScript 编写 Redux 应用。

话虽如此，**Redux 是专门设计用来与[React](https://reactjs.org) 良好配合的**。React 让你能够将 UI 描述为状态的函数，而 Redux 则包含状态并响应动作进行更新。

因此，我们将在本教程中使用 React 来构建待办事项应用，并讲解如何将 React 与 Redux 一起使用的基础知识。

在此之前，我们先简要看看 Redux 是如何普遍与 UI 层交互的。

### 基本的 Redux 和 UI 集成

将 Redux 与任何 UI 层集成都需要几个固定步骤：

1. 创建 Redux 存储
2. 订阅存储的更新
3. 在订阅回调内：
   1. 获取当前存储状态
   2. 提取该 UI 所需的数据
   3. 利用数据更新 UI
4. 如有必要，用初始状态渲染 UI
5. 响应 UI 输入，派发 Redux 动作

我们回到[第一部分的计数器示例](./part-1-overview.md)，看看它是如何遵循这些步骤的：

```js
// 1）用 `createStore` 创建一个新的 Redux 存储
const store = Redux.createStore(counterReducer)

// 2）订阅存储，数据变更时重新渲染
store.subscribe(render)

// 我们的“用户界面”是单个 HTML 元素中的文本
const valueEl = document.getElementById('value')

// 3）当订阅回调被调用时：
function render() {
  // 3.1）获取当前存储状态
  const state = store.getState()
  // 3.2）提取想要的数据
  const newValue = state.value.toString()

  // 3.3）用新值更新 UI
  valueEl.innerHTML = newValue
}

// 4）用初始存储状态渲染 UI
render()

// 5）基于 UI 输入派发动作
document.getElementById('increment').addEventListener('click', function () {
  store.dispatch({ type: 'counter/incremented' })
})
```

无论你使用的是哪种 UI 层，**Redux 总是这样工作**。实际实现会稍显复杂以优化性能，但核心步骤恒定不变。

既然 Redux 是独立库，不同的 UI 框架有不同的“绑定”库来帮助你使用 Redux。这些绑定库负责处理订阅存储和高效更新 UI 的细节，让你不用自己写这部分代码。

## 在 React 中使用 Redux

官方的[**React-Redux UI 绑定库**](https://react-redux.js.org)是与 Redux 核心分开的独立包。你需要额外安装它：

```sh
npm install react-redux
```

本教程将覆盖使用 React 和 Redux 一起时最重要的模式和示例，并结合我们的待办事项应用讲解它们的实际工作原理。

:::info

参见 [官方 React-Redux 文档 https://react-redux.js.org](https://react-redux.js.org) 获取完整指南和 React-Redux API 参考。

:::

### 设计组件树

正如我们[基于需求设计状态结构](./part-3-state-actions-reducers.md#designing-the-state-structure)，我们也可以设计应用中整体的 UI 组件集及其彼此关系。

基于[应用的业务需求清单](./part-3-state-actions-reducers.md#defining-requirements)，至少需要如下组件：

- **`<App>`**：根组件，渲染其它所有内容。
  - **`<Header>`**：包含“新建待办”文本输入框和“全部完成”复选框
  - **`<TodoList>`**：展示基于过滤结果的当前所有可见的待办列表
    - **`<TodoListItem>`**：单个待办列表项，含可切换完成状态的复选框和颜色分类选择器
  - **`<Footer>`**：显示剩余激活状态的待办数量和基于完成状态及颜色分类过滤列表的控制器

除了这个基础组件结构，我们还可以多种划分方式。例如，`<Footer>` 组件 _可以_ 是一个较大的组件，或者拆分成多个较小组件，比如 `<CompletedTodos>`、`<StatusFilter>` 和 `<ColorFilters>`。没有唯一正确的划分，具体采用更大组件还是更多小组件依实际情况而定。

目前，我们先从这几个小组件开始以便易于理解。顺便说下，因为我们假设你[已经熟悉 React](https://reactjs.org)，**接下来我们将跳过写这些组件布局代码的细节，重点讲如何在 React 组件中使用 React-Redux 库**。

这是添加 Redux 逻辑之前该应用的初始 React UI：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-3-initialUI/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&view=preview&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

### 使用 `useSelector` 从存储读取状态

我们知道需要显示待办列表。先创建一个 `<TodoList>` 组件，从存储中读取 todos 数组，遍历它，给每个待办项渲染一个 `<TodoListItem>` 组件。

你应该熟悉像 [React hooks 的 `useState`](https://react.dev/reference/react/useState)，它可在函数组件中使组件拥有 React 状态。React 也让我们编写[自定义 Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)，抽取可重用逻辑，封装在自己的 Hook 里。

像许多其他库一样，React-Redux 也包含[自定义 Hooks](https://react-redux.js.org/api/hooks)，你可以在组件里使用。React-Redux hooks 让组件有能力与 Redux 存储交互，读取状态和派发动作。

第一个要看的是[**`useSelector` Hook**](https://react-redux.js.org/api/hooks#useselector)，它**让你的 React 组件能从 Redux 存储读取数据**。

`useSelector` 接收一个函数，称为**selector 选择器函数**。**选择器函数接收整个 Redux 存储状态作为参数，从状态中读取某个值并返回该结果**。

例如，我们知道待办应用的 Redux 状态保存 todos 数组为 `state.todos`，于是我们写一个选择器函数返回这数组：

```js
const selectTodos = state => state.todos
```

或者，统计当前多少 todo 被标记为“已完成”：

```js
const selectTotalCompletedTodos = state => {
  const completedTodos = state.todos.filter(todo => todo.completed)
  return completedTodos.length
}
```

所以，**选择器既可以直接返回 Redux 状态的数据，也可以返回状态派生的值**。

我们在 `<TodoList>` 组件里读取 todos 数组。首先导入 `react-redux` 的 `useSelector`，然后用一个选择器函数作为参数调用它：

```jsx title="src/features/todos/TodoList.js"
import React from 'react'
// highlight-next-line
import { useSelector } from 'react-redux'
import TodoListItem from './TodoListItem'

// highlight-next-line
const selectTodos = state => state.todos

const TodoList = () => {
  // highlight-next-line
  const todos = useSelector(selectTodos)

  // 因为 todos 是数组，可以遍历它
  const renderedListItems = todos.map(todo => {
    return <TodoListItem key={todo.id} todo={todo} />
  })

  return <ul className="todo-list">{renderedListItems}</ul>
}

export default TodoList
```

首次渲染 `<TodoList>` 组件时，`useSelector` 会调用 `selectTodos` 并传入 _整个_ Redux 状态对象。选择器返回什么，Hook 就返回给你的组件。所以 `const todos` 就是存储状态里的 `state.todos` 数组。

但如果我们派发一个动作如 `{type: 'todos/todoAdded'}` 会怎样？Redux 状态会被 reducer 更新，但我们的组件要知道状态变了，否则不会用新的 todos 重新渲染。

我们知道外面可以用 `store.subscribe()` 监听变化，所以理论上可以在每个组件写代码订阅存储。但这样写会很重复，也难以维护。

幸运的是，**`useSelector` 会自动帮我们订阅存储！** 这样每当派发动作，它会立即重新运行选择器函数。**当选择器返回的结果与上次不一样时，`useSelector` 会强制组件用新数据重新渲染**。我们只需要在组件里调用一次 `useSelector()`，它会帮我们处理这些细节。

但这里有个非常重要的须知：

:::caution

**`useSelector` 使用严格的 `===` 引用比较 selector 返回值是否相同，因此，当选择器返回新引用时组件必重新渲染！** 如果你选择器每次都创建新引用返回，组件就会在每次派发动作后全部重新渲染，即使数据没变化。

:::

例如，将下面这个选择器传给 `useSelector` 会导致组件**总是重渲**，因为 `array.map()` 总是返回新数组引用：

```js
// 坏例子：总返回新引用
const selectTodoDescriptions = state => {
  // 这里创建了新数组引用！
  return state.todos.map(todo => todo.text)
}
```

:::tip

稍后本节会介绍解决这个问题的一种方法。我们还会在[第七部分：标准 Redux 模式](./part-7-standard-patterns.md)中详细讲解如何用“记忆化”选择器优化性能，避免不必要渲染。

:::

此外，选择器函数不必非得写成独立变量，也可以直接写在 `useSelector` 调用里，比如：

```js
const todos = useSelector(state => state.todos)
```

### 使用 `useDispatch` 派发动作

现在我们知道如何将存储数据读取到组件，但如何从组件派发动作？我们知道在 React 外部可以直接写 `store.dispatch(action)`，但组件里没法直接访问 store，我们需要某种方式单独拿到 `dispatch` 函数。

React-Redux 的[**`useDispatch` Hook**](https://react-redux.js.org/api/hooks#usedispatch) 为我们提供了存储的 `dispatch` 方法作为结果。（其实，这个 hook 实现就是 `return store.dispatch`。）

因此，我们可以在任何需要派发动作的组件里调用 `const dispatch = useDispatch()`，然后按需用 `dispatch(someAction)` 派发动作。

试试在 `<Header>` 组件这样写。组件允许用户输入新待办文本，然后派发包含该文本的 `{type: 'todos/todoAdded'}` 动作。

我们写一个典型的 React 表单组件，使用[“受控组件”](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable) 让用户输入文本。用户按下回车键时派发动作。

```jsx title="src/features/header/Header.js"
import React, { useState } from 'react'
// highlight-next-line
import { useDispatch } from 'react-redux'

const Header = () => {
  const [text, setText] = useState('')
  // highlight-next-line
  const dispatch = useDispatch()

  const handleChange = e => setText(e.target.value)

  const handleKeyDown = e => {
    const trimmedText = e.target.value.trim()
    // 如果用户按下了 Enter 键：
    if (e.key === 'Enter' && trimmedText) {
      // highlight-start
      // 派发“添加待办”动作，带上文本
      dispatch({ type: 'todos/todoAdded', payload: trimmedText })
      // highlight-end
      // 清空文本输入
      setText('')
    }
  }

  return (
    <input
      type="text"
      placeholder="需要做什么？"
      autoFocus={true}
      value={text}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  )
}

export default Header
```

### 使用 `<Provider>` 传递存储

组件现在能读取状态、派发动作了。但还有个问题：React-Redux hooks 怎么知道该使用哪个 Redux 存储？Hook 是普通 JS 函数，不能自动从 `store.js` 导入存储。

我们必须明确告诉 React-Redux 用哪个存储。在整个 `<App>` 组件外围渲染一个 `<Provider>` 组件，并将存储作为 prop 传给它。这样之后，应用中所有组件都能访问到该存储。

把它加到主入口文件 `index.js` 中：

```jsx title="src/index.js"
import React from 'react'
import { createRoot } from 'react-dom/client'
// highlight-next-line
import { Provider } from 'react-redux'

import App from './App'
import store from './store'

const root = createRoot(document.getElementById('root'))

root.render(
  // highlight-start
  // 用 `<Provider>` 包裹整个 `<App>`，并传入 Redux 存储
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
  // highlight-end
)
```

这就是 React-Redux 与 React 使用的关键点：

- 在组件里调用 `useSelector` hook 读取数据
- 在组件里调用 `useDispatch` hook 派发动作
- 用 `<Provider store={store}>` 包裹整个 `<App>`，让子组件都能访问存储

现在我们可以实际操作应用了！这是到目前为止的 UI 效果：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-4-initialHooks/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

接下来看看在待办事项应用中，我们还能怎样使用这些工具。

## React-Redux 模式

### 全局状态、组件状态与表单

现在你可能会想，“难道我必须把应用所有状态都放进 Redux 存储吗？”

答案是**不**。跨应用需要共享的全局状态应该放 Redux，只有在单个组件内部用到的状态应该保留在组件状态里。

举个 `<Header>` 组件的例子。我们 _可以_ 通过给输入框的 `onChange` 派发动作，把文本保存在 Reducer 中的 Redux 存储里。但这样没啥好处，因为该文本只在 `<Header>` 组件用到。

因此，保存在 `<Header>` 组件内用 `useState` hook 管理是合理的。

类似地，如果你有个 `isDropdownOpen` 布尔变量，它只关心当前组件，无需放进 Redux。

:::tip

**在 React + Redux 应用里，全局状态放 Redux，局部状态放组件内部。**

不确定放哪里时，可以参考以下准则判定是否需要放 Redux：

- 应用其他部分是否关心这些数据？
- 是否需要基于原始数据衍生新的数据？
- 是否用同一数据驱动多个组件？
- 你是否需要把状态恢复到某一时刻（比如时间旅行调试）？
- 是否需要缓存数据（比如已有状态时避免重复请求）？
- UI 组件热加载时是否需要保持数据一致（通常热加载会丢失内部组件状态）？

:::

这也是判断表单状态是否该放 Redux 的好示例。**大多数表单状态其实不适合放 Redux**。可以先在表单组件中使用本地状态控制数据，用户输入完成后再派发动作更新存储。

### 组件中使用多个选择器

目前，只有 `<TodoList>` 组件读取了存储数据。接下来看看 `<Footer>` 组件如何读取。

`<Footer>` 需要知道三类数据：

- 已完成的 todos 数量
- 当前“状态”过滤条件
- 当前选中的“颜色”分类过滤器数组

如何读取这些数据？

**可以在一个组件里多次调用 `useSelector`**。事实上，这是推荐做法：**每次选择器调用应尽可能返回最小需要的状态片段**。

之前我们写了一个选择器统计已完成 todos。过滤值状态和颜色都在 `state.filters` 里。由于这个组件两者都用得到，我们可以选择整个 `state.filters` 对象。

前面说过，我们可以把输入逻辑写在 `<Footer>` 里，也可以拆分成 Smaller components 如 `<StatusFilter>`，为简洁起见这里跳过输入处理细节，假设有小组件通过 props 接受数据和回调。

对应 React-Redux 的部分代码可能是：

```jsx title="src/features/footer/Footer.js"
import React from 'react'
// highlight-next-line
import { useSelector } from 'react-redux'

import { availableColors, capitalize } from '../filters/colors'
import { StatusFilters } from '../filters/filtersSlice'

// 省略其他 footer 组件

const Footer = () => {
  // highlight-start
  const todosRemaining = useSelector(state => {
    const uncompletedTodos = state.todos.filter(todo => !todo.completed)
    return uncompletedTodos.length
  })

  const { status, colors } = useSelector(state => state.filters)
  // highlight-end

  // 省略占位符变更事件处理

  return (
    <footer className="footer">
      <div className="actions">
        <h5>操作</h5>
        <button className="button">全部标记为完成</button>
        <button className="button">清除已完成项</button>
      </div>

      <RemainingTodos count={todosRemaining} />
      <StatusFilter value={status} onChange={onStatusChange} />
      <ColorFilters value={colors} onChange={onColorChange} />
    </footer>
  )
}

export default Footer
```

### 通过 ID 选择列表项中的数据

当前，`<TodoList>` 组件读取整个 `state.todos` 数组，并将待办对象作为 prop 传给每个 `<TodoListItem>`。

这样没问题，但可能存在性能隐患：

- 修改某个 todo 会生成该 todo 和 `state.todos` 数组的副本，都是新引用
- `useSelector` 看到新引用就强制组件重新渲染
- 所以每次修改待办时，整个 `<TodoList>` 父组件会重新渲染
- [因为 React 默认递归渲染所有子组件](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/#standard-render-behavior)，意味着 _所有_ `<TodoListItem>` 组件都会重新渲染，尽管大部分未改动

偶尔重渲染没问题，React 会自动对比找到需要更新的 DOM，但如果列表非常大，没必要的重渲染可能导致性能下降。

解决方案有几个，一是对所有 `<TodoListItem>` 用 `React.memo()` 包裹，这样组件只有在 props 变化时才重渲。但前提是子组件必须始终接收到相同 props，只有改变的子组件才渲染。

二是让 `<TodoList>` 只从存储读取所有 todo 的 ID 数组，作为 prop 传给子组件。子组件根据该 ID 自己查询对应的 todo 对象。

试试这种方法：

```jsx title="src/features/todos/TodoList.js"
import React from 'react'
import { useSelector } from 'react-redux'
import TodoListItem from './TodoListItem'

// highlight-next-line
const selectTodoIds = state => state.todos.map(todo => todo.id)

const TodoList = () => {
  // highlight-next-line
  const todoIds = useSelector(selectTodoIds)

  const renderedListItems = todoIds.map(todoId => {
    // highlight-next-line
    return <TodoListItem key={todoId} id={todoId} />
  })

  return <ul className="todo-list">{renderedListItems}</ul>
}
```

现在 `<TodoList>` 只选出 ID 数组，传给 `<TodoListItem>` 个组件的 prop 只有 ID。

接下来 `<TodoListItem>` 根据这个 ID 读取对应的待办，然后也修改它派发“切换完成状态”的动作：

```jsx title="src/features/todos/TodoListItem.js"
import React from 'react'
// highlight-next-line
import { useSelector, useDispatch } from 'react-redux'

import { availableColors, capitalize } from '../filters/colors'

// highlight-start
const selectTodoById = (state, todoId) => {
  return state.todos.find(todo => todo.id === todoId)
}
// highlight-end

// 解构 props.id，因为只需要 ID
const TodoListItem = ({ id }) => {
  // 用 ID 调用选择器读取对应待办
  // highlight-next-line
  const todo = useSelector(state => selectTodoById(state, id))
  const { text, completed, color } = todo

  // highlight-next-line
  const dispatch = useDispatch()

  // highlight-start
  const handleCompletedChanged = () => {
    dispatch({ type: 'todos/todoToggled', payload: todo.id })
  }
  // highlight-end

  // 省略其他变更处理逻辑
  // 省略其他渲染内容

  return (
    <li>
      <div className="view">{/* 省略渲染输出 */}</div>
    </li>
  )
}

export default TodoListItem
```

然而，我们前面说过，**在选择器里返回新数组引用会导致组件每次都渲染**，目前 `<TodoList>` 每次返回新的 ID 数组引用。

不过，这里，切换某个待办不会新增或删除条目，ID 内容其实没变，但数组本身是新引用，导致 `<TodoList>` 不必要的重渲染。

一个解决办法是给 `useSelector` 传第二个参数，指定自定义比较函数。比较函数接收前后两次 selector 返回值，返回 `true` 表示“相等不需要重渲染”。

React-Redux 提供了 `shallowEqual`，它做浅比较，判断数组元素是否一致。试试：

```jsx title="src/features/todos/TodoList.js"
import React from 'react'
// highlight-next-line
import { useSelector, shallowEqual } from 'react-redux'
import TodoListItem from './TodoListItem'

// highlight-next-line
const selectTodoIds = state => state.todos.map(todo => todo.id)

const TodoList = () => {
  // highlight-next-line
  const todoIds = useSelector(selectTodoIds, shallowEqual)

  const renderedListItems = todoIds.map(todoId => {
    return <TodoListItem key={todoId} id={todoId} />
  })

  return <ul className="todo-list">{renderedListItems}</ul>
}
```

现在，切换某个待办时，ID 数组内容被视为相同，`<TodoList>` 不会重渲。只有对应的 `<TodoListItem>` 获取更新待办重新渲染，其他子组件不变。

前面说过，你还可以用专门的[“记忆化选择器”](part-7-standard-patterns.md) 来进一步提升性能，稍后章节会介绍。

## 你学到了什么

我们现在有了功能完备的待办应用！应用创建了存储，通过 `<Provider>` 传给 React UI 层，然后在组件里以 `useSelector` 和 `useDispatch` 与存储交互。

:::info

试着自己补全其余缺失功能！你需要实现：

- 在 `<TodoListItem>` 组件里，使用 `useDispatch` 派发修改颜色分类和删除待办的动作
- 在 `<Footer>` 中，使用 `useDispatch` 派发将所有待办标记完成、清除已完成待办及修改过滤条件的动作

我们会在[第七部分：标准 Redux 模式](./part-7-standard-patterns.md)详解过滤功能的实现。

:::

这是包含我们跳过细节的组件和功能的当前完整应用：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-5-uiAllActions/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

:::tip 总结

- **Redux 存储可以配合任何 UI 层使用**
  - UI 代码总是订阅存储、获取最新状态并重新绘制
- **React-Redux 是官方的 React 绑定库**
  - React-Redux 作为独立的 `react-redux` 包安装
- **`useSelector` hook 让 React 组件读取存储中的数据**
  - 选择器函数拿到整个存储状态，返回片段数据
  - `useSelector` 调用选择器，返回结果给组件
  - `useSelector` 订阅存储，任何动作派发时重新调用选择器
  - 当选择器结果变时，触发组件重新渲染
- **`useDispatch` hook 让 React 组件派发动作**
  - 返回存储的 `dispatch` 函数
  - 组件中按需调用 `dispatch(action)`
- **`<Provider>` 组件向 React 组件树注入存储**
  - 用 `<Provider store={store}>` 包裹整个 `<App>`

:::

## 接下来？

UI 已经工作，我们接下来看看如何让 Redux 应用建立与服务器的通讯。在[第六部分：异步逻辑](./part-6-async-logic.md)，我们会讲解异步操作如定时器和 HTTP 请求如何融入 Redux 数据流。
