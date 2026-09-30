---
id: implementing-undo-history
title: 实现撤销历史
---

<!-- prettier-ignore -->
import CoreApiNote from "../components/_CoreApiNote.mdx";

# Implementing Undo History

:::important 前提条件

- 完成了[“Redux 基础教程”](../tutorials/fundamentals/part-1-overview.md)
- 理解了[“reducer 组合”](../tutorials/fundamentals/part-3-state-actions-reducers.md#splitting-reducers)

:::

<CoreApiNote />

Building an Undo and Redo functionality into an app has traditionally required conscious effort from the developer. It is not an easy problem with classical MVC frameworks because you need to keep track of every past state by cloning all relevant models. In addition, you need to be mindful of the undo stack because the user-initiated changes should be undoable.

这意味着在 MVC 应用中实现撤销和重做通常会迫使你重写部分应用逻辑，采用像[命令模式](https://en.wikipedia.org/wiki/Command_pattern)这样的特定数据变更模式。

然而，使用 Redux，实现在一般情况下的撤销历史变得轻而易举。原因有三：

- 不存在多个模型，只有你想要跟踪的状态子树。
- 状态已经是不可变的，变更都是通过独立的动作描述，这很接近于撤销栈的思维模型。
- `(state, action) => state` 的 reducer 签名使得实现通用的“reducer 增强器”或“高阶 reducer”变得自然。它们是接收原 reducer 并增强其功能的函数，同时保持签名不变。撤销历史就是这样一个用例。

这篇教程的第一部分将解释使得撤销和重做能以通用方式实现的底层概念。

第二部分将演示如何使用现成提供此功能的 [Redux Undo](https://github.com/omnidan/redux-undo) 包。

[![todos-with-undo 的演示](https://i.imgur.com/lvDFHkH.gif)](https://twitter.com/dan_abramov/status/647038407286390784)

## 理解撤销历史

### 设计状态结构

撤销历史也是应用状态的一部分，我们没有理由对它采取特别的处理。无论状态如何随时间变化，当实现撤销和重做时，我们都想跟踪该状态在不同时间点的 _历史_。

例如，计数器应用的状态形状可能是：

```js
{
  counter: 10
}
```

如果我们想在此应用中实现撤销和重做，我们需要存储更多的状态信息，以回答以下问题：

- 是否还有可以撤销或重做的操作？
- 当前状态是什么？
- 撤销栈中的过去（和未来）状态有哪些？

合理的做法是将状态结构调整为能回答上述问题：

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    present: 10,
    future: []
  }
}
```

现在，如果用户按下“撤销”，我们期望状态变为：

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    present: 9,
    future: [10]
  }
}
```

再往前撤销：

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7],
    present: 8,
    future: [9, 10]
  }
}
```

当用户点击“重做”时，我们想回到未来的下一步：

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    present: 9,
    future: [10]
  }
}
```

最后，如果用户在撤销栈的中间执行一个新操作（例如计数器减 1），我们将丢弃已有的未来状态：

```js
{
  counter: {
    past: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    present: 8,
    future: []
  }
}
```

这里有趣的是，不管想保存的撤销栈是数字、字符串、数组还是对象，结构始终相同：

```js
{
  counter: {
    past: [0, 1, 2],
    present: 3,
    future: [4]
  }
}
```

```js
{
  todos: {
    past: [
      [],
      [{ text: 'Use Redux' }],
      [{ text: 'Use Redux', complete: true }]
    ],
    present: [
      { text: 'Use Redux', complete: true },
      { text: 'Implement Undo' }
    ],
    future: [
      [
        { text: 'Use Redux', complete: true },
        { text: 'Implement Undo', complete: true }
      ]
    ]
  }
}
```

一般而言，形状如下：

```js
{
  past: Array<T>,
  present: T,
  future: Array<T>
}
```

我们也可以选择保留单一顶层历史：

```js
{
  past: [
    { counterA: 1, counterB: 1 },
    { counterA: 1, counterB: 0 },
    { counterA: 0, counterB: 0 }
  ],
  present: { counterA: 2, counterB: 1 },
  future: []
}
```

或者保存多个更细粒度的历史，让用户能独立地对每个部分进行撤销和重做：

```js
{
  counterA: {
    past: [1, 0],
    present: 2,
    future: []
  },
  counterB: {
    past: [0],
    present: 1,
    future: []
  }
}
```

后面会介绍不同做法如何让撤销和重做粒度可控。

### 设计算法

无论具体数据类型如何，撤销历史状态的形状保持不变：

```js
{
  past: Array<T>,
  present: T,
  future: Array<T>
}
```

下面讲解操作该状态形状的算法。定义两个动作 `UNDO` 和 `REDO` 对该状态执行操作。在 reducer 中处理这两个动作时，所采取的步骤如下：

#### 处理撤销（Undo）

- 从 `past` 中移除最后一个元素。
- 将 `present` 设置为刚刚移除的元素。
- 将旧的 `present` 插入 `future` 的 _开头_。

#### 处理重做（Redo）

- 从 `future` 中移除第一个元素。
- 将 `present` 设置为刚刚移除的元素。
- 将旧的 `present` 添加到 `past` 的末尾。

#### 处理其他动作

- 将当前 `present` 添加到 `past` 的末尾。
- 使用当前动作计算新的 `present`。
- 清空 `future`。

### 第一次尝试：编写 Reducer

```js
const initialState = {
  past: [],
  present: null, // (?) 如何初始化 present？
  future: []
}

function undoable(state = initialState, action) {
  const { past, present, future } = state

  switch (action.type) {
    case 'UNDO':
      const previous = past[past.length - 1]
      const newPast = past.slice(0, past.length - 1)
      return {
        past: newPast,
        present: previous,
        future: [present, ...future]
      }
    case 'REDO':
      const next = future[0]
      const newFuture = future.slice(1)
      return {
        past: [...past, present],
        present: next,
        future: newFuture
      }
    default:
      // (?) 如何处理其他动作？
      return state
  }
}
```

这个实现不可用，因为它忽略了三个重要问题：

- 初始 `present` 状态从哪里来？我们事先并不知道。
- 什么时候监听外部动作，将 `present` 存入 `past`？
- 如何将对 `present` 的控制权委托给一个自定义的 reducer？

看来 reducer 本身的抽象不对，但我们已经非常接近目标了。

### 认识 Reducer 增强器

你可能熟悉[高阶函数](https://en.wikipedia.org/wiki/Higher-order_function)。如果你使用 React，也可能熟悉[高阶组件（HOC）](https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750)。这里介绍一个对 reducer 适用的类似模式。

_reducer 增强器_（或称高阶 reducer）是一个函数，它接收一个 reducer 并返回一个新的 reducer，该新 reducer 能处理更多动作，或持有更多状态，且对不会处理的动作将其委托给原 reducer。这并非新模式——技术上，[`combineReducers()`](../api/combineReducers.md) 也是一个 reducer 增强器，因为它接收多个 reducer 并返回一个新的 reducer。

一个什么都不做的 reducer 增强器示例如下：

```js
function doNothingWith(reducer) {
  return function (state, action) {
    // 仅调用传入的 reducer
    return reducer(state, action)
  }
}
```

一个组合多个 reducer 的增强器示例如下：

```js
function combineReducers(reducers) {
  return function (state = {}, action) {
    return Object.keys(reducers).reduce((nextState, key) => {
      // 使用状态的对应部分调用每个 reducer
      nextState[key] = reducers[key](state[key], action)
      return nextState
    }, {})
  }
}
```

### 第二次尝试：编写 Reducer 增强器

理解 reducer 增强器后，我们发现 `undoable` 正应是这样：

```js
function undoable(reducer) {
  // 调用 reducer，传入空动作以获得初始状态
  const initialState = {
    past: [],
    present: reducer(undefined, {}),
    future: []
  }

  // 返回可处理撤销和重做动作的 reducer
  return function (state = initialState, action) {
    const { past, present, future } = state

    switch (action.type) {
      case 'UNDO':
        const previous = past[past.length - 1]
        const newPast = past.slice(0, past.length - 1)
        return {
          past: newPast,
          present: previous,
          future: [present, ...future]
        }
      case 'REDO':
        const next = future[0]
        const newFuture = future.slice(1)
        return {
          past: [...past, present],
          present: next,
          future: newFuture
        }
      default:
        // 将动作交给传入的 reducer 处理
        const newPresent = reducer(present, action)
        if (present === newPresent) {
          return state
        }
        return {
          past: [...past, present],
          present: newPresent,
          future: []
        }
    }
  }
}
```

现在我们可以用 `undoable` 包裹任何 reducer，扩展它以响应 `UNDO` 和 `REDO` 动作。

```js
// 这是一个 reducer
function todos(state = [], action) {
  /* ... */
}

// 这也是一个 reducer！
const undoableTodos = undoable(todos)

import { configureStore } from '@reduxjs/toolkit'
const store = configureStore({ reducer: undoableTodos })

store.dispatch({
  type: 'ADD_TODO',
  text: 'Use Redux'
})

store.dispatch({
  type: 'ADD_TODO',
  text: 'Implement Undo'
})

store.dispatch({
  type: 'UNDO'
})
```

需要注意：调用时应从状态中取出 `.present`，即使用 `state.todos.present` 而非直接使用 `state.todos`。你还可以检查 `.past.length` 和 `.future.length`，用以决定是否启用撤销和重做按钮。

你可能听说 Redux 受到了[Elm 架构](https://github.com/evancz/elm-architecture-tutorial/)的影响，不意外的是这个例子与 [elm-undo-redo 包](https://package.elm-lang.org/packages/TheSeamau5/elm-undo-redo/2.0.0)非常相似。

## 使用 Redux Undo

以上内容颇为详尽，但我们不如直接用库替代自己实现的 `undoable`，岂不更好？当然可以！这里介绍 [Redux Undo](https://github.com/omnidan/redux-undo)，一个提供简单撤销和重做功能的库，适用于 Redux 的任意状态树部分。

:::info

The Redux Undo repository was archived in January 2026. The package still works with Redux 5 and Redux Toolkit 2, ships its own TypeScript types, and has no dependencies, so it is safe to keep using. If you want an actively maintained option, [`history-adapter`](https://history-adapter.js.org/) from Redux maintainer Ben Durrant implements the same `past` / `present` / `future` idea with helpers designed for `createSlice`.

:::

In this part of the recipe, you will learn how to make a small "todo list" app logic undoable. The complete code for the app is shown below.

### 安装

首先需要执行：

```sh
npm install redux-undo
```

安装该包以获得 `undoable` reducer 增强器。

### 包装 Reducer

You will need to wrap the reducer you wish to enhance with `undoable` function. This works the same whether the reducer was written by hand or generated by `createSlice`. For example, if you exported a `todos` reducer from a dedicated file, you will want to change it to export the result of calling `undoable()` with the reducer you wrote:

#### `features/todos/todosSlice.ts`

```ts
import { createSlice } from '@reduxjs/toolkit'
import undoable from 'redux-undo'

interface Todo {
  text: string
  completed: boolean
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {/* ... */}
})

export const { todoAdded, todoToggled } = todosSlice.actions

const undoableTodos = undoable(todosSlice.reducer)

export default undoableTodos
```

该包还提供多种[配置选项](https://github.com/omnidan/redux-undo#configuration)，例如配置撤销和重做动作的类型。

Note that your store setup stays exactly as it was, but the `todos` reducer will now refer to the reducer enhanced with Redux Undo:

#### `app/store.ts`

```ts
import { configureStore } from '@reduxjs/toolkit'
import todos from '../features/todos/todosSlice'
import visibilityFilter from '../features/filters/filtersSlice'

export const store = configureStore({
  reducer: {
    todos,
    visibilityFilter
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

你可以在 reducer 组合层次的任意层级使用 `undoable` 包裹一个或多个 reducer。这里我们选择包裹 `todos`，而非顶层组合 reducer，以免 `visibilityFilter` 的变更影响撤销历史。

### 更新 Selector

此时 `todos` 状态结构变为：

```js
{
  visibilityFilter: 'SHOW_ALL',
  todos: {
    past: [
      [],
      [{ text: 'Use Redux' }],
      [{ text: 'Use Redux', complete: true }]
    ],
    present: [
      { text: 'Use Redux', complete: true },
      { text: 'Implement Undo' }
    ],
    future: [
      [
        { text: 'Use Redux', complete: true },
        { text: 'Implement Undo', complete: true }
      ]
    ]
  }
}
```

This means you need to access your state with `state.todos.present` instead of
just `state.todos`. `RootState` already reflects this, because `undoable` wraps the reducer's return type in a `StateWithHistory<T>`:

#### `features/todos/todosSelectors.ts`

```ts
import type { RootState } from '../../app/store'

export const selectVisibleTodos = (state: RootState) =>
  getVisibleTodos(state.todos.present, state.visibilityFilter)
```

### 添加按钮

最后，你需要添加执行撤销和重做的按钮。

Create a new `UndoRedo` component for these buttons. To determine whether to enable Undo and Redo buttons, you can check `state.todos.past.length` and `state.todos.future.length`. You won't need to write action creators for performing undo and redo because Redux Undo already provides them:

#### `features/todos/UndoRedo.tsx`

```tsx
import { ActionCreators as UndoActionCreators } from 'redux-undo'
import { useAppDispatch, useAppSelector } from '../../app/hooks'

export function UndoRedo() {
  const dispatch = useAppDispatch()
  const canUndo = useAppSelector(state => state.todos.past.length > 0)
  const canRedo = useAppSelector(state => state.todos.future.length > 0)

  return (
    <p>
      <button
        onClick={() => dispatch(UndoActionCreators.undo())}
        disabled={!canUndo}
      >
        Undo
      </button>
      <button
        onClick={() => dispatch(UndoActionCreators.redo())}
        disabled={!canRedo}
      >
        Redo
      </button>
    </p>
  )
}
```

(`useAppDispatch` and `useAppSelector` are the typed hooks described in [Usage with TypeScript](./UsageWithTypescript.md#define-typed-hooks).)

Now you can add `UndoRedo` component to the `App` component:

#### `App.tsx`

```tsx
import { AddTodo } from './features/todos/AddTodo'
import { VisibleTodoList } from './features/todos/VisibleTodoList'
import { Footer } from './features/filters/Footer'
import { UndoRedo } from './features/todos/UndoRedo'

export function App() {
  return (
    <div>
      <AddTodo />
      <VisibleTodoList />
      <Footer />
      <UndoRedo />
    </div>
  )
}
```

This is it! Add these files to a React + Redux project, run it, and try it out.
