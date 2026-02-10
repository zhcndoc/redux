---
id: quick-start
title: 快速开始
sidebar_label: 快速开始
---

# Redux Toolkit 快速开始

:::tip 你将学到的内容

- 如何设置并使用 Redux Toolkit 和 React-Redux

:::

:::info 先决条件

- 熟悉 [ES6 语法和特性](https://www.taniarascia.com/es6-syntax-and-feature-overview/)
- 了解 React 术语：[JSX](https://reactjs.org/docs/introducing-jsx.html)、[状态（State）](https://reactjs.org/docs/state-and-lifecycle.html)、[函数组件，属性（Props）](https://reactjs.org/docs/components-and-props.html) 以及 [Hooks](https://reactjs.org/docs/hooks-intro.html)
- 理解 [Redux 术语和概念](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow)

:::

## 简介

欢迎来到 Redux Toolkit 快速开始教程！**本教程将简要介绍 Redux Toolkit 并教你如何正确地开始使用它**。

### 如何阅读本教程

本页将重点介绍如何使用 Redux Toolkit 设置 Redux 应用和你将使用的主要 API。关于 Redux 是什么、它如何工作以及如何使用 Redux Toolkit 的完整示例，请参见[“教程索引”页面中的教程](./tutorials-index.md)。

本教程假设你正在将 Redux Toolkit 与 React 一起使用，但你也可以将其与其他 UI 层一起使用。示例基于[典型的 Create-React-App 文件夹结构](https://create-react-app.dev/docs/folder-structure)，所有应用代码都在 `src` 文件夹中，但这些模式可以适应你任何项目或文件夹结构。

[Create-React-App 的 Redux+JS 模板](https://github.com/reduxjs/cra-template-redux) 已预配置了相同的项目结构。

## 使用摘要

### 安装 Redux Toolkit 和 React-Redux

将 Redux Toolkit 和 React-Redux 包添加到你的项目：

```sh
npm install @reduxjs/toolkit react-redux
```

### 创建 Redux Store

创建一个名为 `src/app/store.js` 的文件。从 Redux Toolkit 导入 `configureStore` API。我们先创建一个空的 Redux store 并导出它：

```js title="app/store.js"
import { configureStore } from '@reduxjs/toolkit'

export default configureStore({
  reducer: {}
})
```

这将创建一个 Redux store，并且自动配置 Redux DevTools 扩展，以便你在开发时可以检查 store。

### 将 Redux Store 提供给 React

store 创建之后，我们可以通过在 `src/index.js` 中用 React-Redux 的 `<Provider>` 包裹应用来为 React 组件提供 store。导入刚创建的 Redux store，用 `<Provider>` 包裹 `<App>`，并传入 store 作为 prop：

```js title="index.js"
import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
// highlight-start
import store from './app/store'
import { Provider } from 'react-redux'
// highlight-end

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    // highlight-next-line
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)
```

### 创建 Redux 状态切片（Slice）

新增一个名为 `src/features/counter/counterSlice.js` 的文件。在该文件中，从 Redux Toolkit 导入 `createSlice` API。

创建切片需要一个字符串名称来标识该切片，一个初始状态值，以及一个或多个定义如何更新状态的 reducer 函数。切片创建后，我们可以导出自动生成的 Redux action 创建函数以及整个切片的 reducer 函数。

Redux 要求[我们以不可变方式写所有状态更新，即复制数据并更新副本](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow#immutability)。不过，Redux Toolkit 的 `createSlice` 和 `createReducer` API 内部使用了 [Immer](https://immerjs.github.io/immer/)，允许我们[写“可变”的更新逻辑，但实际上会转换成正确的不可变更新](https://redux.js.org/tutorials/fundamentals/part-8-modern-redux#immutable-updates-with-immer)。

```js title="features/counter/counterSlice.js"
import { createSlice } from '@reduxjs/toolkit'

export const counterSlice = createSlice({
  name: 'counter',
  initialState: {
    value: 0
  },
  reducers: {
    increment: state => {
      // Redux Toolkit 允许我们在 reducer 中写“可变”逻辑。
      // 它实际上不会改变状态，因为它使用 Immer 库，
      // 该库检测对“草稿状态”的更改，并基于这些更改生成全新的不可变状态
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

// 为每个 case reducer 生成对应的 action 创建函数
export const { increment, decrement, incrementByAmount } = counterSlice.actions

export default counterSlice.reducer
```

### 将切片 Reducer 添加到 Store 中

接下来，我们需要导入该 counter 切片的 reducer 函数并将其添加到 store。通过在 `reducer` 参数中定义一个字段，我们告诉 store 使用此切片的 reducer 函数来处理该状态的所有更新。

```js title="app/store.js"
import { configureStore } from '@reduxjs/toolkit'
// highlight-next-line
import counterReducer from '../features/counter/counterSlice'

export default configureStore({
  reducer: {
    // highlight-next-line
    counter: counterReducer
  }
})
```

### 在 React 组件中使用 Redux 状态和动作

现在我们可以使用 React-Redux 的钩子让 React 组件与 Redux store 交互。我们可以用 `useSelector` 从 store 读取数据，用 `useDispatch` 派发动作。新建文件 `src/features/counter/Counter.js`，创建一个 `<Counter>` 组件，然后在 `App.js` 中导入该组件，并在 `<App>` 内渲染。

```jsx title="features/counter/Counter.js"
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { decrement, increment } from './counterSlice'
import styles from './Counter.module.css'

export function Counter() {
  const count = useSelector(state => state.counter.value)
  const dispatch = useDispatch()

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

## 你学到了什么

以上是如何使用 React 配置和使用 Redux Toolkit 的简要介绍，具体回顾如下：

:::tip 总结

- **用 `configureStore` 创建 Redux store**
  - `configureStore` 接收一个名为 `reducer` 的函数参数
  - `configureStore` 自动为 store 设置良好的默认配置
- **为 React 应用组件提供 Redux store**
  - 用 React-Redux 的 `<Provider>` 组件包裹 `<App />`
  - 将 Redux store 作为 `<Provider store={store}>` 传入
- **使用 `createSlice` 创建 Redux “切片” reducer**
  - 调用 `createSlice`，传入字符串名称、初始状态和命名的 reducer 函数
  - reducer 函数可以使用 Immer 来“修改”状态
  - 导出生成的切片 reducer 和 action 创建函数
- **在 React 组件中使用 React-Redux 的 `useSelector` 和 `useDispatch` 钩子**
  - 使用 `useSelector` 钩子从 store 读取数据
  - 使用 `useDispatch` 钩子获取 `dispatch` 函数，并根据需要派发动作

:::

### 完整计数器应用示例

下面是完整的计数器应用示例，可以在 CodeSandbox 中运行：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-counter-example/tree/master/?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Ffeatures%2Fcounter%2FcounterSlice.js&theme=dark&runonclick=1"
  title="redux-essentials-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## 接下来怎么办？

我们建议继续学习[**完整的“Redux Essentials”教程**](./essentials/part-1-overview-concepts.md)，它涵盖了 Redux Toolkit 中包含的所有关键部分、它们解决了哪些问题，以及如何使用它们构建真实世界的应用。

你也可以阅读[“Redux 基础”教程](./fundamentals/part-1-overview.md)，它将让你全面了解 Redux 的工作原理、Redux Toolkit 的作用以及如何正确使用它。