---
id: part-8-rtk-query-advanced
title: 'Redux 精华，第 8 部分：RTK Query 高级模式'
sidebar_label: 'RTK Query 高级模式'
description: '官方 Redux 精华教程：学习使用 RTK Query 获取数据的高级模式'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 你将学到

- 如何使用带 ID 的标签管理缓存失效和重新获取
- 如何在 React 之外使用 RTK Query 缓存
- 操纵响应数据的技巧
- 实现乐观更新和流更新

:::

:::info 前置知识

- 完成了[第 7 部分](./part-7-rtk-query-basics.md)，以理解 RTK Query 的设置和基础用法

:::

## 介绍

在[第 7 部分：RTK Query 基础](./part-7-rtk-query-basics.md)中，我们学习了如何设置和使用 RTK Query API 以处理应用中的数据获取和缓存。我们在 Redux 存储中添加了一个“API 切片”，定义了用于获取帖子数据的“查询”端点，以及用于添加新帖子的“变更”端点。

本节中，我们将继续迁移示例应用以使用 RTK Query 处理其他数据类型，并学习如何使用一些高级特性以简化代码库并提升用户体验。

:::info

本节中的一些更改不是必须的 —— 它们是为了演示 RTK Query 的功能以及展示你 _可以_ 做的事情，方便你在需要时掌握这些功能的使用方法。

:::

## 编辑帖子

我们已经添加了一个变更端点以将新的帖子条目保存到服务器，并在 `<AddPostForm>` 中使用了它。接下来，我们需要更新 `<EditPostForm>` 以支持编辑已有帖子。

### 更新编辑帖子表单

与添加帖子类似，第一步是在 API 切片中定义一个新的变更端点。它与添加帖子的变更很像，但该端点需要在 URL 中包含帖子 ID，并使用 HTTP 的 `PATCH` 请求，表示只更新部分字段。

```ts title="features/api/apiSlice.ts"
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  tagTypes: ['Post'],
  endpoints: builder => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
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
      invalidatesTags: ['Post']
    }),
    // highlight-start
    editPost: builder.mutation<Post, PostUpdate>({
      query: post => ({
        url: `posts/${post.id}`,
        method: 'PATCH',
        body: post
      })
    })
    // highlight-end
  })
})

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddNewPostMutation,
  // highlight-next-line
  useEditPostMutation
} = apiSlice
```

添加后，我们可以更新 `<EditPostForm>`。它需要从存储中读取原始的 `Post` 条目，用来初始化组件状态以编辑字段，然后将更新后的更改发送到服务器。目前，我们使用 `selectPostById` 读取 `Post` 条目，并手动调度一个 `postUpdated` thunk 来发送请求。

我们可以使用和 `<SinglePostPage>` 中相同的 `useGetPostQuery` 钩子来从存储缓存读取 `Post` 条目，同时使用新的 `useEditPostMutation` 钩子来处理保存更改。如果需要，我们也可以在更新进行时添加加载动画并禁用表单输入。

```tsx title="features/posts/EditPostForm.tsx"
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Spinner } from '@/components/Spinner'

// highlight-next-line
import { useGetPostQuery, useEditPostMutation } from '@/features/api/apiSlice'

// omit form types

export const EditPostForm = () => {
  const { postId } = useParams()
  const navigate = useNavigate()

  // highlight-start
  const { data: post } = useGetPostQuery(postId!)

  const [updatePost, { isLoading }] = useEditPostMutation()
  // highlight-end

  if (!post) {
    return (
      <section>
        <h2>帖子未找到！</h2>
      </section>
    )
  }

  // highlight-start
  const onSavePostClicked = async (
  // highlight-end
    e: React.FormEvent<EditPostFormElements>
  ) => {
    // 防止表单提交到服务器
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    if (title && content) {
      // highlight-next-line
      await updatePost({ id: post.id, title, content })
      navigate(`/posts/${postId}`)
    }
  }

  // omit rendering
}
```

### 缓存数据订阅的生命周期

试试看，会发生什么。在浏览器 DevTools 的网络（Network）标签页，刷新页面，清空网络请求列表，然后登录。你应该能够看到 `/posts` 的 `GET` 请求，用以获取初始数据。当点击某个“查看帖子”按钮时，又会看到针对单个帖子的 `/posts/:postId` 请求。

接着，在单个帖子页点击“编辑帖子”。界面切换到 `<EditPostForm>`，但这次没有针对单个帖子发出网络请求。为什么？

![RTK Query 网络请求](/img/tutorials/essentials/devtools-cached-requests.png)

**RTK Query 允许多个组件订阅相同的数据，并确保每个唯一数据仅被请求一次。** 在内部，RTK Query 保持了每个端点加缓存键组合的活动“订阅”数引用计数。如果组件 A 调用 `useGetPostQuery(42)`，数据会被获取。如果组件 B 也调用 `useGetPostQuery(42)`，它请求的是相同数据。已有缓存条目，故无需再次请求。两个钩子调用将返回完全相同的结果，包括获取到的 `data` 和加载状态标志。

当活跃订阅数降至 0 时，RTK Query 会启动内部定时器。**如果定时器过期前未添加新的订阅，RTK Query 会自动移除该数据缓存**，因为应用已不再需要这份数据。若新订阅在定时器过期前加入，定时器会被取消，已经缓存的数据就会被继续使用，无需重新发起请求。

本例中，`<SinglePostPage>` 挂载并请求了该 ID 的单个帖子。当点击“编辑帖子”，路由卸载了 `<SinglePostPage>`，移除了活跃订阅，RTK Query 立即启动了“移除此帖缓存”的定时器。但 `<EditPostPage>` 紧接着挂载，订阅了同一个 `Post` 数据。RTK Query 取消了定时器，继续使用相同缓存数据，避免了请求服务器。

默认情况下，**未使用的数据在缓存中的保存时间是 60 秒**，但可以通过根 API 切片定义中的 `keepUnusedDataFor` 配置，或在单个端点定义里覆盖该参数来自定义缓存生命周期（单位秒）。

### 使特定条目失效

我们的 `<EditPostForm>` 可以将修改后帖子保存到服务器，但存在问题：保存后跳转回 `<SinglePostPage>`，仍显示修改前的旧数据。`<SinglePostPage>` 仍使用之前缓存的帖子数据。同时回到首页查看 `<PostsList>`，也仍显示旧数据。**我们需要一种方式强制重新获取单个 `Post` 条目和帖子列表（`Posts`）**。

早先，我们看到可用标签对缓存数据部分失效。声明 `getPosts` 查询端点 _提供_ `'Post'` 标签，`addNewPost` 变更端点 _使该 `'Post'` 标签失效_。如此，每次添加新帖时，都会强制 RTK Query 重新请求整个帖子列表。

我们可以给 `getPost` 查询和 `editPost` 变更均添加 `'Post'` 标签，但这样会导致所有其他单独帖子也被重新请求。幸运地是，**RTK Query 允许定义特定标签，实现更细粒度缓存失效**。这种特定标签形如 `{type: 'Post', id: 123}`。

`getPosts` 查询的 `providesTags` 字段是字符串数组，也可以是接收 `result` 和 `arg` 参数的回调函数，返回标签数组。这样允许我们基于获取数据的 ID 构造标签。同理，`invalidatesTags` 也支持回调。

为了正确处理，我们给各端点配置合适标签：

- `getPosts`：提供通用 `'Post'` 标签表示整列表，还提供每个帖子 `{type: 'Post', id}` 特定标签
- `getPost`：提供单个帖子对应的 `{type: 'Post', id}` 标签
- `addNewPost`：使通用 `'Post'` 标签失效，从而重新获取整个列表
- `editPost`：使特定的 `{type: 'Post', id}` 标签失效，这会导致单个帖子和列表都刷新，因为它们均提供该 `{type, id}` 标签

```ts title="features/api/apiSlice.ts"
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  tagTypes: ['Post'],
  endpoints: builder => ({
    getPosts: builder.query<Post[], void>({
      query: () => '/posts',
      // highlight-start
      providesTags: (result = [], error, arg) => [
        'Post',
        ...result.map(({ id }) => ({ type: 'Post', id }) as const)
      ]
      // highlight-end
    }),
    getPost: builder.query<Post, string>({
      query: postId => `/posts/${postId}`,
      // highlight-start
      providesTags: (result, error, arg) => [{ type: 'Post', id: arg }]
      // highlight-end
    }),
    addNewPost: builder.mutation<Post, NewPost>({
      query: initialPost => ({
        url: '/posts',
        method: 'POST',
        body: initialPost
      }),
      // highlight-start
      invalidatesTags: ['Post']
      // highlight-end
    }),
    editPost: builder.mutation<Post, PostUpdate>({
      query: post => ({
        url: `posts/${post.id}`,
        method: 'PATCH',
        body: post
      }),
      // highlight-start
      invalidatesTags: (result, error, arg) => [{ type: 'Post', id: arg.id }]
      // highlight-end
    })
  })
})
```

需要注意的是，如果响应无数据或出错，`result` 可能为 `undefined`，所以需安全处理。对于 `getPosts`，可给 `result` 赋默认空数组保证 `map` 不出错；`getPost` 直接返回基于参数 ID 的单元素数组可行；`editPost` 已通过参数传入了帖子对象，因此可直接访问 ID。

改好后，再次编辑帖子并打开 DevTools 网络标签页。

![RTK Query 失效与重新获取](/img/tutorials/essentials/devtools-cached-invalidation-refetching.png)

保存修改后，会连续发起两个请求：

- `PATCH /posts/:postId`，来自 `editPost` 变更
- `GET /posts/:postId`，因 `getPost` 查询重新获取

若回主帖列表页，则会见到：

- `GET /posts`，来自 `getPosts` 查询重新获取

因为我们用标签建立了端点关系，**RTK Query 知道修改某 ID 后需要重新请求该 ID 的帖子及帖子列表以保持一致性** —— 无需额外代码！同时，在编辑帖子过程中，`getPosts` 缓存超时被清理，重新打开 `<PostsList>` 时 RTK Query 发现缓存空缺自动重新请求数据。

唯一要注意的是：在 `getPosts` 指定了 `'Post'` 标签且在 `addNewPost` 中失效该标签，实际上也使所有单个帖子被重新请求（因为它们提供了对应 `{type, id}` 标签）。若想仅重新请求帖子列表，可为这个列表加入任意 ID 标签，如 `{type: 'Post', id: 'LIST'}`，失效该标签即可。详见 [RTK Query 文档中关于标签失效行为的表格说明](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching#tag-invalidation-behavior)。

:::info

RTK Query 提供了很多控制重新获取时机和方式的选项，包含“条件查询”、“懒加载查询”和“预获取”，端点定义也可高度定制。详情参考 RTK Query 使用指南：

- [RTK Query: 自动重新获取](https://redux-toolkit.js.org/rtk-query/usage/automated-refetching)
- [RTK Query: 条件查询](https://redux-toolkit.js.org/rtk-query/usage/conditional-fetching)
- [RTK Query: 预获取](https://redux-toolkit.js.org/rtk-query/usage/prefetching)
- [RTK Query: 定制查询](https://redux-toolkit.js.org/rtk-query/usage/customizing-queries)
- [RTK Query: `useLazyQuery`](https://redux-toolkit.js.org/rtk-query/api/created-api/hooks#uselazyquery)

:::

### 更新通知显示

我们从使用调度 thunk 添加帖子切换为 RTK Query 变更时，不小心破坏了“新帖子已添加”提示的行为，因为 `addNewPost.fulfilled` 动作不再被调度。

幸运的是，修复很简单。RTK Query 内部实际上用了 `createAsyncThunk`，我们已经看到它在发起请求时会调度 Redux 动作。我们只需要更新提示监听器，监听 RTKQ 内部动作，并在动作触发时显示提示。

`createApi` 自动内部生成 thunk 以及 [RTK “匹配器”函数](https://redux-toolkit.js.org/api/matching-utilities)，接受一个动作对象，在符合条件时返回 `true`。这些匹配器可被用于任何需判断动作是否匹配的场景，比如在 `startAppListening` 中。它们还能作为 TypeScript 类型守卫，缩小 `action` 的类型，方便安全访问字段。

当前，提示监听器只监听 `actionCreator: addNewPost.fulfilled` 这一具体动作。我们要改成监听通过 `matcher: apiSlice.endpoints.addNewPost.matchFulfilled` 的帖子添加事件：

```ts title="features/posts/postsSlice.ts"
import { createEntityAdapter, createSelector, createSlice, EntityState, PayloadAction } from '@reduxjs/toolkit'
import { client } from '@/api/client'

import type { RootState } from '@/app/store'
import { AppStartListening } from '@/app/listenerMiddleware'
import { createAppAsyncThunk } from '@/app/withTypes'

// highlight-next-line
import { apiSlice } from '@/features/api/apiSlice'
import { logout } from '@/features/auth/authSlice'

// omit types, posts slice, and selectors

export const addPostsListeners = (startAppListening: AppStartListening) => {
  startAppListening({
    // highlight-next-line
    matcher: apiSlice.endpoints.addNewPost.matchFulfilled,
    effect: async (action, listenerApi) => {
```

提示现在应该能正确显示了。

## 管理用户数据

我们完成了帖子数据管理向 RTK Query 迁移。接下来将迁移用户列表。

因为我们已经见识了 RTK Query 钩子的用法，这节我们尝试另一种方法。**RTK Query 核心逻辑是 UI 无关的，可在任何 UI 层使用，不仅限 React。**

通常应使用 `createApi` 生成的 React 钩子，它们帮你做了大量工作。但为演示原理，这里演示如何 _仅使用_ RTK Query 核心 API 来操作用户数据。

### 手动获取用户

当前我们在 `usersSlice.ts` 里定义了 `fetchUsers` 异步 thunk，并在 `main.tsx` 手动调度，使用户列表尽早可用。我们也能用 RTK Query 做同样事。

先在 `apiSlice.ts` 添加 `getUsers` 查询端点，类似已有端点。出于风格一致，导出 `useGetUsersQuery` 钩子，但目前不调用。

```ts title="features/api/apiSlice.ts"
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import type { Post, NewPost, PostUpdate } from '@/features/posts/postsSlice'
// highlight-next-line
import type { User } from '@/features/users/usersSlice'

export type { Post }

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  tagTypes: ['Post'],
  endpoints: builder => ({
    // omit other endpoints

    // highlight-start
    getUsers: builder.query<User[], void>({
      query: () => '/users'
    })
    // highlight-end
  })
})

export const {
  useGetPostsQuery,
  useGetPostQuery,
  // highlight-next-line
  useGetUsersQuery,
  useAddNewPostMutation,
  useEditPostMutation
} = apiSlice
```

API 切片对象 `endpoints` 字段含有每个定义的端点对象。

![API 切片端点内容](/img/tutorials/essentials/api-slice-contents.png)

每个端点包含：

- 主查询/变更钩子（前面导出的 `useQuery` 或 `useMutation`）
- 查询端点补充钩子组，用于懒查询、部分订阅等场景
- 一套用来检测请求动作 `pending/fulfilled/rejected` 的 [匹配器函数](https://redux-toolkit.js.org/api/matching-utilities)
- 触发请求的 `initiate` thunk
- 创建 [memoized 选择器](../../usage/deriving-data-selectors.md) 的 `select` 函数，用于读取缓存结果和状态

想要在 React 之外请求用户数据，可以在入口文件手动调度 `getUsers.initiate()` thunk：

```tsx title="main.tsx"
// omit other imports
// highlight-next-line
import { apiSlice } from './features/api/apiSlice'

async function main() {
  // 启动模拟 API 服务器
  await worker.start({ onUnhandledRequest: 'bypass' })

  // highlight-next-line
  store.dispatch(apiSlice.endpoints.getUsers.initiate())

  const root = createRoot(document.getElementById('root')!)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}
main()
```

钩子内部也会自动调度，但这里演示如何手动触发请求。

`initiate()` 未传入参数，因为 `getUsers` 不需要参数，默认为 `undefined`。如需传参，可调用 `dispatch(apiSlice.endpoints.getPokemon.initiate('pikachu'))`。

在示例中，我们在应用启动时预取数据。实践中，也可以在 [React Router 的“数据加载器”(data loaders)](https://reactrouter.com/en/main/route/loader) 中执行预取（详见 [RTK 仓库关于 React Router loaders 的讨论](https://github.com/reduxjs/redux-toolkit/discussions/2751) ）。

:::caution

手动调度 RTKQ 请求 thunk 会创建订阅条目，但你需要自行管理[后续取消订阅](https://redux-toolkit.js.org/rtk-query/usage/usage-without-react-hooks#removing-a-subscription)，否则数据会永远保留在缓存。本文示例中，用户数据常用，可跳过取消订阅步骤。

:::

### 选择用户数据

我们当前还有从 `state.users` 读取用户的 `selectAllUsers` 和 `selectUserById`，由 `createEntityAdapter` 生成。刷新页面会发现数据都断了，因为 `state.users` 为空。既然我们用 RTK Query 缓存获取用户，**应替换成使用缓存的对应选择器**。

每个端点的 `endpoint.select()` 返回一个 memoized 选择器，每调用一次生成新的选择器。`select()` 形参为缓存键，应与查询钩子或 `initiate()` thunk 填入的参数一致，用来知道从存储中哪个缓存结果返回数据。

本例 `getUsers` 无参数，始终获取全部用户，缓存键即为无参数 `undefined`。

我们将修改 `usersSlice.ts` 使用 RTKQ 查询缓存值替代 `usersSlice` 本身：

```ts title="features/users/usersSlice.ts"
import {
  createEntityAdapter,
  createSelector,
  createSlice
} from '@reduxjs/toolkit'

import { client } from '@/api/client'

import type { RootState } from '@/app/store'
import { createAppAsyncThunk } from '@/app/withTypes'

// highlight-next-line
import { apiSlice } from '@/features/api/apiSlice'
import { selectCurrentUsername } from '@/features/auth/authSlice'

export interface User {
  id: string
  name: string
}

// omit `fetchUsers` and `usersSlice`

// highlight-start
const emptyUsers: User[] = []

// 调用 `someEndpoint.select(someArg)` 生成选择器，用于返回缓存该参数的查询结果
// 无参数查询可不传参数调用 `select()`
export const selectUsersResult = apiSlice.endpoints.getUsers.select()

export const selectAllUsers = createSelector(
  selectUsersResult,
  usersResult => usersResult?.data ?? emptyUsers
)

export const selectUserById = createSelector(
  selectAllUsers,
  (state: RootState, userId: string) => userId,
  (users, userId) => users.find(user => user.id === userId)
)

export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state)
  if (currentUsername) {
    return selectUserById(state, currentUsername)
  }
}
// highlight-end

/* 暂时注释掉 adapter 选择器，后续还会重新启用
export const { selectAll: selectAllUsers, selectById: selectUserById } = usersAdapter.getSelectors(
  (state: RootState) => state.users,
)
*/
```

开始时先创建 `selectUsersResult` 方便获取正确缓存条目。

再用它创建 `selectAllUsers` 获取用户数组，没结果时返回空数组。`selectUserById` 由数组查找对应 ID。

暂时注释适配器的选择器，后续会切换回来。

组件依然引用这些选择器，改动不会影响它们。刷新页面、浏览帖子，正确用户名应显示在帖子和 `<AddPostForm>` 下拉里。

**这很好展示了选择器提升维护便利的优势**。组件调用相同选择器，数据来源无论是 `usersSlice` 还是 RTKQ 缓存，选择器返回一致数据即可，无需修改组件代码。

既然不再使用 `usersSlice` 状态，可以删掉 `createSlice()` 和 `fetchUsers` thunk，删去 store 配置里的 `users: usersReducer`。有关帖子 slice 还有些引用，暂时保留，稍后处理。

### 分割并注入端点

我们之前提到，**RTK Query 通常每个应用只有一个“API 切片”**，至今为止我们都直接在 `apiSlice.ts` 中定义所有端点。但较大的应用通常“代码分割”模块，按需“懒加载”首用功能。如果想代码分割定义，或出于文件大小组织规范想拆分端点定义，怎么办？

**RTK Query 支持通过 `apiSlice.injectEndpoints()` 来拆分端点定义**。这样，我们仍有唯一的 API 切片实例、单一中间件和缓存 reducer，但端点定义能分散到多文件。方便代码拆分场景，也能将端点与对应特性目录并置。

示范如何将 `getUsers` 端点从 `apiSlice.ts` 移到 `usersSlice.ts` 里注入。

由于 `usersSlice.ts` 已导入 `apiSlice`，可改用 `apiSlice.injectEndpoints()`：

```ts title="features/users/usersSlice.ts"
import { apiSlice } from '../api/apiSlice'

// highlight-start
// 它是相同的 `apiSlice` 引用，但含加入注入端点的 TS 类型
export const apiSliceWithUsers = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getUsers: builder.query<User[], void>({
      query: () => '/users'
    })
  })
})

export const { useGetUsersQuery } = apiSliceWithUsers

export const selectUsersResult = apiSliceWithUsers.endpoints.getUsers.select()
// highlight-end
```

`injectEndpoints()` 会修改原始 API 切片，添加端点定义并返回**相同**的切片引用，但返回值的 TS 类型已包含注入端点。

因此我们以新变量保存该引用（如 `apiSliceWithUsers`），方便类型区分，代码也更清晰。

目前只有入口文件里调用 `getUsers.initiate`，也要改用扩展后的切片：

```tsx title="main.tsx"
// highlight-next-line
import { apiSliceWithUsers } from './features/users/usersSlice'

import { worker } from './api/server'

import './index.css'

// 包装 app 渲染，等待模拟 API 初始化
async function start() {
  // 启动模拟 API 服务器
  await worker.start({ onUnhandledRequest: 'bypass' })

  // highlight-next-line
  store.dispatch(apiSliceWithUsers.endpoints.getUsers.initiate())

  const root = createRoot(document.getElementById('root')!)

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  )
}
```

也可将具体端点本身导出，就像 slice 里操作创建器那样。

## 转换响应数据

迄今为止，所有查询端点都直接缓存了服务器响应体原样的数据。`getPosts` 与 `getUsers` 期望服务器返回数组，`getPost` 期望单个对象。

客户端常需从服务器响应提取部分数据、对其转换后才缓存。比如 `/getPost` 可能返回 `{post: {id}}`，数据被嵌套了。

理论上有多种处理方式。一种是提取 `responseData.post` 存入缓存，而非整个响应体；另一种是缓存完整响应体，组件在读取时只选择需要的字段。

### 转换响应体

**端点可以定义 `transformResponse` 方法，在缓存前提取或转换服务器响应数据**。比如如果 `getPost` 返回 `{post: {id}}`，则可以写 `transformResponse: (responseData) => responseData.post`，仅缓存 `Post` 对象。

在[第 6 部分：性能和规范化](./part-6-performance-normalization.md)中讨论过，规范化数据存储更有利于高效查找和更新。

`selectUserById` 本来是遍历数组寻找用户。若缓存数据规范化了，就能按 ID 直接索引。

我们之前用 `createEntityAdapter` 管理 `usersSlice` 里的规范化用户数据。这里集成 `createEntityAdapter` 到扩展 API 切片，利用它对响应数据做转换后缓存。解开之前注释的 `usersAdapter` 相关代码，恢复其更新函数和选择器：

```ts title="features/users/usersSlice.ts"
import {
  createSelector,
  // highlight-start
  createEntityAdapter,
  EntityState
  // highlight-end
} from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

import { apiSlice } from '@/features/api/apiSlice'
import { selectCurrentUsername } from '@/features/auth/authSlice'

export interface User {
  id: string
  name: string
}

// highlight-start
const usersAdapter = createEntityAdapter<User>()
const initialState = usersAdapter.getInitialState()
// highlight-end

// 与 `apiSlice` 相同引用，但类型已扩展包含注入端点
export const apiSliceWithUsers = apiSlice.injectEndpoints({
  endpoints: builder => ({
    // highlight-start
    getUsers: builder.query<EntityState<User, string>, void>({
      query: () => '/users',
      transformResponse(res: User[]) {
        // 生成所有用户的规范化状态对象
        return usersAdapter.setAll(initialState, res)
      }
    })
    // highlight-end
  })
})

export const { useGetUsersQuery } = apiSliceWithUsers

// 生成缓存选择器
export const selectUsersResult = apiSliceWithUsers.endpoints.getUsers.select()
// highlight-start
const selectUsersData = createSelector(
  selectUsersResult,
  // 无响应值时默认空规范化状态
  result => result.data ?? initialState
)
// highlight-end

export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state)
  if (currentUsername) {
    return selectUserById(state, currentUsername)
  }
}

// highlight-start
export const { selectAll: selectAllUsers, selectById: selectUserById } =
  usersAdapter.getSelectors(selectUsersData)
// highlight-end
```

`getUsers` 端点新增 `transformResponse`，接收完整响应体（此处为用户数组），返回规范化状态数据。通过 `usersAdapter.setAll(initialState, res)` 生成 `{ids: [], entities: {}}` 格式。TS 类型声明为缓存数据的实际类型。

`adapter.getSelectors()` 需要输入选择器定位数据位置。此处数据在 RTK Query 缓存中，写了 `selectUsersData`，没数据时回退至空状态。

### 规范化缓存和文档缓存

我们花点时间重新看这事儿和它的重要性。

别的库如 Apollo 提到“规范化缓存”，RTK Query 核心用法其实是“文档缓存”。

全规范化缓存会消除跨所有查询对相同条目的重复存储，比如有 `getTodos` 和 `getTodo` 端点，多个查询都会返回同一 `{id: 1}` Todo。全规范化缓存只保留一份 Todo 实例，避免冗余。

而 **RTK Query 给每个查询结果单独存储一份缓存数据**。所以上述三个查询形成了三份 Todo 副本。但如果端点都准确提供了标签（如 `{type: 'Todo', id: 1}`），失效该标签会触发相关请求刷新，保持数据同步。

RTK Query 特意**不实现跨请求完全去重的缓存**。理由包括：

- 实现全规范化且跨查询共享的缓存很复杂
- 团队目前没有资源强调这一点
- 多数情况下，简单失效后重新请求更好理解更实用
- RTKQ 主要目标是简化“请求数据”痛点，满足通用需求

本案例中，我们转换了 `getUsers` 的数据存储为规范化结构，即 `{[id]: value}`，但这并非“规范化缓存”——仅转换了 _该响应的存储方式_，而非消除多个请求间的重复。

### 从结果中选择值

最后，剩下 `<UserPage>` 组件仍从旧 `postsSlice` 读取帖子，筛选当前用户的帖。我们已见过用 `useGetPostsQuery()` 获得全部帖子后可以 `useMemo` 里排序筛选。查询钩子还能通过 `selectFromResult` 选项挑选缓存中特定数据，仅在所选择的部分变化时触发重渲染。

`useQuery` 钩子第一个参数是缓存键，若传选项则为第二参数。`getUsers` 端点无缓存键，等价于 `undefined`。所以给钩子传选项时，须调用 `useGetUsersQuery(undefined, options)`。

我们用 `selectFromResult` 使 `<UserPage>` 只读取筛选后的帖子。但要避免组件重复渲染，须保证从缓存选出的数据正确 memo 化。为此应创建新的选择器实例供 `<UserPage>` 复用，每次渲染都能缓存结果。

```tsx title="features/users/UserPage.tsx"
import { Link, useParams } from 'react-router-dom'
// highlight-start
import { createSelector } from '@reduxjs/toolkit'
import type { TypedUseQueryStateResult } from '@reduxjs/toolkit/query/react'
// highlight-end

import { useAppSelector } from '@/app/hooks'

// highlight-next-line
import { useGetPostsQuery, Post } from '@/features/api/apiSlice'

import { selectUserById } from './usersSlice'

// highlight-start
// 创建 TS 类型表示传入给 `selectFromResult` 的 hook 结果类型
type GetPostSelectFromResultArg = TypedUseQueryStateResult<Post[], any, any>

const selectPostsForUser = createSelector(
  (res: GetPostSelectFromResultArg) => res.data,
  (res: GetPostSelectFromResultArg, userId: string) => userId,
  (data, userId) => data?.filter(post => post.user === userId)
)
// highlight-end

export const UserPage = () => {
  const { userId } = useParams()

  const user = useAppSelector(state => selectUserById(state, userId!))

  // highlight-start
  // 复用相同的帖子查询，只取部分数据
  const { postsForUser } = useGetPostsQuery(undefined, {
    selectFromResult: result => ({
      // 可选：包括所有现有字段，如 `isFetching`
      ...result,
      // 返回过滤后的帖子列表
      postsForUser: selectPostsForUser(result, userId!)
    })
  })
  // highlight-end

  // omit rendering logic
}
```

此处自定义选择器与普通 `state` 选择器不同，第一个参数为缓存中包含值和请求元数据的结果对象。该结果包含 `data` 等我们需要的字段。

因为选择器输入参数非标准的 `RootState`，需使用 RTK Query 导出的 TS 类型 `TypedUseQueryStateResult` 标明钩子返回的类型。

:::tip 选择器与参数的 Memo 化

RTK 2.x 和 Reselect 5.x 里，memoized 选择器缓存容量改为无限（见 [reselect 文档](https://reselect.js.org/api/weakMapMemoize)），因此参数变化仍保留之前缓存。RTK 1.x 或 Reselect 4.x 默认缓存大小为 1，需[为组件创建唯一选择器实例](../../usage/deriving-data-selectors.md#creating-unique-selector-instances)才确保不同 ID 参数一致缓存。

:::

`selectFromResult` 回调接收 `result`，它含原始请求数据和元信息，返回筛选或衍生的新值。查询钩子会浅比较返回对象，**仅在字段变化时重新渲染组件**。为了避免不必要渲染，应仅返回组件需要的字段。若需要其余元字段，亦可用展开操作符合并。

示例中返回了一个新字段 `postsForUser`，可从钩子返回结果中直接解构，使用选择器进行缓存过滤，避免重复计算。

### 不同转换方式比较

目前见过三种响应转换处理：

- 保留缓存原响应，组件内读取全部结果后转化
- 保留原响应，利用 `selectFromResult` 选搭部分结果
- 请求时转化响应后缓存

针对不同场景，建议用法如下：

- `transformResponse`：全体消费者均需同样格式，如规范化方便按 ID 快速查找
- `selectFromResult`：部分组件只需部分数据，如筛选过的列表
- 组件内 `useMemo`：仅个别组件需要转换缓存数据时

## 高级缓存更新

我们完成了帖子与用户数据迁移，剩下要处理的是“点赞”和“通知”数据。用 RTK Query 处理它们可以尝试一些高级技巧，带来更好用户体验。

### 持久保存点赞

起初我们只在客户端追踪点赞，没有保存到服务器。现在添加 `addReaction` 变更，使点赞操作向服务器发送更新，实时保存。

```ts title="features/api/apiSlice.ts"
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  tagTypes: ['Post'],
  endpoints: builder => ({
    // omit other endpoints
    // highlight-start
    addReaction: builder.mutation<
      Post,
      { postId: string; reaction: ReactionName }
    >({
      query: ({ postId, reaction }) => ({
        url: `posts/${postId}/reactions`,
        method: 'POST',
        // 实际开发可能需要基于用户 ID 防止重复点赞
        body: { reaction }
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Post', id: arg.postId }
      ]
    })
    // highlight-end
  })
})

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useAddNewPostMutation,
  useEditPostMutation,
  // highlight-next-line
  useAddReactionMutation
} = apiSlice
```

类似其他变更，我们传入参数，向服务器发送请求体。示例中只传入点赞类型名称，由服务器累加该类型的计数。

已知点赞后需要重新请求帖子，故使特定帖子标签失效。

更新 `<ReactionButtons>` 使用该变更：

```tsx title="features/posts/ReactionButtons.tsx"
// highlight-next-line
import { useAddReactionMutation } from '@/features/api/apiSlice'

import type { Post, ReactionName } from './postsSlice'

const reactionEmoji: Record<ReactionName, string> = {
  thumbsUp: '👍',
  tada: '🎉',
  heart: '❤️',
  rocket: '🚀',
  eyes: '👀'
}

interface ReactionButtonsProps {
  post: Post
}

export const ReactionButtons = ({ post }: ReactionButtonsProps) => {
  // highlight-next-line
  const [addReaction] = useAddReactionMutation()

  const reactionButtons = Object.entries(reactionEmoji).map(
    ([stringName, emoji]) => {
      // 确保 TS 知道这是具体字符串类型
      const reaction = stringName as ReactionName
      return (
        <button
          key={reaction}
          type="button"
          className="muted-button reaction-button"
          onClick={() => {
            // highlight-next-line
            addReaction({ postId: post.id, reaction })
          }}
        >
          {emoji} {post.reactions[reaction]}
        </button>
      )
    }
  )

  return <div>{reactionButtons}</div>
}
```

尝试下吧！进入 `<PostsList>` 主界面，点击某个点赞按钮。

![PostsList 处于加载禁用状态](/img/tutorials/essentials/disabled-posts-fetching.png)

糟糕，因为点赞按钮触发了整个帖子列表的重新请求，导致整个 `<PostsList>` 被禁用并变灰。虽然模拟服务器设置了 2 秒延迟响应，速度更快也会有不好用户体验。

### 点赞的乐观更新

点赞这种小操作，不必重新获取 *整个* 帖子列表。可以直接修改客户端缓存数据，模拟服务器端修改效果。且提前更新缓存，用户点击后反馈立刻可见，无需等待请求返回。**这一先更新客户端状态的做法称为“乐观更新”**，在 Web 应用很常见。

RTK Query 包含 **直接操作客户端缓存的工具**。可结合 RTK Query 的 **请求生命周期方法** 来实现乐观更新。

#### 缓存更新工具

API 切片有附加方法在 `api.util` 下（[文档](https://redux-toolkit.js.org/rtk-query/api/created-api/api-slice-utils)）。包括修改缓存的 thunk：`upsertQueryData` 以添加或替换缓存项，和 `updateQueryData` 以修改缓存数据。它们是 thunk，可在任何能访问 `dispatch` 的地方使用。

其中 `updateQueryData` 接收三个参数：要更新的端点名称、缓存键参数，以及用于更新缓存的回调。**回调通过 Immer 拦截，可“直接 mutate”缓存数据，操作类似 `createSlice` 里的 reducers**：

```ts title="updateQueryData example"
dispatch(
  apiSlice.util.updateQueryData(endpointName, queryArg, draft => {
    // 像写 reducer 一样修改 `draft`
    draft.value = 123
  })
)
```

`updateQueryData` 会生成包含更改补丁的动作对象。调用 `dispatch` 后返回 `patchResult`，可调用 `patchResult.undo()` 来撤销补丁改动。

#### `onQueryStarted` 生命周期

第一个生命周期方法是 [**`onQueryStarted`**](https://redux-toolkit.js.org/rtk-query/api/createApi#onquerystarted)。支持查询和变更。

每当发起请求，该回调会执行。这里可放额外代码响应请求。

类似异步 thunk 和监听器，`onQueryStarted` 接受两个参数：请求参数 `arg` 和生命周期 API `lifecycleApi`。后者包含 `{dispatch, getState, extra, requestId}`，还有额外方法，最重要是 `lifecycleApi.queryFulfilled`，这是一个在请求返回（成功或失败）时解决的 Promise。

#### 实现乐观更新

我们可在 `onQueryStarted` 用缓存更新工具实现乐观更新（请求返回前更新缓存）或悲观更新（请求返回后更新缓存）。

这里实现乐观更新：查找 `getPosts` 缓存中对应帖子，递增该点赞计数。因为存在另一份同样帖子的 `getPost` 缓存，也需同步更新。

我们默认请求成功。如失败则等待 `lifecycleApi.queryFulfilled` 拒绝，调用 `undo()` 恢复缓存。

```ts title="features/api/apiSlice.ts"
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),
  tagTypes: ['Post'],
  endpoints: builder => ({
    // omit other endpoints

    addReaction: builder.mutation<
      Post,
      { postId: string; reaction: ReactionName }
    >({
      query: ({ postId, reaction }) => ({
        url: `posts/${postId}/reactions`,
        method: 'POST',
        // 实际开发可能需要基于用户 ID 防止重复点赞
        body: { reaction }
      }),
      // highlight-start
      // 移除 `invalidatesTags`，使用乐观更新替代
      async onQueryStarted({ postId, reaction }, lifecycleApi) {
        // 更新 `getPosts` 缓存（无参数）
        const getPostsPatchResult = lifecycleApi.dispatch(
          apiSlice.util.updateQueryData('getPosts', undefined, draft => {
            const post = draft.find(post => post.id === postId)
            if (post) {
              post.reactions[reaction]++
            }
          })
        )

        // 更新 `getPost` 缓存（参数为 postId）
        const getPostPatchResult = lifecycleApi.dispatch(
          apiSlice.util.updateQueryData('getPost', postId, draft => {
            draft.reactions[reaction]++
          })
        )

        try {
          await lifecycleApi.queryFulfilled
        } catch {
          getPostsPatchResult.undo()
          getPostPatchResult.undo()
        }
      }
    })
    // highlight-end
  })
})
```

这里移除了之前的标签失效，因为点击点赞时我们不想重新请求帖子。

现在快速点击点赞按钮，UI 上点赞数量会即时递增。网络请求也会发出，但用户感觉不会卡顿。

有时变更返回重要数据（如服务器生成的 ID），也可以等请求成功后再基于响应更新缓存，称为悲观更新。

### 通知的流更新

最后是通知标签。我们之前在[第 6 部分](./part-6-performance-normalization.md#adding-notifications)提到，真实应用里服务器会推送通知更新。最初是用“刷新通知”按钮模拟的 HTTP `GET` 请求。

应用常见模式是先发初始请求，再打开 WebSocket 监听后续更新。RTK Query 的生命周期方法为实现此“流更新”提供了空间。

已知的 `onQueryStarted` 支持乐观/悲观更新。另一方面，**RTK Query 提供了 `onCacheEntryAdded` 生命周期，是实现流更新的理想场所。** 我们会用它实现更真实的通知管理体验。

#### `onCacheEntryAdded` 生命周期

和 `onQueryStarted` 相仿， [**`onCacheEntryAdded`**](https://redux-toolkit.js.org/rtk-query/api/createApi#oncacheentryadded) 适用于查询和变更。

当新增缓存条目（端点 + 序列化参数）时调用。触发频次比 `onQueryStarted` 少（后者每请求都会跑）。

它的回调参数有两项，第一个是查询参数，第二个 `lifecycleApi` 支持 `{dispatch, getState, extra, requestId}`，还额外含有 `updateCachedData` 实用函数，类似于 `api.util.updateQueryData`，但已绑定端点名称和参数，调用更方便。

还有两个 Promise：

- `cacheDataLoaded`: 在接收到的第一个缓存值加载完成时 resolve，通常用于在继续处理前等待缓存中确实已有一个实际值
- `cacheEntryRemoved`: 在该缓存条目被移除时 resolve（即不再有订阅者，且该缓存条目已被垃圾回收）

只要有任意订阅，该缓存就保留。订阅挂起且缓存超时后移除，`cacheEntryRemoved` 解决。基本用法：

- 立刻等待 `cacheDataLoaded`
- 建立服务器订阅如 WebSocket
- 接收数据后用 `updateCachedData` 更新缓存
- 等待 `cacheEntryRemoved`，做清理动作

`onCacheEntryAdded` 适合放长时间运行的逻辑，如聊天应用在打开频道时请求初始消息，保持 WebSocket 监听新消息，关闭频道时断开。

#### 获取通知

拆分任务。

先定义通知端点，添加一个替代原 `fetchNotificationsWebsocket` thunk 以让模拟后端通过 WebSocket 推送通知。

把 `getNotifications` 端点注入到 `notificationsSlice`，示范注入用法。

```ts title="features/notifications/notificationsSlices.ts"
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'

import { client } from '@/api/client'
// highlight-next-line
import { forceGenerateNotifications } from '@/api/server'

// highlight-next-line
import type { AppThunk, RootState } from '@/app/store'
import { createAppAsyncThunk } from '@/app/withTypes'

// highlight-next-line
import { apiSlice } from '@/features/api/apiSlice'

// omit types and `fetchNotifications` thunk

// highlight-start
export const apiSliceWithNotifications = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getNotifications: builder.query<ServerNotification[], void>({
      query: () => '/notifications'
    })
  })
})

export const { useGetNotificationsQuery } = apiSliceWithNotifications
// highlight-end
```

`getNotifications` 是普通查询端点，用于缓存服务器返回的 `ServerNotification` 数组。

在 `<Navbar>` 使用该查询钩子自动获取通知。能拿到 `ServerNotification`，但没拿到我们之前添加的 `{read, isNew}` 字段，要暂时禁用 `notification.new` 校验：

```tsx title="features/notifications/NotificationsList.tsx"
// omit other imports

// highlight-next-line
import { allNotificationsRead, useGetNotificationsQuery } from './notificationsSlice'

export const NotificationsList = () => {
  const dispatch = useAppDispatch()
  // highlight-next-line
  const { data: notifications = [] } = useGetNotificationsQuery()

  useLayoutEffect(() => {
    dispatch(allNotificationsRead())
  })

  const renderedNotifications = notifications.map((notification) => {
    const notificationClassname = classnames('notification', {
      // highlight-next-line
      // new: notification.isNew,
    })
  }

  // omit rendering
}
```

进入“通知”页可看到通知条目，但无新未读高亮。点击“刷新通知”按钮，未读数不断增，因为按钮依然调用旧异步 thunk 往 `state.notifications` 存数据，且 `<NotificationsList>` 不响应，布局效果没更新，也不触发 `useLayoutEffect`。

#### 跟踪客户端状态

接下去调整「读状态」跟踪。

以前我们从服务端通知组合客户端字段 `{read, isNew}` 并保存，现在 RTK Query 缓存存的是服务端通知，只含服务器数据。

可以通过手动缓存更新，或用 `transformResponse` 添加属性，并动态修改缓存。不过我们采用另一种思路，**在 `notificationsSlice` 内部维护“读状态”元数据**。

本质是维护每条通知的 `{read, isNew}` 元信息。若有办法监听查询动作并访问通知 ID，就能管理与缓存对应的元数据。

幸运的是可以，因为 RTK Query 基于 `createAsyncThunk`，每次请求成功后会调度 `fulfilled` 动作。只需在 `notificationsSlice` 中监视该动作即可，实现监听。

由于 RTKQ 端点不直接暴露 thunk 的 fulfilled 动作创建器，不能用 `builder.addCase()`。

但端点有 `matchFulfilled` 匹配器函数，可用 `builder.addMatcher()` 监听该动作。

改造 `ClientNotification` 成 `NotificationMetadata` 类型，监听 `getNotifications` 端点的 fulfilled 动作，存储只包含元信息的实体。

顺便将 `notificationsAdapter` 重命名为 `metadataAdapter`，所有变量都改成 `metadata` 相关，方便理解。导出 `selectEntities` 为 `selectMetadataEntities` 方便通过 ID 查找元数据。

```ts title="features/notifications/notificationsSlice.ts"
// omit imports and thunks

// highlight-start
// 替代 `ClientNotification`，只需这些字段
export interface NotificationMetadata {
  // 增加 `id` 字段，单独对象唯一标识
  id: string
  // highlight-end
  read: boolean
  isNew: boolean
}

export const fetchNotifications = createAppAsyncThunk(
  'notifications/fetchNotifications',
  async (_unused, thunkApi) => {
    // highlight-next-line
    // 删除时间戳查找 - 准备弃用此 thunk
    const response = await client.get<ServerNotification[]>(
      `/fakeApi/notifications`
    )
    return response.data
  }
)

// highlight-start
// 重命名 `notificationsAdapter`，并关闭排序功能
const metadataAdapter = createEntityAdapter<NotificationMetadata>()

const initialState = metadataAdapter.getInitialState()
// highlight-end

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    allNotificationsRead(state) {
      // highlight-start
      // 变量改名为 metadata
      Object.values(state.entities).forEach(metadata => {
        metadata.read = true
      })
      // highlight-end
    }
  },
  extraReducers(builder) {
    // highlight-start
    // 用 `addMatcher` 监听 `getNotifications` 查询 fulfilled 动作
    builder.addMatcher(
      apiSliceWithNotifications.endpoints.getNotifications.matchFulfilled,
      (state, action) => {
        // 添加客户端元信息，追踪新通知
        const notificationsMetadata: NotificationMetadata[] =
          action.payload.map(notification => ({
            // 元数据和通知共用 ID
            id: notification.id,
            read: false,
            isNew: true
          }))

        // 以前读过的通知不再是新通知
        Object.values(state.entities).forEach(metadata => {
          metadata.isNew = !metadata.read
        })

        metadataAdapter.upsertMany(state, notificationsMetadata)
      }
    )
    // highlight-end
  }
})

export const { allNotificationsRead } = notificationsSlice.actions

export default notificationsSlice.reducer

// highlight-start
// 重命名选择器
export const {
  selectAll: selectAllNotificationsMetadata,
  selectEntities: selectMetadataEntities
} = metadataAdapter.getSelectors(
  // highlight-end
  (state: RootState) => state.notifications
)

export const selectUnreadNotificationsCount = (state: RootState) => {
  // highlight-next-line
  const allMetadata = selectAllNotificationsMetadata(state)
  const unreadNotifications = allMetadata.filter(metadata => !metadata.read)
  return unreadNotifications.length
}
```

接着在 `<NotificationsList>` 导入元数据选择器，从中查找对应通知的元数据，重新启用 `isNew` 条件，恢复高亮样式：

```ts title="features/notifications/NotificationsList.tsx"
// highlight-next-line
import { allNotificationsRead, useGetNotificationsQuery, selectMetadataEntities } from './notificationsSlice'

export const NotificationsList = () => {
  const dispatch = useAppDispatch()
  const { data: notifications = [] } = useGetNotificationsQuery()
  // highlight-next-line
  const notificationsMetadata = useAppSelector(selectMetadataEntities)

  useLayoutEffect(() => {
    dispatch(allNotificationsRead())
  })

  const renderedNotifications = notifications.map((notification) => {

      // highlight-start
      // 获得对应通知的元数据
    const metadata = notificationsMetadata[notification.id]
    const notificationClassname = classnames('notification', {
      // 重新启用判断高亮的 isNew
      new: metadata.isNew,
    })
    // highlight-end

    // omit rendering
  }
}
```

“通知”页里的通知会高亮新旧状态，但点击“刷新通知”按钮不会收到更多新的通知，也无法标记已读。

#### 通过 WebSocket 推送通知

要完成过渡为服务器推送，还需几步。

下一步是将“刷新通知”按钮从调度异步 thunk 变为手动调用模拟服务器推送通知函数。

`src/api/server.ts` 已配置了模拟 WebSocket 服务器，类似模拟 HTTP 服务器。由于没有真正后端和多用户，依然要手动调用 `forceGenerateNotifications` 来模拟服务器发送通知更新。

我们将用 `fetchNotificationsWebsocket` thunk 替代旧的 `fetchNotifications` 异步 thunk。新 thunk 不发请求，无需异步逻辑，只是调用模拟服务器接口触发推送。

为了实现“最新时间戳”逻辑，需要增加选择器读取通知缓存数据，复用“用户选择器”模式。

```ts title="features/notifications/notificationsSlice.ts"
import {
  createEntityAdapter,
  createSlice,
  // highlight-next-line
  createSelector
} from '@reduxjs/toolkit'

// highlight-start
import { forceGenerateNotifications } from '@/api/server'
import type { AppThunk, RootState } from '@/app/store'
// highlight-end

import { apiSlice } from '@/features/api/apiSlice'

// omit types and API slice setup

export const { useGetNotificationsQuery } = apiSliceWithNotifications

// highlight-start
export const fetchNotificationsWebsocket =
  (): AppThunk => (dispatch, getState) => {
    const allNotifications = selectNotificationsData(getState())
    const [latestNotification] = allNotifications
    const latestTimestamp = latestNotification?.date ?? ''
    // 通过调用模拟服务器方法，模拟推送通知（WebSocket）
    forceGenerateNotifications(latestTimestamp)
  }

const emptyNotifications: ServerNotification[] = []

export const selectNotificationsResult =
  apiSliceWithNotifications.endpoints.getNotifications.select()

const selectNotificationsData = createSelector(
  selectNotificationsResult,
  notificationsResult => notificationsResult.data ?? emptyNotifications
)
// highlight-end

// omit slice and selectors
```

替换 `<Navbar>` 中的 `fetchNotifications` 调度为 `fetchNotificationsWebsocket`：

```tsx title="components/Navbar.tsx"
import {
  // highlight-next-line
  fetchNotificationsWebsocket,
  selectUnreadNotificationsCount,
} from '@/features/notifications/notificationsSlice'
import { selectCurrentUser } from '@/features/users/usersSlice'

import { UserIcon } from './UserIcon'

export const Navbar = () => {
  // omit hooks

  if (isLoggedIn) {
    const onLogoutClicked = () => {
      dispatch(logout())
    }

    const fetchNewNotifications = () => {
      // highlight-next-line
      dispatch(fetchNotificationsWebsocket())
    }
```

差不多了！初始通知用 RTK Query 获取，读状态独立存储，强制触发模拟服务器推送。但现在点“刷新通知”会报错，WebSocket 处理还没写！

接下来实现流式更新。

#### 实现流更新

应用场景为：用户登录时获取通知，并保持监听所有后续推送。登出时停止监听。

`<Navbar>` 登录后才渲染且保持挂载，是保持缓存订阅的好地方，可在此调用 `useGetNotificationsQuery()` 钩子。

```ts title="components/Navbar.tsx"
// omit other imports
import {
  fetchNotificationsWebsocket,
  selectUnreadNotificationsCount,
  // highlight-next-line
  useGetNotificationsQuery
} from '@/features/notifications/notificationsSlice'

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  // highlight-start
  // 触发通知初始获取，保持 WebSocket 连接以接收更新
  useGetNotificationsQuery()
  // highlight-end

  // omit rest of the component
}
```

最后，在 `getNotifications` 端点添加 `onCacheEntryAdded` 生命周期方法，编写 WebSocket 逻辑：

```ts title="features/notifications/notificationsSlice.ts"
import {
  createEntityAdapter,
  createSlice,
  createSelector,
  // highlight-start
  createAction,
  isAnyOf
  // highlight-end
} from '@reduxjs/toolkit'
// omit imports and other code

// highlight-next-line
const notificationsReceived = createAction<ServerNotification[]>('notifications/notificationsReceived')

export const apiSliceWithNotifications = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getNotifications: builder.query<ServerNotification[], void>({
      query: () => '/notifications',
      // highlight-start
      async onCacheEntryAdded(arg, lifecycleApi) {
        // 缓存订阅开启时创建 WebSocket 连接
        const ws = new WebSocket('ws://localhost')
        try {
          // 等待首次缓存数据加载完成
          await lifecycleApi.cacheDataLoaded

          // 监听 WebSocket 消息，更新缓存
          const listener = (event: MessageEvent<string>) => {
            const message: {
              type: 'notifications'
              payload: ServerNotification[]
            } = JSON.parse(event.data)
            switch (message.type) {
              case 'notifications': {
                lifecycleApi.updateCachedData(draft => {
                  // 将接收到的通知追加到缓存数组
                  draft.push(...message.payload)
                  draft.sort((a, b) => b.date.localeCompare(a.date))
                })

                // 发送额外动作以同步读状态
                lifecycleApi.dispatch(notificationsReceived(message.payload))
                break
              }
              default:
                break
            }
          }

          ws.addEventListener('message', listener)
        } catch {
          // 若缓存一开始就移除，忽略异常
        }
        // 等待缓存被移除，做断开 WebSocket 等清理
        await lifecycleApi.cacheEntryRemoved
        ws.close()
      }
    })
    // highlight-end
  })
})

export const { useGetNotificationsQuery } = apiSliceWithNotifications

// highlight-start
const matchNotificationsReceived = isAnyOf(
  notificationsReceived,
  apiSliceWithNotifications.endpoints.getNotifications.matchFulfilled,
)
// highlight-end

// omit other code

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: { /* omit reducers */  },
  extraReducers(builder) {
    // highlight-next-line
    builder.addMatcher(matchNotificationsReceived, (state, action) => {
     // omit logic
    }
  },
})
```

缓存订阅启动时建立 WebSocket 连接。

等待 `cacheDataLoaded` 表示数据已加载。

监听 WebSocket 收到的消息，解析 JSON 数据，判定类型是通知，调用 `updateCachedData`，把通知添加进缓存数组，重新排序。

发送额外动作以更新读状态。

等待 `cacheEntryRemoved` 表示无订阅时断开连接。

注意，也无需一定在此处创建 WebSocket。可能提前在应用其他处创建或中间件维护。关键是根据缓存订阅生命周期管理监听及更新缓存。

完成！点击“刷新通知”，未读计数增加，切到“通知”页，能正确区分已读与未读。

### 清理

最后可做一些清理。`postsSlice.ts` 里的 `createSlice` 不再用，删掉切片及选择器、类型，删除 Redux store 里的 `postsReducer`。保留 `addPostsListeners` 函数和类型声明合理。

## 你学到了什么

至此，应用完成 RTK Query 迁移！所有数据获取均转用 RTKQ，并通过乐观更新、流式更新提升了用户体验。

RTK Query 提供了大量强大选项控制缓存管理。未必立即用到全部功能，但它们灵活且关键，帮助实现特定应用逻辑。

看看完整应用运行：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-6-rtkqConversion?fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-essentials-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

:::tip 总结

- **特定缓存标签用于更细粒度失效**
  - 标签可为简单字符串，如 `'Post'`，或对象 `{type: 'Post', id}`
  - 端点可基于结果和参数提供或使标签失效
- **RTK Query API 不依赖 UI，可 React 外使用**
  - 端点对象含发起请求函数、结果选择器、请求动作匹配器
- **响应数据可以多种方式转化**
  - 端点可用 `transformResponse` 修改缓存前数据
  - 钩子支持 `selectFromResult` 选取/转换数据
  - 组件可拿全部数据并用 `useMemo` 转换
- **RTK Q 也有高级缓存操作，优化用户体验**
  - `onQueryStarted` 用于乐观更新，先更新缓存再请求返回
  - `onCacheEntryAdded` 用于流更新，根据服务推送变更缓存
  - 端点具有 `matchFulfilled` 匹配函数，可监听动作执行额外逻辑，如更新切片状态

:::

## 下一步？

恭喜你，**已完成 Redux 精华教程！** 现在你应理解 Redux Toolkit、React-Redux 基础，知道如何写和组织 Redux 逻辑，了解 Redux 数据流及 React 集成，用法包括 `configureStore`、`createSlice`，并能用 RTK Query 简化请求与缓存。

更多 RTK Query 细节见[官方使用指南](https://redux-toolkit.js.org/rtk-query/usage/queries)，API 参考见[文档](https://redux-toolkit.js.org/rtk-query/api/createApi)。

本教程提供的概念足够让你开始用 React + Redux 写自己的应用。现在就试试做个项目，加深理解。如果无头绪，看看[这份项目点子列表](https://github.com/florinpop17/app-ideas)。

Redux Essentials 教程聚焦“如何正确用 Redux”，不专注“工作原理”或“为什么这样设计”。尤其 Redux Toolkit 是高级抽象工具，理解它做了啥很值得。阅读[“Redux 基础”教程](../fundamentals/part-1-overview.md)能帮你掌握手写 Redux 的原理及为何推荐 RTK。

[使用 Redux](../../usage/index.md) 部分包含诸多核心概念，如[如何布局 Reducers](../../usage/structuring-reducers/StructuringReducers.md)，[我们的代码风格指南](../../style-guide/style-guide.md)提供最佳实践。

想深入了解 Redux 存在原因、解决的问题和设计理念，可阅读作者 Mark Erikson 关于 [Redux 的道，第一部分：实现和意图](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/) 和 [第二部分：实践和哲学](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/) 的帖子。

用于 Redux 问题帮助，可加入 [Reactiflux Discord 服务器的 `#redux` 频道](https://www.reactiflux.com)。

**感谢认真阅读本教程，祝你开发 Redux 应用愉快！**