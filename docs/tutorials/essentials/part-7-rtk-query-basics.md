---
id: part-7-rtk-query-basics
title: 'Redux 要点，第7部分：RTK Query 基础'
sidebar_label: 'RTK Query 基础'
description: 'Redux 官方要点教程：学习如何使用 RTK Query 进行数据获取'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 你将学到

- RTK Query 如何简化 Redux 应用中的数据获取
- 如何设置 RTK Query
- 如何使用 RTK Query 进行基本的数据获取和更新请求

:::

:::info 先决条件

- 完成本教程的前面章节，以理解 Redux Toolkit 的使用模式

:::

:::tip 更喜欢视频课程？

如果你更喜欢视频课程，可以[在 Egghead 免费观看 RTK Query 创建者 Lenz Weber-Tronic 的 RTK Query 视频课程](https://egghead.io/courses/rtk-query-basics-query-endpoints-data-flow-and-typescript-57ea3c43?af=7pnhj6)，或者在此查看第一课：

<div style={{position:"relative",paddingTop:"56.25%"}}>
  <iframe 
    src="https://app.egghead.io/lessons/redux-course-introduction-and-application-walk-through-for-rtk-query-basics/embed?af=7pnhj6" 
    title="Egghead 上的 RTK Query 视频课程：RTK Query 基础课程介绍和应用演练"
    frameborder="0" 
    allowfullscreen
    style={{position:"absolute",top:0,left:0,width:"100%",height:"100%"}}
  ></iframe>
</div>

:::

## 介绍

在[第5部分：异步逻辑和数据获取](./part-5-async-logic.md)和[第6部分：性能和规范化](./part-6-performance-normalization.md)中，我们见识了 Redux 中数据获取和缓存的标准模式。这些模式包括使用异步 thunk 获取数据，派发包含结果的动作，管理请求的加载状态，并规范化缓存数据以便通过 ID 更轻松地查找和更新单个条目。

在本节中，我们将了解如何使用 RTK Query——一个为 Redux 应用设计的数据获取和缓存解决方案，看看它如何简化获取数据及在组件中使用数据的过程。

## RTK Query 概述

**RTK Query** 是一个强大的数据获取和缓存工具，设计用来简化 Web 应用加载数据的常见场景，**省去了你手写数据获取和缓存逻辑的需求**。

RTK Query **包含在 Redux Toolkit 包中**，其功能构建在 Redux Toolkit 其他 API 之上。**我们推荐 RTK Query 作为 Redux 应用数据获取的默认方案**。

### 动机

Web 应用通常需要从服务器获取数据来展示，同时也会对数据进行更新、将更新发送回服务器，并保持客户端缓存数据与服务器数据同步。这还需要实现当今应用常用的其它行为，使得流程更复杂：

- 跟踪加载状态以显示界面加载动画
- 避免对相同数据的重复请求
- 实现乐观更新使界面响应更快
- 管理缓存生命周期以响应用户交互

我们已经看到可以如何使用 Redux Toolkit 来实现这些行为。

然而，Redux 最初并未内置帮助**完整**解决这些用例的功能。即使配合 `createAsyncThunk` 和 `createSlice` 使用，发起请求和管理加载状态仍需要很多手动工作。需要创建异步 thunk，执行实际请求，从响应提取相关字段，添加加载状态字段，在 `extraReducers` 里处理 `pending/fulfilled/rejected` 状态，以及编写正确的状态更新逻辑。

随着时间，React 社区认识到**“数据获取和缓存”与“状态管理”是两个不同的关注点**。虽然可以利用 Redux 这类状态管理库进行数据缓存，但由于用例差异很大，使用专门为数据获取设计的工具更有价值。

#### 服务器状态的挑战

这里引用一下 [React Query “动机”文档](https://tanstack.com/query/latest/docs/framework/react/overview)中精彩的解释：

> 传统大多数状态管理库擅长管理客户端状态，但它们不擅长异步或服务器状态，因为服务器状态本质上不同。服务器状态：
>
> - 远程持久化，位置你可能无法控制或拥有
> - 需要异步 API 进行获取和更新
> - 表示共享所有权，可被他人未经你知晓地更改
> - 如果不注意应用，可能会变得“过时”
>
> 一旦掌握服务器状态的特性，更会遇到其他挑战，例如：
>
> - 缓存管理……（可能是编程中最难的事）
> - 合并多个相同数据请求为一个请求
> - 后台更新“过时”的数据
> - 判断数据何时“过时”
> - 尽快反映数据更新
> - 分页、懒加载等性能优化
> - 内存管理与服务器状态垃圾回收
> - 使用结构共享对查询结果进行记忆化

### RTK Query 的区别

RTK Query 从其他开创数据获取方案的工具获得灵感，如 Apollo Client、React Query、Urql 和 SWR，但其 API 设计具有独特方法：

- 数据获取和缓存逻辑构建在 Redux Toolkit 的 `createSlice` 和 `createAsyncThunk` API 之上
- 由于 Redux Toolkit 是与 UI 无关的，RTK Query 功能可用于任意 UI 层，如 Angular、Vue，甚至纯 JS，而不仅仅是 React
- API 端点提前定义，包括如何从参数生成查询参数、如何变换响应用于缓存
- RTK Query 还能生成 React Hooks，把整个数据获取流程封装起来，向组件提供 `data` 和 `isFetching` 字段，并管理缓存数据的生命周期（组件挂载和卸载期间）
- RTK Query 提供“缓存条目生命周期”选项，可实现如在获取初始数据后，通过 websocket 消息流更新缓存等用例
- 我们有一个代码生成器，用于根据 OpenAPI 模式自动生成 RTK Query API 定义
- 最后，RTK Query 完全用 TypeScript 编写，设计时力求提供极佳的 TS 使用体验

### 包含内容

#### API

RTK Query 包含于 Redux Toolkit 核心包中，可通过以下两种入口导入：

```ts no-transpile
// 与 UI 无关的入口，包含核心逻辑
import { createApi } from '@reduxjs/toolkit/query'

// React 专用入口，自动生成对应定义端点的 Hooks
import { createApi } from '@reduxjs/toolkit/query/react'
```

RTK Query 主要有两个 API：

- [`createApi()`](https://redux-toolkit.js.org/rtk-query/api/createApi)：RTK Query 核心功能。允许定义一组端点，描述如何从一系列端点检索数据，包括如何获取和处理数据配置。通常情况下，每个应用调用一次，每个基础 URL 建议一个 API Slice。
- [`fetchBaseQuery()`](https://redux-toolkit.js.org/rtk-query/api/fetchBaseQuery)：一个对标准 [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) 的小封装，简化 HTTP 请求。RTK Query 可缓存任意异步请求的结果，但因 HTTP 请求最常用，`fetchBaseQuery` 内置了 HTTP 支持。

#### 包体大小

RTK Query 会为应用体积增加固定大小。因基于 Redux Toolkit 和 React-Redux，增加的大小取决于应用当前是否已使用这些库。估算压缩后的包体大小：

- 如果已使用 RTK：RTK Query 大约增加 9kb，Hooks 大约增加 2kb
- 如果未使用 RTK：
  - 无 React：RTK + 依赖 + RTK Query 大约增加 17 kB
  - 有 React：19kB + React-Redux（peer 依赖）

添加更多端点定义，包体增加仅来自 `endpoints` 内具体代码，通常仅几个字节。

RTK Query 提供的功能远超出包体增加的开销，对于大多数重要应用，是包体大小上的净提升，同时省去了手写数据获取逻辑。

### RTK Query 缓存思维方式

Redux 一直强调可预测性和显式行为。Redux 中没有“魔法”——你应该能理解应用发生了什么，因为**所有 Redux 逻辑遵循同样的基本模式：派发动作和通过 reducers 更新状态**。这虽导致需写较多代码促成行为，但交换得来的是数据流和行为十分明确。

**Redux Toolkit 核心 API 不改变 Redux 应用的基本数据流**，你依然派发动作和写 reducers，只是代码不用完全手写。**RTK Query 也是如此。** 它是更高层的抽象，但**内部仍在做我们已熟知的异步请求管理操作**——使用 thunks 执行异步请求，派发携带结果的动作，reducers 处理动作并缓存数据。

但使用 RTK Query 时，会经历一个思维转换。我们不再思考“管理状态”，而是**思考“管理缓存的数据”**。不再手写 reducers，转而关注**“数据从哪里来？”，“如何发送更新？”，“何时重新获取缓存数据？”，“缓存数据如何更新？”**。数据的获取、存储和读取成为不需要关心的实施细节。

随着教程继续，你会体会这种思维转换的实际应用。

## 设置 RTK Query

我们的示例应用目前可用，但现在要迁移所有异步逻辑，改用 RTK Query。演示中会讲解如何使用 RTK Query 的主要功能，也包含如何将以往用 `createAsyncThunk` 和 `createSlice` 的代码迁移到 RTK Query API。

### 定义 API Slice

之前，我们为帖子（Posts）、用户（Users）、通知（Notifications）等不同数据类型定义了独立的“Slice”。每个 slice 有自己的 reducer，定义了自己的动作和 thunk，各自缓存对应数据条目。

使用 RTK Query，**缓存数据管理逻辑集中至每个应用的单个“API Slice”中**。就像应用有唯一的 Redux store，一样，我们现在有唯一的 slice 用于整个缓存数据。

先定义一个新的 `apiSlice.ts` 文件。既然这与之前写的任何“feature”无关，我们新建 `features/api/` 文件夹，放入 `apiSlice.ts`。填入以下代码，然后逐步讲解：

```ts title="features/api/apiSlice.ts"
// 从 React 专用入口导入 RTK Query 方法
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// 使用我们之前定义在 `postsSlice` 中的 `Post` 类型，方便使用所以重新导出
import type { Post } from '@/features/posts/postsSlice'
export type { Post }

// 定义我们的单一 API slice 对象
export const apiSlice = createApi({
  // 缓存 reducer 预期挂载在 `state.api`（已经默认，可以省略）
  reducerPath: 'api',
  // 所有请求的基础 URL 都以 '/fakeApi' 开头
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  // “endpoints” 表示对这个服务器的操作和请求
  endpoints: builder => ({
    // `getPosts` 端点是返回数据的“查询”操作
    // 返回值是 `Post[]` 数组，不接收参数
    getPosts: builder.query<Post[], void>({
      // 请求 URL 是 '/fakeApi/posts'
      query: () => '/posts'
    })
  })
})

// 导出自动生成的 `getPosts` 查询端点 Hook
export const { useGetPostsQuery } = apiSlice
```

RTK Query 的功能基于单个方法 [**`createApi`**](https://redux-toolkit.js.org/rtk-query/api/createApi)。我们以前使用的 Redux Toolkit API 都是独立于 UI 的，可用于任何 UI 层。RTK Query 核心逻辑也是如此。不过 RTK Query 也包含专为 React 的 `createApi` 版本，因为我们使用 React 也使用 RTK，需要利用 RTK 的 React 集成功能。所以这里专门从 `'@reduxjs/toolkit/query/react'` 导入。

:::tip

**整个应用应且仅应调用一次 `createApi`。** 一个 API slice 应该包含所有针对同一基础 URL 的端点定义。例如 `/api/posts` 和 `/api/users` 从同一个服务器获取数据，应放在同一个 API slice。如有多个服务器，可以在每个端点使用完整 URL，或者另建独立的 API slice。

端点通常直接在 `createApi` 内定义。如想拆分端点定义到多个文件，参见[第8部分“注入端点”章节](./part-8-rtk-query-advanced.md#injecting-endpoints)。

:::

#### API Slice 参数

调用 `createApi` 时，有两个必填字段：

- `baseQuery`：一个函数，用于知道如何从服务器获取数据。RTK Query 包含 `fetchBaseQuery`，对标准 `fetch()` 的简单封装，处理常见的 HTTP 请求/响应。创建时可传入基础 URL，以及改写请求头等行为。你也可以[自定义 base query](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries#customizing-queries-with-basequery)来定制错误处理和身份验证等。
- `endpoints`：一组操作，用于定义与服务器交互的端点。端点可为**查询（query）**获取缓存数据，或**变更（mutation）**发送更新。通过接收 builder 参数的回调函数定义，返回一个包含调用 `builder.query()` 和 `builder.mutation()` 创建的端点对象。

`createApi` 也接受 `reducerPath`，定义生成的 reducer 在 state 中期望存储的顶层字段。与其他 slice 不一定和 state key 一致不同，RTK Query 期望你告诉它 reducer 会被挂载的 state 路径。若省略，默认为 `'api'`，即缓存的数据存在 `state.api`。

如果忘记在 store 里添加 reducer，或挂载到和 `reducerPath` 不同 key，RTK Query 会记录错误提醒修正。

#### 定义端点

所有请求的 URL 第一部分已在 `fetchBaseQuery` 中定义为 `'/fakeApi'`。

第一步，我们添加获取服务器所有帖子列表的端点命名为 `getPosts`，定义为**查询（query）端点**，使用 `builder.query()`。可传入多个选项配置请求和响应，目前只需定义 `query` 回调，返回 URL 字符串：`() => '/posts'`。

查询请求默认使用 HTTP `GET`，可返回对象如 `{url: '/posts', method: 'POST', body: newPost}` 自定义请求方法和各项配置，包括设置请求头。

TypeScript 使用时，**`builder.query()` 和 `builder.mutation()` 接受两个泛型参数：`<返回类型, 参数类型>`**。比如按名称获取宝可梦的端点会写成 `getPokemonByName: builder.query<Pokemon, string>()`。**若无参数，传 `void` 类型，如 `getAllPokemon: builder.query<Pokemon[], void>()`**。

#### 导出 API Slice 和 Hooks

之前用 `createSlice`，我们仅导出动作创建器和 reducer，因为这两者在其他文件需要使用。RTK Query 通常导出整个 API slice 对象，因为它含多种有用字段。

最后，注意本文件最后一行的 `useGetPostsQuery` 来自何处？

**RTK Query 的 React 集成会自动为定义的每个端点生成 React Hook！** 这些 Hook 封装了组件挂载时触发请求、请求进度重渲染等流程。我们导出这些 Hook，以供 React 组件调用。

自动生成的 Hook 名字遵循规范：

- `use`，React Hook 通用前缀
- 端点名（首字母大写）
- 端点类型（`Query` 或 `Mutation`）

本例，端点为 `getPosts`，查询端点，所以 Hook 命名为 `useGetPostsQuery`。

### 配置 Store

要把 API slice 连接到 Redux store，修改现有 `store.ts`，添加 API slice 的缓存 reducer 到 state，还要添加 API slice 生成的 custom middleware，它负责管理缓存生命周期和过期，**必须添加**。

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

// highlight-next-line
import { apiSlice } from '@/features/api/apiSlice'
import authReducer from '@/features/auth/authSlice'
import postsReducer from '@/features/posts/postsSlice'
import usersReducer from '@/features/users/usersSlice'
import notificationsReducer from '@/features/notifications/notificationsSlice'

import { listenerMiddleware } from './listenerMiddleware'

export const store = configureStore({
  // 传入根 reducer 配置
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer,
    notifications: notificationsReducer,
    // highlight-next-line
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    // highlight-start
    getDefaultMiddleware()
      .prepend(listenerMiddleware.middleware)
      .concat(apiSlice.middleware)
  // highlight-end
})
```

我们用 `apiSlice.reducerPath` 作为计算键，确保缓存 reducer 挂载正确。

如之前[设置监听中间件](./part-6-performance-normalization.md#setting-up-the-listener-middleware)，要保留已有默认中间件如 `redux-thunk`，API slice 的 middleware 通常放在最后。现已调用 `getDefaultMiddleware()` 并把监听中间件放前，可用 `.concat(apiSlice.middleware)` 添加 RTK Query middleware。

## 使用查询展示帖子

### 组件中使用查询 Hook

API slice 定义并加入 store 后，可以在 `<PostsList>` 组件中导入 `useGetPostsQuery` 查询 Hook，直接使用。

目前 `<PostsList>` 明确导入 `useSelector`、`useDispatch` 和 `useEffect`，从 store 读取帖子和加载状态，组件挂载时 Dispatcth `fetchPosts()` thunk 触发加载。**现在用 `useGetPostsQuery` Hook 一行代码就替代了所有这些！**

下面是使用该 Hook 后的 `<PostsList>`：

```tsx title="features/posts/PostsList.tsx"
import React from 'react'
import { Link } from 'react-router-dom'

import { Spinner } from '@/components/Spinner'
import { TimeAgo } from '@/components/TimeAgo'

// highlight-next-line
import { useGetPostsQuery, Post } from '@/features/api/apiSlice'

import { PostAuthor } from './PostAuthor'
import { ReactionButtons } from './ReactionButtons'

// highlight-start
// 接收 `post` 对象作为属性
interface PostExcerptProps {
  post: Post
}

function PostExcerpt({ post }: PostExcerptProps) {
  // highlight-end
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
  // highlight-start
  // 调用 `useGetPostsQuery()` Hook 自动发起请求！
  const {
    data: posts = [],
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetPostsQuery()
  // highlight-end

  let content: React.ReactNode

  // highlight-start
  // 根据 Hook 的状态标志渲染加载状态
  if (isLoading) {
    content = <Spinner text="加载中..." />
  } else if (isSuccess) {
    content = posts.map(post => <PostExcerpt key={post.id} post={post} />)
  } else if (isError) {
    content = <div>{error.toString()}</div>
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

概念上，`<PostsList>` 做了之前的相同行为，但**用一行 `useGetPostsQuery()` 替代了多个 `useSelector` 调用和 `useEffect` 触发请求**。

（注意现在应用里依然有代码使用旧的 `state.posts` slice 与 RTK Query 缓存并存，属于正常情况，我们会逐步修正。）

之前，我们从 store 选取帖子 ID 数组，传给 `<PostExcerpt>`，再单独选取帖子的具体对象。现在 `posts` 已包含所有帖子对象，改传整个对象。

:::tip

通常使用查询 Hooks 在组件里访问缓存数据，不建议自写 `useSelector` 或 `useEffect` 来触发数据获取！

:::

### 查询 Hook 返回对象

生成的查询 Hook 返回一个“结果”对象，包含许多字段：

- `data`：最近一次成功请求返回的响应数据。**在响应到达前此字段为 `undefined`。**
- `currentData`：当前查询参数对应的响应数据。如果参数变更请求新数据，且无缓存，此字段会变为 `undefined`
- `isLoading`：指示是否为首次发起请求且无任何数据时为真（参数改变请求新数据时此字段保持假）
- `isFetching`：指示当前是否有任何请求正在进行
- `isSuccess`：指示请求成功且数据已就绪（即 `data` 有值）
- `isError`：指示请求失败
- `error`：序列化错误对象

通常解构结果对象字段，可能重命名 `data` 为更具体变量名如 `posts`，然后根据状态标志和数据/错误渲染界面。旧版 TypeScript 可能需要保持原对象使用 `result.isSuccess` 这种写法，以帮助类型推断。

#### 加载状态字段区别

请注意 [`isLoading` 和 `isFetching` 含义不同](https://redux-toolkit.js.org/rtk-query/usage/queries#query-loading-state)，根据界面显示加载状态时期和形式灵活选择字段。例如首次加载时显示骨架屏选 `isLoading`，每次请求中显示禁用或旋转图标用 `isFetching`。

类似地，`data` 和 `currentData` 发生变化的时机不同。大多数情况下使用 `data`，而 `currentData` 帮助实现比如数据半透明代表重新加载中等细节效果。因为 `data` 直到请求结束才替换，`currentData` 不同参数会立即变空。

### 帖子排序

不幸的是，帖子的显示顺序错乱了。之前用 `createEntityAdapter` 在 reducer 里排序。现在 API slice 缓存的是服务器返回的原始数组，顺序无保证。

可采取多种方法。当前先在 `<PostsList>` 内部排序，后续讨论其他方案和权衡。

不能直接 `posts.sort()`，因为 `Array.sort()` 会修改原数组。先复制一份再排序。且为避免每次渲染排序，用 `useMemo()` 缓存排序结果。给 `posts` 一个默认空数组防止 `undefined`。

```tsx title="features/posts/PostsList.tsx"
// 省略其他代码

export const PostsList = () => {
  const {
    // highlight-next-line
    data: posts = [],
    isLoading,
    isSuccess,
    isError,
    error
  } = useGetPostsQuery()

  // highlight-start
  const sortedPosts = useMemo(() => {
    const sortedPosts = posts.slice()
    // 按时间倒序排序
    sortedPosts.sort((a, b) => b.date.localeCompare(a.date))
    return sortedPosts
  }, [posts])
  // highlight-end

  let content

  if (isLoading) {
    content = <Spinner text="加载中..." />
  } else if (isSuccess) {
    // highlight-next-line
    content = sortedPosts.map(post => <PostExcerpt key={post.id} post={post} />)
  } else if (isError) {
    content = <div>{error.toString()}</div>
  }

  // 省略渲染内容
}
```

## 展示单条帖子

现在修改了 `<PostsList>` 通过获取所有帖子列表展示，但点击“查看帖子”进入的 `<SinglePostPage>` 组件仍从旧的 `state.posts` 查找单帖，导致“找不到帖子”提示。需要修改 `<SinglePostPage>` 也使用 RTK Query。

实现方法有几种。一种是 `<SinglePostPage>` 调用同样的 `useGetPostsQuery()`，获取全部帖子然后筛选出单条。查询 Hook 支持 `selectFromResult` 配置也能提前筛选，稍后演示。

这里新增一个端点，支持根据 ID 请求单个帖子，便于演示如何基于参数定制请求。

### 添加单条帖子查询端点

在 `apiSlice.ts` 添加如下查询端点 `getPost`（无复数形式）：

```ts title="features/api/apiSlice.ts"
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  endpoints: builder => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts'
    }),
    // highlight-start
    getPost: builder.query<Post, string>({
      query: postId => `/posts/${postId}`
    })
    // highlight-end
  })
})

// highlight-next-line
export const { useGetPostsQuery, useGetPostQuery } = apiSlice
```

`getPost` 类似 `getPosts`，但 `query` 函数带参数 `postId`，用它构造请求 URL，支持请求特定帖子。

同时生成新的 `useGetPostQuery` Hook 并导出。

### 查询参数与缓存键

我们目前 `<SinglePostPage>` 根据 ID 从 `state.posts` 读取帖子，要改用新 Hook，类似主列表处理加载状态：

```tsx title="features/posts/SinglePostPage.tsx"
// 省略部分导入

// highlight-next-line
import { useGetPostQuery } from '@/features/api/apiSlice'
import { selectCurrentUsername } from '@/features/auth/authSlice'

export const SinglePostPage = () => {
  const { postId } = useParams()

  const currentUsername = useAppSelector(selectCurrentUsername)
  // highlight-next-line
  const { data: post, isFetching, isSuccess } = useGetPostQuery(postId!)
  
  // highlight-next-line
  let content: React.ReactNode

  // highlight-next-line
  const canEdit = currentUsername === post?.user

  // highlight-start
  if (isFetching) {
    content = <Spinner text="加载中..." />
  } else if (isSuccess) {
    content = (
      // highlight-end
      <article className="post">
        <h2>{post.title}</h2>
        <div>
          <PostAuthor userId={post.user} />
          <TimeAgo timestamp={post.date} />
        </div>
        <p className="post-content">{post.content}</p>
        <ReactionButtons post={post} />
        {canEdit && (
          <Link to={`/editPost/${post.id}`} className="button">
            编辑帖子
          </Link>
        )}
      </article>
    )
  }
  
  // highlight-next-line
  return <section>{content}</section>
}
```

我们将路由参数 `postId` 直接传给 `useGetPostQuery`，用于构造请求 URL，获取单个帖子。

那么所有数据如何缓存？点开 Redux DevTools，查看当前 Redux store 状态。

![RTK Query 缓存数据示例](/img/tutorials/essentials/devtools-rtkq-cache.png)

可见顶层有 `state.api` slice，其中 `queries` 包含两条条目：

- `getPosts(undefined)` 代表无参数请求 `getPosts` 的元数据和响应
- `getPost('abcd1234')` 是特定 ID 请求帖子返回数据

RTK Query 对每个“端点 + 参数组合”生成唯一“缓存键”，各自缓存结果。意味着**可在组件多次调用同一查询 Hook，传不同参数，分别缓存结果**。

:::tip

多个组件需要相同数据，直接调用相同查询 Hook 和参数即可；例如三个组件都调用 `useGetPostQuery('123')`，RTK Query 会确保只请求一次，组件会按需重新渲染。

:::

注意查询参数只能是**一个单独的值**。需要传多个参数时，应传对象（如 `createAsyncThunk` 的用法），RTK Query 会浅比较参数字段，如有变化触发重新请求。

Redux DevTools 中动作名字较泛，如 `api/executeQuery/fulfilled`，没有之前 `posts/fetchPosts/fulfilled` 那么直观，是使用抽象层的折中。动作内有具体端点名信息，可通过 `action.meta.arg.endpointName` 查看。

:::tip

Redux DevTools 有独立的 “RTK Query” 标签页，更友好展示缓存数据，基于缓存条目而非原始 state 展示，含端点信息、查询时间统计等：

![RTK Query Devtools 标签页截图](/img/tutorials/essentials/devtools-rtkq-tab.png)

可试用此在线演示：

- [RTK Query Monitor 预览 Demo](https://rtk-query-monitor-demo.netlify.app/)

:::

## 使用变更（Mutations）创建帖子

已经看到如何用查询端点获取数据，如何更新服务器的数据呢？

RTK Query 支持定义**变更端点（mutation）**，向服务器发送更新。下面添加一个变更端点，发布新帖子。

### 添加新帖子变更端点

添加变更端点类似添加查询端点。最大区别在于用 `builder.mutation()` 定义，不是 `builder.query()`。且请求方法由默认的 GET 改为 `'POST'`，需提供请求体。

我们导出 `NewPost` TS 类型用作参数类型。

```ts title="features/api/apiSlice.ts"
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// highlight-next-line
import type { Post, NewPost } from '@/features/posts/postsSlice'
export type { Post }

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  endpoints: builder => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts'
    }),
    getPost: builder.query<Post, string>({
      query: postId => `/posts/${postId}`
    }),
    // highlight-start
    addNewPost: builder.mutation<Post, NewPost>({
      query: initialPost => ({
        // 请求地址为 '/fakeApi/posts'
        url: '/posts',
        // HTTP POST 请求发更新
        method: 'POST',
        // 请求体即完整的帖子对象
        body: initialPost
      })
    })
    // highlight-end
  })
})

export const {
  useGetPostsQuery,
  useGetPostQuery,
  // highlight-next-line
  useAddNewPostMutation
} = apiSlice
```

同查询端点，一样指定 TypeScript 类型：返回完整 `Post`，参数是部分的 `NewPost`。

这里 `query` 返回对象 `{url, method, body}` 表明 HTTP POST 请求，并携带请求体。用 `fetchBaseQuery` 自动将请求体 JSON 序列化。（这代码中 “post” 一词出现次数实在太多了 :)）

API slice 也会自动生成变更端点的 React Hook ，这里是 `useAddNewPostMutation`。

### 组件中使用变更 Hook

我们的 `<AddPostForm>` 组件之前用异步 thunk 处理点击“保存”按钮时添加帖子。现在用变更 Hook 替换，同时也替换 `useDispatch` 和 `addNewPost` thunk。用法类似：

```tsx title="features/posts/AddPostForm.tsx"
import React from 'react'

import { useAppSelector } from '@/app/hooks'

// highlight-next-line
import { useAddNewPostMutation } from '@/features/api/apiSlice'
import { selectCurrentUsername } from '@/features/auth/authSlice'

// 省略类型定义

export const AddPostForm = () => {
  const userId = useAppSelector(selectCurrentUsername)!
  // highlight-next-line
  const [addNewPost, { isLoading }] = useAddNewPostMutation()

  const handleSubmit = async (e: React.FormEvent<AddPostFormElements>) => {
    // 阻止表单默认提交
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    const form = e.currentTarget

    try {
      // highlight-next-line
      await addNewPost({ title, content, user: userId }).unwrap()

      form.reset()
    } catch (err) {
      console.error('保存帖子失败: ', err)
    }
  }

  return (
    <section>
      <h2>添加新帖子</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">帖子标题：</label>
        <input type="text" id="postTitle" defaultValue="" required />
        <label htmlFor="postContent">内容：</label>
        <textarea
          id="postContent"
          name="postContent"
          defaultValue=""
          required
        />
        // highlight-next-line
        <button disabled={isLoading}>保存帖子</button>
      </form>
    </section>
  )
}
```

变更 Hook 返回一个包含两个元素的数组：

- 第一个是“触发函数”，调用时带参数即可发起请求。这里的触发函数已经封装为立即调度的 thunk。
- 第二个是包含当前请求状态元数据的对象（如请求中标志 `isLoading`）

替换掉原来用 thunk 分发和组件 loading 状态，即可用变更 Hook。组件其它部分保持不变。

与前面相同，调用触发函数返回的 Promise 有 `.unwrap()` 方法，可用 `await` 和标准 `try/catch` 处理错误（RTK Query 内部用的仍是 `createAsyncThunk`）。

## 刷新缓存数据

点击“保存帖子”浏览器开发者工具 Network 标签确认 HTTP POST 请求成功，但新帖子不会立刻在 `<PostsList>` 中显示。Redux store 状态没变，缓存数据仍是旧的。

需要告诉 RTK Query 刷新缓存帖子列表，才能看到最新添加的帖子。

### 手动重新请求帖子

方法一，手动强制 RTK Query 重新请求某端点数据。实际应用少用，这里作为过渡。

查询 Hook 返回的结果对象包含 `refetch` 函数，可调用强制重新请求。暂时在 `<PostsList>` 添加一个“重新获取帖子”按钮，点击查看效果：

```tsx title="features/posts/PostsList.tsx"
export const PostsList = () => {
  const {
    data: posts = [],
    isLoading,
    isSuccess,
    isError,
    error,
    // highlight-next-line
    refetch
  } = useGetPostsQuery()

  // 省略其他渲染内容

  return (
    <section className="posts-list">
      <h2>帖子</h2>
      // highlight-next-line
      <button onClick={refetch}>重新获取帖子</button>
      {content}
    </section>
  )
}
```

现在添加帖子后，等待完成，点击“重新获取帖子”即可看到新帖子。

但没有提示正在重新获取，体验欠佳。

前面见过查询 Hook 有两个标识 `isLoading` 和 `isFetching`，`isLoading` 初次加载时为真，`isFetching` 指出任何请求中。可用 `isFetching` 来改造 UI。

例如重新发请求时全部列表替换为加载指示，虽可行，但有些烦人。我们已有所有帖子数据，为何隐藏？

改为让帖子列表半透明，表示数据可能过时，同时保留显示。请求结束后恢复显示。

```tsx title="features/posts/PostsList.tsx"
// highlight-next-line
import classnames from 'classnames'

import { useGetPostsQuery, Post } from '@/features/api/apiSlice'

// 省略其它导入与 PostExcerpt

export const PostsList = () => {
  const {
    data: posts = [],
    isLoading,
    // highlight-next-line
    isFetching,
    isSuccess,
    isError,
    error,
    refetch
  } = useGetPostsQuery()

  const sortedPosts = useMemo(() => {
    const sortedPosts = posts.slice()
    sortedPosts.sort((a, b) => b.date.localeCompare(a.date))
    return sortedPosts
  }, [posts])

  let content: React.ReactNode

  if (isLoading) {
    content = <Spinner text="加载中..." />
  } else if (isSuccess) {
    // highlight-start
    const renderedPosts = sortedPosts.map(post => (
      <PostExcerpt key={post.id} post={post} />
    ))
    // highlight-end

    // highlight-start
    const containerClassname = classnames('posts-container', {
      disabled: isFetching
    })

    content = <div className={containerClassname}>{renderedPosts}</div>
    // highlight-end
  } else if (isError) {
    content = <div>{error.toString()}</div>
  }

  // 省略 return
}
```

添加帖子后，点击“重新获取帖子”时，帖子列表变半透明几秒，完成后新帖显示在顶部。

### 用缓存失效自动刷新

手动刷新有时用得着，但非常不理想。

我们知道服务器已保存所有帖子，包括刚加的。希望变更请求结束时自动重新请求最新帖子列表。

**RTK Query 允许定义查询和变更之间的关系，通过“标签（tags）”实现自动缓存失效刷新。** 标签是字符串或小对象，用于标记数据类型，失效时自动重新请求带标签的接口。

基础标签配置需要三步：

- 在 API slice 根配置 `tagTypes` 字段，声明标签名称数组，比如 `'Post'`
- 查询端点的 `providesTags`，表示该查询返回的数据标签
- 变更端点的 `invalidatesTags`，表示该变更触发时失效的标签

给 API slice 增加 `'Post'` 标签，让新增帖子后自动刷新帖子列表查询：

```ts title="features/api/apiSlice.ts"
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  // highlight-next-line
  tagTypes: ['Post'],
  endpoints: builder => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      // highlight-next-line
      providesTags: ['Post']
    }),
    getPost: builder.query<Post, string>({
      query: postId => `/posts/${postId}`
    }),
    addNewPost: builder.mutation<Post, NewPost>({
      query: initialPost => ({
        url: '/posts',
        method: 'POST',
        body: initialPost
      }),
      // highlight-next-line
      invalidatesTags: ['Post']
    })
  })
})
```

仅需加这些配置！点击“保存帖子”后，`<PostsList>` 会自动变灰几秒，随后重新渲染显示新增帖子。

标签字符串没特别含义，可为任意内容，只要查询和变更端点中字符串保持一致即可。

## 你学到了什么

使用 RTK Query，数据获取、缓存和加载状态管理细节被封装，代码简单很多，让我们关注更高层次的行为。RTK Query 基于我们已掌握的 Redux Toolkit API，能用 Redux DevTools 观察状态变化。

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-5-createApi?fontsize=14&hidenavigation=1&module=%2fsrc%2Ffeatures%2Fposts%2FpostsSlice.ts&theme=dark&runonclick=1"
  title="redux-essentials-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

:::tip 总结

- **RTK Query 是 Redux Toolkit 内置的数据获取和缓存方案**
  - 抽象了管理缓存服务端数据的流程，无需编写加载状态、存储结果和请求细节逻辑
  - 构建于 Redux 中使用的异步 thunk 等相同模式之上
- **RTK Query 使用单一“API Slice”定义**
  - 有 UI 无关和 React 专用的 `createApi`
  - API Slice 定义多个端点对应不同服务器操作
  - React 集成版本自动生成查询和变更 Hooks
- **查询端点实现服务器数据获取和缓存**
  - 查询 Hook 返回数据和加载状态标志
  - 支持手动和标签驱动的自动缓存刷新
- **变更端点实现服务器数据更新**
  - 变更 Hook 返回触发函数和状态
  - 触发函数返回可“解包(unwrapped)”且支持 await 的 Promise

:::

## 下一步？

RTK Query 默认行为已相当完善，还支持许多自定义选项调整请求和缓存行为。我们将在[第8部分：RTK Query 高级模式](./part-8-rtk-query-advanced.md)中深入这些模式，比如乐观更新等。
