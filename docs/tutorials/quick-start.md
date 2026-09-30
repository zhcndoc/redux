---
id: quick-start
title: Quick Start
sidebar_label: Quick Start
description: 'Tutorials > Quick Start: how to set up Redux Toolkit and React-Redux in a React + TypeScript app'
---

# Redux Quick Start

:::tip 你将学到的内容

- How to set up and use Redux Toolkit with React-Redux
- How to infer the store's `RootState` and `AppDispatch` types and create pre-typed hooks
- What to leave out if you're writing plain JavaScript instead of TypeScript

:::

:::info 先决条件

- Familiarity with [ES6 syntax and features](https://www.taniarascia.com/es6-syntax-and-feature-overview/)
- Knowledge of React terminology: [JSX](https://react.dev/learn/writing-markup-with-jsx), [State](https://react.dev/learn/state-a-components-memory), [Function Components, Props](https://react.dev/learn/passing-props-to-a-component), and [Hooks](https://react.dev/reference/react/hooks)
- Understanding of [Redux terms and concepts](./fundamentals/part-2-concepts-data-flow.md)
- Basic TypeScript syntax is helpful but not required. The examples are written in TypeScript; the ["Using Plain JavaScript" section](#using-plain-javascript) at the end shows what changes if you're not using TS.

:::

## 简介

Welcome to the Redux Quick Start tutorial! **This tutorial will briefly introduce you to Redux Toolkit and React-Redux and teach you how to start using them correctly**.

### 如何阅读本教程

This page focuses on just how to set up a Redux application with Redux Toolkit and React-Redux, and the main APIs you'll use. For explanations of what Redux is, how it works, and full examples of how to use Redux Toolkit, [see the tutorials linked in the "Tutorials Index" page](./tutorials-index.md).

For this tutorial, we assume that you're using Redux Toolkit with React, but you can also use it with other UI layers as well. The examples are based on a typical Vite project structure where all the application code is in a `src` folder, but the patterns can be adapted to whatever project or folder setup you're using.

Redux Toolkit and React-Redux are both written in TypeScript, so their type definitions are built in and you do not need to install any separate `@types/` packages.

The [Redux+TS template for Vite](https://github.com/reduxjs/redux-templates/tree/master/packages/vite-template-redux) comes with this same project setup already configured. You can create a new project from it with `tiged`:

```sh
npx tiged reduxjs/redux-templates/packages/vite-template-redux my-app
```

## 使用摘要

### 安装 Redux Toolkit 和 React-Redux

将 Redux Toolkit 和 React-Redux 包添加到你的项目：

```sh
npm install @reduxjs/toolkit react-redux
```

### 创建 Redux Store

Create a file named `src/app/store.ts`. Import the `configureStore` API from Redux Toolkit. We'll start by creating an empty Redux store, and exporting it:

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {}
})
```

这将创建一个 Redux store，并且自动配置 Redux DevTools 扩展，以便你在开发时可以检查 store。

### Define Root State and Dispatch Types

`configureStore` does not need any additional typings. You will, however, want to extract the `RootState` type and the `Dispatch` type so that they can be referenced as needed. Inferring these types from the store itself means that they correctly update as you add more state slices or modify middleware settings.

Since those are types, it's safe to export them directly from your store setup file and import them directly into other files.

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

export const store = configureStore({
  reducer: {}
})

// highlight-start
// Infer the `RootState`, `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
// highlight-end
```

### Define Typed Hooks

While it's possible to import the `RootState` and `AppDispatch` types into each component, it's **better to create typed versions of the `useDispatch` and `useSelector` hooks for usage in your application**. This is important for a couple reasons:

- For `useSelector`, it saves you the need to type `(state: RootState)` every time
- For `useDispatch`, the default `Dispatch` type does not know about thunks. In order to correctly dispatch thunks, you need to use the specific customized `AppDispatch` type from the store that includes the thunk middleware types, and use that with `useDispatch`. Adding a pre-typed `useDispatch` hook keeps you from forgetting to import `AppDispatch` where it's needed.

Since these are actual variables, not types, it's important to define them in a separate file such as `app/hooks.ts`, not the store setup file. This allows you to import them into any component file that needs to use the hooks, and avoids potential circular import dependency issues.

```ts title="app/hooks.ts"
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// highlight-start
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
// highlight-end
```

### Provide the Redux Store to React

Once the store is created, we can make it available to our React components by putting a React-Redux `<Provider>` around our application in `src/main.tsx`. Import the Redux store we just created, put a `<Provider>` around your `<App>`, and pass the store as a prop:

```tsx title="main.tsx"
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
// highlight-start
import { store } from './app/store'
import { Provider } from 'react-redux'
// highlight-end

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    // highlight-next-line
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
```

### 创建 Redux 状态切片（Slice）

Add a new file named `src/features/counter/counterSlice.ts`. In that file, import the `createSlice` API from Redux Toolkit.

创建切片需要一个字符串名称来标识该切片，一个初始状态值，以及一个或多个定义如何更新状态的 reducer 函数。切片创建后，我们可以导出自动生成的 Redux action 创建函数以及整个切片的 reducer 函数。

Each slice file should define a type for its initial state value, so that `createSlice` can correctly infer the type of `state` in each case reducer. Reducers that expect a payload should declare the `action` argument using the `PayloadAction<T>` type from Redux Toolkit, which takes the type of the `action.payload` field as its generic argument.

Redux requires that [we write all state updates immutably, by making copies of data and updating the copies](./fundamentals/part-2-concepts-data-flow.md#immutability). However, Redux Toolkit's `createSlice` and `createReducer` APIs use [Immer](https://immerjs.github.io/immer/) inside to allow us to [write "mutating" update logic that becomes correct immutable updates](./fundamentals/part-8-modern-redux.md#immutable-updates-with-immer).

```ts title="features/counter/counterSlice.ts"
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

// highlight-start
// Define a type for the slice state
export interface CounterState {
  value: number
}

// Define the initial state using that type
const initialState: CounterState = {
  value: 0
}
// highlight-end

export const counterSlice = createSlice({
  name: 'counter',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    increment: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes.
      // Also, no return statement is required from these functions.
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    // highlight-start
    // Use the PayloadAction type to declare the contents of `action.payload`
    incrementByAmount: (state, action: PayloadAction<number>) => {
      // highlight-end
      state.value += action.payload
    }
  }
})

// 为每个 case reducer 生成对应的 action 创建函数
export const { increment, decrement, incrementByAmount } = counterSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value

export default counterSlice.reducer
```

The generated action creators will be correctly typed to accept a `payload` argument based on the `PayloadAction<T>` type you provided for the reducer. For example, `incrementByAmount` requires a `number` as its argument.

Importing the `RootState` type from the store file into a slice file is a circular import, but the TypeScript compiler handles that correctly for type-only imports. This is useful for writing selector functions next to the slice they read from.

In some cases, [TypeScript may unnecessarily tighten the type of the initial state](https://github.com/reduxjs/redux-toolkit/pull/827). If that happens, you can work around it by casting the initial state using `as`, instead of declaring the type of the variable:

```ts
// Workaround: cast state instead of declaring variable type
const initialState = {
  value: 0
} satisfies CounterState as CounterState
```

### Add Slice Reducers to the Store

接下来，我们需要导入该 counter 切片的 reducer 函数并将其添加到 store。通过在 `reducer` 参数中定义一个字段，我们告诉 store 使用此切片的 reducer 函数来处理该状态的所有更新。

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
// highlight-next-line
import counterReducer from '../features/counter/counterSlice'

export const store = configureStore({
  reducer: {
    // highlight-next-line
    counter: counterReducer
  }
})

// Infer the `RootState`, `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {counter: CounterState}
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store
```

Because `RootState` is inferred from the store, adding `counter: counterReducer` here is all that's needed for `state.counter` to show up as `CounterState` in every selector.

### Use Redux State and Actions in React Components

Now we can use the React-Redux hooks to let React components interact with the Redux store. We can read data from the store with `useSelector`, and dispatch actions using `useDispatch`. In component files, import the pre-typed `useAppSelector` and `useAppDispatch` hooks we defined earlier instead of the standard hooks from React-Redux.

Create a `src/features/counter/Counter.tsx` file with a `<Counter>` component inside, then import that component into `App.tsx` and render it inside of `<App>`.

```tsx title="features/counter/Counter.tsx"
import React from 'react'
// highlight-next-line
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { decrement, increment } from './counterSlice'

export function Counter() {
  // highlight-start
  // The `state` arg is correctly typed as `RootState` already
  const count = useAppSelector(state => state.counter.value)
  const dispatch = useAppDispatch()
  // highlight-end

  return (
    <div>
      <div>
        <button
          aria-label="增加值"
          onClick={() => dispatch(increment())}
        >
          增加
        </button>
        <span>{count}</span>
        <button
          aria-label="减少值"
          onClick={() => dispatch(decrement())}
        >
          减少
        </button>
      </div>
    </div>
  )
}
```

现在，每次点击“增加”和“减少”按钮时：

- 对应的 Redux 动作会被派发到 store
- counter 切片的 reducer 会接收到动作并更新状态
- `<Counter>` 组件会从 store 获取新的状态值并用新数据重新渲染自身

## Using Plain JavaScript

Everything above works the same way in a plain JavaScript project. The differences are only in what you leave out:

- Use `.js` / `.jsx` file extensions, and remove the `interface`, `type`, and `PayloadAction` declarations. `createSlice` still infers everything it needs from `initialState` and the reducer functions.
- Skip the `app/hooks.js` file, and import `useSelector` and `useDispatch` directly from `react-redux` in your components.
- Export the store as the default export or a named export, whichever you prefer. There are no `RootState` / `AppDispatch` types to export alongside it.

The slice and component end up looking like this:

```js title="features/counter/counterSlice.js"
import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: state => {
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload
    }
  }
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default counterSlice.reducer
```

```jsx title="features/counter/Counter.jsx"
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './counterSlice'

export function Counter() {
  const count = useSelector(state => state.counter.value)
  const dispatch = useDispatch()

  // rendering logic is the same as the TS version
}
```

Because Redux Toolkit and React-Redux ship their own type definitions, editors like VS Code will still give you autocomplete and inline documentation for the library APIs in JS files, even though your own state won't be type-checked.

## What You've Learned

以上是如何使用 React 配置和使用 Redux Toolkit 的简要介绍，具体回顾如下：

:::tip 总结

- **Create a Redux store with `configureStore`**
  - `configureStore` accepts a `reducer` function as a named argument
  - `configureStore` automatically sets up the store with good default settings
- **Infer the `RootState` and `AppDispatch` types from the store**
  - `export type RootState = ReturnType<typeof store.getState>` and `export type AppDispatch = typeof store.dispatch`
  - Create pre-typed `useAppSelector` and `useAppDispatch` hooks with `useSelector.withTypes<RootState>()` and `useDispatch.withTypes<AppDispatch>()` in a separate `hooks.ts` file
- **Provide the Redux store to the React application components**
  - Put a React-Redux `<Provider>` component around your `<App />`
  - Pass the Redux store as `<Provider store={store}>`
- **Create a Redux "slice" reducer with `createSlice`**
  - Call `createSlice` with a string name, an initial state, and named reducer functions
  - Declare a type for the slice state, and use `PayloadAction<T>` to type each reducer's `action.payload`
  - Reducer functions may "mutate" the state using Immer
  - Export the generated slice reducer and action creators
- **Use the pre-typed `useAppSelector/useAppDispatch` hooks in React components**
  - Read data from the store with `useAppSelector`
  - Get the `dispatch` function with `useAppDispatch`, and dispatch actions as needed

:::

### 完整计数器应用示例

Here's the complete TypeScript counter application as a running CodeSandbox:

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux/tree/master/examples/counter-ts/?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Ffeatures%2Fcounter%2FcounterSlice.ts&theme=dark&runonclick=1"
  title="redux-counter-ts-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

A plain JavaScript version of the same app is available in the [`redux-essentials-counter-example` repo](https://github.com/reduxjs/redux-essentials-counter-example).

## What's Next?

我们建议继续学习[**完整的“Redux Essentials”教程**](./essentials/part-1-overview-concepts.md)，它涵盖了 Redux Toolkit 中包含的所有关键部分、它们解决了哪些问题，以及如何使用它们构建真实世界的应用。

You may also want to read through [the "Redux Fundamentals" tutorial](./fundamentals/part-1-overview.md), which will give you a complete understanding of how Redux works, what Redux Toolkit does, and how to use it correctly.

If your app fetches data from a server, the [RTK Query Quick Start](/toolkit/tutorials/rtk-query) shows how to define an API slice and use its generated hooks alongside the store setup shown here.

Finally, see [the "Usage with TypeScript" page](../usage/UsageWithTypescript.md) for extended details on how to use Redux Toolkit's APIs with TypeScript.
