---
id: learning-resources
title: 学习资源
description: '介绍 > 学习资源：学习 Redux 的额外文章和资源'
---

# 学习资源

Redux 文档旨在教授 Redux 的基本概念，并解释在现实应用中使用的关键概念。然而，文档无法涵盖所有内容。幸运的是，有许多优秀的其他资源可用于学习 Redux。我们鼓励你去了解它们。许多资源涵盖了超出文档范围的话题，或者用不同的方式描述相同的话题，可能更适合你的学习风格。

本页包含我们推荐的一些最佳外部资源，用于学习 Redux。关于 React、Redux、JavaScript 及相关主题的更多教程、文章和资源详见 [React/Redux 链接列表](https://github.com/markerikson/react-redux-links)。

:::tip Start with the tutorials

If you're new to Redux, start with our own tutorials first. [The Redux Essentials tutorial](../tutorials/essentials/part-1-overview-concepts.md) teaches how to build real apps with Redux Toolkit and React-Redux, and [the Redux Fundamentals tutorial](../tutorials/fundamentals/part-1-overview.md) explains how Redux works from the ground up. We also have a page of [recommended videos](../tutorials/videos.md).

Several of the articles below were written before Redux Toolkit existed. Where that's the case, we've noted it. The concepts still apply, but the code samples use older patterns.

:::

## Basic Introductions

_教授 Redux 基本概念及其用法的教程_

- **Modern Redux with Redux Toolkit** <br />
  https://blog.isquaredsoftware.com/2022/06/presentations-modern-redux-rtk/ <br />
  Redux maintainer Mark Erikson's presentation on how Redux Toolkit simplifies Redux usage, why we recommend it as the standard way to write Redux logic, and how it compares to the older hand-written patterns.

- **Intro to React, Redux, and TypeScript** <br />
  https://blog.isquaredsoftware.com/2020/12/presentations-react-redux-ts-intro/ <br />
  Mark Erikson's slideset that covers the basics of React, Redux, and TypeScript. Redux topics include stores, reducers, middleware, React-Redux, and Redux Toolkit.

- **Learn Modern Redux - Redux Toolkit, React-Redux Hooks, and RTK Query** <br />
  https://codetv.dev/series/learn-with-jason/s4/let-s-learn-modern-redux <br />
  An episode of the "Learn with Jason" show, with Redux maintainer Mark Erikson as guest. The episode features a live-coded app, and shows how to create a new React+TS project, add the Redux packages, and set up Redux Toolkit and React-Redux from scratch (including our recommended TS hooks configuration). It also shows how to use the RTK Query data fetching API and display that data in a UI.

- **Redux 教程：概览及实操引导** <br />
  https://www.taniarascia.com/redux-react-guide/ <br />
  Tania Rascia 编写的优秀教程，快速解释 Redux 核心概念，展示如何用原生 Redux 和 Redux Toolkit 构建基础的 Redux + React 应用。

- **Redux 入门——脑科学友好的 Redux 学习指南** <br />
  https://www.freecodecamp.org/news/redux-for-beginners-the-brain-friendly-guide-to-redux/ <br />
  易于跟随的教程，构建一个使用 Redux Toolkit 和 React-Redux（含数据获取）的小型待办事项应用。

- **Redux made easy with Redux Toolkit and TypeScript** <br />
  https://mattbutton.com/redux-made-easy-with-redux-toolkit-and-typescript/ <br />
  A helpful tutorial that shows how to use Redux Toolkit and TypeScript together to write Redux applications, and how RTK simplifies typical Redux usage.

## Using Redux With React

_解释 React-Redux 绑定库_

- **React-Redux docs** <br />
  https://react-redux.js.org/ <br />
  The official docs for React-Redux, including the `useSelector` and `useDispatch` hooks, the recommended TypeScript setup, and the older `connect` API.

- **Modernizing a Legacy Redux Application with React-Redux Hooks** <br />
  https://app.egghead.io/playlists/modernizing-a-legacy-redux-application-with-react-hooks-c528 <br />
  一个视频系列，展示了早期 `connect` API 和新 React-Redux hooks API 的区别，以及如何在组件中使用 hooks。

- **A (Mostly) Complete Guide to React Rendering Behavior** <br />
  https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/ <br />
  Mark Erikson's explanation of when and why React components re-render, and how React-Redux fits into that. Useful background for understanding `useSelector` and performance.

## TypeScript

_Using Redux with TypeScript_

- **Redux: Usage with TypeScript** <br />
  [Usage with TypeScript](../usage/UsageWithTypescript.md) <br />
  Our own guide to setting up a typed store, typed hooks, and typed slices and thunks.

- **Redux Toolkit: Usage with TypeScript** <br />
  [Quick Start](../tutorials/quick-start.md) <br />
  [Redux Toolkit: Usage with TypeScript](/toolkit/usage/usage-with-typescript) <br />
  The initial typed store setup is covered in the Quick Start; the Redux Toolkit guide goes through typing each RTK API.

## Data Fetching with RTK Query

_Fetching and caching server data with the RTK Query API in Redux Toolkit_

- **RTK Query Overview** <br />
  https://redux-toolkit.js.org/rtk-query/overview <br />
  The RTK Query docs, covering what RTK Query is, how to define an API slice, and how to use the generated hooks in components.

- **Redux Essentials, Parts 7 and 8** <br />
  [Part 7: RTK Query Basics](../tutorials/essentials/part-7-rtk-query-basics.md) <br />
  [Part 8: RTK Query Advanced Patterns](../tutorials/essentials/part-8-rtk-query-advanced.md) <br />
  Our own tutorial shows how to convert an app from thunks to RTK Query, and how to handle cache invalidation, optimistic updates, and streaming updates.

- **RTK Query Basics: Query Endpoints, Data Flow and TypeScript** <br />
  https://egghead.io/courses/rtk-query-basics-query-endpoints-data-flow-and-typescript-57ea3c43 <br />
  A free video course by Lenz Weber-Tronic, the creator of RTK Query.

## Redux DevTools

- **Redux DevTools** <br />
  https://github.com/reduxjs/redux-devtools <br />
  The Redux DevTools browser extension lets you inspect every dispatched action and state change, and jump back and forth between states. `configureStore` enables it automatically in development. The repo includes the extension, the standalone `@redux-devtools/cli` for React Native and other environments, and the underlying DevTools components.

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
  Dan Abramov, the creator of Redux, demonstrates various concepts in 30 short (2-5 minute) videos. The linked Github repo contains notes and transcriptions of the videos. (Note: these videos predate Redux Toolkit and show hand-written reducers and action creators. Watch them to understand how Redux works, after reading the Essentials tutorial to see how we write Redux code today.)

- **用惯用 Redux 构建 React 应用视频系列** <br/>
  https://egghead.io/courses/building-react-applications-with-idiomatic-redux <br/>
  https://github.com/tayiorbeii/egghead.io_idiomatic_redux_course_notes <br/>
  Dan Abramov's second video tutorial series, continuing directly after the first. Includes lessons on store initial state, using Redux with React Router, using "selector" functions, normalizing state, use of Redux middleware, async action creators, and more. The linked Github repo contains notes and transcriptions of the videos. (Same note as above: older patterns, still valuable for the concepts.)

- **Live React: Hot Reloading and Time Travel** <br/>
  https://www.youtube.com/watch?v=xsSnOQynTHs <br/>
  Dan Abramov's original conference talk that introduced Redux. See how constraints enforced by Redux make hot reloading with time travel easy

- **Build Yourself a Redux** <br/>
  https://zapier.com/blog/how-to-build-redux/ <br/>
  An excellent in-depth "build a mini-Redux" article, which covers not only Redux's core, but also `connect` and middleware as well.

## Reducers

_探讨编写 reducer 函数的方法的文章_

- **Structuring Reducers** <br/>
  [Structuring Reducers](../usage/structuring-reducers/StructuringReducers.md) <br/>
  Our own guide to splitting, combining, and reusing reducer logic, normalizing state, and immutable update patterns. Redux Toolkit's `createSlice` applies these same patterns.

- **Taking Advantage of `combineReducers`** <br/>
  https://randycoulman.com/blog/2016/11/22/taking-advantage-of-combinereducers/ <br/>
  Examples of using `combineReducers` multiple times to produce a state tree, and some thoughts on tradeoffs in various approaches to reducer logic. The same ideas apply to the `reducer` object passed to `configureStore`.

## Selector

_解释为何以及如何使用 selector 函数从状态中读取值_

- **Deriving Data with Selectors** <br/>
  [Deriving Data with Selectors](../usage/deriving-data-selectors.md) <br/>
  Our own guide to writing selectors, memoizing them with Reselect, and using them with React-Redux.

- **Reselect docs** <br/>
  [https://redux.js.org/reselect/](/reselect/) <br/>
  The official Reselect docs, including the `createSelector` API, memoization options, and the development-mode checks that catch common selector mistakes.

- **Idiomatic Redux: Using Reselect Selectors for Encapsulation and Performance** <br/>
  https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/ <br/>
  A complete guide to why you should use selector functions with Redux, how to use the Reselect library to write optimized selectors, and advanced tips for improving performance. (Note: the code samples use `connect`, but the reasoning applies equally to `useSelector`.)

## 规范化 (Normalization)

_如何将 Redux store 结构化为类似数据库以获得最佳性能_

- **Normalizing State Shape** <br/>
  [Normalizing State Shape](../usage/structuring-reducers/NormalizingStateShape.md) <br/>
  Our own guide to why and how to store data in a normalized `{ids, entities}` shape.

- **`createEntityAdapter`** <br/>
  https://redux-toolkit.js.org/api/createEntityAdapter <br/>
  The Redux Toolkit API that generates reducers and selectors for managing normalized data in a slice.

- **Querying a Redux Store** <br/>
  https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f <br/>
  A look at best practices for organizing and storing data in Redux, including normalizing data and use of selector functions. (Note: predates `createEntityAdapter`, which now handles the update logic described here.)

## 中间件

_解释及示例讲解中间件如何工作及如何编写_

- **Middleware** <br/>
  [Understanding Redux: Middleware](../understanding/history-and-design/middleware.md) <br/>
  [Writing Custom Middleware](../usage/WritingCustomMiddleware.md) <br/>
  Our own explanation of what middleware are and how `applyMiddleware` works, plus a guide to writing your own.

- **Exploring Redux Middlewares** <br/>
  https://blog.krawaller.se/posts/exploring-redux-middleware/ <br/>
  通过一系列小实验理解中间件。

## Side Effects

_Handling async behavior in Redux_

- **Side Effects Approaches** <br/>
  [Side Effects Approaches](../usage/side-effects-approaches.mdx) <br/>
  Our recommendations for handling side effects: RTK Query for data fetching, thunks for general async logic, and the listener middleware for reacting to actions. Also compares sagas and observables.

- **Writing Logic with Thunks** <br/>
  [Writing Logic with Thunks](../usage/writing-logic-thunks.mdx) <br/>
  Our own guide to what thunks are, why they exist, and how to write them.

- **`createListenerMiddleware`** <br/>
  https://redux-toolkit.js.org/api/createListenerMiddleware <br/>
  The Redux Toolkit API for running logic in response to dispatched actions, with cancellation and debouncing support. Covers most use cases that previously needed sagas.

- **Stack Overflow: 带超时的 Redux Action 分发** <br/>
  https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559 <br/>
  Dan Abramov 讲解 Redux 异步行为管理基础，分步演示不同方案（内联异步调用、异步 action 创建者、thunk 中间件）。

- **Stack Overflow: 为什么 Redux 异步流需要中间件？** <br/>
  https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594 <br/>
  Dan Abramov 给出使用 thunk 和异步中间件的理由，以及 thunk 的多种实用模式。

- **“thunk” 是什么？** <br/>
  https://daveceddia.com/what-is-a-thunk/ <br/>
  快速解释“thunk”一词的一般含义及 Redux 中的含义。

- **Idiomatic Redux: Thoughts on Thunks, Sagas, Abstractions, and Reusability** <br/>
  https://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/ <br/>
  针对“thunks 很糟糕”的反馈的回应，辩称 thunks（和 sagas）仍然是管理复杂同步逻辑和异步副作用的有效办法。

## Thinking in Redux

_深入探究 Redux 的使用理念和设计原理_

- **何时（何时不）该使用 Redux** <br />
  https://changelog.com/posts/when-and-when-not-to-reach-for-redux <br />
  Redux 维护者 Mark Erikson 说明 Redux 诞生要解决的问题，以及和其他常用工具的比较。

- **Why React Context is Not a "State Management" Tool (and Why It Doesn't Replace Redux)** <br />
  https://blog.isquaredsoftware.com/2021/01/context-redux-differences/ <br />
  Mark Erikson explains what React Context actually does, how it differs from Redux, and when each one is the right choice.

- **You Might Not Need Redux** <br/>
  https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367 <br/>
  Dan Abramov 讨论使用 Redux 时的权衡利弊。

- **Idiomatic Redux: The Tao of Redux, Part 1 - Implementation and Intent** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/ <br/>
  深入剖析 Redux 真实工作机制、其要求遵循的约束及设计理念。

- **Idiomatic Redux: The Tao of Redux, Part 2 - Practice and Philosophy** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/ <br/>
  随笔分析常见 Redux 使用模式背后的原因，Redux 可能的其它用法，以及各种模式的优缺点思考。

- **What's So Great About Redux?** <br/>
  https://www.freecodecamp.org/news/whats-so-great-about-redux-ac16f1cc0f8b <br/>
  Deep and fascinating analysis of how Redux compares to OOP and message-passing, how typical Redux usage can devolve towards Java-like "setter" functions with more boilerplate, and something of a plea for a higher-level "blessed" abstraction on top of Redux to make it easier to work with and learn for newbies. Very worth reading. (Redux Toolkit is that abstraction.)

## Redux 架构

_组织大型 Redux 应用的模式和实践_

- **Redux Style Guide** <br/>
  [Style Guide](../style-guide/style-guide.md) <br/>
  Our recommended patterns and best practices for structuring Redux applications, organized by priority.

- **Avoiding Accidental Complexity When Structuring Your App State** <br/>
  https://hackernoon.com/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a <br/>
  极佳的 Redux store 结构组织指导原则。

- **Redux for state management in large web apps** <br/>
  https://medium.com/mapbox/redux-for-state-management-in-large-web-apps-c7f3fab3ce9b <br/>
  Excellent discussion and examples of idiomatic Redux architecture, and how Mapbox applies those approaches to their Mapbox Studio application. (Note: written in 2017, so the code samples use `connect` and hand-written reducers.)

## 应用和示例

- **Redux Templates** <br/>
  https://github.com/reduxjs/redux-templates <br/>
  Official project templates for Vite and Expo, preconfigured with Redux Toolkit, React-Redux, and TypeScript. For Next.js, see [Next's `with-redux` example](https://github.com/vercel/next.js/tree/canary/examples/with-redux).

- **Redux Essentials Example App** <br/>
  https://github.com/reduxjs/redux-essentials-example-app <br/>
  The social media feed app built in [the Redux Essentials tutorial](../tutorials/essentials/part-1-overview-concepts.md), using Redux Toolkit, RTK Query, and TypeScript.

- **Webamp** <br/>
  https://webamp.org <br/>
  https://github.com/captbaritone/webamp <br/>
  浏览器内复刻 Winamp2 的应用，基于 React 和 Redux。支持播放 MP3，且可加载本地 MP3 文件。

- **WordPress-Calypso** <br/>
  https://github.com/Automattic/wp-calypso <br/>
  The JavaScript- and API-powered WordPress.com

## Redux 文档翻译

- [中文文档](https://cn.redux.js.org/) — Chinese
- [繁體中文文件](https://github.com/chentsulin/redux) — Traditional Chinese
- [Redux in Russian](https://github.com/rajdee/redux-in-russian) — Russian
- [Redux en Español](https://es.redux.js.org/) - Spanish
- [Redux in Korean](https://ko.redux.js.org/) - Korean

## More Resources

- [React-Redux Links](https://github.com/markerikson/react-redux-links) is a curated list of high-quality articles, tutorials, and related content for React, Redux, ES2015, and more.
- [Awesome Redux](https://github.com/xgrommx/awesome-redux) is an extensive list of Redux-related repositories.
- [DEV Community](https://dev.to/t/redux) is a place to share Redux projects, articles and tutorials as well as start discussions and ask for feedback on Redux-related topics. Developers of all skill-levels are welcome to take part.
