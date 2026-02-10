---
id: part-2-app-structure
title: 'Redux 必备知识，第 2 部分：Redux Toolkit 应用结构'
sidebar_label: 'Redux Toolkit 应用结构'
description: 'Redux 官方必备知识教程：学习典型 React + Redux Toolkit 应用的结构'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 你将学到

- 典型 React + Redux Toolkit 应用的结构
- 如何在 Redux DevTools 扩展中查看状态变化

:::

## 介绍

在 [第 1 部分：Redux 概述与概念](./part-1-overview-concepts.md) 中，我们了解了 Redux 的用途，描述 Redux 代码各部分的术语和概念，以及数据如何在 Redux 应用中流动。

现在，让我们看看一个实际的示例，了解这些部分是如何结合在一起的。

## 计数器示例应用

我们要看的示例项目是一个小型计数器应用，允许我们点击按钮对数字进行增加或减少。它或许并不十分复杂，但它展示了一个 React+Redux 应用中的所有重要组成部分。

该项目使用一个更小的版本创建，基于 [官方 Redux Toolkit 的 Vite 模板](https://github.com/reduxjs/redux-templates/tree/master/packages/vite-template-redux)。开箱即用，它已经配置了标准的 Redux 应用结构，使用 [Redux Toolkit](https://redux-toolkit.js.org) 创建 Redux store 和逻辑，使用 [React-Redux](https://react-redux.js.org) 连接 Redux store 与 React 组件。

这是该项目的在线演示。你可以通过点击右侧应用预览中的按钮进行操作，也可以浏览左侧的源文件。

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-templates/tree/master/packages/rtk-app-structure-example?fontsize=14&hidenavigation=1&module=%2Fsrc%2Ffeatures%2Fcounter%2FcounterSlice.ts&theme=dark&runonclick=1"
  title="redux-essentials-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

如果你想在自己的电脑上搭建此项目，可以用此命令创建本地副本：

```sh
npx degit reduxjs/redux-templates/packages/rtk-app-structure-example my-app
```

你也可以使用完整的 Redux Toolkit Vite 模板创建新项目：

```sh
npx degit reduxjs/redux-templates/packages/vite-template-redux my-app
```

### 使用计数器应用

计数器应用已设置好，可以让我们观察内部发生了什么。

打开浏览器的 DevTools。然后，选择 DevTools 中的“Redux”标签，并点击右上工具栏的“State”按钮。你应该能看到类似这样的界面：

![Redux DevTools：初始应用状态](/img/tutorials/essentials/devtools-basic-counter.png)

右侧显示我们的 Redux store 以如下 app state 开始：

```js
{
  counter: {
    value: 0
    status: 'idle'
  }
}
```

DevTools 会显示当我们使用应用时，store 状态是如何变化的。

首先让我们玩玩应用，看看它的行为。点击应用中的“+”按钮，然后查看 Redux DevTools 的“Diff（差异）”标签：

![Redux DevTools：首次派发的 action](/img/tutorials/essentials/devtools-first-action.png)

我们可以看到两个重要信息：

- 点击“+”按钮时，派发了一个类型为 `"counter/increment"` 的 action 给 store
- 当该 action 被派发时，`state.counter.value` 字段从 `0` 变为 `1`

接着尝试以下操作：

- 再次点击“+”按钮。现在显示的值应该是 2。
- 点击一次“-”按钮。显示值应变回 1。
- 点击“Add Amount”按钮。显示值应变为 3。
- 将文本框里的数字“2”改为“3”
- 点击“Add Async”按钮。你会看到按钮上出现进度条，几秒后显示值变成 6。

回到 Redux DevTools，你会看到累计派发了五个 action，分别对应每次点击按钮。现在选择左侧列表中最后一个 `"counter/incrementByAmount"`，再点击右侧的“Action”标签：

![Redux DevTools：完成点击按钮](/img/tutorials/essentials/devtools-done-clicking.png)

我们可以看到该 action 对象是这样的：

```js
{
  type: 'counter/incrementByAmount',
  payload: 3
}
```

点击“Diff”标签，可以看到 `state.counter.value` 字段从 `3` 变为 `6`，对应该 action。

能够看到应用内部发生了什么、状态随时间如何变化，非常强大！

DevTools 还有更多命令和选项帮助调试应用。试着点击右上角的“Trace”标签，你会看到一个 JavaScript 函数调用堆栈跟踪面板，展示多个执行该 action 时调用的代码行。其中一行代码被高亮，那是我们从 `<Counter>` 组件里派发该 action 的位置：

![Redux DevTools：action 调用堆栈跟踪](/img/tutorials/essentials/devtools-action-stacktrace.png)

这让我们更容易追踪具体代码触发了某个 action。

## 应用内容

既然了解了应用做什么，接下来看看它是如何工作的。

以下是构成该应用的关键文件：

- `/src`
  - `main.tsx`：应用的入口点
  - `App.tsx`：顶层 React 组件
  - `/app`
    - `store.ts`：创建 Redux store 实例
    - `hooks.ts`：导出预先定义类型的 React-Redux hooks
  - `/features`
    - `/counter`
      - `Counter.tsx`：计数器功能的 UI React 组件
      - `counterSlice.ts`：计数器功能的 Redux 逻辑

先从 Redux store 的创建开始看起。

## 创建 Redux Store

打开 `app/store.ts`，内容如下：

```ts title="app/store.ts"
import type { Action, ThunkAction } from '@reduxjs/toolkit'
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '@/features/counter/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
})

// 推断 `store` 的类型
export type AppStore = typeof store
export type RootState = ReturnType<AppStore['getState']>
// 从 store 本身推断 `AppDispatch` 类型
export type AppDispatch = AppStore['dispatch']
// 定义一个可复用的 thunk 函数类型
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>
```

Redux store 通过 Redux Toolkit 的 `configureStore` 函数创建。`configureStore` 需要传入一个 `reducer` 参数。

我们的应用可能由许多不同的功能组成，每个功能可能都有自己的 reducer 函数。调用 `configureStore` 时，我们可以把所有不同的 reducers 放到一个对象里传入。对象的键名将定义最终状态值中的键。

我们有一个文件 `features/counter/counterSlice.ts`，导出计数器逻辑的 reducer 函数，作为 ES 模块的默认导出。我们可以将该函数导入到这个文件中。因为是默认导出，我们导入时可以自由命名。这里我们命名为 `counterReducer`，然后在创建 store 是使用它。（注意，这里的 [导入/导出行为是标准 ES 模块语法](https://javascript.info/import-export#export-default)，与 Redux 无关。）

当我们传入类似 `{counter: counterReducer}` 的对象时，表示我们希望 Redux 状态的 `state.counter` 部分由 `counterReducer` 函数负责决定，在派发 action 时该部分如何更新。

Redux 允许通过各种插件（“middleware”和“enhancers”）定制 store 设置。`configureStore` 默认自动添加好几个中间件，提供良好的开发体验，并设置 store 使 Redux DevTools 扩展可以检查其内容。

对于 TypeScript，我们还导出了一些可复用的类型，比如 `RootState` 和 `AppDispatch`。后面会看到它们的用法。

## Redux 切片（Slices）

**“切片”是针对应用中某个单一功能的 Redux reducer 逻辑和 actions 的集合**，通常定义在一个文件中。这个名字来源于将根 Redux 状态对象拆分成多个“切片”状态。

比如，在一个博客应用中，我们的 store 配置可能是这样：

```ts
import { configureStore } from '@reduxjs/toolkit'
import usersReducer from '../features/users/usersSlice'
import postsReducer from '../features/posts/postsSlice'
import commentsReducer from '../features/comments/commentsSlice'

export const store = configureStore({
  reducer: {
    users: usersReducer,
    posts: postsReducer,
    comments: commentsReducer
  }
})
```

在这个例子中，`state.users`，`state.posts` 和 `state.comments` 都是 Redux 状态里的独立“切片”。由于 `usersReducer` 负责更新 `state.users`，所以我们称它为 **“切片 reducer”函数**。

<DetailedExplanation title="详细解读：Reducers 和状态结构">

创建 Redux store 时，需要传入一个单一的“根 reducer”函数。那么如果有多个切片 reducer，如何合成一个根 reducer？这又如何定义 Redux store 状态的内容？

如果我们手动调用这些切片 reducer，示例如下：

```js
function rootReducer(state = {}, action) {
  return {
    users: usersReducer(state.users, action),
    posts: postsReducer(state.posts, action),
    comments: commentsReducer(state.comments, action)
  }
}
```

代码中分别调用每个切片 reducer，传入对应的 Redux 状态部分，返回值组合成最终新的 Redux 状态对象。

Redux 提供了 [`combineReducers`](../../api/combineReducers.md) 函数自动实现这个过程。它接受一个切片 reducer 对象，返回一个函数，在派发 action 时调用各个切片 reducer，并把返回值合并成一个对象作为最终结果。用 `combineReducers` 可做成如下：

```js
const rootReducer = combineReducers({
  users: usersReducer,
  posts: postsReducer,
  comments: commentsReducer
})
```

将切片 reducers 对象传给 `configureStore` 时，它会自动使用 `combineReducers` 生成根 reducer。

我们之前看到，也可以直接将根 reducer 函数传给 `reducer` 参数：

```js
const store = configureStore({
  reducer: rootReducer
})
```

</DetailedExplanation>

### 创建切片 Reducers 和 Actions

既然我们知道 `counterReducer` 函数来自 `features/counter/counterSlice.ts` 文件，那就来看一下该文件的内容，逐步解析。

```ts title="features/counter/counterSlice.ts"
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// 定义计数器切片状态的 TS 类型
export interface CounterState {
  value: number
  status: 'idle' | 'loading' | 'failed'
}

// 计数器切片状态的初始值
const initialState: CounterState = {
  value: 0,
  status: 'idle'
}

// 切片包含 Redux reducer 逻辑，用于更新状态，
// 并自动生成可派发的 action。
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  // `reducers` 字段用来定义 reducer 及生成相关 action
  reducers: {
    increment: state => {
      // Redux Toolkit 允许在 reducers 里写“可变”逻辑
      // 但实际上它并不会修改状态，本质是用 Immer 库
      // 检测对“草稿状态”修改，并生成全新的不可变状态
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    // 使用 PayloadAction 类型声明 action.payload 的内容
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    }
  }
})

// 导出自动生成的 action 创建函数，供组件使用
export const { increment, decrement, incrementByAmount } = counterSlice.actions

// 导出切片 reducer，供 store 配置使用
export default counterSlice.reducer
```

之前我们看到点击不同按钮会派发三种 Redux action 类型：

- `{type: "counter/increment"}`
- `{type: "counter/decrement"}`
- `{type: "counter/incrementByAmount"}`

已知 action 是含有 `type` 字段的普通对象，`type` 始终是字符串，通常会写“action 创建函数”来生成并返回 action 对象。那么这些 action 对象、类型字符串和创建函数在哪里定义？

我们可以每次手写这些代码，但这很繁琐。Redux 的重点其实在 reducer 函数，以及它们计算新状态的逻辑。

Redux Toolkit 有一个函数叫 [**`createSlice`**](https://redux-toolkit.js.org/api/createSlice)，它帮我们生成 action 类型字符串、action 创建函数和 action 对象。只需定义切片名称，写一组 reducer 函数，其他代码便自动生成。每个 action 类型由 `name` 选项生成的字符串作为前缀，reducer 函数键名作为后缀组成。因此 `"counter"` + `"increment"` 生成的 action 类型是 `{type: "counter/increment"}`。毕竟，有电脑干的活儿，何必手写！

除了 `name` 字段，`createSlice` 还需要我们传入初始状态，确保第一次调用 reducer 时有 `state` 值。这里我们传入一个对象，其 `value` 初始为 0，`status` 初始为 `'idle'`。

这里声明了三个 reducer 函数，对应先前点击按钮派发的三种 action 类型。

`createSlice` 会自动生成同名的 action 创建函数。可以打印一个查看：

```js
console.log(counterSlice.actions.increment())
// {type: "counter/increment"}
```

它也生成切片 reducer 函数，可响应所有这些 action：

```js
const newState = counterSlice.reducer(
  { value: 10 },
  counterSlice.actions.increment()
)
console.log(newState)
// {value: 11}
```

## Reducer 规则

前面提到 reducer 函数**必须始终遵守一些特殊规则**：

- 只根据 `state` 和 `action` 参数计算新状态值
- 不允许修改原有 `state`，必须做 _不可变更新_，拷贝状态后修改拷贝
- 必须是“纯函数”，不能做异步逻辑或副作用

为什么这些规则重要？有几个原因：

- Redux 目标之一是使代码可预测。函数只由输入参数决定其输出，便于理解和测试。
- 若函数依赖外部变量或行为随机，运行时难以预料。
- 函数修改参数或其它值，会导致应用行为难以预料，这常引发“我更新了状态，但 UI 没及时变更”类 bug。
- Redux DevTools 依赖 reducer 遵守此规则以良好运作。

这里“不可变更新”规则尤其重要，值得详谈。

### Reducer 与不可变更新

之前提过“变异”（修改已有对象/数组）和“不变性”（视值为不可变）概念。

在 Redux 中，**reducer _绝对不允许_ 修改原始/当前状态对象！**

:::warning

```js
// ❌ 禁止 - 默认情况下这会修改状态！
state.value = 123
```

:::

不能修改状态有多重原因：

- 会引起 bug，比如 UI 更新异常
- 使得理解何时何因状态变化更困难
- 写单元测试更难
- 破坏“时间旅行调试”功能
- 违背 Redux 设计理念和最佳实践

那如果不能直接修改状态，如何返回更新后的状态？

:::tip

**Reducer 只能拷贝原状态的值，对拷贝进行修改。**

```js
// ✅ 安全写法，因先做了拷贝
return {
  ...state,
  value: 123
}
```

:::

前文介绍了我们可以手写不可变更新，通过 JavaScript 的对象/数组扩展运算符，及返回新对象的函数实现。但如果觉得 “手写不可变更新语法难记又繁琐”，那确实没错！ :)

手动写不可变逻辑很难，且最常犯的 Redux 错误是 reducer 中意外修改状态。

**这就是为什么 Redux Toolkit 的 `createSlice` 允许你以更简单的方式写不可变更新！**

`createSlice` 内部使用了一个名为 [Immer](https://immerjs.github.io/immer/) 的库。Immer 利用 JS 的 `Proxy` 包装数据，让你写“修改”包装数据的代码。Immer 会跟踪所有变动，然后返回经过安全不可变更新的新值，就像你手写不可变更新逻辑一样。

所以，你不必写：

```js
function handwrittenReducer(state, action) {
  return {
    ...state,
    first: {
      ...state.first,
      second: {
        ...state.first.second,
        [action.someId]: {
          ...state.first.second[action.someId],
          fourth: action.someValue
        }
      }
    }
  }
}
```

而能写成这样：

```js
function reducerWithImmer(state, action) {
  state.first.second[action.someId].fourth = action.someValue
}
```

明显更易读！

但是，有一点非常重要要铭记：

:::warning

**只有使用 Redux Toolkit 的 `createSlice` 和 `createReducer`（内部含 Immer）时，你才能写“修改”逻辑！如果你自己写了“修改”代码但没使用 Immer，状态 _会_ 被直接修改，从而导致 bug！**

:::

回到计数器切片的实际 reducers，看看它们的代码：

```ts title="features/counter/counterSlice.ts"
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: state => {
      // Redux Toolkit 允许写“修改”代码，但实际使用 Immer 处理
      state.value += 1
    },
    decrement: state => {
      state.value -= 1
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      // highlight-next-line
      state.value += action.payload
    }
  }
})
```

`increment` reducer 总是给 `state.value` 加 1。由于 Immer 追踪了对`state`草稿的修改，我们这里不必返回值。同样，`decrement` 减 1。

这两个 reducer 都不需要查看 `action` 对象，因此没有声明 `action` 参数。

`incrementByAmount` reducer 需要知道加多少，所以定义了 `state` 和 `action` 两个参数。这里我们知道 UI 把输入框内容转换为数字，放进了 `action.payload`，加到 `state.value`。

如果用 TypeScript，需要告诉它 `action.payload` 的类型。`PayloadAction` 类型声明“这是一个 action 对象，且它的 `payload` 类型是……”你传入的类型。这里我们设为 `number`。

:::info 想学更深入？

想了解不可变和不可变更新，请参见 [“不可变更新模式” 文档页](../../usage/structuring-reducers/ImmutableUpdatePatterns.md) 和 [React 和 Redux 中不可变性的完整指南](https://daveceddia.com/react-redux-immutability-guide/)。

想了解用 Immer 写 reducer，请参阅 [Immer 文档](https://immerjs.github.io/immer/) 及 [“用 Immer 编写 Reducers” 文档页](https://redux-toolkit.js.org/usage/immer-reducers)。

:::

## 额外的 Redux 逻辑

Redux 的核心是 reducers、actions 和 store。此外，还有几种常用的 Redux 函数类型。

### 使用 Selector 读取数据

我们可以调用 `store.getState()` 获得整个根状态对象，并访问字段如 `state.counter.value`。

通常会写“selector”函数帮我们封装状态字段访问。在此例中，`counterSlice.ts` 导出了两个可复用的选择器：

```ts
// Selector 函数让我们从根状态里选取需要的值。
// 选择器也可以直接在组件中 `useSelector` 调用时定义，
// 或写在 `createSlice.selectors` 字段里。
export const selectCount = (state: RootState) => state.counter.value
export const selectStatus = (state: RootState) => state.counter.status
```

Selector 函数一般接收整个根状态对象作为参数，可以从中读取字段或做计算，返回新的值。

由于使用了 TypeScript，我们用从 `store.ts` 导出的 `RootState` 类型声明 `state` 参数类型。

注意你**不必为每个切片的每个字段都写单独的选择器！**（这个例子中写了，是为了演示选择器概念，其实切片里只有两个字段。）请[合理权衡选择器的数量](../../usage/deriving-data-selectors.md#balance-selector-usage)。

:::info 选择器深入知识

我们将在 [第 4 部分：使用 Redux 数据](./part-4-using-data.md#reading-data-with-selectors) 里详细学习选择器，并在 [第 6 部分：性能](./part-6-performance-normalization.md#memoizing-selector-functions) 中调优它们。

更长讲解见 [用选择器派生数据](../../usage/deriving-data-selectors.md)。

:::

### 用 Thunks 编写异步逻辑

目前，我们的应用逻辑都是同步的。派发 action 后，store 执行 reducer，计算新状态，dispatch 函数结束。但 JavaScript 有多种写异步代码的方法，每个应用中常有类似调用 API 获取数据的异步逻辑。我们需要给 Redux 应用的异步逻辑留出位置。

**thunk 是 Redux 中一种可包含异步逻辑的函数。** thunk 包括两层函数：

- 内层 thunk 函数，接收 `dispatch` 和 `getState` 作为参数
- 外层创建函数，负责创建并返回 thunk 函数

`counterSlice` 里导出的下一个函数就是 thunk action 创建函数示例：

```ts title="features/counter/counterSlice.ts"
// 下面的函数叫 thunk，能包含同步和异步逻辑，
// 且可访问 `dispatch` 和 `getState`。它可以直接 dispatch：
// `dispatch(incrementIfOdd(10))`。
// 示例：根据当前状态条件触发 dispatch。
export const incrementIfOdd = (amount: number): AppThunk => {
  return (dispatch, getState) => {
    const currentValue = selectCount(getState())
    if (currentValue % 2 === 1) {
      dispatch(incrementByAmount(amount))
    }
  }
}
```

在该 thunk 中，使用 `getState()` 获得当前根状态，使用 `dispatch()` 派发其它 action。这里也可做异步操作，如 `setTimeout` 或 `await`。

它的用法和普通 action 创建函数类似：

```ts
store.dispatch(incrementIfOdd(6))
```

使用 thunk 需求在创建 Redux store 时添加 `redux-thunk` _middleware_（Redux 的一种插件）。幸运的是，Redux Toolkit 的 `configureStore` 已默认帮我们配置好，可以直接用。

写 thunk 时，要确保 `dispatch` 和 `getState` 函数被正确类型化。我们 _可以_ 将 thunk 类型声明为 `(dispatch: AppDispatch, getState: () => RootState)`，但一般会在 store 文件里定义可复用的 `AppThunk` 类型。

需要向服务器发请求时，可将调用写在 thunk 中。这里是一个更长的例子，方便理解定义方式：

```ts title="示例 手写 异步 thunk"
// 外层“thunk 创建器”函数
const fetchUserById = (userId: string): AppThunk => {
  // 内层“thunk 函数”
  return async (dispatch, getState) => {
    try {
      dispatch(userPending())
      // 在 thunk 中发起异步调用
      const user = await userAPI.fetchById(userId)
      // 收到响应后派发 action
      dispatch(userLoaded(user))
    } catch (err) {
      // 出错时处理
    }
  }
}
```

Redux Toolkit 提供了一个[**`createAsyncThunk`**](https://redux-toolkit.js.org/api/createAsyncThunk) 方法，它帮你自动完成所有派发工作。`counterSlice.ts` 中的下一个函数是一个 async thunk，模拟用计数器值发起 API 请求。派发该 thunk 时，它会先派发一个 `pending` action，然后等异步完成后派发 `fulfilled` 或 `rejected` action。

```ts title="features/counter/counterSlice.ts"
// Thunks 常用于异步逻辑，如请求数据。
// `createAsyncThunk` 用于生成 thunk，
// 它基于 Promise 派发 pending/fulfilled/rejected actions。
// 本例模拟异步请求并返回结果。
// `createSlice.extraReducers` 字段用于处理这些 actions，
// 并用结果更新状态。
export const incrementAsync = createAsyncThunk(
  'counter/fetchCount',
  async (amount: number) => {
    const response = await fetchCount(amount)
    // 返回值成为 `fulfilled` action 的 payload
    return response.data
  }
)
```

使用 `createAsyncThunk` 时，相关 actions 在 `createSlice.extraReducers` 处理。本例中，我们处理了三个 action 类型，更新 `status` 字段，也更新 `value`：

```ts title="features/counter/counterSlice.ts"
export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    // 省略 reducers
  },
  // `extraReducers` 让切片处理在别处定义的 actions，
  // 包括 `createAsyncThunk` 生成的 actions，或其他切片的 actions。
  extraReducers: builder => {
    builder
      // 处理由 `incrementAsync` thunk 定义的 action 类型。
      // 让切片 reducer 根据请求状态和结果更新状态。
      .addCase(incrementAsync.pending, state => {
        state.status = 'loading'
      })
      .addCase(incrementAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        state.value += action.payload
      })
      .addCase(incrementAsync.rejected, state => {
        state.status = 'failed'
      })
  }
})
```

 curious“为什么用 thunk 写异步逻辑”？

<DetailedExplanation title="详细解读：Thunk 和异步逻辑">

前面说过，reducer 内不能写异步逻辑。但这些逻辑又必须存在某处。

如果能访问 Redux store，异步代码结束后调用 `store.dispatch()` 就行：

```js
const store = configureStore({ reducer: counterReducer })

setTimeout(() => {
  store.dispatch(increment())
}, 250)
```

但真实应用中，不允许把 store 直接导入组件或其他文件，因为这会降低代码可测试性和复用性。

此外，我们经常编写异步逻辑，等最终用在某个 store 上，但事先不知道具体是哪个 store。

Redux store 支持添加“middleware”，即插件，可扩展 store 功能。最常见的用途是让你写含有异步逻辑的代码，同时还能访问 store。middleware 可以让 dispatch 接受非普通 action 对象的参数，比如函数或 Promise。

Redux Thunk middleware 修改商店，让 `dispatch` 支持函数类型参数。它逻辑简短，贴出如下：

```js
const thunkMiddleware =
  ({ dispatch, getState }) =>
  next =>
  action => {
    if (typeof action === 'function') {
      return action(dispatch, getState)
    }

    return next(action)
  }
```

它检查传入 `dispatch` 的“action”是否为函数。若是函数，则调用它，返回结果。否则，继续传给下一个 middleware 或 store。

这样，我们可以写任意同步或异步代码，同时拿到 `dispatch` 和 `getState`。

</DetailedExplanation>

:::info 关于 thunk 更多信息

我们将在 [第 5 部分：异步逻辑与数据获取](./part-5-async-logic.md) 中看到 thunk 的使用。

想了解详情，请阅读 [Redux Thunk 文档](../../usage/writing-logic-thunks.mdx)、文章 [什么是 thunk？](https://daveceddia.com/what-is-a-thunk/) 以及 Redux FAQ 中关于“为什么用中间件做异步？”的内容 [Redux FAQ — Actions](../../faq/Actions.md#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)。

:::

## React 计数器组件

前面我们见过简单的 React `<Counter>` 组件。本应用中 `<Counter>` 组件类似，但做法略有不同。

开始看看 `Counter.tsx` 文件：

```tsx title="features/counter/Counter.tsx"
import { useState } from 'react'

// 使用预定义类型的 React-Redux
// `useDispatch` 和 `useSelector` hook
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import {
  decrement,
  increment,
  incrementAsync,
  incrementByAmount,
  incrementIfOdd,
  selectCount,
  selectStatus
} from './counterSlice'

import styles from './Counter.module.css'

export function Counter() {
  // highlight-start
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCount)
  const status = useAppSelector(selectStatus)
  // highlight-end
  const [incrementAmount, setIncrementAmount] = useState('2')

  const incrementValue = Number(incrementAmount) || 0

  return (
    <div>
      <div className={styles.row}>
        // highlight-start
        <button
          className={styles.button}
          aria-label="Decrement value"
          onClick={() => {
            dispatch(decrement())
          }}
        >
          -
        </button>
        // highlight-end
        <span aria-label="Count" className={styles.value}>
          {count}
        </span>
        <button
          className={styles.button}
          aria-label="Increment value"
          onClick={() => {
            dispatch(increment())
          }}
        >
          +
        </button>
        {/* 省略额外渲染内容 */}
      </div>
    </div>
  )
}
```

和之前的纯 React 例子一样，这也是一个函数组件 `Counter`，其中用到了 `useState` hook 来存储数据。

不过，我们组件中没有把当前计数值放到 `useState` 里。这里确实有个名为 `count` 的变量，但它不是从 `useState` 得到的。

React 内置了 `useState`、`useEffect` 等几个 hook，其他库也可以基于 React 的 hook 自定义 [自定义 hook](https://reactjs.org/docs/hooks-custom.html)，封装复用逻辑。

[React-Redux 库](https://react-redux.js.org/) 提供了一组自定义 hooks，使 React 组件能与 Redux store 交互，详见 [API 文档](https://react-redux.js.org/api/hooks)。

#### 使用 `useSelector` 读取数据

`useSelector` hook 让组件能访问 Redux store 状态中任意所需数据。

我们之前发现可以写选择器函数，接收 `state` 参数，返回状态的某部分。特别是 `counterSlice.ts` 导出了 `selectCount` 和 `selectStatus`。

若能访问 Redux store，则取当前计数值的写法是：

```ts
const count = selectCount(store.getState())
console.log(count)
// 0
```

组件不能直接访问 Redux store，也不能在组件文件内 import store。但 `useSelector` 背后会帮我们访问 store。如果传入选择器函数，它帮你调用 `someSelector(store.getState())`，并返回结果。

因此我们可以这样获取当前计数：

```ts
const count = useSelector(selectCount)
```

你也可以直接传入内联选择器函数：

```ts
const countPlusTwo = useSelector((state: RootState) => state.counter.value + 2)
```

每当派发 action 更新 store 后，`useSelector` 会重新运行选择器。如果结果变化，确保组件使用新值重新渲染。

#### 使用 `useDispatch` 分发 action

同理，若能访问 Redux store，我们能通过 `store.dispatch(increment())` 分发 action。现在不能直接用 store，需要通过 `useDispatch` hook 获得 `dispatch` 方法。

```js
const dispatch = useDispatch()
```

接着，用户点击按键时调用它：

```tsx title="features/counter/Counter.tsx"
<button
  className={styles.button}
  aria-label="Increment value"
  onClick={() => {
    dispatch(increment())
  }}
>
  +
</button>
```

#### 预定义类型的 React-Redux Hooks

默认情况下，`useSelector` 要求你每次都在选择器函数参数上声明 `(state: RootState)`。我们可创建带预定义类型的 `useSelector`、`useDispatch`，避免重复声明。

```ts title="app/hooks.ts"
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// 在应用中替代原生的 `useDispatch` 和 `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
```

然后在组件中引入 `useAppSelector` 和 `useAppDispatch`，代替基础版本。

### 组件状态与表单

你可能会问，“我总是要把所有状态都放入 Redux store 中吗？”

答案是否定的。**跨应用需要共享的全局状态放 Redux store。只在某个组件用的状态放组件本地 state。**

本例中有个输入框，用户能在里面输入要加多少：

```tsx title="features/counter/Counter.tsx"
const [incrementAmount, setIncrementAmount] = useState('2')

const incrementValue = Number(incrementAmount) || 0

// 后续渲染
return (
  <div className={styles.row}>
    <input
      className={styles.textbox}
      aria-label="Set increment amount"
      value={incrementAmount}
      onChange={e => setIncrementAmount(e.target.value)}
    />
    <button
      className={styles.button}
      onClick={() => dispatch(incrementByAmount(incrementValue))}
    >
      Add Amount
    </button>
    <button
      className={styles.asyncButton}
      onClick={() => dispatch(incrementAsync(incrementValue))}
    >
      Add Async
    </button>
  </div>
)
```

我们 _可以_ 把当前输入保持在 Redux store 里，输入时派发 action，reducer 保存值。但这样没任何好处。该字符串只在 `<Counter>` 组件用到。即使应用很大，也只有 `<Counter>` 关心它。

所以保持该值在 `<Counter>` 组件的 `useState` hook 中更合理。

类似地，如果有个布尔值 `isDropdownOpen`，只有该组件关心，完全应仅保存在本地。

**React + Redux 应用里，全局状态放 Redux store，本地状态放 React 组件。**

如果犹豫放哪儿，常用判定逻辑：

- 是否其它地方也需要此数据？
- 是否需要衍生数据？
- 是否相同数据驱动多个组件？
- 是否想用时间旅行调试回退？
- 是否想缓存，已有数据时避免重复请求？
- 是否想在热重载 UI 时保持数据一致？

本例也是讲述 Redux 中处理表单状态的好示范。**多数表单状态不应存 Redux，而应先放组件本地，用户完成后再派发 action 更新 Redux store。**

另：还记得 `counterSlice.ts` 里的 `incrementAsync` thunk 吗？这里组件里一样用它。无论是普通 action 还是含异步逻辑的 thunk，组件只关心 dispatch 某东西，实际细节藏在Thunk内。

## 提供 Store

我们看到组件用 `useSelector` 和 `useDispatch` 与 Redux store 交互。但没导入 store，hooks 怎样知道去用哪个 store？

知道应用各部件后，回头看看应用入口文件，解决剩余拼图。

```tsx title="main.tsx"
import React from 'react'
import { createRoot } from 'react-dom/client'
// highlight-next-line
import { Provider } from 'react-redux'

import App from './App'
import { store } from './app/store'

import './index.css'

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <React.StrictMode>
    // highlight-start
    <Provider store={store}>
      <App />
    </Provider>
    // highlight-end
  </React.StrictMode>
)
```

我们必须调用 `root.render(<App />)`，告诉 React 渲染根组件 `<App>`。但为了让 `useSelector` 等 hooks 正常工作，需要用 `<Provider>` 组件在内部传递 Redux store 以便底层访问。

我们已在 `app/store.ts` 创建了 store，所以这里导入。然后用 `<Provider>` 包裹整个 `<App>`，传入 store：`<Provider store={store}>`。

现在，任何调用 `useSelector` 或 `useDispatch` 的 React 组件，都会使用我们传给 `<Provider>` 的 Redux store。

## 你学到了什么

虽然计数器示例很简单，但它展示了 React + Redux 应用的所有关键部分。我们内容总结如下：

:::tip 小结

- **通过 Redux Toolkit 的 `configureStore` API 创建 Redux store**
  - `configureStore` 接收 `reducer` 函数为命名参数
  - `configureStore` 自动使用良好默认设置配置 store
- **Redux 逻辑通常分组织到“切片（slice）”文件**
  - “切片”包含与某功能/状态片段相关的 reducer 逻辑和 actions
  - Redux Toolkit 的 `createSlice` API 根据每个 reducer 函数，自动生成 action 创建函数和 action 类型
- **Redux reducer 必须遵守规则**
  - 只应基于 `state` 和 `action` 参数计算新状态
  - 必须做 _不可变更新_，拷贝原状态
  - 不能含异步或副作用逻辑
  - Redux Toolkit 的 `createSlice` 利用 Immer 支持“可变”写法实现不可变更新
- **读取状态值使用叫“选择器（selector）”的函数**
  - 选择器接受 `(state: RootState)` 参数，返回状态字段或派生值
  - 选择器可以写在切片文件，或内联写在 `useSelector` 中
- **异步逻辑通常写在叫“thunks”的特殊函数中**
  - thunk 接收 `dispatch` 和 `getState` 参数
  - Redux Toolkit 默认启用了 `redux-thunk` 中间件
- **React-Redux 允许 React 组件与 Redux store 交互**
  - 使用 `<Provider store={store}>` 包裹应用，注入 store
  - `useSelector` hook 让组件读取 Redux store 数据
  - `useDispatch` hook 让组件派发 actions
  - TS 使用时，创建预定义类型的 `useAppSelector` 和 `useAppDispatch`
  - 全局状态放入 Redux，局部状态保留在 React 组件

:::

## 下一步？

现在你已经见识了 Redux 应用中所有环节，是时候自己动手写个应用！随后教程会带你构建更大示例应用，逐步介绍使用 Redux 的关键思想。

继续阅读 [第 3 部分：Redux 基础数据流](./part-3-data-flow.md)，开始构建示例应用吧。