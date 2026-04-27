---
id: part-4-using-data
title: 'Redux 必备篇，第四部分：使用 Redux 数据'
sidebar_label: '使用 Redux 数据'
description: '官方 Redux 必备教程：学习如何在 React 组件中处理复杂的 Redux 状态'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 你将学到

- 在多个 React 组件中使用 Redux 数据
- 组织派发动作的逻辑
- 使用选择器查找状态值
- 在 reducers 中编写更复杂的更新逻辑
- 如何思考 Redux 动作

:::

:::info 先决条件

- 理解[第三部分：Redux 数据流和 React-Redux API](./part-3-data-flow.md)
- 熟悉 [React Router 的 `<Link>` 和 `<Route>` 组件用于页面路由](https://reactrouter.com/start/library/routing)

:::

## 介绍

在[第三部分：基础 Redux 数据流](./part-3-data-flow.md)中，我们看到如何从一个空的 Redux+React 项目开始，添加一个新的状态切片，并创建能够从 Redux store 读取数据并派发动作以更新数据的 React 组件。我们还了解了数据在应用中的流动方式，组件派发动作，reducers 处理动作并返回新状态，组件读取新状态并重新渲染 UI。我们还看到了如何创建“预先定义类型”的 `useSelector` 和 `useDispatch` 钩子，自动应用正确的 store 类型。

现在既然你已经知道编写 Redux 逻辑的核心步骤，我们将用同样的步骤为我们的社交媒体动态添加一些新功能，使其更有用：查看单条帖子，编辑已有帖子，显示帖子作者详情，帖子时间戳，表情按钮，以及授权功能。

:::info

提醒一下，代码示例聚焦于每个章节的关键概念和改动。完整的应用改动请见 CodeSandbox 项目和项目仓库的 [`tutorial-steps-ts` 分支](https://github.com/reduxjs/redux-essentials-example-app/tree/tutorial-steps-ts)。

:::

## 显示单条帖子

既然我们能够向 Redux store 添加新帖子，就可以添加更多使用帖子数据的功能。

目前，我们的帖子条目显示在主动态页面，但如果内容过长，我们只显示内容摘要。能在独立页面查看单条帖子会很方便。

### 创建单条帖子页面

首先，我们需要在 `posts` 功能文件夹下添加一个新的 `SinglePostPage` 组件。我们会使用 React Router，当页面 URL 看起来像 `/posts/123` 时显示此组件，其中 `123` 是我们想查看的帖子的 ID。

```tsx title="features/posts/SinglePostPage.tsx"
import { useParams } from 'react-router-dom'

import { useAppSelector } from '@/app/hooks'

export const SinglePostPage = () => {
  const { postId } = useParams()

  const post = useAppSelector(state =>
    state.posts.find(post => post.id === postId)
  )

  if (!post) {
    return (
      <section>
        <h2>找不到帖子！</h2>
      </section>
    )
  }

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <p className="post-content">{post.content}</p>
      </article>
    </section>
  )
}
```

当我们设置路由渲染这个组件时，会告诉它将 URL 第二部分解析为一个名为 `postId` 的变量，我们可以用 `useParams` 钩子读取该值。

有了这个 `postId`，我们可以在选择器函数内用它在 Redux store 中找到对应帖子对象。我们知道 `state.posts` 应该是所有帖子对象的数组，所以可以用 `Array.find()` 遍历数组，返回 ID 匹配的帖子条目。

重要的是，**组件在 `useAppSelector` 返回的新引用值发生变化时会重新渲染**。组件应始终尝试从 store 中选择所需的最小数据量，这有助于确保组件只有在必要时才重新渲染。

可能的情况是，我们在 store 中找不到匹配的帖子——可能是用户直接在 URL 中输入了错误地址，或者数据未正确加载。此时，`find()` 会返回 `undefined`，而不是实际的帖子对象。组件需要检查这一点，并处理显示“找不到帖子！”的提示。

假如我们确实拿到了正确的帖子对象，`useAppSelector` 会返回它，我们可以用它渲染帖子标题和内容。

你可能注意到这逻辑和我们 `<PostsList>` 组件中循环整个 `posts` 数组在主动态页面展示帖子摘要的逻辑相当相似。我们_可以_尝试提取一个 `Post` 组件供两个地方复用，但目前展示帖子摘要和完整帖子已有些不同。通常即使有重复，也最好先独立写，再根据情况判断不同代码是否足够相似以提取复用组件。

### 添加单条帖子路由

既然我们已有 `<SinglePostPage>` 组件，可以定义路由来显示它，并在前端帖子列表中添加指向每条帖子的链接。

顺便说一下，为了提高可读性，我们还把“主页”内容提取到单独的 `<PostsMainPage>` 组件。

我们在 `App.tsx` 中导入 `PostsMainPage` 和 `SinglePostPage`，并添加路由：

```tsx title="App.tsx"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Navbar } from './components/Navbar'
// highlight-start
import { PostsMainPage } from './features/posts/PostsMainPage'
import { SinglePostPage } from './features/posts/SinglePostPage'
// highlight-end

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          // highlight-start
          <Route path="/" element={<PostsMainPage />}></Route>
          <Route path="/posts/:postId" element={<SinglePostPage />} />
          // highlight-end
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

接下来，在 `<PostsList>` 中更新列表渲染逻辑，包含指向特定帖子的 `<Link>`：

```tsx title="features/posts/PostsList.tsx"
// highlight-next-line
import { Link } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

export const PostsList = () => {
  const posts = useAppSelector(state => state.posts)

  const renderedPosts = posts.map(post => (
    <article className="post-excerpt" key={post.id}>
      <h3>
        // highlight-next-line
        <Link to={`/posts/${post.id}`}>{post.title}</Link>
      </h3>
      <p className="post-content">{post.content.substring(0, 100)}</p>
    </article>
  ))

  return (
    <section className="posts-list">
      <h2>帖子列表</h2>
      {renderedPosts}
    </section>
  )
}
```

既然我们现在可以点击跳转到不同页面，`<Navbar>` 组件里也添加返回主帖子页的链接会更方便：

```tsx title="app/Navbar.tsx"
// highlight-next-line
import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav>
      <section>
        <h1>Redux 必备示例</h1>

        <div className="navContent">
          <div className="navLinks">
            // highlight-next-line
            <Link to="/">帖子</Link>
          </div>
        </div>
      </section>
    </nav>
  )
}
```

## 编辑帖子

作为用户，完成帖子写作保存后发现有错非常烦人。具备编辑已有帖子的能力会很有用。

我们来添加一个新的 `<EditPostForm>` 组件，它能接受一个已有帖子 ID，从 store 读取该帖子，允许用户编辑标题和内容，然后保存更改更新 store。

### 更新帖子条目

首先，需要更新 `postsSlice` 添加一个新的 reducer 函数和动作，告诉 store 如何更新帖子。

在 `createSlice()` 调用内，在 `reducers` 对象中添加一个新的函数。记住，这个 reducer 的名字应很好地描述发生的事情，因为 reducer 名称会成为 Redux DevTools 中该动作类型字符串的一部分。第一个 reducer 叫 `postAdded`，这次叫它 `postUpdated`。

:::tip

Redux 本身不关心你给 reducer 函数取什么名字——无论是 `postAdded`、`addPost`、`POST_ADDED` 还是 `someRandomName` 都会正常运行。

不过，**建议给 reducer 用过去式的动作名称，比如 `postAdded`，描述“应用中发生的事件”**。

:::

为了更新帖子对象，我们需要知道：

- 被更新帖子的 ID，以便找到对应帖子对象
- 用户输入的新 `title` 和 `content` 字段

Redux 动作对象必须有一个 `type` 字段，通常是描述性的字符串，也可以包含其他字段提供额外信息。习惯上，我们把额外信息放在 `action.payload` 中，但实际 payload 可以是字符串、数字、对象、数组等。这里我们有三项信息，所以计划让 `payload` 是一个包含这三个字段的对象，动作对象形如 `{type: 'posts/postUpdated', payload: {id, title, content}}`。

默认情况下，`createSlice` 生成的动作创建函数期望传入一个参数，这个参数的值赋给动作对象的 `payload`。因此，我们可以将包含这些字段的对象作为参数传给 `postUpdated` 动作创建函数。和 `postAdded` 一样，这里传入的是完整的 `Post` 类型，所以我们在 reducer 中声明参数为 `action: PayloadAction<Post>`。

我们还知道 reducer 负责根据派发动作实际更新状态。这里，reducer 应该根据 ID 找到对应帖子，更新它的 `title` 和 `content` 字段。

最后，我们要导出 `createSlice` 自动生成的动作创建函数，方便 UI 组件派发新的 `postUpdated` 动作。

综合要求，更新后的 `postsSlice` 看起来像这样：

```ts title="features/posts/postsSlice.ts"
// highlight-next-line
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// 省略状态类型

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded(state, action: PayloadAction<Post>) {
      state.push(action.payload)
    },
    // highlight-start
    postUpdated(state, action: PayloadAction<Post>) {
      const { id, title, content } = action.payload
      const existingPost = state.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    }
    // highlight-end
  }
})

// highlight-next-line
export const { postAdded, postUpdated } = postsSlice.actions

export default postsSlice.reducer
```

### 创建编辑帖子表单

我们的新 `<EditPostForm>` 组件会类似 `<AddPostForm>` 和 `<SinglePostPage>`，但逻辑略有不同。我们需要根据 URL 中的 `postId` 从 store 取出正确的帖子对象，然后用它初始化组件内输入字段，供用户修改。用户提交表单后保存更改并更新 store。我们还用 React Router 的 `useNavigate` 钩子在保存后跳转回单条帖子页面展示该帖子。

```tsx title="features/posts/EditPostForm.tsx"
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAppSelector, useAppDispatch } from '@/app/hooks'
import { postUpdated } from './postsSlice'

// 省略表单元素类型

export const EditPostForm = () => {
  const { postId } = useParams()

  const post = useAppSelector(state =>
    state.posts.find(post => post.id === postId)
  )

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  if (!post) {
    return (
      <section>
        <h2>找不到帖子！</h2>
      </section>
    )
  }

  const onSavePostClicked = (e: React.FormEvent<EditPostFormElements>) => {
    // 阻止表单提交到服务器
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    if (title && content) {
      dispatch(postUpdated({ id: post.id, title, content }))
      navigate(`/posts/${postId}`)
    }
  }

  return (
    <section>
      <h2>编辑帖子</h2>
      <form onSubmit={onSavePostClicked}>
        <label htmlFor="postTitle">帖子标题：</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          defaultValue={post.title}
          required
        />
        <label htmlFor="postContent">内容：</label>
        <textarea
          id="postContent"
          name="postContent"
          defaultValue={post.content}
          required
        />

        <button>保存帖子</button>
      </form>
    </section>
  )
}
```

注意，这里的 Redux 相关代码很简洁。和以前一样，先用 `useAppSelector` 从 store 读取值，再用 `useAppDispatch` 派发动作响应 UI 交互。

和 `SinglePostPage` 一样，我们需要导入它到 `App.tsx`，添加带有 `postId` 路由参数的路由渲染此组件：

```tsx title="App.tsx"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Navbar } from './components/Navbar'
import { PostsMainPage } from './features/posts/PostsMainPage'
import { SinglePostPage } from './features/posts/SinglePostPage'
// highlight-next-line
import { EditPostForm } from './features/posts/EditPostForm'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route path="/" element={<PostsMainPage />}></Route>
          <Route path="/posts/:postId" element={<SinglePostPage />} />
          // highlight-next-line
          <Route path="/editPost/:postId" element={<EditPostForm />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

同时，我们也应该在 `SinglePostPage` 给帖子添加一个指向编辑页的链接：

```tsx title="features/post/SinglePostPage.tsx"
// highlight-next-line
import { Link, useParams } from 'react-router-dom'

export const SinglePostPage = () => {

        // 省略其他内容

        <p className="post-content">{post.content}</p>
        // highlight-start
        <Link to={`/editPost/${post.id}`} className="button">
          编辑帖子
        </Link>
        // highlight-end
```

### 准备动作负载

我们刚才看到，`createSlice` 生成的动作创建函数通常期望一个参数作为 `action.payload`。这简化了常见用法，但有时我们需要准备动作对象的内容。比如 `postAdded` 动作，我们需要生成唯一 ID，还要确保 payload 是形如 `{id, title, content}` 的对象。

现在，我们在 React 组件里生成 ID 并组装 payload 对象，再传给 `postAdded`。但如果想在不同组件多次派发该动作，或者 payload 逻辑复杂，就得重复代码，还让组件知道 payload 结构。

:::caution

如果动作中需要唯一 ID 或其他随机值，**务必先生成它们并放进动作对象。reducers 里不应计算随机值**，因为这样会导致不可预测的结果。

:::

如果手写 `postAdded` 动作创建函数，可以内部包含生成 ID 等逻辑：

```ts
// 手写动作创建函数
function postAdded(title: string, content: string) {
  const id = nanoid()
  return {
    type: 'posts/postAdded',
    payload: { id, title, content }
  }
}
```

但 Redux Toolkit 的 `createSlice` 为我们自动生成动作创建函数，使代码更短，不必手写，但我们仍需要方式定制 `action.payload`。

幸运的是，在写 reducer 时，`createSlice` 允许我们定义“prepare 回调”函数。prepare 函数可以接收多个参数，生成随机值（如唯一 ID），运行同步逻辑来确定动作对象各字段。它返回一个带 `payload` 字段的对象。（返回对象还可以包含 `meta` 字段用于附加描述，和 `error` 字段表示是否出错。）

在 `createSlice` 的 `reducers` 字段中，我们可以将某个字段定义为形如 `{reducer, prepare}` 的对象：

```ts title="features/posts/postsSlice.ts"
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // highlight-start
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        state.push(action.payload)
      },
      prepare(title: string, content: string) {
        return {
          payload: { id: nanoid(), title, content }
        }
      }
    }
    // highlight-end
    // 其他 reducers 省略
  }
})
```

现在组件不用关心 payload 结构，动作创建函数会帮我们组装。我们更新组件在派发 `postAdded` 时传入 `title` 和 `content` 两个参数：

```ts title="features/posts/AddPostForm.tsx"
const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
  // 阻止表单提交
  e.preventDefault()

  const { elements } = e.currentTarget
  const title = elements.postTitle.value
  const content = elements.postContent.value

  // highlight-start
  // 现在我们传入分开的参数，ID 会自动生成
  dispatch(postAdded(title, content))
  // highlight-end

  e.currentTarget.reset()
}
```

## 用选择器读取数据

现在有几个不同组件通过 ID 查找帖子，都重复写了 `state.posts.find()` 代码。这是重复代码，应该尝试去重；而且脆弱——后续章节我们会改变 posts 切片状态结构，届时要去找所有引用 `state.posts` 的代码逐个更新。TypeScript 通过编译错误能帮忙捕捉不匹配的代码，但如果不想每次数据结构改动都重复修改组件，且减少重复代码，这会更好。

一个避免的办法是**在切片文件中定义可复用的选择器函数，由组件调用选择器提取所需数据，替代在组件中重复选择逻辑**。这样一旦状态结构改变，只要更新切片里的选择器即可。

### 定义选择器函数

每次用 `useAppSelector` 时其实就是写选择器，比如 `useAppSelector(state => state.posts)`，这里选择器是行内定义的匿名函数。因为选择器是函数，也可以写成：

```ts
const selectPosts = (state: RootState) => state.posts
const posts = useAppSelector(selectPosts)
```

选择器通常单独写成切片文件里的函数，通常第一个参数是整个 Redux `RootState`，也可以有其他参数。

### 抽取帖子选择器

`<PostsList>` 需要读取所有帖子列表，`<SinglePostPage>` 和 `<EditPostForm>` 需要通过 ID 查找帖子。我们从 `postsSlice.ts` 导出两个小选择器函数满足这两个场景：

```ts title="features/posts/postsSlice.ts"
import type { RootState } from '@/app/store'

const postsSlice = createSlice(/* 省略切片代码 */)

export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions

export default postsSlice.reducer

// highlight-start
export const selectAllPosts = (state: RootState) => state.posts

export const selectPostById = (state: RootState, postId: string) =>
  state.posts.find(post => post.id === postId)
// highlight-end
```

注意，这些选择器函数的 `state` 参数是 Redux 根状态对象，跟我们之前写在 `useAppSelector` 里的内联选择器相同。

然后在组件中调用：

```tsx title="features/posts/PostsList.tsx"
// 省略导入
// highlight-next-line
import { selectAllPosts } from './postsSlice'

export const PostsList = () => {
  // highlight-next-line
  const posts = useAppSelector(selectAllPosts)
  // 省略组件内容
}
```

```tsx title="features/posts/SinglePostPage.tsx"
// 省略导入
// highlight-next-line
import { selectPostById } from './postsSlice'

export const SinglePostPage = () => {
  const { postId } = useParams()

  // highlight-next-line
  const post = useAppSelector(state => selectPostById(state, postId!))
  // 省略组件逻辑
}
```

```ts title="features/posts/EditPostForm.tsx"
// 省略导入
// highlight-next-line
import { postUpdated, selectPostById } from './postsSlice'

export const EditPostForm = () => {
  const { postId } = useParams()

  // highlight-next-line
  const post = useAppSelector(state => selectPostById(state, postId!))
  // 省略组件逻辑
}
```

注意，来自 `useParams()` 的 `postId` 类型是 `string | undefined`，而 `selectPostById` 期望有效的 `string`。我们用 TS 的 `!` 告诉编译器此处不会是 `undefined`。（这样做需要谨慎，但基于路由设置默认只显示这些页面当 URL 中有有效 ID。）

以后我们会一直写类似模式，将选择器放切片里而非内联写在组件中。这不是必须，但推荐这么做！

### 有效使用选择器

用选择器封装数据访问通常是个好主意。理想情况下，组件甚至不必知道值在 Redux `state` 的位置，只需用切片里的选择器。

你还可以创建"memoized"选择器，帮助优化重复渲染和避免不必要的计算，稍后会讲。

但任何抽象都不是万能的，不必在任何地方**每个字段都写选择器**。建议先不写选择器，发现多个组件重复用到相同数据时再补充。

### 可选：在 `createSlice` 内定义选择器

此前我们看到选择器定义为切片文件里的独立函数。有时可以稍微简化，直接在 `createSlice` 内定义选择器。

<DetailedExplanation title="在 createSlice 内定义选择器" >

`createSlice` 需要 `name`、`initialState` 和 `reducers`，可选还有 `extraReducers`。

如果想直接在 `createSlice` 定义选择器，可以传入额外的 `selectors` 字段。`selectors` 是一个类似于 `reducers` 的对象，键名是选择器函数名，值是生成的选择器函数。

**注意，这里写的选择器的 `state` 参数是切片状态(slice state)，**_而非_整个 `RootState`!

示例：

```ts
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    /* 省略 reducer 代码 */
  },
  // highlight-start
  selectors: {
    // 注意这些选择器接受的是 `PostsState`，不是全局 RootState
    selectAllPosts: postsState => postsState,
    selectPostById: (postsState, postId: string) => {
      return postsState.find(post => post.id === postId)
    }
  }
  // highlight-end
})

// highlight-start
export const { selectAllPosts, selectPostById } = postsSlice.selectors
// highlight-end

export default postsSlice.reducer

// highlight-start
// 我们替代了之前单独定义的选择器函数：
// export const selectAllPosts = (state: RootState) => state.posts

// export const selectPostById = (state: RootState, postId: string) =>
//   state.posts.find(post => post.id === postId)

// highlight-end
```

有时候还是需要在切片外写选择器，尤其是当调用其他选择器并需要接受整个 `RootState` 参数，确保类型匹配正确。

</DetailedExplanation>

## 用户和帖子

目前我们只有一个状态切片。逻辑定义在 `postsSlice.ts`，数据存放于 `state.posts`，组件都与帖子相关。真实应用往往有多个状态切片，也有多个“功能文件夹”分别放置 Redux 逻辑及组件。

没有其它人就不是社交应用啦！我们添加记录用户列表的能力，并更新帖子功能使用这些数据。

### 添加用户切片

“用户”这一概念与“帖子”不同，代码和数据要分离。添加新文件夹 `features/users`，放置 `usersSlice` 文件。像帖子切片一样，先添加些初始用户数据方便使用。

```ts title="features/users/usersSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/app/store'

interface User {
  id: string
  name: string
}

const initialState: User[] = [
  { id: '0', name: 'Tianna Jenkins' },
  { id: '1', name: 'Kevin Grant' },
  { id: '2', name: 'Madison Price' }
]

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {}
})

export default usersSlice.reducer

export const selectAllUsers = (state: RootState) => state.users

export const selectUserById = (state: RootState, userId: string | null) =>
  state.users.find(user => user.id === userId)
```

现在我们暂时不会修改用户数据，所以 `reducers` 为空（以后再说）。

同样导入 `usersReducer` 到 store 文件并注册：

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

import postsReducer from '@/features/posts/postsSlice'
// highlight-next-line
import usersReducer from '@/features/users/usersSlice'

export default configureStore({
  reducer: {
    posts: postsReducer,
    // highlight-next-line
    users: usersReducer
  }
})
```

此时根状态形如 `{posts, users}`，与传入的 `reducer` 对象对应。

### 给帖子添加作者

我们的每个帖子都是某个用户写的，添加帖子时应记录是哪位用户。要改变 Redux 状态和 `<AddPostForm>` 组件。

先更新 `Post` 类型，加 `user: string` 字段，存储作者 ID。更新 `initialState` 里的帖子数据也加 `user` 字段，对应示例用户 ID。

再更新对应 reducer，`postAdded` 的 prepare 回调接受用户 ID 作为参数，并加到动作中。同时更新 `postUpdated`，**不修改用户字段**，只更新帖子 ID、标题和内容。定义 `PostUpdate` 类型，只选用这三个字段，作为 `postUpdated` 的 payload。

```ts title="features/posts/postsSlice.ts"
export interface Post {
  id: string
  title: string
  content: string
  user: string
}

// highlight-start
type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>

const initialState: Post[] = [
  { id: '1', title: 'First Post!', content: 'Hello!', user: '0' },
  { id: '2', title: 'Second Post', content: 'More text', user: '2' }
]
// highlight-end

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        state.push(action.payload)
      },
      // highlight-next-line
      prepare(title: string, content: string, userId: string) {
        return {
          payload: {
            id: nanoid(),
            title,
            content,
            // highlight-next-line
            user: userId
          }
        }
      }
    },
    // highlight-next-line
    postUpdated(state, action: PayloadAction<PostUpdate>) {
      const { id, title, content } = action.payload
      const existingPost = state.find(post => post.id === id)
      if (existingPost) {
        existingPost.title = title
        existingPost.content = content
      }
    }
  }
})
```

在 `<AddPostForm>` 里，读取用户列表显示下拉，用选择的用户 ID 传给 `postAdded`。顺便添加表单验证，只有标题内容有实际文本时才允许“保存帖子”：

```tsx title="features/posts/AddPostForm.tsx"
// highlight-next-line
import { selectAllUsers } from '@/features/users/usersSlice'

// 省略其它导入和表单类型

const AddPostForm = () => {
  const dispatch = useAppDispatch()
  // highlight-next-line
  const users = useAppSelector(selectAllUsers)

  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    // 阻止表单提交服务器
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value
    // highlight-next-line
    const userId = elements.postAuthor.value

    // highlight-next-line
    dispatch(postAdded(title, content, userId))

    e.currentTarget.reset()
  }

  // highlight-start
  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))
  // highlight-end

  return (
    <section>
      <h2>添加新帖子</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="postTitle">Post Title:</label>
        <input
          type="text"
          id="postTitle"
          name="postTitle"
          defaultValue=""
          required
        />
        // highlight-start
        <label htmlFor="postAuthor">作者：</label>
        <select id="postAuthor" name="postAuthor" required>
          <option value=""></option>
          {usersOptions}
        </select>
        // highlight-end
        <label htmlFor="postContent">内容：</label>
        <textarea
          id="postContent"
          name="postContent"
          defaultValue=""
          required
        />
        <button>保存帖子</button>
      </form>
    </section>
  )
}
```

现在我们需要在帖子列表和 `<SinglePostPage>` 显示作者名。由于会多处用到，可以做一个 `PostAuthor` 组件，用 userId 作为 prop，查询用户对象，格式化输出用户名：

```tsx title="features/posts/PostAuthor.tsx"
import { useAppSelector } from '@/app/hooks'

import { selectUserById } from '@/features/users/usersSlice'

interface PostAuthorProps {
  userId: string
}

export const PostAuthor = ({ userId }: PostAuthorProps) => {
  const author = useAppSelector(state => selectUserById(state, userId))

  return <span>作者：{author?.name ?? '未知作者'}</span>
}
```

我们来看：各组件都用相同模式。任何组件需要读 Redux 数据，都能用 `useAppSelector` 取所需片段。多数组件能同时访问相同 Redux 数据。

导入 `PostAuthor` 到 `PostsList.tsx` 和 `SinglePostPage.tsx`，用 `<PostAuthor userId={post.user} />` 渲染每条帖子作者。每添加帖子，选定用户即可显示用户名。

## 更多帖子功能

至此，我们可以创建和编辑帖子。下面添加更多实用逻辑。

### 面向帖子存储日期

社交动态通常按帖子创建时间排序，并展示类似“5 小时前”这样的相对时间。为此，我们要记录帖子创建时间 `date` 字段。

像 `post.user` 字段一样，更新 `postAdded` prepare 回调，确保 `post.date` 总是包含在动作中。但不是额外参数，而是 prepare 回调自行获取动作触发时的时间戳。

:::caution

**Redux 动作和状态应只含普通 JS 值，如对象、数组、原始类型。不要把类实例、函数、`Date`/`Map`/`Set` 等非序列化值放入 Redux！**

:::

因为不能直接把 `Date` 实例放进 Redux store，用日期时间字符串保存。初始状态值（用 `date-fns` 减去几分钟模拟时间差）和新的帖子都加入 `date` 字段：

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid } from '@reduxjs/toolkit'
// highlight-next-line
import { sub } from 'date-fns'

const initialState: Post[] = [
  {
    // 省略字段
    content: 'Hello!',
    // highlight-next-line
    date: sub(new Date(), { minutes: 10 }).toISOString()
  },
  {
    // 省略字段
    content: 'More text',
    // highlight-next-line
    date: sub(new Date(), { minutes: 5 }).toISOString()
  }
]

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      reducer(state, action: PayloadAction<Post>) {
        state.push(action.payload)
      },
      prepare(title: string, content: string, userId: string) {
        return {
          payload: {
            id: nanoid(),
            // highlight-next-line
            date: new Date().toISOString(),
            title,
            content,
            user: userId
          }
        }
      }
    }
    // 省略 postUpdated
  }
})
```

也像作者信息一样，我们需要做 `<TimeAgo>` 组件统一展示相对时间。用 `date-fns` utils 解析格式化：

```tsx title="components/TimeAgo.tsx"
import { parseISO, formatDistanceToNow } from 'date-fns'

interface TimeAgoProps {
  timestamp: string
}

export const TimeAgo = ({ timestamp }: TimeAgoProps) => {
  let timeAgo = ''
  if (timestamp) {
    const date = parseISO(timestamp)
    const timePeriod = formatDistanceToNow(date)
    timeAgo = `${timePeriod} 前`
  }

  return (
    <time dateTime={timestamp} title={timestamp}>
      &nbsp; <i>{timeAgo}</i>
    </time>
  )
}
```

### 排序帖子列表

当前 `<PostsList>` 显示帖子顺序和 store 一样，即最早帖子先，新增帖子总加到末尾，因此最新帖总在底部。

社交动态一般最新帖子优先显示，向下滑动看旧帖。即便数据按旧到新保存在 store，`<PostsList>` 内我们可以重新排序，让最新帖子先展示。理论上知道 `state.posts` 已排好序，_可以_用 `reverse()` 颠倒，但保障起见最好显式排序。

因为 `array.sort()` 会修改原数组，需先复制一个 `state.posts`，再排序。这里我们 `post.date` 是日期字符串，直接用字符串比较排序：

```tsx title="features/posts/PostsList.tsx"
// 根据日期字符串逆序排序帖子
// highlight-start
const orderedPosts = posts.slice().sort((a, b) => b.date.localeCompare(a.date))

const renderedPosts = orderedPosts.map(post => {
  // highlight-end
  return (
    // 省略渲染逻辑
  )
})
```

### 帖子表情按钮

我们的帖子现在很无聊。让我们来点花样，给帖子加上传情表情按钮？🎉

在 `<PostsList>` 和 `<SinglePostPage>` 底部添加一排表情按钮，每点击一个，就在 Redux store 对应帖子对应的计数加一。由于反应计数在 Redux store，不管在哪部分界面查看，展示应保持一致。

#### 在帖子数据追踪表情计数

我们还没有 `post.reactions` 字段，得更新初始帖数据和 `postAdded` prepare 回调，确保每帖都有 `reactions: {thumbsUp: 0, tada: 0, heart: 0, rocket: 0, eyes: 0}` 结构。

接着定义新的 reducer 处理用户点表情，知道帖子 ID 和表情类型，`action.payload` 是 `{id, reaction}` 对象。reducer 找对应帖子，更新对应表情计数。

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { sub } from 'date-fns'

// highlight-start
export interface Reactions {
  thumbsUp: number
  tada: number
  heart: number
  rocket: number
  eyes: number
}

export type ReactionName = keyof Reactions
// highlight-end

export interface Post {
  id: string
  title: string
  content: string
  user: string
  date: string
  // highlight-next-line
  reactions: Reactions
}

type PostUpdate = Pick<Post, 'id' | 'title' | 'content'>

// highlight-start
const initialReactions: Reactions = {
  thumbsUp: 0,
  tada: 0,
  heart: 0,
  rocket: 0,
  eyes: 0
}
// highlight-end

const initialState: Post[] = [
  // 省略初始状态
]

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // 省略其他 reducers
    // highlight-start
    reactionAdded(
      state,
      action: PayloadAction<{ postId: string; reaction: ReactionName }>
    ) {
      const { postId, reaction } = action.payload
      const existingPost = state.find(post => post.id === postId)
      if (existingPost) {
        existingPost.reactions[reaction]++
      }
    }
    // highlight-end
  }
})

// highlight-next-line
export const { postAdded, postUpdated, reactionAdded } = postsSlice.actions
```

如前所述，**`createSlice` 让你可以写看似“可变”逻辑的 reducer**。若不用 `createSlice` 和 Immer，`existingPost.reactions[reaction]++` 会真的改写旧对象，极易出错。但有了 `createSlice`，你写简单直观的代码，Immer 会帮你完成安全的不可变更新。

同时注意，动作对象只包含最小足够信息描述“发生了什么”——知道哪个帖子，哪个表情被点。理论上可以把表情计数新值计算好放动作，但**保持动作简洁，将状态更新逻辑放入 reducer 是更优做法**。实际上**更新状态计算逻辑_应该在_ reducer 里完成!**。这避免在组件重复逻辑或 UI 无最新数据导致的 BUG。

:::info

使用 Immer 时，要么写“可变”状态更新，要么返回新状态，但不要两者同时。更多查看 Immer 文档 [陷阱](https://immerjs.github.io/immer/pitfalls) 和 [返回新数据](https://immerjs.github.io/immer/return)。

:::

#### 显示表情按钮

同作者和时间戳一样，我们想所有帖子显示，都用一个 `<ReactionButtons>` 组件，其接受 `post` 作为 prop。用户点击按钮时派发 `reactionAdded` 动作带上表情名。

```tsx title="features/posts/ReactionButtons.tsx"
import { useAppDispatch } from '@/app/hooks'

import type { Post, ReactionName } from './postsSlice'
import { reactionAdded } from './postsSlice'

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
  const dispatch = useAppDispatch()

  const reactionButtons = Object.entries(reactionEmoji).map(
    ([stringName, emoji]) => {
      // 确保 TS 知道这是特定字符串类型
      const reaction = stringName as ReactionName
      return (
        <button
          key={reaction}
          type="button"
          className="muted-button reaction-button"
          onClick={() => dispatch(reactionAdded({ postId: post.id, reaction }))}
        >
          {emoji} {post.reactions[reaction]}
        </button>
      )
    }
  )

  return <div>{reactionButtons}</div>
}
```

现在，点表情按钮计数会增加。切换到应用不同页面，帖子的计数都保持一致。因为每个组件都从同一 Redux store 读取数据。

## 添加用户登录

这一部分还有最后一个功能。

现在我们仅仅在 `<AddPostForm>` 选择哪个用户写帖子。更真实点，我们应该让用户先登录，知道是谁写帖子（方便后续功能）。

本示例不会实现真正的身份验证（重在学 Redux 功能，不是实现真实认证），而是显示用户名列表供用户选一个。

我们添加一个 `auth` 切片，追踪 `state.auth.username`，记录当前用户。然后用这个信息添加帖子。

### 添加 Auth 切片

第一步，写 `authSlice` 并纳入 store。模式和以往熟悉一样——定义初始状态，写切片包含登录登出两个 reducer，添加切片 reducer 到 store。

此处 auth 状态只保存当前用户名，登出时设为 `null`：

```ts title="features/auth/authSlice.ts"
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  username: string | null
}

const initialState: AuthState = {
  // 真实应用可能更复杂，本示例简化处理
  username: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    userLoggedIn(state, action: PayloadAction<string>) {
      state.username = action.payload
    },
    userLoggedOut(state) {
      state.username = null
    }
  }
})

export const { userLoggedIn, userLoggedOut } = authSlice.actions

export const selectCurrentUsername = (state: RootState) => state.auth.username

export default authSlice.reducer
```

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

// highlight-next-line
import authReducer from '@/features/auth/authSlice'
import postsReducer from '@/features/posts/postsSlice'
import usersReducer from '@/features/users/usersSlice'

export const store = configureStore({
  reducer: {
    // highlight-next-line
    auth: authReducer,
    posts: postsReducer,
    users: usersReducer
  }
})
```

### 添加登录页面

目前应用主页面是 `<Posts>` 组件，显示帖子列表和添加表单。我们改成先显示登录页面，只有登录成功才能查看帖子页。

先写 `<LoginPage>` 组件，读取用户列表显示下拉，表单提交时派发 `userLoggedIn`，并导航到 `/posts` 页面查看 `<PostsMainPage>`：

```tsx title="features/auth/LoginPage.tsx"
import React from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectAllUsers } from '@/features/users/usersSlice'

import { userLoggedIn } from './authSlice'

interface LoginPageFormFields extends HTMLFormControlsCollection {
  username: HTMLSelectElement
}
interface LoginPageFormElements extends HTMLFormElement {
  readonly elements: LoginPageFormFields
}

export const LoginPage = () => {
  const dispatch = useAppDispatch()
  const users = useAppSelector(selectAllUsers)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent<LoginPageFormElements>) => {
    e.preventDefault()

    const username = e.currentTarget.elements.username.value
    dispatch(userLoggedIn(username))
    navigate('/posts')
  }

  const usersOptions = users.map(user => (
    <option key={user.id} value={user.id}>
      {user.name}
    </option>
  ))

  return (
    <section>
      <h2>欢迎使用 Tweeter！</h2>
      <h3>请登录：</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">用户：</label>
        <select id="username" name="username" required>
          <option value=""></option>
          {usersOptions}
        </select>
        <button>登录</button>
      </form>
    </section>
  )
}
```

然后修改 `<App>` 的路由。根路径 `/` 显示 `<LoginPage>`，未授权访问其他页面重定向到登录页。

常用做法是添加“受保护路由”组件，接受 `children`，执行授权检查，授权通过才显示子组件。我们写 `<ProtectedRoute>` 组件，读取 `state.auth.username` 判断身份，包裹帖子相关路由：

```tsx title="App.tsx"
// highlight-next-line
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate
} from 'react-router-dom'

// highlight-next-line
import { useAppSelector } from './app/hooks'
import { Navbar } from './components/Navbar'
// highlight-next-line
import { LoginPage } from './features/auth/LoginPage'
import { PostsMainPage } from './features/posts/PostsMainPage'
import { SinglePostPage } from './features/posts/SinglePostPage'
import { EditPostForm } from './features/posts/EditPostForm'

// highlight-next-line
import { selectCurrentUsername } from './features/auth/authSlice'

// highlight-start
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const username = useAppSelector(selectCurrentUsername)

  if (!username) {
    return <Navigate to="/" replace />
  }

  return children
}
// highlight-end

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          // highlight-start
          <Route path="/" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/posts" element={<PostsMainPage />} />
                  <Route path="/posts/:postId" element={<SinglePostPage />} />
                  <Route path="/editPost/:postId" element={<EditPostForm />} />
                </Routes>
              </ProtectedRoute>
            }
          />
          // highlight-end
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

现在我们可以体验：

- 未登录时访问 `/posts`，`<ProtectedRoute>` 会跳转回 `/` 展示 `<LoginPage>`
- 正常登录后派发 `userLoggedIn()` 更新状态，跳转 `/posts`，这时 `<ProtectedRoute>` 会展示帖子页面

### 在 UI 展示当前用户

既然登录了，我们可以在导航栏显示用户名，并给用户一个登出按钮。

我们要从 store 获取当前用户对象，以显示 `user.name`。通过先从 auth 切片取当前用户名，再用它查用户对象。写成复用的 `selectCurrentUser` 选择器，放入 `usersSlice.ts`，依赖于 `authSlice.ts` 的 `selectCurrentUsername`：

```ts title="features/users/usersSlice.ts"
// highlight-next-line
import { selectCurrentUsername } from '@/features/auth/authSlice'

// 省略切片及选择器其它部分

// highlight-start
export const selectCurrentUser = (state: RootState) => {
  const currentUsername = selectCurrentUsername(state)
  return selectUserById(state, currentUsername)
}
// highlight-end
```

组合选择器很方便，能复用。

同样，选出当前用户对象，显示其信息，给登出按钮绑定派发 `userLoggedOut()`：

```tsx title="components/Navbar.tsx"
import { Link } from 'react-router-dom'

// highlight-start
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { userLoggedOut } from '@/features/auth/authSlice'
import { selectCurrentUser } from '@/features/users/usersSlice'

import { UserIcon } from './UserIcon'
// highlight-end

export const Navbar = () => {
  // highlight-start
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  const isLoggedIn = !!user

  let navContent: React.ReactNode = null

  if (isLoggedIn) {
    const onLogoutClicked = () => {
      dispatch(userLoggedOut())
    }

    navContent = (
      <div className="navContent">
        <div className="navLinks">
          <Link to="/posts">帖子</Link>
        </div>
        <div className="userDetails">
          <UserIcon size={32} />
          {user.name}
          <button className="button small" onClick={onLogoutClicked}>
            登出
          </button>
        </div>
      </div>
    )
  }
  // highlight-end

  return (
    <nav>
      <section>
        <h1>Redux 必备示例</h1>
        {navContent}
      </section>
    </nav>
  )
}
```

最后，应把 `<AddPostForm>` 也改成使用当前登录的用户名，不再显示用户选择下拉。删除所有对 `postAuthor` 的引用，用 `useAppSelector` 读取当前用户名：

```tsx title="features/posts/AddPostForm.tsx"
export const AddPostForm = () => {
  const dispatch = useAppDispatch()
  // highlight-next-line
  const userId = useAppSelector(selectCurrentUsername)!

  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    // 阻止表单提交到服务器
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value
    // highlight-next-line
    // 删除了组件中与 `postAuthor` 相关的所有字段和引用

    dispatch(postAdded(title, content, userId))

    e.currentTarget.reset()
  }
```

此外，只有帖子作者本人可以编辑帖子。我们可以更新 `<SinglePostPage>` 中仅当当前用户和帖子作者匹配时显示“编辑帖子”按钮：

```tsx title="features/posts/SinglePostPage.tsx"
// highlight-next-line
import { selectCurrentUsername } from '@/features/auth/authSlice'

export const SinglePostPage = () => {
  const { postId } = useParams()

  const post = useAppSelector(state => selectPostById(state, postId!))
  // highlight-next-line
  const currentUsername = useAppSelector(selectCurrentUsername)!

  if (!post) {
    return (
      <section>
        <h2>找不到帖子！</h2>
      </section>
    )
  }

  // highlight-next-line
  const canEdit = currentUsername === post.user

  return (
    <section>
      <article className="post">
        <h2>{post.title}</h2>
        <div>
          <PostAuthor userId={post.user} />
          <TimeAgo timestamp={post.date} />
        </div>
        <p className="post-content">{post.content}</p>
        <ReactionButtons post={post} />
        // highlight-start
        {canEdit && (
          <Link to={`/editPost/${post.id}`} className="button">
            编辑帖子
          </Link>
        )}
        // highlight-end
      </article>
    </section>
  )
}
```

## 登出时清空其他状态

还有一部分和授权处理有关。现在如果用户 A 登录并创建帖子，然后登出，用户 B 登录后会看到例子里已有帖子和新帖子。

这“正确”，Redux 已根据现有代码行为正常工作。我们更新了 posts 状态，页面没刷新，所以数据还存在内存里。但从应用逻辑和隐私角度看很糟。用户 B 除非与 A 关联，否则不应该看到 A 的帖子；多用户共享电脑时更是如此。

因此登出时，应该清空现有帖子状态。

### 多切片响应相同动作

迄今为止，新增状态更新时都定义个新 reducer，导出对应动作，组件派发动作。我们_可以_这样做，但会连续派发两个动作：

```ts
dispatch(userLoggedOut())
// highlight-start
// 这种做法让行为重复了
dispatch(clearUserData())
// highlight-end
```

每派发一动作，都会跑一轮全局 reducer 运行、通知 UI 更新，正常，但连续派发两个通常说明逻辑可优化。

`userLoggedOut()` 是 auth 切片动作。我们希望 posts 切片也能监听它。

之前讲过，动作是$app 中发生事件$的描述，而非命令状态怎样设置。这就是例子。其实我们不需要 `clearUserData` 额外动作，因为事件只发生了一件：“用户登出”。只需每个切片都能响应该动作，更新自身状态。

### 使用 `extraReducers` 监听其他动作

`createSlice` 接受 `extraReducers` 选项，允许一个切片监听应用其他地方定义的动作。任何派发该动作时，该切片也能更新状态。也就是说，**多个切片 reducer 可以响应同一动作，各自更新自身状态**。

`extraReducers` 是一个函数，参数是 `builder`。`builder` 有三个方法：

- `builder.addCase(actionCreator, caseReducer)`：监听单一动作
- `builder.addMatcher(matcherFunction, caseReducer)`：监听多动作，使用 Redux Toolkit 的“匹配器”功能
- `builder.addDefaultCase(caseReducer)`：默认 case，所有其他未匹配动作都会走

这些方法可链式调用。

因此，我们可以导入 `userLoggedOut` 动作到 `postsSlice.ts`，在 `extraReducers` 里监听这个动作，返回空数组清空 `posts` 状态，登出时重置帖子列表：

```ts title="features/posts/postsSlice.ts"
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit'
import { sub } from 'date-fns'

// highlight-next-line
import { userLoggedOut } from '@/features/auth/authSlice'

// 省略初始状态和类型

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    postAdded: {
      // 省略 postAdded 和其他 reducer
  },
  // highlight-start
  extraReducers: (builder) => {
    // 传入动作创建函数给 builder.addCase()
    builder.addCase(userLoggedOut, (state) => {
      // 用户登出时清空帖子列表
      return []
    })
  },
  // highlight-end
})
```

我们用 `builder.addCase(userLoggedOut, caseReducer)`。此处 reducer 可以写“可变”代码，也可直接返回新状态。这里简单起见，返回空数组替换旧的帖子状态。

现在点“登出”按钮后再用另一个用户登录，帖子列表应该为空。成功实现登出时清空帖子。

:::tip `reducers` 与 `extraReducers` 有何区别？

`createSlice` 内的 `reducers` 和 `extraReducers` 用途不同：

- `reducers` 通常是对象。每个 case reducer 同时生成动作创建函数和动作类型字符串。**用 `reducers` 定义 slice 的新动作及对应 reducer**。
- `extraReducers` 是函数，使用 `builder.addCase()`、`builder.addMatcher()` 监听应用其他地方定义的动作，**用 `extraReducers` 处理 slice 外定义的动作**。

:::

## 你学到了什么

本节内容丰富！现在我们可以查看和编辑单条帖子，看到作者，添加表情反应，并实现用户登录登出。

改动后应用示例如下：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-2-authHandling?fontsize=14&hidenavigation=1&module=%2fsrc%2Ffeatures%2Fposts%2FpostsSlice.ts&theme=dark&runonclick=1"
  title="redux-essentials-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

我们的例子开始变得有趣且实用了！

总结本节重要内容：

:::tip 总结

- **任何 React 组件都可以按需读取 Redux store 中的数据**
  - 组件能读取 store 中任意数据
  - 多个组件能同时读取同一数据
  - 组件应只提取渲染所需的最小数据量
  - 组件能结合 props、state 和 store 数据决定 UI
  - 组件可以派发动作触发状态更新
- **Redux 动作创建器能准备带有效载荷的动作对象**
  - `createSlice` 和 `createAction` 支持“prepare 回调”
  - 唯一 ID 和随机值应放动作，不在 reducer 中计算
- **状态更新逻辑应写在 reducer 中**
  - reducer 可包含任意计算新状态的逻辑
  - 动作携带描述事件发生的必要信息即可
- **可写复用的选择器函数封装读取 Redux 状态逻辑**
  - 选择器函数接受 Redux `state`，返回需要数据
- **动作应理解为描述“发生的事件”，多个 reducer 可响应同一动作**
  - 应用通常每次只派发一个动作
  - reducer 名称与动作建议用过去式，如 `postAdded`
  - 多个切片 reducer 可响应同一动作，各自更新状态
  - `createSlice.extraReducers` 允许监听切片外定义的动作
  - 状态可通过返回新值替换，而非变更旧状态，实现重置

:::

## 接下来？

目前你应该对 Redux store 与 React 组件中处理数据游刃有余了。迄今为止，我们仅使用初始状态或用户添加的数据。

在[第五部分：异步逻辑和数据获取](./part-5-async-logic.md)，我们将学习如何处理服务器 API 拉取的数据。