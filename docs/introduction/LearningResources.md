---
id: learning-resources
title: 学习资源
description: '介绍 > 学习资源：学习 Redux 的额外文章和资源'
---

# 学习资源

Redux 文档旨在教授 Redux 的基本概念，并解释在现实应用中使用的关键概念。然而，文档无法涵盖所有内容。幸运的是，有许多优秀的其他资源可用于学习 Redux。我们鼓励你去了解它们。许多资源涵盖了超出文档范围的话题，或者用不同的方式描述相同的话题，可能更适合你的学习风格。

本页包含我们推荐的一些最佳外部资源，用于学习 Redux。关于 React、Redux、JavaScript 及相关主题的更多教程、文章和资源详见 [React/Redux 链接列表](https://github.com/markerikson/react-redux-links)。

:::tip 建议先学习这些教程

如果你刚接触 Redux，建议先从我们的教程开始。[Redux Essentials 教程](../tutorials/essentials/part-1-overview-concepts.md)介绍如何使用 Redux Toolkit 和 React-Redux 构建真实应用；[Redux Fundamentals 教程](../tutorials/fundamentals/part-1-overview.md)则从基础讲解 Redux 的工作原理。我们还有一个[推荐视频](../tutorials/videos.md)页面。

下面有些文章发表于 Redux Toolkit 出现之前。我们已在相应位置注明。文章中的概念仍然适用，但代码示例采用的是较旧模式。

:::

## 基础介绍 {#basic-introductions}

_教授 Redux 基本概念及其用法的教程_

- **使用 Redux Toolkit 编写现代 Redux** <br />
  https://blog.isquaredsoftware.com/2022/06/presentations-modern-redux-rtk/ <br />
  Redux 维护者 Mark Erikson 的演讲，介绍 Redux Toolkit 如何简化 Redux 使用、我们为何推荐它作为标准编写方式，以及它与较旧手写模式的区别。

- **React、Redux 和 TypeScript 入门** <br />
  https://blog.isquaredsoftware.com/2020/12/presentations-react-redux-ts-intro/ <br />
  Mark Erikson 的幻灯片，介绍 React、Redux 和 TypeScript 的基础知识。Redux 主题包括 store、reducer、middleware、React-Redux 和 Redux Toolkit。

- **学习现代 Redux：Redux Toolkit、React-Redux Hooks 和 RTK Query** <br />
  https://codetv.dev/series/learn-with-jason/s4/let-s-learn-modern-redux <br />
  “Learn with Jason” 节目的一期，嘉宾是 Redux 维护者 Mark Erikson。节目现场编写了一个应用，演示如何创建 React + TypeScript 项目、添加 Redux 包，并从头配置 Redux Toolkit 和 React-Redux（包括我们推荐的 TypeScript hooks 配置），还介绍如何使用 RTK Query 数据获取 API 并在 UI 中显示数据。

- **Redux 教程：概览及实操引导** <br />
  https://www.taniarascia.com/redux-react-guide/ <br />
  Tania Rascia 编写的优秀教程，快速解释 Redux 核心概念，展示如何用原生 Redux 和 Redux Toolkit 构建基础的 Redux + React 应用。

- **Redux 入门——脑科学友好的 Redux 学习指南** <br />
  https://www.freecodecamp.org/news/redux-for-beginners-the-brain-friendly-guide-to-redux/ <br />
  易于跟随的教程，构建一个使用 Redux Toolkit 和 React-Redux（含数据获取）的小型待办事项应用。

- **使用 Redux Toolkit 和 TypeScript 轻松编写 Redux** <br />
  https://mattbutton.com/redux-made-easy-with-redux-toolkit-and-typescript/ <br />
  这篇教程介绍如何结合 Redux Toolkit 与 TypeScript 编写 Redux 应用，以及 RTK 如何简化常见的 Redux 用法。

## 在 React 中使用 Redux {#using-redux-with-react}

_解释 React-Redux 绑定库_

- **React-Redux 文档** <br />
  https://react-redux.js.org/ <br />
  React-Redux 官方文档，介绍 `useSelector` 和 `useDispatch` hooks、推荐的 TypeScript 配置以及较旧的 `connect` API。

- **使用 React-Redux Hooks 改造旧版 Redux 应用** <br />
  https://app.egghead.io/playlists/modernizing-a-legacy-redux-application-with-react-hooks-c528 <br />
  一个视频系列，展示了早期 `connect` API 和新 React-Redux hooks API 的区别，以及如何在组件中使用 hooks。

- **React 渲染行为（基本）完整指南** <br />
  https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/ <br />
  Mark Erikson 解释 React 组件何时、为何重新渲染，以及 React-Redux 如何参与其中。这是理解 `useSelector` 和性能问题的有用背景。

## TypeScript

_在 TypeScript 中使用 Redux_

- **Redux：TypeScript 使用指南** <br />
  [Usage with TypeScript](../usage/UsageWithTypescript.md) <br />
  我们编写的指南，介绍如何配置带类型的 store、hooks、slice 和 thunk。

- **Redux Toolkit：TypeScript 使用指南** <br />
  [Quick Start](../tutorials/quick-start.md) <br />
  [Redux Toolkit: Usage with TypeScript](/toolkit/usage/usage-with-typescript) <br />
  快速开始教程介绍了带类型的 store 基础配置；Redux Toolkit 指南则逐一说明 RTK API 的类型用法。

## 使用 RTK Query 获取数据 {#data-fetching-with-rtk-query}

_使用 Redux Toolkit 的 RTK Query API 获取并缓存服务器数据_

- **RTK Query 概览** <br />
  https://redux-toolkit.js.org/rtk-query/overview <br />
  RTK Query 文档，介绍 RTK Query 的概念、如何定义 API slice，以及如何在组件中使用生成的 hooks。

- **Redux Essentials 第 7 和第 8 部分** <br />
  [Part 7: RTK Query Basics](../tutorials/essentials/part-7-rtk-query-basics.md) <br />
  [Part 8: RTK Query Advanced Patterns](../tutorials/essentials/part-8-rtk-query-advanced.md) <br />
  我们的教程演示如何将应用从 thunk 改为 RTK Query，以及如何处理缓存失效、乐观更新和流式更新。

- **RTK Query 基础：查询端点、数据流和 TypeScript** <br />
  https://egghead.io/courses/rtk-query-basics-query-endpoints-data-flow-and-typescript-57ea3c43 <br />
  RTK Query 创建者 Lenz Weber-Tronic 提供的免费视频课程。

## Redux DevTools {#redux-devtools}

- **Redux DevTools** <br />
  https://github.com/reduxjs/redux-devtools <br />
  Redux DevTools 浏览器扩展可检查每个已派发的 action 和状态变化，并在不同状态之间来回跳转。`configureStore` 会在开发环境自动启用它。仓库包含浏览器扩展、适用于 React Native 等环境的独立 `@redux-devtools/cli`，以及底层 DevTools 组件。

## 基于项目的教程

_通过构建项目教授 Redux 概念，包括较大的“真实世界”应用_

- **实用 Redux** <br/>
  https://blog.isquaredsoftware.com/2016/10/practical-redux-part-0-introduction/ <br/>
  https://blog.isquaredsoftware.com/series/practical-redux/ <br/>
  A series of posts intended to demonstrate a number of specific Redux techniques by building a sample application, based on the MekHQ application for managing Battletech campaigns. Written by Redux co-maintainer Mark Erikson. Covers topics like managing relational data, connecting multiple components and lists, complex reducer logic for features, handling forms, showing modal dialogs, and much more. (Note: this is an older series, and today we recommend newer patterns for writing Redux code. However, many of the principles in this series are still valuable.)

## Redux 实现

_通过编写简易重实现来解释 Redux 内部工作原理_

- **Redux 入门视频系列** <br/>
  https://egghead.io/courses/fundamentals-of-redux-course-from-dan-abramov-bd5cc867 <br/>
  https://github.com/tayiorbeii/egghead.io_redux_course_notes <br/>
  Redux 创建者 Dan Abramov 通过 30 个短视频（每个 2 到 5 分钟）演示各种概念。关联的 GitHub 仓库包含视频笔记和文字记录。（注意：这些视频早于 Redux Toolkit，展示了手写 reducer 和 action creator。建议先阅读 Essentials 教程，了解当前推荐的 Redux 编写方式，再通过这些视频理解 Redux 的底层工作原理。）

- **用惯用 Redux 构建 React 应用视频系列** <br/>
  https://egghead.io/courses/building-react-applications-with-idiomatic-redux <br/>
  https://github.com/tayiorbeii/egghead.io_idiomatic_redux_course_notes <br/>
  Dan Abramov 的第二个视频教程系列，紧接第一个系列继续讲解。内容包括 store 初始状态、在 React Router 中使用 Redux、使用 selector 函数、状态归一化、Redux middleware、异步 action creator 等。关联的 GitHub 仓库包含视频笔记和文字记录。（同上，这些视频采用较旧模式，但其中的概念仍有价值。）

- **Live React: Hot Reloading and Time Travel** <br/>
  https://www.youtube.com/watch?v=xsSnOQynTHs <br/>
  Dan Abramov 最初介绍 Redux 的会议演讲。了解 Redux 的约束如何让支持时间旅行的热重载变得简单。

- **Build Yourself a Redux** <br/>
  https://zapier.com/blog/how-to-build-redux/ <br/>
  一篇深入讲解“构建迷你 Redux”的优秀文章，除了 Redux 核心，还介绍了 `connect` 和 middleware。

## Reducers

_探讨编写 reducer 函数的方法的文章_

- **Structuring Reducers** <br/>
  [Structuring Reducers](../usage/structuring-reducers/StructuringReducers.md) <br/>
  我们编写的指南，介绍如何拆分、组合和复用 reducer 逻辑、归一化状态以及采用不可变更新模式。Redux Toolkit 的 `createSlice` 也遵循这些模式。

- **Taking Advantage of `combineReducers`** <br/>
  https://randycoulman.com/blog/2016/11/22/taking-advantage-of-combinereducers/ <br/>
  展示多次使用 `combineReducers` 构造状态树的示例，并讨论不同 reducer 逻辑方案的取舍。这些思路同样适用于传给 `configureStore` 的 `reducer` 对象。

## Selector

_解释为何以及如何使用 selector 函数从状态中读取值_

- **Deriving Data with Selectors** <br/>
  [Deriving Data with Selectors](../usage/deriving-data-selectors.md) <br/>
  我们编写的指南，介绍如何编写 selector、使用 Reselect 进行记忆化，以及如何与 React-Redux 配合使用。

- **Reselect docs** <br/>
  [https://redux.js.org/reselect/](/reselect/) <br/>
  Reselect 官方文档，包括 `createSelector` API、记忆化选项，以及用于捕获常见 selector 错误的开发模式检查。

- **Idiomatic Redux: Using Reselect Selectors for Encapsulation and Performance** <br/>
  https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/ <br/>
  A complete guide to why you should use selector functions with Redux, how to use the Reselect library to write optimized selectors, and advanced tips for improving performance. (Note: the code samples use `connect`, but the reasoning applies equally to `useSelector`.)

## 规范化 (Normalization)

_如何将 Redux store 结构化为类似数据库以获得最佳性能_

- **Normalizing State Shape** <br/>
  [Normalizing State Shape](../usage/structuring-reducers/NormalizingStateShape.md) <br/>
  我们编写的指南，介绍为什么以及如何使用 `{ids, entities}` 归一化结构存储数据。

- **`createEntityAdapter`** <br/>
  https://redux-toolkit.js.org/api/createEntityAdapter <br/>
  Redux Toolkit API，可生成用于在 slice 中管理归一化数据的 reducer 和 selector。

- **Querying a Redux Store** <br/>
  https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f <br/>
  A look at best practices for organizing and storing data in Redux, including normalizing data and use of selector functions. (Note: predates `createEntityAdapter`, which now handles the update logic described here.)

## 中间件

_解释及示例讲解中间件如何工作及如何编写_

- **Middleware** <br/>
  [Understanding Redux: Middleware](../understanding/history-and-design/middleware.md) <br/>
  [Writing Custom Middleware](../usage/WritingCustomMiddleware.md) <br/>
  我们编写的说明，介绍 middleware 的概念和 `applyMiddleware` 的工作方式，并指导你编写自己的 middleware。

- **Exploring Redux Middlewares** <br/>
  https://blog.krawaller.se/posts/exploring-redux-middleware/ <br/>
  通过一系列小实验理解中间件。

## 副作用 {#side-effects}

_在 Redux 中处理异步行为_

- **Side Effects Approaches** <br/>
  [Side Effects Approaches](../usage/side-effects-approaches.mdx) <br/>
  我们对副作用处理方式的建议：使用 RTK Query 获取数据、使用 thunk 编写一般异步逻辑、使用 listener middleware 响应 action，并比较 saga 和 observable。

- **Writing Logic with Thunks** <br/>
  [Writing Logic with Thunks](../usage/writing-logic-thunks.mdx) <br/>
  我们编写的指南，介绍 thunk 的概念、用途以及编写方式。

- **`createListenerMiddleware`** <br/>
  https://redux-toolkit.js.org/api/createListenerMiddleware <br/>
  Redux Toolkit API，可在 action 派发后运行逻辑，并支持取消和防抖。它覆盖了过去通常需要 saga 才能处理的大多数场景。

- **Stack Overflow: 带超时的 Redux Action 分发** <br/>
  https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559 <br/>
  Dan Abramov 讲解 Redux 异步行为管理基础，分步演示不同方案（内联异步调用、异步 action 创建者、thunk 中间件）。

- **Stack Overflow: 为什么 Redux 异步流需要中间件？** <br/>
  https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594 <br/>
  Dan Abramov 说明了使用 thunk 和异步 middleware 的理由，以及 thunk 的多种实用模式。

- **“thunk” 是什么？** <br/>
  https://daveceddia.com/what-is-a-thunk/ <br/>
  快速解释“thunk”一词的一般含义及 Redux 中的含义。

- **惯用 Redux：关于 Thunk、Saga、抽象和复用的思考** <br/>
  https://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/ <br/>
  对“thunk 很糟糕”这一观点的回应，说明 thunk（以及 saga）仍然是管理复杂同步逻辑和异步副作用的有效方式。

## Thinking in Redux

_深入探究 Redux 的使用理念和设计原理_

- **何时（何时不）该使用 Redux** <br />
  https://changelog.com/posts/when-and-when-not-to-reach-for-redux <br />
  Redux 维护者 Mark Erikson 说明 Redux 诞生要解决的问题，以及和其他常用工具的比较。

- **为什么 React Context 不是“状态管理”工具（以及它为什么不能取代 Redux）** <br />
  https://blog.isquaredsoftware.com/2021/01/context-redux-differences/ <br />
  Mark Erikson 解释 React Context 的实际作用、它与 Redux 的区别，以及各自适用的场景。

- **You Might Not Need Redux** <br/>
  https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367 <br/>
  Dan Abramov 讨论了使用 Redux 时需要权衡的利弊。

- **Idiomatic Redux: The Tao of Redux, Part 1 - Implementation and Intent** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/ <br/>
  深入剖析 Redux 真实工作机制、其要求遵循的约束及设计理念。

- **Idiomatic Redux: The Tao of Redux, Part 2 - Practice and Philosophy** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/ <br/>
  随笔分析常见 Redux 使用模式背后的原因，Redux 可能的其它用法，以及各种模式的优缺点思考。

- **Redux 到底好在哪里？** <br/>
  https://www.freecodecamp.org/news/whats-so-great-about-redux-ac16f1cc0f8b <br/>
  深入分析 Redux 与面向对象编程、消息传递的异同，说明常见 Redux 用法如何退化为类似 Java 的“setter”函数并带来更多样板代码，同时呼吁在 Redux 之上提供更高层的官方抽象，让新手更容易使用和学习。这篇文章很值得一读。（Redux Toolkit 正是这样的抽象。）

## Redux 架构

_组织大型 Redux 应用的模式和实践_

- **Redux Style Guide** <br/>
  [Style Guide](../style-guide/style-guide.md) <br/>
  我们推荐的 Redux 应用结构模式和最佳实践，并按优先级组织。

- **Avoiding Accidental Complexity When Structuring Your App State** <br/>
  https://hackernoon.com/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a <br/>
  极佳的 Redux store 结构组织指导原则。

- **Redux for state management in large web apps** <br/>
  https://medium.com/mapbox/redux-for-state-management-in-large-web-apps-c7f3fab3ce9b <br/>
  对惯用 Redux 架构及其实例的出色讨论，并介绍 Mapbox 如何在 Mapbox Studio 应用中采用这些方法。（注意：文章写于 2017 年，因此代码示例使用 `connect` 和手写 reducer。）

## 应用和示例

- **Redux Templates** <br/>
  https://github.com/reduxjs/redux-templates <br/>
  Vite 和 Expo 官方项目模板，已预配置 Redux Toolkit、React-Redux 和 TypeScript。Next.js 项目请参阅 [Next.js 的 `with-redux` 示例](https://github.com/vercel/next.js/tree/canary/examples/with-redux)。

- **Redux Essentials Example App** <br/>
  https://github.com/reduxjs/redux-essentials-example-app <br/>
  在 [Redux Essentials 教程](../tutorials/essentials/part-1-overview-concepts.md)中构建的社交媒体动态应用，使用 Redux Toolkit、RTK Query 和 TypeScript。

- **Webamp** <br/>
  https://webamp.org <br/>
  https://github.com/captbaritone/webamp <br/>
  浏览器内复刻 Winamp2 的应用，基于 React 和 Redux。支持播放 MP3，且可加载本地 MP3 文件。

- **WordPress-Calypso** <br/>
  https://github.com/Automattic/wp-calypso <br/>
  由 JavaScript 和 API 驱动的 WordPress.com。

## Redux 文档翻译

- [中文文档](https://cn.redux.js.org/) — Chinese
- [繁體中文文件](https://github.com/chentsulin/redux) — Traditional Chinese
- [Redux in Russian](https://github.com/rajdee/redux-in-russian) — Russian
- [Redux en Español](https://es.redux.js.org/) - Spanish
- [Redux in Korean](https://ko.redux.js.org/) - Korean

## 更多资源 {#more-resources}

- [React-Redux 链接列表](https://github.com/markerikson/react-redux-links)精选了关于 React、Redux、ES2015 等主题的优质文章、教程和相关内容。
- [Awesome Redux](https://github.com/xgrommx/awesome-redux) 收录了大量 Redux 相关仓库。
- [DEV Community](https://dev.to/t/redux) 可用于分享 Redux 项目、文章和教程，发起讨论并征求相关反馈。欢迎各种经验水平的开发者参与。
