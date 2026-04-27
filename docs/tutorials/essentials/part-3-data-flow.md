---
id: part-3-data-flow
title: 'Redux 必备知识，第3部分：Redux基础数据流'
sidebar_label: 'Redux基础数据流'
description: 'Redux官方必备教程：学习React + Redux应用中的数据流动方式'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 您将学到

- 如何在React应用中设置Redux存储（store）
- 如何通过 `createSlice` 向Redux存储添加“切片”的reducer逻辑
- 如何使用 `useSelector` 钩子在组件中读取Redux数据
- 如何使用 `useDispatch` 钩子在组件中派发actions

:::

:::info 前提知识

- 熟悉Redux的核心术语和概念，如“actions”、“reducers”、“store”和“dispatch”。（相关术语解释请参见[**第1部分：Redux概述与概念**](./part-1-overview-concepts.md)）
- 基本了解[TypeScript语法与用法](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

:::

## 介绍

在[第1部分：Redux概述与概念](./part-1-overview-concepts.md)中，我们讨论了Redux如何通过提供一个集中管理全局应用状态的单一存储点，帮助我们构建可维护的应用。我们还讲解了核心Redux概念，如派发action对象、使用返回新状态值的reducer函数，以及通过thunks编写异步逻辑。在[第2部分：Redux Toolkit应用结构](./part-2-app-structure.md)中，我们看到了Redux Toolkit的`configureStore`和`createSlice`，以及React-Redux的`Provider`和`useSelector`如何配合使用，让我们在React组件中编写和交互Redux逻辑。

现在您对这些部分已有了一定了解，接下来是将知识付诸实践。我们将构建一个小型社交媒体动态APP，包含多个功能，展示一些实际用途场景，帮助您理解如何在自己的应用中使用Redux。

我们将使用[TypeScript](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)语法编写代码。您也可以用纯JavaScript使用Redux，但TypeScript能帮助避免很多常见错误，为代码提供内置文档，并让编辑器在React组件和Redux reducers中提示变量类型。**我们强烈建议所有Redux项目使用TypeScript。**

:::caution

示例应用不代表完整的生产级项目，目的是帮助您学习Redux API和典型用法，通过有限示例指明方向。且我们在后续章节会更新初始实现，展示更优做法。**请完整阅读本教程，了解所有概念的应用。**

:::

### 项目搭建

为本教程我们准备了一个预配置的起始项目，已经集成了React和Redux，包含了一些默认样式，并提供了假REST API接口，让我们能在应用中编写真实的API请求。您将基于此进行实际代码开发。

开始前，您可以在此打开并fork此CodeSandbox：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-0-setup/?&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-essentials-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

您也可以[从此Github仓库克隆相同项目](https://github.com/reduxjs/redux-essentials-example-app)。项目配置使用[Yarn 4](https://yarnpkg.com/)作为包管理器，但您可以使用任意包管理器（[NPM](https://docs.npmjs.com/cli/v10)、[PNPM](https://pnpm.io/)或[Bun](https://bun.sh/docs/cli/install)）根据喜好。安装完依赖后，使用`yarn dev`命令启动本地开发服务器。

若想查看我们将构建的最终版本，可访问[**`tutorial-steps-ts`分支**](https://github.com/reduxjs/redux-essentials-example-app/tree/tutorial-steps-ts)，或[在此CodeSandbox查看最终版本](https://codesandbox.io/s/github/reduxjs/redux-essentials-example-app/tree/tutorial-steps-ts)。

> 特别感谢[Tania Rascia](https://www.taniarascia.com/)的[《在React中使用Redux》](https://www.taniarascia.com/redux-react-guide/)教程，启发了本页面示例。示例中也使用了她的[Primitive UI CSS样式起始模板](https://taniarascia.github.io/primitive/)。

#### 创建新的Redux + React项目

完成本教程后，您可能想尝试自行开发项目。**我们推荐使用[Vite和Next.js的Redux模板](../../introduction/Installation.md#create-a-react-redux-app)作为创建新Redux + React项目的最快方式**。这些模板内置了Redux Toolkit和React-Redux，且使用了[您在第1部分里见过的相同“计数器”示例](./part-1-overview-concepts.md)，让您无需添加Redux包和设置store即可直接编写应用代码。

#### 探索初始项目

简单介绍初始项目内容：

- `/public`：基础CSS样式和其他静态文件如图标
- `/src`
  - `main.tsx`：应用入口文件，渲染`<App>`组件。本示例中，也在页面加载时设置了假REST API。
  - `App.tsx`：主应用组件，渲染顶部导航栏并处理客户端路由
  - `index.css`：整个应用的样式
  - `/api`
    - `client.ts`：封装了`fetch`的客户端，支持HTTP GET和POST请求
    - `server.ts`：模拟REST API接口，应用稍后将通过该接口获取数据
  - `/app`
    - `Navbar.tsx`：渲染顶部标题栏和导航菜单

目前加载应用，您应该能看到顶部标题和欢迎信息，但没有其他功能。

准备好后，我们开始吧！

## 设置Redux存储

当前项目为空，需要首先进行Redux相关的单次配置。

### 添加Redux依赖包

打开`package.json`，您会看到已安装了使用Redux所需的两个包：

- `@reduxjs/toolkit`：最新Redux包，包含构建应用用的所有Redux函数
- `react-redux`：React组件连接Redux存储所需功能

如果您是新建项目，请自行添加以上依赖包。

### 创建Store

第一步是创建Redux store。**Redux设计原则之一是整个应用只应有一个store实例。**

我们通常单独创建并导出Redux store实例。应用的文件夹结构由您决定，但一般将应用范围内的配置放在`src/app/`文件夹中。

这里我们在`src/app/store.ts`文件里创建store。

**Redux Toolkit 提供了一个`configureStore`方法**，它创建Redux store实例。该函数支持多个选项，可以更改store行为。它还自动应用了最常用的配置（包括帮您检测常见错误，以及启用Redux DevTools扩展，方便查看状态内容和操作历史）。

```ts title="src/app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
import type { Action } from '@reduxjs/toolkit'

interface CounterState {
  value: number
}

// 一个示例的slice reducer函数，演示Redux reducer的工作方式。
// 我们很快会用真实应用逻辑替换这里。
function counterReducer(state: CounterState = { value: 0 }, action: Action) {
  switch (action.type) {
    // 处理actions
    default: {
      return state
    }
  }
}

// highlight-start
export const store = configureStore({
  // 将根reducer作为`reducer`参数传入
  reducer: {
    // 声明 `state.counter` 会由 `counterReducer` 管理
    counter: counterReducer
  }
})
// highlight-end
```

**`configureStore`总是需要一个`reducer`选项**，通常是包含多个“slice reducers”的对象（分别管理应用不同状态片段）。（如果需要，也可以自行创建根reducer函数，然后传给`reducer`参数。）

这一步，我们传入了一个模拟的`counter`切片reducer函数，演示设置流程。很快会用实际需要的切片替换它。

:::tip Next.js的设置

如果您用的是Next.js，配置稍复杂。具体可见[Next.js下的设置](../../usage/nextjs.mdx)文档。

:::

### 提供Store给React组件

Redux本身是纯JS库，支持任何UI层。我们用的是React，所以要使React组件能访问Redux store。

实现方式是用React-Redux库的`<Provider>`组件包裹应用，并传入store。该组件利用[React Context API](https://react.dev/learn/passing-data-deeply-with-context)将store传递给整个组件树。

:::tip

切记**不要直接在其他应用文件里导入Redux store！** 因为应用只有一个store，直接引入可能引发循环依赖（如A导入B，B导入C，C又导入A），导致难以追踪的bug。此外，我们希望[为组件和Redux逻辑编写测试](../../usage/WritingTests.mdx)，这些测试会创建各自的store实例。通过Context提供store维持灵活性，避免导入问题。

:::

操作方式是：在入口文件`main.tsx`导入store，用`<Provider store={store}>`包裹`<App>`组件：

```tsx title="src/main.tsx"
import { createRoot } from 'react-dom/client'
// highlight-next-line
import { Provider } from 'react-redux'

import App from './App'
// highlight-next-line
import { store } from './app/store'

// 跳过mock API设置

const root = createRoot(document.getElementById('root')!)

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

### 查看Redux状态

有了store，我们可以用Redux DevTools扩展查看当前Redux状态。

打开浏览器开发者工具（右击页面任意处，选择“检查”），进入“Redux”标签页。这里显示了派发动作历史和当前状态值：

![Redux DevTools: 初始应用状态](/img/tutorials/essentials/devtools-initial.png)

当前状态应为一个对象，结构类似：

```ts
{
  counter: {
    value: 0
  }
}
```

该结构由传入`configureStore`的`reducer`参数定义：对象中有个叫`counter`的字段，`counterReducer`返回的状态对象形如`{value}`。

### 导出Store的类型

由于我们使用TypeScript，需要经常引用“Redux state类型”和“store中dispatch函数类型”。

这些类型需从`store.ts`文件导出。通过TS的`typeof`操作符推断store类型：

```ts title="src/app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

// 省略counter切片的代码

export const store = configureStore({
  reducer: {
    counter: counterReducer
  }
})

// highlight-start
// 推断`store`的类型
export type AppStore = typeof store
// 推断`AppDispatch`类型，来自store.dispatch
export type AppDispatch = typeof store.dispatch
// 同理推断`RootState`类型
export type RootState = ReturnType<typeof store.getState>
// highlight-end
```

将鼠标悬停在`RootState`类型处，编辑器会显示`type RootState = { counter: CounterState; }`。类型自动从store推断，将随`reducer`改动自动更新，避免重复定义且保证准确。

### 导出带类型的Hooks

我们要在组件中广泛使用React-Redux的`useSelector`和`useDispatch`钩子。它们需要正确引用`RootState`和`AppDispatch`类型。

为简化使用、防止重复，设定带类型的预设钩子非常有用。

React-Redux 9.1版本包含`.withTypes()`方法，帮我们给钩子加上类型。定义并导出这些钩子，在应用其他部分调用：

```ts title="src/app/hooks.ts"
// 本文件作为重新导出带类型Redux钩子的中心
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './store'

// highlight-start
// 应用中统一使用它们替代原始hooks
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
// highlight-end
```

至此，配置完成。开始构建应用吧！

## 主要帖子列表

社交媒体动态应用的核心功能是帖子的列表。我们后续会添加更多功能，先实现页面展示帖子列表。

### 创建帖子切片

第一步是创建Redux“切片”，存储帖子数据。

**“切片”是单个功能相关的Redux reducer逻辑和actions集合**，通常写在同个文件里。名字源自将根状态拆分成多个“切片”。

拿到帖子数据后，就能创建React组件在页面显示。

在`src`下创建新文件夹`features`，它下面建`posts`文件夹，再添加新的`postsSlice.ts`文件。

使用Redux Toolkit的`createSlice`方法创建处理帖子数据的reducer函数。reducer必须有初始状态，保证store启动时有数据。

先创建含假帖子数据的数组，用于UI开发。

导入`createSlice`，定义初始posts数组，将其传给`createSlice`，导出切片生成的reducer：

```ts title="features/posts/postsSlice.ts"
import { createSlice } from '@reduxjs/toolkit'

// 定义数据的TS类型
export interface Post {
  id: string
  title: string
  content: string
}

// 定义类型一致的初始状态
const initialState: Post[] = [
  { id: '1', title: 'First Post!', content: 'Hello!' },
  { id: '2', title: 'Second Post', content: 'More text' }
]

// 创建切片并传入初始状态
const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {}
})

// 导出生成的reducer函数
export default postsSlice.reducer
```

每次新建切片，都要将其reducer添加进Redux store。之前创建store文件，现在修改它，导入`postsReducer`，移除之前的`counter`代码，用`postsReducer`替代，并把它赋予`posts`字段：

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'

// highlight-next-line
// 移除了 `counterReducer`、`CounterState`类型和`Action`导入

// highlight-next-line
import postsReducer from '@/features/posts/postsSlice'

export const store = configureStore({
  reducer: {
    // highlight-next-line
    posts: postsReducer
  }
})
```

这告诉Redux，我们希望顶层状态有个`posts`字段，对应所有数据由`postsReducer`管理。

打开Redux DevTools，确认状态如下：

![初始帖子状态](/img/tutorials/essentials/example-initial-posts.png)

### 显示帖子列表

既然store有了帖子数据，就创建React组件显示它们。所有和帖子feed相关代码放在`posts`文件夹，新建`PostsList.tsx`文件。（此为TypeScript加JSX语法React组件，须用`.tsx`后缀）

要渲染帖子列表，得先从哪儿拿数据。组件里用React-Redux库的`useSelector`钩子从Redux store读数据。写selector函数，参数是整个Redux `state`，返回组件需要的特定数据。

用TypeScript时，应使用我们在`src/app/hooks.ts`定义的预设钩子`useAppSelector`，它已有正确的`RootState`类型。

初始`PostsList`组件从store读取`state.posts`数组，遍历后在屏幕显示：

```tsx title="features/posts/PostsList.tsx"
// highlight-next-line
import { useAppSelector } from '@/app/hooks'

export const PostsList = () => {
  // highlight-start
  // 从store选择`state.posts`数据到组件
  const posts = useAppSelector(state => state.posts)
  // highlight-end

  const renderedPosts = posts.map(post => (
    <article className="post-excerpt" key={post.id}>
      <h3>{post.title}</h3>
      <p className="post-content">{post.content.substring(0, 100)}</p>
    </article>
  ))

  return (
    <section className="posts-list">
      <h2>Posts</h2>
      {renderedPosts}
    </section>
  )
}
```

修改`App.tsx`里的路由，显示`PostsList`组件替代“欢迎”文字。导入`PostsList`，将欢迎信息替换为`<PostsList />`，用[React Fragment](https://react.dev/reference/react/Fragment)包裹，因稍后会添加更多内容：

```tsx title="App.tsx"
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import { Navbar } from './components/Navbar'
// highlight-next-line
import { PostsList } from './features/posts/PostsList'

function App() {
  return (
    <Router>
      <Navbar />
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              // highlight-start
              <>
                <PostsList />
              </>
              // highlight-end
            }
          ></Route>
        </Routes>
      </div>
    </Router>
  )
}

export default App
```

完成后主页面显示帖子列表：

![初始帖子列表](/img/tutorials/essentials/working_post_list.png)

进步！已在Redux store中添加数据，并在React组件中渲染。

### 添加新帖子

浏览别人发的帖子不错，但我们也希望能自己写帖子。创建“新增帖子”表单，允许输入并保存。

先建空表单放页面。随后连接到Redux store，实现点击“保存帖子”时新增帖子。

#### 添加新增帖子表单

在`posts`文件夹创建`AddPostForm.tsx`。包含一个文本输入框用作标题，和一个文本域输入正文：

```tsx title="features/posts/AddPostForm.tsx"
import React from 'react'

// 表单输入字段的TS类型
// 参考：https://epicreact.dev/how-to-type-a-react-form-on-submit-handler/
interface AddPostFormFields extends HTMLFormControlsCollection {
  postTitle: HTMLInputElement
  postContent: HTMLTextAreaElement
}
interface AddPostFormElements extends HTMLFormElement {
  readonly elements: AddPostFormFields
}

export const AddPostForm = () => {
  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    // 阻止表单提交跳转
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    console.log('Values: ', { title, content })

    e.currentTarget.reset()
  }

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
        <label htmlFor="postContent">Content:</label>
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

注意：这里没用Redux逻辑，接下来再加。

此示例使用“非受控”输入（uncontrolled inputs），并依靠HTML5表单验证防止提交空字段，您也可自由选择表单数据的读取方式，该选择与Redux无关。

导入该组件到`App.tsx`，放在`<PostsList />`上方：

```tsx title="App.tsx"
// 省略外层App定义
<Route
  path="/"
  element={
    <>
      // highlight-next-line
      <AddPostForm />
      <PostsList />
    </>
  }
></Route>
```

页面应显示表单在标题栏下方。

#### 保存帖子数据

接下来，修改posts切片来新增帖子项。

posts切片负责管理posts数据的所有更新。`createSlice`调用内有个`reducers`对象，目前为空。要添加`postAdded`函数，用于处理新增帖子。

`postAdded`接收两个参数：当前`state`与派发的`action`对象。posts切片仅管自身数据，因此`state`即帖子数组。`action.payload`是传入的新帖子内容。需用Redux Toolkit的`PayloadAction`类型声明`action`参数，指定`action.payload`的类型为`Post`。

更新state的操作是将新帖追加到数组，调用`state.push()`即可。

:::warning

注意：**Redux reducer必须不可变地创建新state！** 在`createSlice`内安全调用`push()`、赋值等“变更语句”，因它内置了Immer库，会转成安全的不可变更新。**但不要在`createSlice`外直接写类似变更代码！**

:::

定义`postAdded`后，`createSlice`会自动生成同名[动作创建器 (action creator)](../fundamentals/part-7-standard-patterns.md#action-creators)，导出它，方便组件派发动作。

```ts title="features/posts/postsSlice.ts"
// highlight-start
// 导入PayloadAction类型
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// highlight-end

// 省略初始状态

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    // highlight-start
    // 声明名为`postAdded`的case reducer
    // action.payload类型为Post对象
    postAdded(state, action: PayloadAction<Post>) {
      // 在这里“变更”已有状态数组
      // 由于createSlice内置Immer，此操作安全
      state.push(action.payload)
    }
    // highlight-end
  }
})

// highlight-start
// 导出自动生成的action creator
export const { postAdded } = postsSlice.actions
// highlight-end

export default postsSlice.reducer
```

该函数示范了**“case reducer”**概念：slice中的reducer函数，针对单一action类型写的处理函数。等价于`switch`语句中的一个`case`：

```ts
function sliceReducer(state = initialState, action) {
  switch (action.type) {
    case 'posts/postAdded': {
      // 更新逻辑
    }
  }
}
```

#### 派发“新增帖子”动作

我们的`AddPostForm`有输入框和“保存”按钮，触发提交事件，但目前按钮无操作。需更新提交处理函数，调用`postAdded`动作创建器派发动作，将用户输入的帖子数据传入。

帖子也必须有唯一`id`。示例中的测试帖子用序号作ID。生成唯一ID方案有很多，Redux Toolkit内置`nanoid`函数生成随机ID，直接用它。

:::info

稍后[第4部分：使用Redux数据](./part-4-using-data.md)会详细讲ID生成和派发动作。

:::

要在组件派发动作，需访问store的`dispatch`函数，用React-Redux的`useDispatch`钩子获取。用TypeScript时，改用我们定义的带类型`useAppDispatch`钩子。别忘了导入`postAdded`动作创建器。

拿到`dispatch`后，表单提交时执行：

```tsx title="features/posts/AddPostForm.tsx"
import React from 'react'
// highlight-start
import { nanoid } from '@reduxjs/toolkit'

import { useAppDispatch } from '@/app/hooks'

import { type Post, postAdded } from './postsSlice'
// highlight-end

// 省略表单类型定义

export const AddPostForm = () => {
  // highlight-start
  // 获取store的dispatch方法
  const dispatch = useAppDispatch()

  // highlight-end

  const handleSubmit = (e: React.FormEvent<AddPostFormElements>) => {
    // 阻止表单默认提交
    e.preventDefault()

    const { elements } = e.currentTarget
    const title = elements.postTitle.value
    const content = elements.postContent.value

    // highlight-start
    // 创建新帖子对象，派发postAdded动作
    const newPost: Post = {
      id: nanoid(),
      title,
      content
    }
    dispatch(postAdded(newPost))
    // highlight-end

    e.currentTarget.reset()
  }

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
        <label htmlFor="postContent">Content:</label>
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

尝试输入标题与正文，点击“保存帖子”，您会发现帖子列表新增了新内容。

**恭喜！您已构建第一个完整的React + Redux应用！**

这体现了完整的Redux数据流：

- 帖子列表通过`useSelector`读store初始帖子数据，渲染UI
- 派发带新帖数据的`postAdded`动作
- posts reducer响应动作，更新posts数组状态
- Redux store通知UI数据变化
- 帖子列表读取更新后数组，重新渲染显示新帖子

后续添加的所有功能都将沿用这个模式：添加状态切片，编写reducer，派发动作，并根据store数据渲染UI。

在Redux DevTools里查看刚刚派发的动作，点选`"posts/postAdded"`，“Action”标签显示：

![postAdded动作内容](/img/tutorials/essentials/example-postAdded-action.png)

“Diff”标签也显示`state.posts`增加了位于索引2的新项。

记住，**Redux store只应保存应用的“全局状态”！** 例如，只有`AddPostForm`需要知道输入框里的临时值。即使用“受控”输入，也应保存在React组件状态或原生HTML输入中。用户完成后再派发Redux动作更新全局store。

## 您已学到

我们搭建了Redux应用的基础：store、切片和reducer，以及派发动作的UI。应用到此为止长这样：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-essentials-example-app/tree/ts-checkpoint-1-postAdded?fontsize=14&hidenavigation=1&module=%2fsrc%2Ffeatures%2Fposts%2FpostsSlice.ts&theme=dark&runonclick=1"
  title="redux-essentials-example"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

本节回顾：

:::tip 总结

- **Redux应用只有一个`store`，通过`<Provider>`组件传递给React组件**
- **Redux状态通过“reducer函数”更新**：
  - reducer不可变地计算新状态（复制旧状态并更新副本）
  - Redux Toolkit的`createSlice`生成“切片reducer”，支持编写看似“变更”的代码，内部使用Immer转成不可变操作
  - 这些切片reducer组合传给`configureStore`的`reducer`字段，定义store结构和字段名
- **React组件用`useSelector`钩子读取store数据**：
  - selector函数接受完整store状态，返回所需数据
  - Redux store每变更，selector会重新运行。若返回数据变更，组件自动重新渲染
- **React组件用`useDispatch`钩子派发动作更新store**：
  - `createSlice`为每个reducer自动生成动作创建器
  - 调用`dispatch(someActionCreator())`派发动作
  - reducer检查动作类型，更新状态后返回新state
  - 临时数据（如表单输入）应保存在React组件状态或HTML输入元素内，完成时派发Redux动作更新store
- **使用TypeScript时，应导出基于store的`RootState`和`AppDispatch`类型，以及带类型的`useSelector`和`useDispatch`钩子**

:::

## 下一步？

了解了Redux数据流，继续阅读[第4部分：使用Redux数据](./part-4-using-data.md)，我们将为应用添加更多功能，展示如何操作已有store数据。
