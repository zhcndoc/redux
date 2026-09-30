---
id: usage-with-typescript
title: TypeScript 使用指南
---

# TypeScript 使用指南

:::tip 你将学到

- 使用 TypeScript 设置 Redux 应用的标准模式
- 正确为 Redux 逻辑部分添加类型的技巧

:::

:::important 先决条件

- Understanding of [TypeScript syntax and terms](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- Familiarity with TypeScript concepts like [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) and [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- Knowledge of [React Hooks](https://react.dev/reference/react/hooks)

:::

## 概述

**TypeScript** 是 JavaScript 的带类型超集，提供源代码的编译时检查。与 Redux 一起使用时，TypeScript 可以帮助提供：

1. 对 reducers、state、action creators 以及 UI 组件的类型安全
2. 方便的已类型代码重构
3. 团队环境中更好的开发者体验

[**我们强烈建议在 Redux 应用中使用 TypeScript**](../style-guide/style-guide.md#use-static-typing)。不过，像所有工具一样，TypeScript 也有权衡点。它增加了编写额外代码、理解 TS 语法以及构建应用的复杂度。同时，通过在开发早期捕获错误，支持更安全、更高效的重构，并作为已有源码的文档，它为开发流程带来了价值。

我们相信，**[务实地使用 TypeScript](https://blog.isquaredsoftware.com/2019/11/blogged-answers-learning-and-using-typescript/#pragmatism-is-vital) 为较大代码库带来的价值足以抵消额外的开销**，但你应花时间**评估权衡并决定是否值得在自己的应用中使用 TS**。

有多种方式可对 Redux 代码进行类型检查。**本页展示了我们推荐的 Redux 和 TypeScript 结合使用的标准模式**，并非详尽指南。遵循这些模式可以获得良好的 TS 使用体验，**在类型安全与需要为代码库添加的类型声明数量之间取得最佳平衡**。

## 标准 Redux Toolkit + TypeScript 项目搭建

我们假设典型 Redux 项目同时使用 Redux Toolkit 和 React Redux。

[Redux Toolkit](/toolkit) (RTK) is the standard approach for writing modern Redux logic. RTK is already written in TypeScript, and its API is designed to provide a good experience for TypeScript usage.

[React Redux](/react-redux) is also written in TypeScript and ships its own type definitions, so no separate `@types` package is needed. In addition to typing the library functions, the types also export some helpers to make it easier to write typesafe interfaces between your Redux store and your React components.

The [Redux+TS project templates](https://github.com/reduxjs/redux-templates) come with a working example of these patterns already configured.

### 定义 Root State 和 Dispatch 类型

Using [configureStore](/toolkit/api/configureStore) should not need any additional typings. You will, however, want to extract the `RootState` type and the `Dispatch` type so that they can be referenced as needed. Inferring these types from the store itself means that they correctly update as you add more state slices or modify middleware settings.

因为它们是类型，直接从 store 设置文件（如 `app/store.ts`）导出并在其他文件导入是安全的。

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
// 获取 store 变量的类型
export type AppStore = typeof store
// 从 store 本身推断 RootState 和 AppDispatch 类型
export type RootState = ReturnType<AppStore['getState']>
// 推断类型为: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = AppStore['dispatch']
// highlight-end
```

### 定义已类型化的 Hooks

虽然可以把 `RootState` 和 `AppDispatch` 类型导入到每个组件，但**最好为 `useDispatch` 和 `useSelector` hooks 创建预定义类型的版本以供全应用使用**。这样做有几个原因：

- 对于 `useSelector`，避免每次都写 `(state: RootState)` 来声明类型
- 对于 `useDispatch`，默认 `Dispatch` 类型不知道 thunk 或其他中间件。若要正确 dispatch thunk，需要用到包含 thunk 中间件类型的自定义 `AppDispatch`，并用它和 `useDispatch`。预先类型化的 `useDispatch` hook 可防止忘记导入 `AppDispatch`

这些是实际变量，不是类型，最好定义在 `app/hooks.ts` 这样的独立文件中，而不是 store 设置文件。这样能在任意组件文件导入，避免循环依赖风险。

Each of the React Redux hooks has a `.withTypes()` method (added in React Redux v9.1.0) that returns a copy of the hook with the given types built in, analogous to the [`.withTypes`](/toolkit/usage/usage-with-typescript#defining-a-pre-typed-createasyncthunk) method on Redux Toolkit's `createAsyncThunk`:

```ts title="app/hooks.ts"
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, AppStore, RootState } from './store'

// highlight-start
// 在应用中使用，替代普通 `useDispatch` 和 `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
// highlight-end
```

## 应用中使用

### 定义切片 State 和 Action 类型

每个切片文件应定义初始状态的类型，便于 `createSlice` 正确推断 case reducer 中 `state` 的类型。

所有生成的动作应使用 Redux Toolkit 的 `PayloadAction<T>` 类型定义，其中泛型参数代表 `action.payload` 字段的类型。

你可以安全地从 store 文件导入 `RootState` 类型，这会是循环导入，但 TypeScript 编译器能够正确处理该类型导入。这在写 selector 函数时很有用。

```ts title="features/counter/counterSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

// highlight-start
// 定义切片状态类型
interface CounterState {
  value: number
}

// 使用该类型定义初始状态
const initialState: CounterState = {
  value: 0
}
// highlight-end

export const counterSlice = createSlice({
  name: 'counter',
  // `createSlice` 会自动根据 `initialState` 推断 state 类型
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

// 其它代码，如 selectors 可使用导入的 RootState 类型
export const selectCount = (state: RootState) => state.counter.value

export default counterSlice.reducer
```

生成的 action creators 会正确推断参数类型，例如 `incrementByAmount` 需传入 `number`。

某些情况下，[TypeScript 会过度缩小初始状态的类型](https://github.com/reduxjs/redux-toolkit/pull/827)，如果发生，可用 `as` 类型断言代替变量类型声明绕开：

```ts
// 规避方式：用断言而非声明变量类型
const initialState = {
  value: 0
} as CounterState
```

### 在组件中使用类型化 Hooks

组件文件中导入预定义类型的 hooks，替代直接从 React Redux 导入的默认 hooks。

```tsx title="features/counter/Counter.tsx"
import React, { useState } from 'react'

// highlight-next-line
import { useAppSelector, useAppDispatch } from 'app/hooks'

import { decrement, increment } from './counterSlice'

export function Counter() {
  // highlight-start
  // `state` 参数已正确推断为 `RootState`
  const count = useAppSelector(state => state.counter.value)
  const dispatch = useAppDispatch()
  // highlight-end

  // 省略渲染逻辑
}
```

:::tip 关于错误导入的提醒

ESLint 可以帮助团队轻松导入正确的 hooks。规则 [typescript-eslint/no-restricted-imports](https://github.com/typescript-eslint/typescript-eslint/blob/main/packages/eslint-plugin/docs/rules/no-restricted-imports.md) 会在错误导入时发出警告。

示例 ESLint 配置：

```json
"no-restricted-imports": "off",
"@typescript-eslint/no-restricted-imports": [
  "warn",
  {
    "name": "react-redux",
    "importNames": ["useSelector", "useDispatch"],
    "message": "请使用预定义类型的 hooks：`useAppDispatch` 和 `useAppSelector`。"
  }
],
```

:::

## 为额外 Redux 逻辑添加类型

### 为 Reducers 添加类型检查

[Reducers](../tutorials/fundamentals/part-3-state-actions-reducers.md) 是纯函数，接收当前 `state` 和传入 `action`，返回新状态。

如果用 Redux Toolkit 的 `createSlice`，一般不需要单独为 reducer 添加类型。但如果写独立 reducer，通常只需声明 `initialState` 类型，并将 `action` 类型设为 `UnknownAction` 即可：

```ts
import { UnknownAction } from 'redux'

interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0
}

export default function counterReducer(
  state = initialState,
  action: UnknownAction
) {
  // 处理逻辑
}
```

当然，Redux 核心也导出了 `Reducer<State, Action>` 类型供使用。

### 为中间件添加类型检查

[Middleware](../tutorials/fundamentals/part-4-store.md#middleware) 是 Redux Store 的扩展机制，它们组成管道，包裹 store 的 `dispatch` 方法，并可访问 `dispatch` 和 `getState`。

Redux 核心导出了 `Middleware` 类型，用于给中间件函数添加正确类型：

```ts
export interface Middleware<
  DispatchExt = {}, // 可选，用于重写 dispatch 的返回行为
  S = any, // Redux store 的 state 类型
  D extends Dispatch = Dispatch // dispatch 方法类型
>
```

自定义中间件应使用该类型，并根据需要传入 `S`（state）和 `D`（dispatch）泛型参数：

```ts
import { Middleware } from 'redux'

import { RootState } from '../store'

export const exampleMiddleware: Middleware<
  {}, // 大部分中间件不修改 dispatch 返回值
  RootState
> = storeApi => next => action => {
  const state = storeApi.getState() // 正确推断为 RootState
}
```

:::caution

If you are using `typescript-eslint`, the `@typescript-eslint/no-empty-object-type` rule (formerly part of `@typescript-eslint/ban-types`) might report an error if you use `{}` for the dispatch value. The recommended changes it makes are incorrect and will break your Redux store types, you should disable the rule for this line and keep using `{}`.

:::

dispatch 泛型通常只有在 middleware 内部还调用 thunk 时才需特别指定。

当使用 `type RootState = ReturnType<typeof store.getState>` 时，若产生 [中间件与 store 类型定义的循环引用](https://github.com/reduxjs/redux/issues/4267)，可改用：

```ts
const rootReducer = combineReducers({ ... });
type RootState = ReturnType<typeof rootReducer>;
```

结合 Redux Toolkit 使用的示例：

```ts
// 改为先 combineReducers 定义 reducers
const rootReducer = combineReducers({ counter: counterReducer })

// 然后设置 rootReducer 为 configureStore 的 reducer
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(yourMiddleware)
})

type RootState = ReturnType<typeof rootReducer>
```

### 为 Redux Thunks 添加类型检查

[Redux Thunk](https://github.com/reduxjs/redux-thunk) 是编写同步与异步逻辑中与 store 交互的标准中间件。thunk 函数接收 `dispatch` 和 `getState` 两参数。Redux Thunk 提供了内建的 `ThunkAction` 类型，可用来定义这些参数：

```ts
export type ThunkAction<
  R, // thunk 函数返回类型
  S, // getState 返回的 state 类型
  E, // 注入的“额外参数”类型
  A extends Action // 能 dispatch 的已知 Action
> = (dispatch: ThunkDispatch<S, E, A>, getState: () => S, extraArgument: E) => R
```

通常你只需提供 `R`（返回类型）和 `S`（state）泛型参数。TS 不支持只写部分泛型参数，其他参数通常填 `unknown`（E）和 `UnknownAction`（A）：

```ts
import { UnknownAction } from 'redux'
import { sendMessage } from './store/chat/actions'
import { RootState } from './store'
import { ThunkAction } from 'redux-thunk'

export const thunkSendMessage =
  (message: string): ThunkAction<void, RootState, unknown, UnknownAction> =>
  async dispatch => {
    const asyncResp = await exampleAPI()
    dispatch(
      sendMessage({
        message,
        user: asyncResp,
        timestamp: new Date().getTime()
      })
    )
  }

function exampleAPI() {
  return Promise.resolve('Async Chat Bot')
}
```

为了减少重复，你可以在 store 文件中定义通用的 `AppThunk` 类型，并在写 thunk 时复用：

```ts
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>
```

注意，这假设 thunk 没有显著的返回值。如果 thunk 返回 promise，且你希望[在 dispatch 后使用返回的 promise](../tutorials/essentials/part-5-async-logic.md#checking-thunk-results-in-components)，则应用 `AppThunk<Promise<SomeReturnType>>`。

:::caution

别忘了**默认的 `useDispatch` hook 不支持 thunk**，dispatch thunk 会引发类型错误。确保[使用能识别 thunk 的更新版 `Dispatch`](#define-root-state-and-dispatch-types)。

:::

## React Redux 使用指南

While [React Redux](/react-redux) is a separate library from Redux itself, it is commonly used with React.

React Redux ships its own type definitions as part of the `react-redux` package, so there is nothing extra to install. The recommended approach is the pre-typed `useAppSelector` and `useAppDispatch` hooks shown in [Define Typed Hooks](#define-typed-hooks) above. This section covers what those hooks are doing, in case you need to type the base hooks by hand.

### 为 `useSelector` 添加类型

声明 selector 函数中 `state` 参数的类型，`useSelector` 返回类型会自动推断：

```ts
interface RootState {
  isOn: boolean
}

// TS 推断类型为: (state: RootState) => boolean
const selectIsOn = (state: RootState) => state.isOn

// TS 推断 isOn 是 boolean
const isOn = useSelector(selectIsOn)
```

也可内联写：

```ts
const isOn = useSelector((state: RootState) => state.isOn)
```

不过更推荐创建内置类型的 `useAppSelector`。

### 为 `useDispatch` 添加类型

默认情况下，`useDispatch` 返回 Redux 内建的标准 `Dispatch` 类型，无需额外声明：

```ts
const dispatch = useDispatch()
```

但更推荐创建内置类型的 `useAppDispatch`。

### 为 `connect` 高阶组件添加类型

If you are still using the deprecated `connect` API, use the `ConnectedProps<T>` type exported by `react-redux` to infer the props that `connect` injects. See [Typing `connect` with TypeScript](/react-redux/using-react-redux/usage-with-typescript) in the React Redux docs for the full pattern.

## Redux Toolkit 使用指南

The [Standard Redux Toolkit Project Setup with TypeScript](#standard-redux-toolkit-project-setup-with-typescript) section above covers the normal usage patterns for `configureStore` and `createSlice`. The [Redux Toolkit "Usage with TypeScript" page](/toolkit/usage/usage-with-typescript) is the detailed reference for typing every RTK API. The points below are the ones that come up most often:

- **`configureStore`** infers the state type from the root reducer, so no type declarations are needed. When adding middleware, use the `.concat()` and `.prepend()` methods on the array returned by `getDefaultMiddleware()` rather than array spreads, so the middleware types are preserved. See [Correct typings for the `Dispatch` type](/toolkit/usage/usage-with-typescript#correct-typings-for-the-dispatch-type).
- **Matching actions**: RTK action creators have a `match` method that acts as a type predicate, so `if (increment.match(action))` narrows `action` to the right type. This is useful in middleware and in RxJS `filter` calls. See [Alternative to using a literally-typed `action.type`](/toolkit/usage/usage-with-typescript#alternative-to-using-a-literally-typed-actiontype).
- **`createSlice`**: declare `action: PayloadAction<T>` on each case reducer; use the `CaseReducer<State, Action>` type to define case reducers outside the slice; always use the builder callback form of `extraReducers` so action types can be inferred; use the `{ reducer, prepare }` form when an action needs `meta` or a customized `payload`. See the [`createSlice` section](/toolkit/usage/usage-with-typescript#createslice).
- **`createAsyncThunk`**: for basic usage, type the payload creator's argument and return value and let the rest infer. To type the `thunkApi` fields (`state`, `dispatch`, `extra`), pass the return type, argument type, and a config object as the three generic arguments, or define a [pre-typed `createAsyncThunk`](/toolkit/usage/usage-with-typescript#defining-a-pre-typed-createasyncthunk) once per app. See the [`createAsyncThunk` section](/toolkit/usage/usage-with-typescript#createasyncthunk).
- **`createEntityAdapter`**: pass the entity type as the single generic argument when entities have an `id` field; when they use a different key, pass a typed `selectId` function instead so the ID type is inferred. See the [`createEntityAdapter` section](/toolkit/usage/usage-with-typescript#createentityadapter).

### Fixing Circular Types in Exported Slices

On rare occasions you might need to export the slice reducer with a specific type in order to break a circular type dependency problem. This might look like:

```ts
export default counterSlice.reducer as Reducer<Counter>
```

## Additional Recommendations

### 使用 React Redux Hooks API

**推荐默认使用 React Redux hooks API**。hooks API 更易结合 TypeScript 使用，`useSelector` 是简单的钩子，传入 selector 函数，返回类型能轻松由 state 参数推断。

虽然 `connect` 仍有效且可类型化，但写类型非常复杂且容易出错。

### 避免创建 action 类型联合

**特别建议不要试图创建 action 类型联合**，这无实质帮助，反而误导编译器。详情见 RTK 维护者 Lenz Weber 的文章 [不要对 Redux Action 类型创建联合](https://phryneas.de/redux-typescript-no-discriminating-union)。

另外，若使用 `createSlice`，你已知切片定义的所有动作都被正确处理。

## 相关资源

更多信息见以下资源：

- Redux library documentation:
  - [Redux Toolkit docs: Usage with TypeScript](/toolkit/usage/usage-with-typescript): Detailed typing patterns for each Redux Toolkit API
  - [RTK Query docs: Usage with TypeScript](/toolkit/rtk-query/usage-with-typescript): Typing `createApi`, endpoints, and hooks
  - [React Redux docs: Typing `connect`](/react-redux/using-react-redux/usage-with-typescript): Typing the deprecated `connect` API
- React + TypeScript guides:
  - [React+TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react): a comprehensive guide to using React with TypeScript
- Other articles:
  - [Do Not Create Union Types with Redux Action Types](https://phryneas.de/redux-typescript-no-discriminating-union)
