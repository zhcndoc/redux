---
id: part-5-async-logic
title: 'Redux 基础，第 5 部分：异步逻辑和数据获取'
sidebar_label: '异步逻辑和数据获取'
description: 'Redux 官方基础教程：学习 Redux 应用中异步逻辑的工作原理'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 你将学到

- 如何使用 Redux 的 "thunk" 中间件处理异步逻辑
- 处理异步请求状态的模式
- 如何使用 Redux Toolkit 的 `createAsyncThunk` API 管理异步调用

:::

:::info 前提条件

- 熟悉使用 HTTP 请求从服务器 REST API 获取和更新数据

:::

## 介绍

在 [第 4 部分：使用 Redux 数据](./part-4-using-data.md) 中，我们了解了如何在 React 组件中使用 Redux 存储中的多条数据，自定义派发动作对象的内容，以及在 reducer 中处理更复杂的更新逻辑。

到目前为止，我们处理的所有数据都直接存储在 React 客户端应用程序内部。然而，大多数真实应用需要通过发起 HTTP API 调用来从服务器获取和保存数据。

本节中，我们将把社交媒体应用改为从 API 获取帖子和用户数据，并通过保存到 API 来添加新帖子。

:::tip

Redux Toolkit 包含了 [**RTK Query 数据获取和缓存 API**](https://redux-toolkit.js.org/rtk-query/overview)。RTK Query 是为了 Redux 应用特别设计的数据获取和缓存方案，**可以完全免去你编写像 thunk 或 reducer 这样额外 Redux 代码来管理数据获取的需要。** 我们也会将 RTK Query 作为数据获取的默认教学方案。

RTK Query 构建在本页展示的模式之上，因此本节内容有助于你理解 Redux 中数据获取底层的工作机制。

我们将在 [第 7 部分：RTK Query 基础](./part-7-rtk-query-basics.md) 讲解如何使用 RTK Query。

:::

### 示例 REST API 和客户端

为了保持示例项目既独立又现实，初始项目已包含一个基于假内存的 REST API（使用 [Mock Service Worker 模拟 API 工具](https://mswjs.io/) 配置）。API 以 `/fakeApi` 作为端点基地址，支持 `/fakeApi/posts`、`/fakeApi/users` 和 `/fakeApi/notifications` 的典型 `GET/POST/PUT/DELETE` HTTP 方法。API 定义在 `src/api/server.ts` 中。

项目还包括一个小型 HTTP API 客户端对象，该对象暴露了类似于流行 HTTP 库 `axios` 的 `client.get()` 和 `client.post()` 方法，定义在 `src/api/client.ts` 中。

本节中，我们将使用该 `client` 对象对内存中的假 REST API 进行 HTTP 调用。

此外，模拟服务器已配置为每次加载页面时使用相同的随机种子，保证生成的假用户和假帖子列表一致。如果你想重置，删除浏览器 Local Storage 中的 `'randomTimestampSeed'` 值并重新加载页面，或者编辑 `src/api/server.ts` 并将 `useSeededRNG` 设置为 `false` 来关闭该功能。

:::info

提醒一下，示例代码着重展现每节的关键概念和变动。完整的应用变更请查看 CodeSandbox 项目和项目仓库中的 [`tutorial-steps-ts` 分支](https://github.com/reduxjs/redux-essentials-example-app/tree/tutorial-steps-ts)。

:::

## 使用中间件启用异步逻辑

Redux 存储本身并不支持异步逻辑。它只知道如何同步派发动作、调用根 reducer 函数更新状态，并通知 UI 有变化。任何异步操作都必须在存储之外发生。

但是，如果你想让异步逻辑通过派发动作、检查当前存储状态或执行副作用等方式与存储交互，怎么办？这就需要用到 [Redux 中间件](../fundamentals/part-4-store.md#middleware)。中间件扩展存储，赋予它附加功能，使你能够：

- 每当有动作派发时执行额外逻辑（如日志记录动作和状态）
- 暂停、修改、延迟、替换或阻止派发的动作
- 编写有权访问 `dispatch` 和 `getState` 的额外代码
- 让 `dispatch` 除了接受普通动作对象外，还能接受函数、Promise 等其他类型，拦截这些值并改派发真正的动作对象
- 编写含异步逻辑或其他副作用的代码

[使用中间件最常见的原因是让各种异步逻辑能与存储交互](../../faq/Actions.md#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)。这让你可以编写代码派发动作并检查存储状态，同时保持逻辑与 UI 分离。

:::info 中间件和 Redux 存储

想了解更多中间件如何自定义 Redux 存储，参见：

- [Redux 基础，第 4 部分：存储 > 中间件](../fundamentals/part-4-store.md#middleware)

:::

### 中间件与 Redux 数据流

此前我们见过 [Redux 的同步数据流长什么样](part-1-overview-concepts.md#redux-application-data-flow)。

中间件通过在 `dispatch` 开始处添加一步扩展 Redux 数据流，使得中间件可以执行像 HTTP 请求这样的逻辑，然后再派发动作。异步数据流就变成这样：

![Redux 异步数据流图](/img/tutorials/essentials/ReduxAsyncDataFlowDiagram.gif)

## Thunk 与异步逻辑

Redux 有许多异步中间件，允许你用不同语法编写异步逻辑。最常见的是 [`redux-thunk`](https://github.com/reduxjs/redux-thunk)，它允许你直接编写包含异步逻辑的普通函数。Redux Toolkit 的 `configureStore` 函数[默认自动配置 thunk 中间件](https://redux-toolkit.js.org/api/getDefaultMiddleware#included-default-middleware)，我们也建议[用 thunk 作为 Redux 异步逻辑编写的标准方式](../../style-guide/style-guide.md#use-thunks-and-listeners-for-other-async-logic)。

:::info 什么是“Thunk”？

“thunk”是一个编程术语，意为 [“一段执行延迟工作的代码”](https://en.wikipedia.org/wiki/Thunk)。

更多如何使用 Redux thunk，请参阅：

- [使用 Redux：用 thunk 编写逻辑](../../usage/writing-logic-thunks.mdx)

还有这些文章：

- [到底什么是 thunk？](https://daveceddia.com/what-is-a-thunk/)
- [Redux 中的 thunks：基础](https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60)

:::

### Thunk 函数

把 thunk 中间件添加到 Redux 存储后，你可以直接将 _thunk 函数_ 传入 `store.dispatch`。thunk 函数总是用 `(dispatch, getState)` 作为参数调用，你可以在 thunk 内根据需要使用它们。

thunk 函数可以包含任何逻辑，无论同步还是异步。

thunk 通常用 action 创建器派发普通动作，如 `dispatch(increment())`：

```ts
const store = configureStore({ reducer: counterReducer })

const exampleThunkFunction = (
  dispatch: AppDispatch,
  getState: () => RootState
) => {
  const stateBefore = getState()
  console.log(`计数器之前：${stateBefore.counter}`)
  dispatch(increment())
  const stateAfter = getState()
  console.log(`计数器之后：${stateAfter.counter}`)
}

store.dispatch(exampleThunkFunction)
```

为了和正常派发普通动作对象保持一致，我们通常将其写成 _thunk action 创建器_，返回 thunk 函数。这个 action 创建器可以接收参数以供 thunk 内使用。

```ts
const logAndAdd = (amount: number) => {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const stateBefore = getState()
    console.log(`计数器之前：${stateBefore.counter}`)
    dispatch(incrementByAmount(amount))
    const stateAfter = getState()
    console.log(`计数器之后：${stateAfter.counter}`)
  }
}

store.dispatch(logAndAdd(5))
```

Thunk 通常写在 ["slice" 文件](./part-2-app-structure.md#redux-slices) 中，因为数据获取的 thunk 通常与某特定 slice 的更新逻辑紧密相关。我们会在本节中看到几种定义 thunk 的方式。

### 编写异步 Thunk

thunk 中可以含有异步逻辑，比如 `setTimeout`、Promise、`async/await`，这使得它们成为执行 HTTP API 调用的理想位置。

Redux 数据获取逻辑通常遵循以下模式：

- 请求发起前派发“开始”动作，表示请求正在进行，便于追踪加载状态，避免重复请求或显示加载提示
- 使用 `fetch` 或封装库进行异步请求，返回 Promise
- 请求 Promise 解析后，异步逻辑派发“成功”动作（含结果数据）或“失败”动作（含错误详情）。reducer 会在两者中均清除加载状态，在成功时处理数据，失败时存储错误以供展示

这些步骤并非 _必须_，但很常见。（如果只关心成功结果，可以只派发请求结束的“成功”动作，省略“开始”和“失败”动作。）

**Redux Toolkit 提供了 [`createAsyncThunk`](https://redux-toolkit.js.org/api/createAsyncThunk) API，帮助你实现异步请求相关动作的自动创建和派发**。

`createAsyncThunk` 的基础用法如下：

```ts title="createAsyncThunk 示例"
import { createAsyncThunk } from '@reduxjs/toolkit'

export const fetchItemById = createAsyncThunk(
  'items/fetchItemById',
  async (itemId: string) => {
    const item = await someHttpRequest(itemId)
    return item
  }
)
```

详细部分会进一步说明 `createAsyncThunk` 如何简化异步请求动作派发代码。我们稍后也会看到实际用例。

<DetailedExplanation title="详细说明：在 Thunk 中派发请求状态动作">

如果我们手写一个典型异步 thunk 的代码，可能是这样的：

```ts
const getRepoDetailsStarted = () => ({
  type: 'repoDetails/fetchStarted'
})
const getRepoDetailsSuccess = (repoDetails: RepoDetails) => ({
  type: 'repoDetails/fetchSucceeded',
  payload: repoDetails
})
const getRepoDetailsFailed = (error: any) => ({
  type: 'repoDetails/fetchFailed',
  error
})

const fetchIssuesCount = (org: string, repo: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(getRepoDetailsStarted())
    try {
      const repoDetails = await getRepoDetails(org, repo)
      dispatch(getRepoDetailsSuccess(repoDetails))
    } catch (err) {
      dispatch(getRepoDetailsFailed(err.toString()))
    }
  }
}
```

不过，这种写法很繁琐。每种请求类型都需重复相似实现：

- 为三种情况定义唯一动作类型
- 通常为每种动作类型定义相应的动作创建器
- 编写 thunk，按正确顺序派发相应动作

`createAsyncThunk` 抽象了这个模式，帮你生成动作类型与动作创建器，并生成一个自动派发这些动作的 thunk。你只需提供一个进行异步请求并返回 Promise 的回调函数。

自己写 thunk 还容易因错误处理不当出错。比如上例中的 `try` 会捕获失败请求导致的错误，也会捕获派发动作时的错误。正确处理就需要重构逻辑区分两者。而 `createAsyncThunk` 内部已帮你正确处理错误。

</DetailedExplanation>

<br />

### Thunk 的类型定义

#### 手写 Thunk 的类型定义

如果手写 thunk，可以显式声明参数类型为 `(dispatch: AppDispatch, getState: () => RootState)`。这很常用，所以也可以定义可复用的 `AppThunk` 类型来替代：

```ts title="app/store.ts"
// highlight-next-line
import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit'

// 略去实际存储配置

// 推断 store 类型
export type AppStore = typeof store
// 推断 `dispatch` 类型
export type AppDispatch = typeof store.dispatch
// 推断 `RootState` 类型
export type RootState = ReturnType<typeof store.getState>
// highlight-start
// 导出一个可复用的手写 thunk 类型
export type AppThunk = ThunkAction<void, RootState, unknown, Action>
// highlight-end
```

然后用该类型描述你编写的 thunk 函数：

```ts title="示例类型化 thunk"
// highlight-start
// 用 `AppThunk` 作为返回类型，因为返回的是 thunk 函数
const logAndAdd = (amount: number): AppThunk => {
  // highlight-end
  return (dispatch, getState) => {
    const stateBefore = getState()
    console.log(`计数器之前：${stateBefore.counter}`)
    dispatch(incrementByAmount(amount))
    const stateAfter = getState()
    console.log(`计数器之后：${stateAfter.counter}`)
  }
}
```

#### `createAsyncThunk` 的类型定义

针对 `createAsyncThunk`：如果回调参数有值，**你应为该参数提供类型，如 `async (userId: string)`。默认情况下不必给返回值类型，TS 会自动推断。**

如果需要在 `createAsyncThunk` 内访问 `dispatch` 或 `getState`，RTK 支持用 `createAsyncThunk.withTypes()` 定义“预定义类型”版本，内置正确的类型。类似我们为 `useSelector` 和 `useDispatch` 定义的预定义版本。我们新建一个 `src/app/withTypes.ts` 文件并导出：

```ts title="app/withTypes.ts"
import { createAsyncThunk } from '@reduxjs/toolkit'

import type { RootState, AppDispatch } from './store'

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
}>()
```

:::info Thunk 的类型定义

想了解更多用 TypeScript 定义 thunk 的细节，见：

- [Redux Thunk 的类型检查](../../usage/UsageWithTypescript.md#type-checking-redux-thunks)

:::

## 加载帖子

到目前为止，`postsSlice` 使用的是写死的示例数据作为初始状态。我们将改成从一个空数组开始，然后从服务器请求帖子列表。

为此，我们需要改写 `postsSlice` 的状态结构，以便追踪 API 请求的当前状态。

### 请求的加载状态

发起 API 调用时，其可视为一个小状态机，具有四种可能状态：

- 请求尚未开始
- 请求正在进行中
- 请求成功，我们获取了需要的数据
- 请求失败，可能有错误消息

我们 _可以_ 用多个布尔值来跟踪，比如 `isLoading: true`，但更好的方案是用单一的联合值表示这些状态。常见模式是使用如下状态段（用 TypeScript 字符串联合类型表示）：

```ts
{
  // 可选的状态字符串联合值
  status: 'idle' | 'pending' | 'succeeded' | 'failed',
  error: string | null
}
```

这些字段和实际数据字段并存。状态名可自由替换，比如 `'loading'` 替代 `'pending'`，`'completed'` 替代 `'succeeded'` 等。

我们用这些信息在 UI 中显示请求进度状态，也能在 reducers 里防止例如重复加载等情况。

我们更新 `postsSlice` 以采用此模式追踪“获取帖子”请求的加载状态。state 不再是简单的帖子数组，而是改成 `{posts, status, error}` 结构。同时移除旧的示例帖数据，编写两个新的 selector 供加载状态和错误字段使用：

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid } from '@reduxjs/toolkit'

// 略去 reactions 和其他类型

// highlight-start
interface PostsState {
  posts: Post[]
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null
}
// highlight-end

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        // highlight-next-line
        state.posts.push(action.payload)
      },
      prepare(title: string, content: string, userId: string) {
        // 略去 prepare 逻辑
      }
    },
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload
      // highlight-next-line
      const existingPost = state.posts.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    },
    reactionAdded(
      state,
      action: PayloadAction<{ postId: string; reaction: ReactionName }>
    ) {
      const { postId, reaction } = action.payload
      // highlight-next-line
      const existingPost = state.posts.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(userLoggedOut, state => {
      // highlight-start
      // 用户注销时清空帖子列表
      return initialState
      // highlight-end
    })
  }
})

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// highlight-start

export const selectAllPosts = (state: RootState) => state.posts.posts

export const selectPostById = (state: RootState, postId: string) =>
  state.posts.posts.find(post => post.id === postId)

export const selectPostsStatus = (state: RootState) => state.posts.status
export const selectPostsError = (state: RootState) => state.posts.error
// highlight-end
```

更改完成后，所有直接使用 `state` 作为数组的地方都需要改为 `state.posts`，因为帖子数组现在嵌套在 `posts` 字段里了。

确实，这意味着现在有个看起来重复的路径 `state.posts.posts` :) 我们 _可以_ 把嵌套数组字段名改为 `items` 或 `data` 等以避免重复，但暂时就保留。

### 使用 `createAsyncThunk` 进行数据获取

Redux Toolkit 的 `createAsyncThunk` API 会帮你生成自动派发“开始/成功/失败”动作的 thunk。

我们先添加一个 thunk，从 API 发请求以获取帖子列表。导入 `src/api` 里的 `client`，用它请求 `'/fakeApi/posts'`：

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
// highlight-next-line
import { client } from '@/api/client'

import type { RootState } from '@/app/store'
// highlight-next-line
import { createAppAsyncThunk } from '@/app/withTypes'

// 略去其他导入和类型

// highlight-start
export const fetchPosts = createAppAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get<Post[]>('/fakeApi/posts')
  return response.data
})
// highlight-end

const initialState: PostsState = {
  posts: [],
  status: 'idle',
  error: null
}
```

`createAsyncThunk` 接受两个参数：

- 用于生成动作类型前缀的字符串
- “payload creator” 回调函数，应返回一个包含数据的 Promise，或者包含错误的 rejected Promise

payload creator 通常会发起 HTTP 请求，并可直接返回请求的 Promise，或者取出响应里的数据返回。建议用 `async/await` 语法写，能够用常规的 `try/catch` 逻辑替代 `.then()` 链。

这里传了 `'posts/fetchPosts'` 作为动作类型前缀。

这个 `fetchPosts` 的回调不带参数，只是等待 API 返回响应。响应对象是 `{data: []}` 结构，我们希望派发的 Redux 动作负载是纯粹的帖子数组，所以返回 `response.data`。

调用 `dispatch(fetchPosts())` 时，`fetchPosts` thunk 会首先派发 `'posts/fetchPosts/pending'` 动作：

![`createAsyncThunk`：posts pending 动作](/img/tutorials/essentials/devtools-posts-pending.png)

我们可以在 reducer 里监听该动作，将请求状态设置为 `'pending'`。

当 Promise 成功解析，`fetchPosts` thunk 会取回回调返回的 `response.data` 数组，并派发 `'posts/fetchPosts/fulfilled'` 动作，`action.payload` 是帖子数组：

![`createAsyncThunk`：posts fulfilled 动作](/img/tutorials/essentials/devtools-posts-fulfilled.png)

### 处理加载相关动作的 Reducer

接下来需要在 reducers 中处理这些动作。这需要稍微深入了解一下我们用的 `createSlice` API。

我们已见过 `createSlice` 会根据 `reducers` 字段里定义的每个 reducer 函数生成一个动作创建器，生成的动作类型包含 slice 名称，比如：

```js
console.log(
  postUpdated({ id: '123', title: '第一条帖', content: '这里有点内容' })
)
/*
{
  type: 'posts/postUpdated',
  payload: {
    id: '123',
    title: '第一条帖',
    content: '这里有点内容'
  }
}
*/
```

也见过 [`createSlice` 中的 `extraReducers` 字段可以响应 slice 外定义的动作](./part-4-using-data.md##using-extrareducers-to-handle-other-actions)。

这次需要监听 `fetchPosts` thunk 派发的 “pending” 和 “fulfilled” 动作。该 thunk 函数上附带这些动作创建器，我们能传给 `extraReducers` 监听它们：

```ts title="features/posts/postsSlice.ts"
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async () => {
  const response = await client.get<Post[]>('/fakeApi/posts')
  return response.data
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // 略去已有 reducers
  },

  extraReducers: builder => {
    builder
      .addCase(userLoggedOut, state => {
        // 用户注销时清空帖子列表
        return initialState
      })
      // highlight-start
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'pending'
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        // 将获取的帖子添加进数组
        state.posts.push(...action.payload)
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? '未知错误'
      })
      // highlight-end
  }
})
```

根据我们返回的 Promise，处理 thunk 可能派发的三种动作：

- 请求开始，状态设为 `'pending'`
- 请求成功，状态设为 `'succeeded'`，将获取的帖子添加到 `state.posts`
- 请求失败，状态设为 `'failed'`，保存错误信息以便展示

### 组件派发 Thunk

有了 `fetchPosts` thunk 和 slice 处理相关动作后，我们来改 `<PostsList>` 组件触发数据请求。

导入 `fetchPosts` thunk。像之前其他动作创建器一样，需要用 `useAppDispatch` 钩子派发。想在组件挂载时拉取数据，需要导入 React 的 `useEffect` 钩子并派发动作。

要确保只触发一次加载，不能每次 `<PostsList>` 渲染都发请求。我们可以选取 `posts.status`，当它是 `'idle'` （没开始加载）时才派发请求。

```ts title="features/posts/PostsList.tsx"
// highlight-next-line
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

// highlight-next-line
import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { TimeAgo } from '@/components/TimeAgo'

import { PostAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'
// highlight-next-line
import { fetchPosts, selectAllPosts, selectPostsStatus } from './postsSlice'

export const PostsList = () => {
  // highlight-start
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const postStatus = useAppSelector(selectPostsStatus)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])
  // highlight-end

  // 略去渲染逻辑
}
```

这样，登录应用后，应该能看到一份最新帖子列表了！

![获取的帖子列表](/img/tutorials/essentials/posts-fetched.png)

#### 避免重复请求

好消息：我们成功从模拟服务器 API 上拉取到了帖子对象。

坏消息：帖子列表显示了重复的帖子：

![重复帖子条目](/img/tutorials/essentials/posts-duplicates.png)

Redux DevTools 里，我们看到 _两组_ `'pending'` 和 `'fulfilled'` 动作被派发：

![重复 fetchPosts 动作](/img/tutorials/essentials/devtools-posts-duplicate.png)

为什么？我们不是刚加了判断 `postStatus === 'idle'` 吗？不是足以保证只派发一次 thunk 了吗？

嗯，答案是“是的……又不是” :)

`useEffect` 的代码确实正确。问题在于目前我们用的是开发版本应用，且 React 在 `<StrictMode>` 里会[在组件挂载时执行所有 `useEffect` 两次](https://react.dev/reference/react/StrictMode)，以帮助暴露某些 bug。

情况是：

- `<PostsList>` 挂载
- `useEffect` 第一次执行。此时 `postStatus` 是 `'idle'`，派发了 `fetchPosts` thunk
- `fetchPosts` 立刻派发了 `fetchPosts.pending`，Redux 存储即刻更新状态为 `'pending'`...
- **React 又执行了一遍 `useEffect`（但组件未重新渲染），所以效果仍认为 `postStatus` 是 `'idle'`，又派发了第二次 `fetchPosts`**
- 这两个 thunk 都完成数据拉取并派发了 `fetchPosts.fulfilled`，reducer 执行两遍，造成重复帖子添加

那如何解决？

一种方案是删掉 `<StrictMode>`，但 React 团队推荐保留它，它对捕获其他问题有帮助。

也可以用 `useRef` 追踪组件是否真第一次挂载，避免多次派发 thunk，但实现起来比较繁琐。

最后一种方案是用 Redux 状态里 `state.posts.status` 字段判断请求状态，让 thunk 在自身内部检测，如果状态非 `'idle'`，就跳过执行。`createAsyncThunk` 提供了这样能力。

#### 检查 Async Thunk 条件

`createAsyncThunk` 支持一个可选的 `condition` 回调用于执行上述判断。如果返回 `false`，将取消该 thunk 执行。

这里，我们只在 `state.posts.status === 'idle'` 时执行 thunk。已有 `selectPostsStatus` selector，使用它即可，加上 `condition` 选项：

```ts title="features/posts/postsSlice.ts
export const fetchPosts = createAppAsyncThunk(
  'posts/fetchPosts',
  async () => {
    const response = await client.get<Post[]>('/fakeApi/posts')
    return response.data
  },
  // highlight-start
  {
    condition(arg, thunkApi) {
      const postsStatus = selectPostsStatus(thunkApi.getState())
      if (postsStatus !== 'idle') {
        return false
      }
    }
  }
  // highlight-end
)
```

现在刷新页面，`<PostsList>` 只会得到一份帖子，没有重复，也只会看到一组派发动作。

**你不必给所有 thunk 都加 `condition`，不过用来确保请求不会重复时挺有用。**

:::tip

注意，[RTK Query 会帮你管理这些问题！](./part-7-rtk-query-basics.md) 它能在 _所有_ 组件间去重请求，只发一次，不必自己担心重复发起。

:::

### 显示加载状态

`<PostsList>` 会观察存储里的帖子列表更新，并自动重新渲染。刷新页面后，我们看到假 API 返回的随机帖子，但起初 `<PostsList>` 是空的，过几秒才显示帖子。

真实 API 调用可能耗时，因此展示“加载中...”提示让用户知道数据正在请求中，是个好习惯。

我们改造 `<PostsList>`，根据 `state.posts.status` 显示不同 UI：加载时用一个旋转器，失败时显示错误，成功时显示帖列表。

顺带，我们把单个帖子渲染提取成 `<PostExcerpt>` 组件。

示例结果如下：

```tsx title="features/posts/PostsList.tsx"
import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { useAppSelector, useAppDispatch } from '@/app/hooks'

// highlight-next-line
import { Spinner } from '@/components/Spinner'
import { TimeAgo } from '@/components/TimeAgo'

import { PostAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'
import {
  Post,
  selectAllPosts,
  selectPostsError,
  fetchPosts
} from './postsSlice'

interface PostExcerptProps {
  post: Post
}

function PostExcerpt({ post }: PostExcerptProps) {
  return (
    <article className="post-excerpt" key={post.id}>
      <h3>
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <div>
        <PostAuthor userId={post.user} />
        <TimeAgo timestamp={post.date} />
      </div>
      <p className="post-content">{post.content.substring(0, 100)}</p>
      <ReactionButtons post={post} />
    </article>
  )
}

export const PostsList = () => {
  const dispatch = useAppDispatch()
  const posts = useAppSelector(selectAllPosts)
  const postStatus = useAppSelector(selectPostsStatus)
  // highlight-next-line
  const postsError = useAppSelector(selectPostsError)

  useEffect(() => {
    if (postStatus === 'idle') {
      dispatch(fetchPosts())
    }
  }, [postStatus, dispatch])

  // highlight-start
  let content: React.ReactNode

  if (postStatus === 'pending') {
    content = <Spinner text="加载中..." />
  } else if (postStatus === 'succeeded') {
    // 按时间逆序排序帖子
    const orderedPosts = posts
      .slice()
      .sort((a, b) => b.date.localeCompare(a.date))

    content = orderedPosts.map(post => (
      <PostExcerpt key={post.id} post={post} />
    ))
  } else if (postStatus === 'rejected') {
    content = <div>{postsError}</div>
  }
  // highlight-end

  return (
    <section className="posts-list">
      <h2>帖子</h2>
      {content}
    </section>
  )
}
```

你可能会注意到 API 调用耗时较久，加载旋转器停留了几秒。我们的模拟服务器专门给所有响应添加了 2 秒延迟，目的是让加载提示更明显直观。如果想调整，可以打开 `api/server.ts`，修改这行：

```ts title="api/server.ts"
// 给所有端点加个额外延迟，演示加载 Spinner
const ARTIFICIAL_DELAY_MS = 2000
```

需要时可开启/关闭此功能，令 API 调用更快返回。

### 可选：在 `createSlice` 内定义 Thunk

目前我们的 `fetchPosts` thunk 定义在 `postsSlice.ts` 文件中，但位置 _在_ `createSlice()` 调用之外。

我们也可以选择在 `createSlice` 内部定义 thunk，不过需要改写 `reducers` 字段。想尝试的话，见下说明：

<DetailedExplanation title="在 createSlice 中定义 Thunk">

`createSlice.reducers` 有两种写法：标准的是传入一个对象，键为动作名，值为 reducer 函数。值得注意的是，这些值也可以是一个带 `{reducer, prepare}` 函数的对象，用来创建带自己内容的动作对象。

另外，你可以把 `reducers` 写成一个回调函数，这个回调接收一个 `create` 参数。类似 `extraReducers`，但用不同方法生成 reducer 和 action：

- `create.reducer<PayloadType>(caseReducer)`：定义 case reducer
- `create.preparedReducer(prepare, caseReducer)`：定义带 prepare 回调的 reducer

然后返回一个对象，键是 reducer 名，值是调用上面 `create` 方法得到的 reducer。转换后的 `postsSlice` 例子：

```ts
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  // highlight-start
  reducers: create => {
    return {
      postAdded: create.preparedReducer(
        (title: string, content: string, userId: string) => {
          return {
            payload: {
              id: nanoid(),
              date: new Date().toISOString(),
              title,
              content,
              user: userId,
              reactions: initialReactions
            }
          }
        },
        (state, action) => {
          state.posts.push(action.payload)
        }
      ),
      postUpdated: create.reducer<PostUpdate>((state, action) => {
        const { id, title, content } = action.payload
        const existingPost = state.posts.find(post => post.id === id)
        if (existingPost) {
          existingPost.title = title
          existingPost.content = content
        }
      }),
      reactionAdded: create.reducer<{ postId: string; reaction: ReactionName }>(
        (state, action) => {
          const { postId, reaction } = action.payload
          const existingPost = state.posts.find(post => post.id === postId)
          if (existingPost) {
            existingPost.reactions[reaction]++
          }
        }
      )
    }
  },
  // highlight-end
  extraReducers: builder => {
    // 如前
  }
})
```

将 `reducers` 写成回调形式可扩展 `createSlice` 的能力。特别地，可以做个特殊版的 `createSlice`，内置支持 `createAsyncThunk`。

只需导入 `buildCreateSlice` 和 `asyncThunkCreator`，调用 `buildCreateSlice`：

```ts
import { buildCreateSlice, asyncThunkCreator } from '@reduxjs/toolkit'

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator }
})
```

这样就得到一个可在 `createSlice` 中直接写 thunk 的版本。

接着用 `createAppSlice` 来定义 `postsSlice` 并把 `fetchPosts` thunk 放进来。注意几点：

- 无法直接给 `RootState` 泛型，需要用 `getState() as RootState` 类型断言
- thunk 处理函数合并入 `create.asyncThunk()` 选项，去掉 `extraReducers` 里的

示例：

```ts
const postsSlice = createAppSlice({
  name: 'posts',
  initialState,
  reducers: create => {
    return {
      // 略去其他 reducers
      // highlight-start
      fetchPosts: create.asyncThunk(
        // payload creator 函数
        async () => {
          const response = await client.get<Post[]>('/fakeApi/posts')
          return response.data
        },
        {
          // createAsyncThunk 选项
          options: {
            condition(arg, thunkApi) {
              const { posts } = thunkApi.getState() as RootState
              if (posts.status !== 'idle') {
                return false
              }
            }
          },
          // thunk 动作对应的 case reducer
          pending: (state, action) => {
            state.status = 'pending'
          },
          fulfilled: (state, action) => {
            state.status = 'succeeded'
            state.posts.push(...action.payload)
          },
          rejected: (state, action) => {
            state.status = 'rejected'
            state.error = action.error.message ?? '未知错误'
          }
        }
      )
      // highlight-end
    }
  },
  extraReducers: builder => {
    builder.addCase(userLoggedOut, state => {
      // 用户注销时清空帖子列表
      return initialState
    })
    // highlight-next-line
    // thunk 相关处理已移除
  }
})
```

提醒，**`create` 回调写法是可选的！** 除非你真的想在 `createSlice` 内写 thunk，否则没必要这么做。该写法去除了对 `PayloadAction` 的需求，且减少了 `extraReducers` 用法。

</DetailedExplanation>

## 加载用户

我们已经拿到了帖子列表，但看帖时有个问题，所有帖子都显示“未知作者”：

![未知帖子作者](/img/tutorials/essentials/posts-unknownAuthor.png)

这是因为假 API 服务器随机生成了帖子，也随机生成了一批假用户。需要更新用户 slice，从 API 拉取用户数据。

同样，我们写另一个异步 thunk 从 API 获取用户列表，处理 `fulfilled` 动作，暂时不管理加载状态：

```ts title="features/users/usersSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// highlight-next-line
import { client } from '@/api/client'

import type { RootState } from '@/app/store'
// highlight-next-line
import { createAppAsyncThunk } from '@/app/withTypes'

interface User {
  id: string
  name: string
}

// highlight-start
export const fetchUsers = createAppAsyncThunk('users/fetchUsers', async () => {
  const response = await client.get<User[]>('/fakeApi/users')
  return response.data
})

const initialState: User[] = []
// highlight-end

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  // highlight-start
  extraReducers(builder) {
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      return action.payload
    })
  }
  // highlight-end
})

export default usersSlice.reducer

// 略去 selectors
```

你可能注意到这次 case reducer 没使用 `state` 参数，而是直接返回了 `action.payload`。**Immer 允许两种写法：一种是用“可变”写法更改传入的 state，另一种是返回一个全新的状态值替代原 state**。如果返回新值，需要自己编写不可变更新逻辑。

初始状态是空数组，我们也可以用 `state.push(...action.payload)` 变异写法。但本例我们想完全替换用户列表，避免意外重复。

:::info

想了解 Immer 状态更新原理，参考 [RTK 文档中的“用 Immer 写 Reducer”指南](https://redux-toolkit.js.org/usage/immer-reducers#immer-usage-patterns)。

:::

用户列表只需加载一次，且希望应用启动时立即拉取。可在 `main.tsx` 直接调用 `store.dispatch(fetchUsers())`，因为这里有完整 store。这样数据加载会在 React 组件渲染前触发，数据更快可用。（相同原理 React Router 的 [数据加载器](https://reactrouter.com/en/main/route/loader) 也用到）

示例：

```tsx title="main.tsx"
// 略去其他导入

import store from './app/store'
// highlight-next-line
import { fetchUsers } from './features/users/usersSlice'

import { worker } from './api/server'

async function start() {
  // 启动模拟 API 服务器
  await worker.start({ onUnhandledRequest: 'bypass' })

  // highlight-next-line
  store.dispatch(fetchUsers())

  const root = createRoot(document.getElementById('root')!)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}

start()
```

现在，帖子的作者应恢复显示用户名，也能在 `<AddPostForm>` 的“作者”下拉列表中看到相应用户。

## 添加新帖子

本节最后一步，当前从 `<AddPostForm>` 新增的帖子仅保存在本地 Redux store。我们还需改造，调用 API 在假服务器创建新帖，做到“持久保存”。（因假 API 重载时数据不会保持，但真实后端服务器会持久化）

### 用 Thunk 发送数据

`createAsyncThunk` 也可以用来发送数据。我们新建一个 thunk，接收 `<AddPostForm>` 中的值作为参数，发起 HTTP POST 请求保存数据到假 API。

为此，我们还将改写 reducer 中对新帖子对象的处理逻辑。当前 `postAdded` 的 `prepare` 回调会创建完整帖子对象，并生成唯一 ID。通常服务器也会生成 ID 并加上额外字段，且会返回完整数据。因此，我们只向服务器发送对象 `{ title, content, user: userId }`，然后把服务器返回的完整帖子对象添加到 `postsSlice` 状态。

同时，从帖子类型里提取 `NewPost` 类型，表示传给 thunk 的帖子对象：

```ts title="features/posts/postsSlice.ts"
type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>
// highlight-next-line
type NewPost = Pick<Post, 'title' | 'content' | 'user'>

// highlight-start
export const addNewPost = createAppAsyncThunk(
  'posts/addNewPost',
  // payload 创建函数接收部分帖子对象 `{title, content, user}`
  async (initialPost: NewPost) => {
    // 发送初始数据到假 API 服务器
    const response = await client.post<Post>('/fakeApi/posts', initialPost)
    // 响应中带有完整帖子对象，包括唯一 ID
    return response.data
  }
)
// highlight-end

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // highlight-next-line
    // 删除了原来的 `postAdded` reducer 和 prepare 回调
    reactionAdded(state, action) {}, // 省略逻辑
    postUpdated(state, action) {} // 省略逻辑
  },
  extraReducers(builder) {
    builder
      // 省略对 `fetchPosts` 和 `userLoggedOut` 的处理
      // highlight-start
      .addCase(addNewPost.fulfilled, (state, action) => {
        // 直接向帖子数组添加新帖子对象
        state.posts.push(action.payload)
      })
    // highlight-end
  }
})

// highlight-start
// 删除 `postAdded`
export const { postUpdated, reactionAdded } = postsSlice.actions
// highlight-end
```

### 在组件中检查 Thunk 结果

最后，更新 `<AddPostForm>`，改为派发 `addNewPost` thunk。因为这也是 API 调用，可能耗时且出错。`addNewPost()` thunk 会自动派发 `pending/fulfilled/rejected` 动作，已由我们处理。

我们 _可以_ 在 `postsSlice` 用第二个加载状态标识来追踪。但这示例中，我们选择在组件内追踪加载状态，演示另一种思路。

至少可以让表单“保存帖子”按钮在请求中禁用，避免重复提交。请求失败时，也可以在表单显示错误信息，或者打印错误。

组件逻辑会等待 thunk 执行完成，并根据结果做事：

```tsx title="features/posts/AddPostForm.tsx"
// highlight-next-line
import React, { useState } from 'react'

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { selectCurrentUsername } from '@/features/auth/authSlice'

// highlight-next-line
import { addNewPost } from './postsSlice'

// 略去字段类型

export const AddPostForm = () => {
  // highlight-start
  const [addRequestStatus, setAddRequestStatus] = useState<'idle' | 'pending'>(
    'idle'
  )
  // highlight-end

  const dispatch = useAppDispatch()
  const userId = useAppSelector(selectCurrentUsername)!

  // highlight-next-line
  const handleSubmit = async (e: React.FormEvent<AddPostFormElements>) => {
    // 阻止提交到服务器
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    // highlight-start
    const form = e.currentTarget

    try {
      setAddRequestStatus('pending')
      await dispatch(addNewPost({ title, content, user: userId })).unwrap()

      form.reset()
    } catch (err) {
      console.error('保存帖子失败：', err)
    } finally {
      setAddRequestStatus('idle')
    }
    // highlight-end
  }

  // 略去渲染逻辑
}
```

我们添加了一个 React 的 `useState` 用于追踪请求状态，类似于 `postsSlice` 中的加载状态。这次只关心是否请求中。

`dispatch(addNewPost())` 返回一个 Promise，可以通过 `await` 等待 thunk 完成。但这时不知道请求是成功还是失败。

`createAsyncThunk` 会内部捕获异步错误，不会在日志显示“未处理的 Promise 拒绝”错误。然后返回派发的最终动作，要么是 `fulfilled`，要么是 `rejected`。所以 **`await dispatch(someAsyncThunk())` 本身是总会成功的，得到的是动作对象。**

不过一般希望像写同步代码那样处理请求成功或失败。**Redux Toolkit 给返回的 Promise 增加了一个 `.unwrap()` 方法，会返回一个新的 Promise，它会返回 `fulfilled` 动作的 `action.payload`，或抛出 `rejected` 动作对应的错误，方便用 `try/catch` 处理。** 因此，我们成功时清空输入，失败时打印错误。

如果想试试故障情形，试着新增一条“内容”字段只包含单词 "error"（不带引号）的帖子。服务器会返回失败响应，你会看到控制台有错误日志。

## 你学到了什么

异步逻辑和数据获取是复杂的话题。如你所见，Redux Toolkit 提供了工具，自动帮助实现常见的 Redux 数据获取模式。

下面是我们改造后的应用示例，数据来自那个假 API：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-3-postRequests?fontsize=14&hidenavigation=1&module=%2fsrc%2Ffeatures%2Fposts%2FpostsSlice.ts&theme=dark&runonclick=1"
  title="redux-essentials-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

提醒，本节重点内容如下：

:::tip 总结

- **Redux 使用称为“中间件”的插件来允许异步逻辑**
  - 标准异步中间件是 `redux-thunk`，已包含在 Redux Toolkit 中
  - thunk 函数接收 `dispatch` 和 `getState` 作为参数，可以利用它们实现异步逻辑
- **你可以派发额外动作来追踪 API 请求的加载状态**
  - 常见模式是先派发“pending”，然后成功派发“success”含数据，失败派发“failure”含错误信息
  - 加载状态通常用字符串字面量联合类型存储，比如 `'idle' | 'pending' | 'succeeded' | 'rejected'`
- **Redux Toolkit 有 `createAsyncThunk` API 来帮你自动派发这些动作**
  - `createAsyncThunk` 接收一个“payload 创建器”回调，返回 Promise，自动生成 `pending/fulfilled/rejected` 动作类型
  - 生成的动作创建器如 `fetchPosts` 会基于 Promise 返回值自动派发动作
  - 你可在 `createSlice` 的 `extraReducers` 监听这些动作，更新相关状态
  - `createAsyncThunk` 支持 `condition` 选项，可基于 Redux 状态取消请求
  - thunk 会返回 Promise。对 `createAsyncThunk`，你可用 `await dispatch(someThunk()).unwrap()` 在组件层基于结果写逻辑

:::

## 下一步？

我们还有一部分核心 Redux Toolkit API 和使用模式内容待覆盖。在 [第 6 部分：性能与数据规范化](./part-6-performance-normalization.md) 中，我们将探讨 Redux 使用如何影响 React 性能，以及一些优化应用性能的手段。
