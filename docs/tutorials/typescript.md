---
id: typescript-quick-start
title: TypeScript 快速入门
sidebar_label: TypeScript 快速入门
---

# Redux Toolkit TypeScript 快速入门

:::tip 你将学到

- 如何使用 TypeScript 配置和使用 Redux Toolkit 及 React-Redux

:::

:::info 前提条件

- 了解 React [Hooks](https://reactjs.org/docs/hooks-intro.html)
- 理解 [Redux 术语和概念](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow)
- 理解 TypeScript 语法和概念

:::

## 介绍

欢迎来到 Redux Toolkit TypeScript 快速入门教程！**本教程将简要展示如何将 TypeScript 与 Redux Toolkit 和 React-Redux 结合使用**。

本页面重点介绍如何设置 TypeScript 相关部分。关于 Redux 是什么，它如何工作，以及如何使用 Redux Toolkit 的完整示例，请参阅[“教程索引”页面中链接的教程](./tutorials-index.md)。

Redux Toolkit 本身已使用 TypeScript 编写，因此包含内置的 TS 类型定义。

[React Redux](https://react-redux.js.org) 自 8 版本起也使用 TypeScript 编写，并且内置了自身的类型定义。

[Create-React-App 的 Redux+TS 模板](https://github.com/reduxjs/cra-template-redux-typescript) 已经配置好了这些模式的工作示例。

## 项目设置

### 定义根状态和分发类型

[Redux Toolkit 的 `configureStore` API](https://redux-toolkit.js.org/api/configureStore) 不需要额外的类型定义。但你需要提取 `RootState` 类型和 `Dispatch` 类型，以便需要时引用。从 store 本身推断这些类型意味着当你添加更多状态切片或修改中间件配置时，类型会自动更新。

因为它们是类型，可以安全地直接从你的 store 配置文件（如 `app/store.ts`）导出，并在其他文件中直接导入。

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
// ...

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer,
    users: usersReducer
  }
})

// highlight-start
// 从 store 本身推断 `RootState`、`AppDispatch` 和 `AppStore` 类型
export type RootState = ReturnType<typeof store.getState>
// 推断类型: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
// highlight-end
```

### 定义类型化的 Hooks

虽然可以在每个组件中导入 `RootState` 和 `AppDispatch` 类型，但**最好为应用创建类型化的 `useDispatch` 和 `useSelector` hooks**。这很重要，原因包括：

- 对于 `useSelector`，避免每次都手动声明 `(state: RootState)` 类型
- 对于 `useDispatch`，默认的 `Dispatch` 类型不支持 thunk。为了正确调度 thunk，你需要使用包含 thunk 中间件类型的特定自定义 `AppDispatch` 类型，并配合 `useDispatch` 使用。预先类型化的 `useDispatch` hook 可以防止忘记在需要处导入 `AppDispatch`

因为它们是变量而非类型，建议将它们定义在独立文件中（如 `app/hooks.ts`），而不是 store 配置文件。这样可以将它们导入需要使用的任何组件文件，并避免潜在的循环导入依赖问题。

```ts title="app/hooks.ts"
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// highlight-start
// 在应用中使用，代替普通的 `useDispatch` 和 `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
// highlight-end
```

## 应用使用

### 定义切片状态和动作类型

每个切片文件都应定义初始状态的类型，这样 `createSlice` 才能正确推断每个案例 reducer 中 `state` 的类型。

所有生成的 actions 都应使用 Redux Toolkit 的 `PayloadAction<T>` 类型定义，其中泛型参数为 `action.payload` 字段的类型。

你可以安全地从 store 文件导入 `RootState` 类型。虽然是循环导入，但 TypeScript 编译器可以正确处理类型导入。这在编写 selector 函数时非常有用。

```ts title="features/counter/counterSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

// highlight-start
// 定义切片状态的类型
export interface CounterState {
  value: number
}

// 使用该类型定义初始状态
const initialState: CounterState = {
  value: 0
}
// highlight-end

export const counterSlice = createSlice({
  name: 'counter',
  // `createSlice` 会根据 `initialState` 参数推断状态类型
  initialState,
  reducers: {
    increment: state => {
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    // highlight-start
    // 使用 PayloadAction 类型声明 `action.payload` 的内容
    incrementByAmount: (state, action: PayloadAction<number>) => {
      // highlight-end
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

// 其它代码（如 selectors）可以使用导入的 `RootState` 类型
export const selectCount = (state: RootState) => state.counter.value

export default counterSlice.reducer
```

生成的 action creators 会根据你为 reducer 提供的 `PayloadAction<T>` 类型，正确地接受一个 `payload` 参数。例如，`incrementByAmount` 需要一个数字作为参数。

在某些情况下，[TypeScript 可能不必要地将初始状态类型限制得过紧](https://github.com/reduxjs/redux-toolkit/pull/827)。若出现此情况，可以通过类型断言（cast）而非变量类型声明来解决：

```ts
// 解决方法：断言类型而不是声明变量类型
const initialState = {
  value: 0
} as CounterState
```

### 在组件中使用类型化 Hooks

在组件文件中，导入预先类型化的 hooks，替代 React-Redux 的标准 hooks。

```tsx title="features/counter/Counter.tsx"
import React from 'react'

// highlight-next-line
import { useAppSelector, useAppDispatch } from 'app/hooks'

import { decrement, increment } from './counterSlice'

export function Counter() {
  // highlight-start
  // `state` 参数已正确类型化为 `RootState`
  const count = useAppSelector(state => state.counter.value)
  const dispatch = useAppDispatch()
  // highlight-end

  // 省略渲染逻辑
}
```

### 完整计数器应用示例

下面是在 CodeSandbox 中运行的完整 TS 计数器应用：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter-ts/?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Ffeatures%2Fcounter%2FcounterSlice.ts&theme=dark&runonclick=1"
  title="redux-counter-ts-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## 接下来做什么？

建议参考[**完整的 “Redux Essentials” 教程**](./essentials/part-1-overview-concepts.md)，其中涵盖了 Redux Toolkit 中包含的所有关键部分、它们解决的问题，以及如何使用它们构建真实应用。

你也可以阅读[“Redux Fundamentals” 教程](./fundamentals/part-1-overview.md)，全面了解 Redux 工作原理、Redux Toolkit 的作用及正确使用方式。

最后，请参阅[“TypeScript 使用指南”](../usage/UsageWithTypescript.md)，了解 Redux Toolkit API 如何与 TypeScript 配合使用的详细信息。