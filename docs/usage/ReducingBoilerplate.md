---
id: reducing-boilerplate
title: 减少样板代码
---

# 减少样板代码

Redux 部分理念[受到 Flux 启发](../understanding/history-and-design/PriorArt.md)，而对 Flux 最常见的抱怨是它要求编写大量样板代码。本篇将讨论 Redux 的哪些部分是真正的设计选择、哪些只是可以舍弃的惯例，以及 [Redux Toolkit](/toolkit) 如何替你生成重复性代码。

## Actions（动作） {#actions}

Actions 是描述应用内发生了什么的普通对象，是描述修改数据意图的唯一方式。重要的是，**Actions 作为你必须 dispatch 的对象，并不是样板代码，而是 Redux 的 [根本设计选择之一](../understanding/thinking-in-redux/ThreePrinciples.md)**。

市面上有声称类似 Flux 的框架，但没有动作对象的概念。从可预测性角度讲，这比 Flux 或 Redux 退步了一步。没有可序列化的普通对象 Actions，就无法录制和回放用户会话，也无法实现带时间旅行的 [热加载](https://www.youtube.com/watch?v=xsSnOQynTHs)。如果你更愿意直接修改数据，你根本不需要 Redux。

Actions 看起来像这样：

```js
{ type: 'todos/todoAdded', payload: 'Use Redux' }
{ type: 'todos/todoRemoved', payload: 42 }
{ type: 'articles/articleLoaded', payload: { ... } }
```

一种常见惯例是为 action 定义常量类型，帮助 reducer 识别它们。我们建议 action 类型使用字符串，而不是 [Symbol](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol)，因为字符串可以序列化；使用 Symbol 会给记录和回放带来不必要的困难。

在 Flux 中，传统上认为你会把每个动作类型定义为字符串常量：

```js
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const LOAD_ARTICLE = 'LOAD_ARTICLE'
```

这样做有什么好处？对于较大型项目，将 action 类型集中定义有以下优点：

- 有助于保持命名一致，因为所有动作类型都汇聚在一个地方。
- 有时你想在开发新功能前先看看已有的所有动作，也许你需要的动作已经被团队某人添加了，但你不知道。
- 在 Pull Request 中新增、删除和修改的动作类型列表，帮助团队成员了解新功能的范围和实现。
- 万一导入动作常量时出现拼写错误，会变成 `undefined`。Redux 在 dispatch 该动作时会立即报错，你可以更早发现错误。

这些好处来自每个 action 只有一个定义，而不是来自常量本身。使用 Redux Toolkit 的 [`createSlice`](/toolkit/api/createSlice) 时，case reducer 就是该定义，类型字符串则根据 slice 名称和 reducer 名称生成：

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as string[],
  reducers: {
    todoAdded(state, action: PayloadAction<string>) {
      state.push(action.payload)
    },
    todoRemoved(state, action: PayloadAction<number>) {
      state.splice(action.payload, 1)
    }
  }
})

export const { todoAdded, todoRemoved } = todosSlice.actions

todoAdded.type // 'todos/todoAdded'
```

你无需手动编写这个字符串，但它仍然存在，并且仍会显示在 DevTools 和 action 对象中。

## Action Creators（动作创建函数）

另一个常见惯例是，不在派发 action 的位置内联创建 action 对象，而是创建生成它们的函数：

```ts
export function addTodo(text: string) {
  return {
    type: 'todos/todoAdded',
    payload: text
  }
}

// 在某处事件处理器内
dispatch(addTodo('使用 Redux'))
```

动作创建函数常被批评为样板代码。其实，你不必非写它们不可！**如果觉得更适合你的项目，可以直接用对象字面量。**不过写动作创建函数有一些优点，你应该了解。

假设设计师审阅原型后提出，待办事项最多只能有三个。我们可以将 action creator 改写为一个 [thunk](./writing-logic-thunks.mdx)，并提前退出以实现这一限制：

```ts
import { todoAdded } from './todosSlice'
import type { AppThunk } from '../../app/store'

export function addTodo(text: string): AppThunk {
  return function (dispatch, getState) {
    if (getState().todos.length === 3) {
      // 早期退出
      return
    }
    dispatch(todoAdded(text))
  }
}
```

我们修改了 `addTodo` 动作创建函数的行为，调用它的代码完全不用改。**不需要对添加待办的每个调用点都加检查。**动作创建函数让你把分发动作的额外逻辑和触发动作的组件解耦。当应用处于快速开发状态、需求频繁变更时，非常方便。

### 生成动作创建函数

为每种 action 类型手动编写 action creator 很重复：每个函数都接收一些参数，并将它们放入带 `type` 字段的对象中。如上所示，`createSlice` 会为每个 case reducer 生成一个 action creator，这已覆盖应用中的大多数 action。对于不属于任何 slice 的 action，可以使用 [`createAction`](/toolkit/api/createAction) 根据类型字符串生成单个 action creator：

```ts
import { createAction } from '@reduxjs/toolkit'

export const userLoggedOut = createAction('auth/userLoggedOut')
export const todoEdited = createAction<{ id: number; text: string }>(
  'todos/todoEdited'
)

todoEdited({ id: 1, text: 'Use Redux Toolkit' })
// { type: 'todos/todoEdited', payload: { id: 1, text: 'Use Redux Toolkit' } }
```

两种方式都遵循 [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action) 约定：数据放在 `payload` 字段中，可选的 `meta` 字段用于存放额外信息。

## 异步动作创建函数

[中间件](../understanding/thinking-in-redux/Glossary.md#middleware) 允许你注入自定义逻辑，用来解释每个被 dispatch 的动作对象。异步动作是中间件最常见的应用。

没有 middleware 时，[`dispatch`](../api/Store.md#dispatchaction) 只接受普通对象，因此我们只能在组件中执行 AJAX 请求，并在请求前派发“request” action、请求后派发“success”或“failure” action。这很快会变得重复：不同组件可能请求同一个 API endpoint，而且我们希望在多个组件中复用部分逻辑（例如数据已缓存时跳过请求）。

**Middleware lets us write more expressive, potentially async action creators.** The thunk middleware, which `configureStore` includes by default, lets you dispatch a function that receives `dispatch` and `getState`, so a single action creator can dispatch many times:

```ts
export function loadPosts(userId: number): AppThunk {
  return async function (dispatch, getState) {
    if (getState().posts.byUser[userId]) {
      // There is cached data! Don't do anything.
      return
    }

    dispatch(postsLoadingStarted({ userId }))

    try {
      const response = await fetch(`http://myapi.com/users/${userId}/posts`)
      const posts = await response.json()
      dispatch(postsLoadingSucceeded({ userId, posts }))
    } catch (error) {
      dispatch(postsLoadingFailed({ userId, error: String(error) }))
    }
  }
}
```

request / success / failure 模式本身就是样板代码，Redux Toolkit 的 [`createAsyncThunk`](/toolkit/api/createAsyncThunk) 可以替你生成这些内容。你提供类型前缀和一个返回 Promise 的函数；它会围绕该 Promise 派发 `pending`、`fulfilled` 和 `rejected` action，并提供可在 slice 中处理它们的 action creator：

```ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface PostsState {
  byUser: Record<number, Post[]>
  status: 'idle' | 'loading' | 'failed'
  error?: string
}

const initialState: PostsState = { byUser: {}, status: 'idle' }

export const loadPosts = createAsyncThunk(
  'posts/loadPosts',
  async (userId: number) => {
    const response = await fetch(`http://myapi.com/users/${userId}/posts`)
    return (await response.json()) as Post[]
  },
  {
    condition(userId, { getState }) {
      // Skip the request if there is cached data
      return !(getState() as RootState).posts.byUser[userId]
    }
  }
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(loadPosts.pending, state => {
        state.status = 'loading'
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        state.status = 'idle'
        state.byUser[action.meta.arg] = action.payload
      })
      .addCase(loadPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  }
})
```

对于从服务器获取并缓存在 store 中的数据，[RTK Query](/toolkit/rtk-query/overview) 更进一步：它根据 endpoint 描述生成 thunk、reducer、缓存和 React hooks，因此无需为每个 endpoint 手动编写这些内容。如何在不同方案间选择，请参阅[副作用处理方式](./side-effects-approaches.mdx)。

## Reducers（状态处理函数）

Redux 通过用函数描述更新逻辑，大大减少了 Flux store 的样板代码。函数比对象简单多了，也比类简单很多。

看看这个 Flux store：

```js
const _todos = []

const TodoStore = Object.assign({}, EventEmitter.prototype, {
  getAll() {
    return _todos
  }
})

AppDispatcher.register(function (action) {
  switch (action.type) {
    case ActionTypes.ADD_TODO:
      const text = action.text.trim()
      _todos.push(text)
      TodoStore.emitChange()
  }
})

export default TodoStore
```

用 Redux，同样的更新逻辑可写成 reducer 函数：

```js
export function todos(state = [], action) {
  switch (action.type) {
    case ActionTypes.ADD_TODO:
      const text = action.text.trim()
      return [...state, text]
    default:
      return state
  }
}
```

开关语句 *不是* 真正的样板代码。Flux 真正的样板是概念上的：需要触发更新事件，需要注册 Store 到 Dispatcher，需要 Store 是对象（以及通用应用中带来的复杂问题）。

### 生成 Reducer

如果不喜欢 `switch`，也可以用一个对象将 action 类型映射到处理函数，再通过一个小型辅助函数将该对象转换为 reducer：

```js
function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

export const todos = createReducer([], {
  [ActionTypes.ADD_TODO]: (state, action) => {
    const text = action.text.trim()
    return [...state, text]
  }
})
```

这正是 `createSlice` 内部所做的事：`reducers` 对象是从 action 类型到 case reducer 的查找表。它还会用 [Immer](https://immerjs.github.io/immer/) 包装每个 case reducer，因此处理函数可以写 `state.push(text)`，而不必复制数组；此外，它还会生成前面介绍的 action creator。Redux reducer API 仍然是 `(state, action) => newState`；`createSlice` 是生成这类函数的一种方式。

手写 reducer 与 `createSlice` 中相同逻辑的逐步对比，请参阅[重构 Reducer](./structuring-reducers/RefactoringReducersExample.md)。将现有手写代码迁移到这些模式，请参阅[迁移到现代 Redux](./migrating-to-modern-redux.mdx)。
