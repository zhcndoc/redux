---
id: getting-started
title: Redux 入门指南
description: '介绍 > 入门指南：学习和使用 Redux 的资源'
---

import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'

Redux 是一个用于可预测且可维护的全局状态管理的 JavaScript 库。

它帮助你编写行为一致、能够在不同环境（客户端、服务器和原生）运行且易于测试的应用程序。除此之外，它还提供了极佳的开发者体验，比如[结合时间旅行调试器的实时代码编辑](https://github.com/reduxjs/redux-devtools)。

Redux 可以与 [React](https://react.dev) 或其他视图库配合使用。它体积很小（含依赖仅 2KB），同时拥有丰富的扩展生态。

[**Redux Toolkit**](/toolkit) 是我们官方推荐的 Redux 逻辑编写方式。它封装了 Redux 核心，并包含我们认为构建 Redux 应用必不可少的包和函数。Redux Toolkit 内置了我们建议的最佳实践，简化大多数 Redux 任务、防止常见错误，并让 Redux 应用更容易编写。

RTK 提供多种工具来简化常见用例，包括[配置 store](/toolkit/api/configureStore)、[创建 reducer 并编写不可变更新逻辑](/toolkit/api/createReducer)，甚至[一次性创建完整的状态“slice”](/toolkit/api/createSlice)。

无论你是初次使用 Redux、正在搭建第一个项目的新手，还是希望简化现有应用的资深用户，**[Redux Toolkit](/toolkit)** 都能帮助你改进 Redux 代码。

## 安装

Redux Toolkit 可作为 NPM 包使用，适用于模块打包器或 Node 应用：

```bash
# NPM
npm install @reduxjs/toolkit react-redux

# Yarn
yarn add @reduxjs/toolkit react-redux
```

使用 React + Redux 创建新应用时，推荐使用我们的[官方模板](https://github.com/reduxjs/redux-templates)。模板已预先配置 Redux Toolkit，并附带一个小型示例应用：

```bash
# Vite + TypeScript
npx tiged reduxjs/redux-templates/packages/vite-template-redux my-app
```

完整模板列表（包括 Expo、React Native 和 Next.js）、Redux DevTools 浏览器扩展以及单独安装 Redux 核心包的方法，请参阅[安装](Installation.md)页面。

## 基本示例

应用的全局状态存储在单个 _store_ 中的一个对象树里。  
改变状态树的唯一途径是创建一个 _action_，即描述所发生事情的对象，并 _dispatch_ 它到 store。  
要指定状态如何响应 action 更新，你需要编写纯 _reducer_ 函数，基于旧状态和 action 计算新状态。

Redux Toolkit 简化了编写 Redux 逻辑和设置 store 的过程。使用 Redux Toolkit，基本的应用逻辑如下：

```ts
import { createSlice, configureStore } from '@reduxjs/toolkit'

interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0
}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    incremented: state => {
      // Redux Toolkit 允许我们在 reducers 中写“可变”逻辑。
      // 它实际上并不改变状态，因为它使用 Immer 库，
      // Immer 监测对“草稿状态”的更改，并基于这些更改生成一个全新的不可变状态
      state.value += 1
    },
    decremented: state => {
      state.value -= 1
    }
  }
})

export const { incremented, decremented } = counterSlice.actions

const store = configureStore({
  reducer: counterSlice.reducer
})

// 依然可以订阅 store
store.subscribe(() => console.log(store.getState()))

// 依然通过 dispatch 传递 action 对象，但 action 由我们创建
store.dispatch(incremented())
// {value: 1}
store.dispatch(incremented())
// {value: 2}
store.dispatch(decremented())
// {value: 1}
```

你不直接修改状态，而是通过简单的对象称为 _actions_ 来指定你想执行的变更。然后编写一个特殊函数 _reducer_，决定每个 action 如何转换整个应用的状态。

典型的 Redux 应用只有一个 store 和一个根 reducer。随着应用壮大，你将根 reducer 拆分成多个小 reducer，分别独立操作状态树的不同部分。就像 React 应用只有一个根组件，但它由许多小组件组成一样。

这种架构可能对计数器应用来说显得复杂，但这种模式的美妙之处在于它能很好地扩展到大型复杂应用。它也支持非常强大的开发工具，因为可以追踪每次状态变更由哪个 action 引起。你可以录制用户会话，仅通过回放每个 action 来复现。

Redux Toolkit 使我们能编写更简洁且易读的逻辑，同时保持 Redux 的行为和数据流。

### 传统示例

作比较，Redux 原始的传统语法（无抽象）如下：

```js
import { createStore } from 'redux'

/**
 * 这是一个 reducer — 一个函数，接受当前状态和一个
 * 描述“发生了什么”的 action 对象，返回新的状态值。
 * reducer 的函数签名是：(state, action) => newState
 *
 * Redux 状态应仅包含普通 JS 对象、数组和原始值。
 * 根状态通常是一个对象。重要的是你不应该修改状态对象，
 * 而是在状态变化时返回一个新的对象。
 *
 * 你可以在 reducer 里使用任意条件逻辑，此例中用的是 switch，但不是必需的。
 */
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/incremented':
      return { value: state.value + 1 }
    case 'counter/decremented':
      return { value: state.value - 1 }
    default:
      return state
  }
}

// 创建一个 Redux store 来保存应用状态。
// 它提供的 API 有 { subscribe, dispatch, getState }。
let store = createStore(counterReducer)

// 可以使用 subscribe() 来响应状态变化更新 UI。
// 通常会使用视图绑定库（例如 React Redux），而不是直接调用 subscribe()。
// 但在某些情况下直接订阅也有用。

store.subscribe(() => console.log(store.getState()))

// 变更内部状态的唯一方式是分发 action。
// 这些 action 可被序列化、记录或存储，随后回放。
store.dispatch({ type: 'counter/incremented' })
// {value: 1}
store.dispatch({ type: 'counter/incremented' })
// {value: 2}
store.dispatch({ type: 'counter/decremented' })
// {value: 1}
```

## 学习 Redux

我们提供了许多资源帮助你学习 Redux。

### Redux 必备教程

[**Redux Essentials 教程**](../tutorials/essentials/part-1-overview-concepts.md) 是一个“自上而下”的教程，教授“如何正确使用 Redux”，采用我们的最新推荐 API 和最佳实践。建议从这里开始。

### Redux 基础教程

[**Redux Fundamentals 教程**](../tutorials/fundamentals/part-1-overview.md) 是一个“自下而上”的教程，从基本原理和无抽象的视角讲解“Redux 是如何工作的”，以及为什么存在标准的 Redux 使用模式。

### 现代 Redux 直播

Redux 维护者 Mark Erikson 在“Learn with Jason”节目中讲解我们今日推荐的 Redux 用法。节目中包含了一个现场编码的示例应用，展示如何用 Redux Toolkit 和 React-Redux hooks（含 TypeScript），以及新的 RTK Query 数据获取 API。

文字记录和示例应用源码链接请参阅[“Learn Modern Redux” 节目说明页](https://codetv.dev/series/learn-with-jason/s4/let-s-learn-modern-redux)。

<LiteYouTubeEmbed
    id="9zySeP5vH9c"
    title="学习现代 Redux - Redux Toolkit、React-Redux Hooks 和 RTK Query"
/>

### 其他教程

- Redux 仓库包含多个示例项目，展示了 Redux 的不同用法。几乎每个示例都有对应的 CodeSandbox 在线沙盒，可以交互式体验代码。完整列表请参阅**[示例页面](./Examples.md)**。
- Redux 创建者 Dan Abramov 在 Egghead.io 提供的**免费 [“Redux 入门”视频系列](https://egghead.io/courses/fundamentals-of-redux-course-from-dan-abramov-bd5cc867)**和**[使用惯用 Redux 构建 React 应用](https://egghead.io/courses/building-react-applications-with-idiomatic-redux)**视频课程。这些课程早于 Redux Toolkit，展示了如何手动编写核心 API。它们仍能很好地解释 Redux 的底层工作原理，但建议先阅读 Essentials 教程。
- Redux 维护者 Mark Erikson 的**[“Redux 基础”会议演讲](https://blog.isquaredsoftware.com/2018/03/presentation-reactathon-redux-fundamentals/)**和[**“Redux 基础”工作坊幻灯片](https://blog.isquaredsoftware.com/2018/06/redux-fundamentals-workshop-slides/)**（2018 年，采用较旧模式）
- Dave Ceddia 的文章[**React Redux 初学者完整教程**](https://daveceddia.com/redux-tutorial/)（采用较旧模式）

### 其他资源

- **[Redux 常见问题](../FAQ.md)**回答了许多 Redux 使用问题；**[“使用 Redux”文档章节](../usage/index.md)**介绍了派生数据、测试、reducer 逻辑组织和减少样板代码等内容。
- Redux 维护者 Mark Erikson 的**[“实用 Redux”教程系列](https://blog.isquaredsoftware.com/series/practical-redux/)**展示了 React 和 Redux 的实际中高级技巧（也可参加 **[Educative.io 交互课程](https://www.educative.io/collection/5687753853370368/5707702298738688)**）。
- **[React/Redux 链接列表](https://github.com/markerikson/react-redux-links)**按主题分类收录了关于[reducer 和 selector](https://github.com/markerikson/react-redux-links/blob/master/redux-reducers-selectors.md)、[管理副作用](https://github.com/markerikson/react-redux-links/blob/master/redux-side-effects.md)、[Redux 架构和最佳实践](https://github.com/markerikson/react-redux-links/blob/master/redux-architecture.md)等文章。
- 社区已创建数千个 Redux 相关库、扩展和工具。**[“生态系统”文档页面](./Ecosystem.md)**列出了我们的推荐资源。

## 帮助和讨论 {#help-and-discussion}

**[Reactiflux Discord 社区](https://www.reactiflux.com)** 的 **[#redux 频道](https://discord.gg/0ZcbPKXt5bZ6au5t)** 是所有关于学习和使用 Redux 问题的官方交流场所。Reactiflux 是一个绝佳的地方供闲聊、提问和学习——欢迎加入我们！

你也可以在 [Stack Overflow](https://stackoverflow.com) 上使用 **[#redux 标签](https://stackoverflow.com/questions/tagged/redux)** 提问。

如果你有bug报告或其他反馈，[请在 Github 仓库提交 issue](https://github.com/reduxjs/redux)。

## 是否应该使用 Redux？

Redux 是组织状态的有力工具，但你也应该考虑它是否适合你的场景。**不要仅仅因为别人说你应该用就用——花点时间了解使用它的潜在优势和权衡**。

以下是一些建议，说明何时使用 Redux 是合理的：

- 你的数据量随时间有较大变化
- 你需要状态的单一可信源
- 你发现将所有状态放在顶层组件中不再足够

> **关于 Redux 的用法，更多思考请参考：**
>
> - **[Redux FAQ：何时该用 Redux？](../faq/General.md#when-should-i-use-redux)**
> - **[你可能不需要 Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**
> - **[Redux 之道，第一部分—实现与意图](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**
> - **[Redux 之道，第二部分—实践与哲学](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/)**
> - **[Redux FAQ](../FAQ.md)**
