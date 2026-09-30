---
id: reducing-boilerplate
title: 减少样板代码
---

# 减少样板代码

Redux is in part [inspired by Flux](../understanding/history-and-design/PriorArt.md), and the most common complaint about Flux is how it makes you write a lot of boilerplate. In this recipe, we will consider which parts of Redux are actual design decisions, which parts are conventions you can drop, and how [Redux Toolkit](/toolkit) generates the repetitive parts for you.

## Actions（动作）

Actions 是描述应用内发生了什么的普通对象，是描述修改数据意图的唯一方式。重要的是，**Actions 作为你必须 dispatch 的对象，并不是样板代码，而是 Redux 的 [根本设计选择之一](../understanding/thinking-in-redux/ThreePrinciples.md)**。

市面上有声称类似 Flux 的框架，但没有动作对象的概念。从可预测性角度讲，这比 Flux 或 Redux 退步了一步。没有可序列化的普通对象 Actions，就无法录制和回放用户会话，也无法实现带时间旅行的 [热加载](https://www.youtube.com/watch?v=xsSnOQynTHs)。如果你更愿意直接修改数据，你根本不需要 Redux。

Actions 看起来像这样：

```js
{ type: 'todos/todoAdded', payload: 'Use Redux' }
{ type: 'todos/todoRemoved', payload: 42 }
{ type: 'articles/articleLoaded', payload: { ... } }
```

It is a common convention that actions have a constant type that helps reducers identify them. We recommend that you use strings and not [Symbols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol) for action types, because strings are serializable, and by using Symbols you make recording and replaying harder than it needs to be.

在 Flux 中，传统上认为你会把每个动作类型定义为字符串常量：

```js
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'
const LOAD_ARTICLE = 'LOAD_ARTICLE'
```

Why is this beneficial? For larger projects, there are some benefits to having action types defined in one place:

- 有助于保持命名一致，因为所有动作类型都汇聚在一个地方。
- 有时你想在开发新功能前先看看已有的所有动作，也许你需要的动作已经被团队某人添加了，但你不知道。
- 在 Pull Request 中新增、删除和修改的动作类型列表，帮助团队成员了解新功能的范围和实现。
- 万一导入动作常量时出现拼写错误，会变成 `undefined`。Redux 在 dispatch 该动作时会立即报错，你可以更早发现错误。

Those benefits come from having a single definition per action, not from the constants themselves. With Redux Toolkit's [`createSlice`](/toolkit/api/createSlice), the definition is the case reducer, and the type string is generated from the slice name and the reducer name:

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

You never write the string, but it still exists and is still visible in the DevTools and in the action objects.

## Action Creators（动作创建函数）

It is another common convention that, instead of creating action objects inline in the places where you dispatch the actions, you would create functions generating them:

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

Let's say a designer comes back to us after reviewing our prototype, and tells us that we need to allow three todos maximum. We can enforce this by rewriting our action creator as a [thunk](./writing-logic-thunks.mdx) and adding an early exit:

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

Writing an action creator for every action type by hand is repetitive: each one is a function that takes some arguments and puts them in an object with a `type` field. `createSlice` generates one action creator per case reducer, as shown above, and that covers most actions in an app. For an action that is not tied to one slice, [`createAction`](/toolkit/api/createAction) generates a single action creator from a type string:

```ts
import { createAction } from '@reduxjs/toolkit'

export const userLoggedOut = createAction('auth/userLoggedOut')
export const todoEdited = createAction<{ id: number; text: string }>(
  'todos/todoEdited'
)

todoEdited({ id: 1, text: 'Use Redux Toolkit' })
// { type: 'todos/todoEdited', payload: { id: 1, text: 'Use Redux Toolkit' } }
```

Both follow the [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action) convention: the data goes in a `payload` field, with an optional `meta` field for extra information.

## 异步动作创建函数

[中间件](../understanding/thinking-in-redux/Glossary.md#middleware) 允许你注入自定义逻辑，用来解释每个被 dispatch 的动作对象。异步动作是中间件最常见的应用。

Without any middleware, [`dispatch`](../api/Store.md#dispatchaction) only accepts a plain object, so we would have to perform AJAX calls inside our components and dispatch a "request" action before the call and a "success" or "failure" action after it. That quickly gets repetitive, because different components request data from the same API endpoints, and we want to reuse some of this logic (like skipping the request when there is cached data) from many components.

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

The request / success / failure pattern itself is boilerplate, and Redux Toolkit's [`createAsyncThunk`](/toolkit/api/createAsyncThunk) generates it. You provide the type prefix and a function that returns a promise; it dispatches `pending`, `fulfilled`, and `rejected` actions around that promise, and gives you the action creators to handle in a slice:

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

For data that comes from a server and is cached in the store, [RTK Query](/toolkit/rtk-query/overview) goes one step further and generates the thunks, the reducers, the cache, and the React hooks from a description of the endpoints, so none of this is written per endpoint. See [Side Effects Approaches](./side-effects-approaches.mdx) for how to choose between these.

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

### Generating Reducers

If you don't like `switch`, a reducer can be expressed as an object mapping from action types to handler functions, and a small helper turns that object into a reducer:

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

That is what `createSlice` does internally: the `reducers` object is a lookup table from action type to case reducer. It also wraps each case reducer in [Immer](https://immerjs.github.io/immer/), so the handler can write `state.push(text)` instead of copying the array, and generates the action creators described earlier. The Redux reducer API is still `(state, action) => newState`; `createSlice` is one way to produce such a function.

For a step-by-step comparison of hand-written reducers and the same logic in `createSlice`, see [Refactoring Reducers](./structuring-reducers/RefactoringReducersExample.md). For moving an existing hand-written codebase to these patterns, see [Migrating to Modern Redux](./migrating-to-modern-redux.mdx).
