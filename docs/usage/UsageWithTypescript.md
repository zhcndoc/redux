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

- 理解 [TypeScript 语法和术语](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- 熟悉 TypeScript 的泛型 [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) 和工具类型 [utility types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- 了解 [React Hooks](https://reactjs.org/docs/hooks-intro.html)

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

[Redux Toolkit](https://redux-toolkit.js.org)（RTK）是编写现代 Redux 逻辑的标准方式。RTK 本身用 TypeScript 编写，且其 API 设计良好，方便 TS 使用。

[React Redux](https://react-redux.js.org) 的类型定义托管于 NPM 上单独的 [`@types/react-redux` 类型包](https://npm.im/@types/react-redux)。除了类型定义库函数，该类型包还导出了一些辅助工具，方便你在 Redux 存储和 React 组件间编写类型安全的接口。

自 React Redux v7.2.3 起，`react-redux` 已依赖 `@types/react-redux`，因此类型定义会自动安装。否则你需要手动安装（通常用 `npm install @types/react-redux`）。

[Create-React-App 的 Redux+TS 模板](https://github.com/reduxjs/cra-template-redux-typescript) 已预配置了这些模式，并含有可用示例。

### 定义 Root State 和 Dispatch 类型

使用 [configureStore](https://redux-toolkit.js.org/api/configureStore) 通常不需额外的类型定义。但你会想导出 `RootState` 和 `Dispatch` 类型以便引用。从 store 本身推断类型意味着当你添加更多 state 切片或修改中间件设置时，这些类型会自动更新。

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

#### `.withTypes()`

之前，预定义类型的 hook 方式不太统一，结果如下：

```ts title="app/hooks.ts"
import type { TypedUseSelectorHook } from 'react-redux'
import { useDispatch, useSelector, useStore } from 'react-redux'
import type { AppDispatch, AppStore, RootState } from './store'

// highlight-start
// 在应用中使用，替代普通 `useDispatch` 和 `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore: () => AppStore = useStore
// highlight-end
```

React Redux v9.1.0 添加了 `.withTypes` 方法，类似于 Redux Toolkit 的 `createAsyncThunk` 上的 [`.withTypes`](https://redux-toolkit.js.org/usage/usage-with-typescript#defining-a-pre-typed-createasyncthunk)。

新写法如下：

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

如果你使用 `typescript-eslint`，可能会因为在 dispatch 泛型用 `{}` 而触发 `@typescript-eslint/ban-types` 规则错误。该规则建议的修正实际上错误，会破坏 Redux store 类型，建议为该行禁用该规则，并继续使用 `{}`。

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

虽说 [React Redux](https://react-redux.js.org) 与 Redux 是独立包，但常与 React 一起用。

完整的 React Redux + TypeScript 使用指南见 **[React Redux 官方文档“Static Typing”章节](https://react-redux.js.org/using-react-redux/static-typing)**，本节重点突出标准模式。

如果用 TypeScript，React Redux 类型维护于 DefinitelyTyped，但作为 react-redux 依赖自动安装。若需手动安装，使用：

```sh
npm install @types/react-redux
```

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

若仍用 `connect`，可用 `@types/react-redux` v7.1.2 及以上导出的 `ConnectedProps<T>` 类型自动推断 props 类型。需将 `connect(mapState, mapDispatch)(MyComponent)` 拆两步：

```tsx
import { connect, ConnectedProps } from 'react-redux'

interface RootState {
  isOn: boolean
}

const mapState = (state: RootState) => ({
  isOn: state.isOn
})

const mapDispatch = {
  toggleOn: () => ({ type: 'TOGGLE_IS_ON' })
}

const connector = connect(mapState, mapDispatch)

// 推断类型:
// {isOn: boolean, toggleOn: () => void}
type PropsFromRedux = ConnectedProps<typeof connector>

type Props = PropsFromRedux & {
  backgroundColor: string
}

const MyComponent = (props: Props) => (
  <div style={{ backgroundColor: props.backgroundColor }}>
    <button onClick={props.toggleOn}>
      Toggle is {props.isOn ? 'ON' : 'OFF'}
    </button>
  </div>
)

export default connector(MyComponent)
```

## Redux Toolkit 使用指南

[“标准 Redux Toolkit + TypeScript 项目搭建”](#标准-redux-toolkit-项目搭建) 已涵盖 `configureStore` 和 `createSlice` 的常规模式，[Redux Toolkit “TypeScript 使用” 文档](https://redux-toolkit.js.org/usage/usage-with-typescript) 涵盖所有 RTK API。

以下是一些你常用的额外类型模式。

### 为 `configureStore` 添加类型

`configureStore` 会基于提供的根 reducer 自动推断 state 类型，无需明确声明。

若想向 store 添加额外中间件，务必用 `getDefaultMiddleware()` 返回的数组上的专用 `.concat()` 和 `.prepend()`，以正确保留类型。（普通 JS 数组展开会丢失类型信息）

```ts
const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .prepend(
        // 正确类型的中间件直接使用
        additionalMiddleware,
        // 也可手动断言类型
        untypedMiddleware as Middleware<
          (action: Action<'specialAction'>) => number,
          RootState
        >
      )
      // prepend 和 concat 可链式调用
      .concat(logger)
})
```

### 匹配 Actions

RTK 生成的 action creators 带有 `match` 方法，作用类似 [类型谓词](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)。调用 `someActionCreator.match(action)` 会基于 `action.type` 做字符串比对，并在条件中缩小 `action` 类型：

```ts
const increment = createAction<number>('increment')
function test(action: Action) {
  if (increment.match(action)) {
    // 此处 action.payload 类型推断正确
    const num = 5 + action.payload
  }
}
```

这在自定义中间件、`redux-observable` 和 RxJS 的 `filter` 操作中检查 action 类型时非常有用。

### 为 `createSlice` 添加类型

#### 定义独立的 Case Reducer

若 case reducer 过多，内联定义较乱，或想复用 case reducer，可单独定义并标注为 `CaseReducer`：

```ts
type State = number
const increment: CaseReducer<State, PayloadAction<number>> = (state, action) =>
  state + action.payload

createSlice({
  name: 'test',
  initialState: 0,
  reducers: {
    increment
  }
})
```

#### 为 `extraReducers` 添加类型

如用 `extraReducers`，务必使用“builder callback”形式，因为“普通对象”形式无法正确推断 action 类型。传入 RTK 动作创建者到 `builder.addCase()` 会正确推断 `action` 类型：

```ts
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // 填写主逻辑
  },
  // highlight-start
  extraReducers: builder => {
    builder.addCase(fetchUserById.pending, (state, action) => {
      // state 和 action 现在类型正确，
      // 分别基于切片状态和 pending 动作创建者推断
    })
  }
  // highlight-end
})
```

#### 为 `prepare` 回调添加类型

若要为 action 添加 `meta` 或 `error` 字段，或自定义 `payload`，须用 `prepare` 语法。配合 TypeScript 写法示例如下：

```ts
const blogSlice = createSlice({
  name: 'blogData',
  initialState,
  reducers: {
    // highlight-start
    receivedAll: {
      reducer(
        state,
        action: PayloadAction<Page[], string, { currentPage: number }>
      ) {
        state.all = action.payload
        state.meta = action.meta
      },
      prepare(payload: Page[], currentPage: number) {
        return { payload, meta: { currentPage } }
      }
    }
    // highlight-end
  }
})
```

#### 解决导出切片时的循环类型

极少数情况下，需显式地给切片 reducer 添加类型以解决循环依赖问题，例如：

```ts
export default counterSlice.reducer as Reducer<Counter>
```

### 为 `createAsyncThunk` 添加类型

基本用法中，只需给 `createAsyncThunk` 的 payload 创建回调的单参数添加类型，并确保返回值类型正确：

```ts
const fetchUserById = createAsyncThunk(
  'users/fetchById',
  // 在这里声明函数参数类型：
  // highlight-next-line
  async (userId: number) => {
    const response = await fetch(`https://reqres.in/api/users/${userId}`)
    // 推断返回类型: Promise<MyData>
    // highlight-next-line
    return (await response.json()) as MyData
  }
)

// `fetchUserById` 的参数自动推断为 number
// 并且 dispatch 该 thunkAction 返回一个正确类型的 fulfilled 或 rejected Promise
const lastReturnedAction = await store.dispatch(fetchUserById(3))
```

如需修改 `thunkApi` 参数类型，比如指定 `getState()` 的 state 类型，须提供前两个泛型参数（返回类型和 payload 参数类型），以及相关 thunkApi 字段的对象：

```ts
const fetchUserById = createAsyncThunk<
  // highlight-start
  // payload 创建者返回类型
  MyData,
  // 创建者的第一个参数类型
  number,
  {
    // 可选定义 thunkApi 字段类型
    dispatch: AppDispatch
    state: State
    extra: {
      jwt: string
    }
  }
  // highlight-end
>('users/fetchById', async (userId, thunkApi) => {
  const response = await fetch(`https://reqres.in/api/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${thunkApi.extra.jwt}`
    }
  })
  return (await response.json()) as MyData
})
```

### 为 `createEntityAdapter` 添加类型

使用 `createEntityAdapter` 时，是否需要自定义 `selectId`，类型写法不同。

若实体已用 `id` 字段规范化，`createEntityAdapter` 只需一个泛型参数指定实体类型。例如：

```ts
interface Book {
  id: number
  title: string
}

// 实体有 id 属性，无需提供 selectId
// highlight-next-line
const booksAdapter = createEntityAdapter<Book>({
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const booksSlice = createSlice({
  name: 'books',
  // highlight-start
  // 在这里推断状态类型
  initialState: booksAdapter.getInitialState(),
  // highlight-end
  reducers: {
    bookAdded: booksAdapter.addOne,
    booksReceived(state, action: PayloadAction<{ books: Book[] }>) {
      booksAdapter.setAll(state, action.payload.books)
    }
  }
})
```

若实体需用其他字段作为 id，推荐传入自定义 `selectId` 并在此处标注类型，这样 ID 类型会被正确推断，无需手动声明：

```ts
interface Book {
  bookId: number
  title: string
  // ...
}

const booksAdapter = createEntityAdapter({
  // highlight-next-line
  selectId: (book: Book) => book.bookId,
  sortComparer: (a, b) => a.title.localeCompare(b.title)
})

const booksSlice = createSlice({
  name: 'books',
  // highlight-start
  // 在这里推断状态类型
  initialState: booksAdapter.getInitialState(),
  // highlight-end
  reducers: {
    bookAdded: booksAdapter.addOne,
    booksReceived(state, action: PayloadAction<{ books: Book[] }>) {
      booksAdapter.setAll(state, action.payload.books)
    }
  }
})
```

## 其他建议

### 使用 React Redux Hooks API

**推荐默认使用 React Redux hooks API**。hooks API 更易结合 TypeScript 使用，`useSelector` 是简单的钩子，传入 selector 函数，返回类型能轻松由 state 参数推断。

虽然 `connect` 仍有效且可类型化，但写类型非常复杂且容易出错。

### 避免创建 action 类型联合

**特别建议不要试图创建 action 类型联合**，这无实质帮助，反而误导编译器。详情见 RTK 维护者 Lenz Weber 的文章 [不要对 Redux Action 类型创建联合](https://phryneas.de/redux-typescript-no-discriminating-union)。

另外，若使用 `createSlice`，你已知切片定义的所有动作都被正确处理。

## 相关资源

更多信息见以下资源：

- Redux 库文档：
  - [React Redux docs: Static Typing](https://react-redux.js.org/using-react-redux/static-typing)：React Redux API 的 TypeScript 使用示例
  - [Redux Toolkit docs: Usage with TypeScript](https://redux-toolkit.js.org/usage/usage-with-typescript)：Redux Toolkit API 的 TypeScript 使用示例
- React + Redux + TypeScript 指南：
  - [React+TypeScript Cheatsheet](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet)：React 和 TypeScript 的全面指南
  - [React + Redux in TypeScript Guide](https://github.com/piotrwitek/react-redux-typescript-guide)：丰富的 React 与 Redux + TypeScript 使用模式
    - _注意：该指南虽有用信息，但部分模式与本页推荐的最佳实践冲突（如使用 action 类型联合）。仅作为补充参考。_
- 其它文章：
  - [不要对 Redux Action 类型创建联合](https://phryneas.de/redux-typescript-no-discriminating-union)
  - [带代码拆分和类型检查的 Redux](https://www.matthewgerstman.com/tech/redux-code-split-typecheck/)
