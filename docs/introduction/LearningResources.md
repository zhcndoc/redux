---
id: learning-resources
title: 学习资源
description: '介绍 > 学习资源：学习 Redux 的额外文章和资源'
---

# 学习资源

Redux 文档旨在教授 Redux 的基本概念，并解释在现实应用中使用的关键概念。然而，文档无法涵盖所有内容。幸运的是，有许多优秀的其他资源可用于学习 Redux。我们鼓励你去了解它们。许多资源涵盖了超出文档范围的话题，或者用不同的方式描述相同的话题，可能更适合你的学习风格。

本页包含我们推荐的一些最佳外部资源，用于学习 Redux。关于 React、Redux、JavaScript 及相关主题的更多教程、文章和资源详见 [React/Redux 链接列表](https://github.com/markerikson/react-redux-links)。

## 基础入门

_教授 Redux 基本概念及其用法的教程_

- **React、Redux 和 TypeScript 入门** <br />
  https://blog.isquaredsoftware.com/2020/12/presentations-react-redux-ts-intro/ <br />
  Redux 维护者 Mark Erikson 的幻灯片，涵盖 React、Redux 和 TypeScript 的基础知识。Redux 话题包括 store、reducer、中间件、React-Redux 及 Redux Toolkit。

- **学习现代 Redux — Redux Toolkit、React-Redux Hooks 和 RTK Query** <br />
  https://www.learnwithjason.dev/let-s-learn-modern-redux <br />
  “Learn with Jason” 节目的一个集数，请到 Redux 维护者 Mark Erikson 作为嘉宾。节目展示了一个实时编码应用，演示如何创建新的 React+TS 项目，添加 Redux 包，搭建 Redux Toolkit 和 React-Redux（包括推荐的 TS hooks 配置）。还演示了如何使用即将推出的 RTK Query 数据获取 API 并在界面中显示数据。

- **Redux 教程：概览及实操引导** <br />
  https://www.taniarascia.com/redux-react-guide/ <br />
  Tania Rascia 编写的优秀教程，快速解释 Redux 核心概念，展示如何用原生 Redux 和 Redux Toolkit 构建基础的 Redux + React 应用。

- **Redux 入门——脑科学友好的 Redux 学习指南** <br />
  https://www.freecodecamp.org/news/redux-for-beginners-the-brain-friendly-guide-to-redux/ <br />
  易于跟随的教程，构建一个使用 Redux Toolkit 和 React-Redux（含数据获取）的小型待办事项应用。

- **使用 Redux Toolkit 和 TypeScript 简化 Redux** <br />
  https://www.mattbutton.com/redux-made-easy-with-redux-toolkit-and-typescript/ <br />
  一篇实用教程，展示如何结合使用 Redux Toolkit 和 TypeScript 编写 Redux 应用，以及 RTK 如何简化典型 Redux 用法。

- **Redux：从 Twitter 热潮到生产** <br/>
  https://slides.com/jenyaterpil/redux-from-twitter-hype-to-production#/ <br/>
  一个制作精良的幻灯片，直观展示 Redux 核心概念、React 中的应用、项目组织以及通过 thunk 和 saga 处理副作用。包含一些很棒的动图示范数据如何在 React+Redux 架构中流转。

## React 中使用 Redux

_解释 React-Redux 绑定库_

- **用 React-Redux Hooks 现代化旧 Redux 应用** <br />
  https://app.egghead.io/playlists/modernizing-a-legacy-redux-application-with-react-hooks-c528 <br />
  一个视频系列，展示了早期 `connect` API 和新 React-Redux hooks API 的区别，以及如何在组件中使用 hooks。

- **React 应用中为何 Redux 有用** <br/>
  https://www.fullstackreact.com/articles/redux-with-mark-erikson/ <br/>
  解释 Redux 在 React 中的优势，比如组件间数据共享和热模块重载。

## 基于项目的教程

_通过构建项目教授 Redux 概念，包括较大的“真实世界”应用_

- **实用 Redux** <br/>
  https://blog.isquaredsoftware.com/2016/10/practical-redux-part-0-introduction/ <br/>
  https://blog.isquaredsoftware.com/series/practical-redux/ <br/>
  一系列持续更新的文章，旨在通过构建示例应用展示多种 Redux 技巧，基于 MekHQ 应用管理战锤 Battletech 战役。由 Redux 联合维护者 Mark Erikson 编写。涵盖关系数据管理、多组件和列表连接、复杂 reducer 逻辑、表单处理、显示模态对话框等主题。（注：该系列较旧，如今推荐更新的 Redux 编写模式，但其许多原则依然有价值。）

## Redux 实现

_通过编写简易重实现来解释 Redux 内部工作原理_

- **Redux 入门视频系列** <br/>
  https://egghead.io/courses/fundamentals-of-redux-course-from-dan-abramov-bd5cc867 <br/>
  https://github.com/tayiorbeii/egghead.io_redux_course_notes <br/>
  Redux 创建者 Dan Abramov 以 30 个简短（2-5 分钟）视频展示各类概念。GitHub 仓库中含视频笔记和文字稿。

- **用惯用 Redux 构建 React 应用视频系列** <br/>
  https://egghead.io/courses/building-react-applications-with-idiomatic-redux <br/>
  https://github.com/tayiorbeii/egghead.io_idiomatic_redux_course_notes <br/>
  Dan Abramov 的第二个视频教程系列，紧接第一个，包含 store 初始状态、与 React Router 结合、使用“selector”函数、状态规范化、Redux 中间件用法、异步 action 创建者等课程。GitHub 仓库含笔记和文字稿。

- **Live React: 热重载与时光旅行** <br/>
  https://youtube.com/watch?v=xsSnOQynTHs <br/>
  Dan Abramov 的原始会议演讲，介绍 Redux。展示 Redux 约束如何使得具有时光旅行功能的热重载变得简单。

- **自制 Redux** <br/>
  https://zapier.com/engineering/how-to-build-redux/ <br/>
  一篇极佳的深入文章，教你如何构建简易 Redux，不仅涵盖核心，还包括 `connect` 和中间件。

- **Connect.js 讲解** <br/>
  https://gist.github.com/gaearon/1d19088790e70ac32ea636c025ba424e <br/>
  React Redux 的 `connect()` 函数的极度简化版本，展示其基本实现。

- **让我们编写 Redux！** <br/>
  https://www.jamasoftware.com/blog/lets-write-redux/ <br/>
  逐步演示编写简易 Redux 版本，帮助解释概念及实现。

## Reducer

_探讨编写 reducer 函数的方法的文章_

- **利用 `combineReducers`** <br/>
  https://randycoulman.com/blog/2016/11/22/taking-advantage-of-combinereducers/ <br/>
  示例展示多次使用 `combineReducers` 生成状态树，以及各种 reducer 逻辑方案的利弊思考。

- **高阶 Reducer 的威力** <br/>
  https://slides.com/omnidan/hor#/ <br/>
  redux-undo 和其它库的作者制作的幻灯片，讲解高阶 reducer 的概念及使用方法。

- **用高阶 Reducer 实现 Reducer 组合** <br/>
  https://medium.com/@mange_vibration/reducer-composition-with-higher-order-reducers-35c3977ed08f <br/>
  很多优秀示例，展示如何编写小函数并组合执行更大具体 reducer 任务，如提供初始状态、过滤、更新特定键等。

- **高阶 Reducer——听上去吓人** <br/>
  https://medium.com/@danielkagan/high-order-reducers-it-just-sounds-scary-2b9e5dbfc705 <br/>
  解释如何像乐高积木一样组合 reducer，创建可复用且易测试的 reducer 逻辑。

## Selector

_解释为何以及如何使用 selector 函数从状态中读取值_

- **惯用 Redux：使用 Reselect Selectors 实现封装和性能优化** <br/>
  https://blog.isquaredsoftware.com/2017/12/idiomatic-redux-using-reselect-selectors/ <br/>
  完整指南，介绍为何使用 selector 函数，如何用 Reselect 写优化过的 selector，以及提升性能的高级技巧。

- **ReactCasts 第8期：Redux 中的 Selector** <br/>
  https://www.youtube.com/watch?v=frT3to2ACCw <br/>
  很棒的概述，解释为何以及怎样用 selector 函数获取 store 数据，并从 store 数据派生额外信息。

- **使用 Reselect 优化 React Redux 应用开发** <br/>
  https://codebrahma.com/reselect-tutorial-optimizing-react-redux-application-development-with-reselect/ <br/>
  优秀的 Reselect 教程，涵盖 selector 函数概念、Reselect API 及如何用缓存 selector 提升性能。

- **React-Redux 应用中 Reselect 的使用** <br/>
  https://dashbouquet.com/blog/frontend-development/usage-of-reselect-in-a-react-redux-application <br/>
  讨论缓存 selectors 对性能的重要性及 Reselect 使用的良好实践。

- **React、Reselect 与 Redux** <br/>
  https://medium.com/@parkerdan/react-reselect-and-redux-b34017f8194c <br/>
  解释 Reselect 缓存 selector 函数在 Redux 应用中的作用，及如何为每个组件实例创建唯一 selector 实例。

## 规范化 (Normalization)

_如何将 Redux store 结构化为类似数据库以获得最佳性能_

- **查询 Redux Store** <br/>
  https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f <br/>
  探讨最佳实践，组织和存储 Redux 数据，包括数据规范化和 selector 函数的使用。

- **规范化 Redux Store 以最大化代码复用** <br/>
  https://medium.com/@adamrackis/normalizing-redux-stores-for-maximum-code-reuse-ae6e3844ae95 <br/>
  关于规范化 Redux store 带来的有用数据处理方法的思考，含使用 selector 函数反规范化层级数据的示例。

- **高级 Redux 实体规范化** <br/>
  https://medium.com/@dcousineau/advanced-redux-entity-normalization-f5f1fe2aefc5 <br/>
  描述了用于跟踪状态中实体子集的 “keyWindow” 概念，类似 SQL 的“视图”。对规范化数据思想的有益拓展。

## 中间件

_解释及示例讲解中间件如何工作及如何编写_

- **探索 Redux 中间件** <br/>
  https://blog.krawaller.se/posts/exploring-redux-middleware/ <br/>
  通过一系列小实验理解中间件。

- **Redux 中间件教程** <br/>
  https://github.com/pshrmn/notes/blob/master/redux/redux-middleware.md <br/>
  概述中间件是什么，`applyMiddleware` 的工作原理，以及如何编写中间件。

- **ReactCasts 第6期：Redux 中间件** <br/>
  https://www.youtube.com/watch?v=T-qtHI1qHIg <br/>
  一段介绍中间件在 Redux 中角色、用途及如何实现自定义中间件的录屏。

- **Redux 中间件初学者指南** <br/>
  https://www.codementor.io/reactjs/tutorial/beginner-s-guide-to-redux-middleware <br/>
  有用的中间件使用说明，包含大量示例。

- **Javascript 中的函数组合** <br/>
  https://joecortopassi.com/articles/functional-composition-in-javascript/ <br/>
  解析 `compose` 函数的工作原理。

## 副作用 - 基础

_介绍在 Redux 中处理异步行为_

- **Stack Overflow: 带超时的 Redux Action 分发** <br/>
  https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559 <br/>
  Dan Abramov 讲解 Redux 异步行为管理基础，分步演示不同方案（内联异步调用、异步 action 创建者、thunk 中间件）。

- **Stack Overflow: 为什么 Redux 异步流需要中间件？** <br/>
  https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594 <br/>
  Dan Abramov 给出使用 thunk 和异步中间件的理由，以及 thunk 的多种实用模式。

- **“thunk” 是什么？** <br/>
  https://daveceddia.com/what-is-a-thunk/ <br/>
  快速解释“thunk”一词的一般含义及 Redux 中的含义。

- **Redux 中的 Thunk：基础** <br/>
  https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60 <br/>
  详细介绍 thunk 是什么、解决了什么问题以及如何使用。

## 副作用 - 进阶

_管理异步行为的高级工具和技巧_

- **Redux 中异步操作的正确方法是什么？** <br/>
  https://decembersoft.com/posts/what-is-the-right-way-to-do-asynchronous-operations-in-redux/ <br/>
  优秀分析比较各种 Redux 副作用库的工作方式。

- **Redux 四种方式** <br/>
  https://medium.com/react-native-training/redux-4-ways-95a130da0cdc <br/>
  并列比较使用 thunk、saga、observable 和 promise 中间件实现基本数据获取。

- **惯用 Redux：关于 Thunks、Sagas、抽象和复用的思考** <br/>
  https://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/ <br/>
  针对“thunks 很糟糕”的反馈的回应，辩称 thunks（和 sagas）仍然是管理复杂同步逻辑和异步副作用的有效办法。

- **Javascript 力量工具：Redux-Saga** <br/>
  https://formidable.com/blog/2017/javascript-power-tools-redux-saga/ <br/>
  https://formidable.com/blog/2017/composition-patterns-in-redux-saga/ <br/>
  https://formidable.com/blog/2017/real-world-redux-saga-patterns/ <br/>
  精彩系列，讲解 Redux-Saga 的理念、实现和优点，包括如何用 ES6 生成器控制函数流程，如何组合 saga 实现并发，以及实际使用场景。

- **探索 Redux Sagas** <br/>
  https://medium.com/onfido-tech/exploring-redux-sagas-cc1fca2015ee <br/>
  一篇出色文章，探讨如何用 saga 创建解耦的业务逻辑胶层于 Redux 应用。

- **用 Sagas 驯服 Redux** <br/>
  https://objectpartners.com/2017/11/20/taming-redux-with-sagas/ <br/>
  Redux-Saga 概述，包含生成器函数、应用场景、用 saga 处理 Promise 和 saga 测试相关内容。

- **基于 RxJS 的响应式 Redux 状态** <br/>
  https://ivanjov.com/reactive-redux-state-with-rxjs/ <br/>
  介绍“响应式编程”概念及 RxJS 库，展示如何用 redux-observable 获取数据，并附有测试示例。

- **使用 redux-observable 处理 Redux 中异步逻辑** <br/>
  https://medium.com/dailyjs/using-redux-observable-to-handle-asynchronous-logic-in-redux-d49194742522 <br/>
  深入文章，对比了基于 thunk 和 observable 的线条绘制异步示例实现。

## Redux 思维

_深入探究 Redux 的使用理念和设计原理_

- **何时（何时不）该使用 Redux** <br />
  https://changelog.com/posts/when-and-when-not-to-reach-for-redux <br />
  Redux 维护者 Mark Erikson 说明 Redux 诞生要解决的问题，以及和其他常用工具的比较。

* **你可能不需要 Redux** <br/>
  https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367 <br/>
  Dan Abramov 讨论使用 Redux 时的权衡利弊。

* **惯用 Redux：Redux 道，第一部分 —— 实现与意图** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/ <br/>
  深入剖析 Redux 真实工作机制、其要求遵循的约束及设计理念。

* **惯用 Redux：Redux 道，第二部分 —— 实践与哲学** <br/>
  https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/ <br/>
  随笔分析常见 Redux 使用模式背后的原因，Redux 可能的其它用法，以及各种模式的优缺点思考。

* **Redux 有何伟大之处？** <br/>
  https://medium.freecodecamp.org/whats-so-great-about-redux-ac16f1cc0f8b <br/>
  深刻且引人入胜的分析，比较 Redux 与面向对象编程及消息传递，指出典型 Redux 用法如何堕落为大量样板代码的“setter”函数，并呼吁在 Redux 之上构建更高层的“主流”抽象以便新人学习和使用。强烈推荐阅读。

## Redux 架构

_组织大型 Redux 应用的模式和实践_

- **避免在应用状态结构中引入意外复杂性** <br/>
  https://hackernoon.com/avoiding-accidental-complexity-when-structuring-your-app-state-6e6d22ad5e2a <br/>
  极佳的 Redux store 结构组织指导原则。

- **Redux 步步为营：适用于真实应用的简单稳健工作流程** <br/>
  https://hackernoon.com/redux-step-by-step-a-simple-and-robust-workflow-for-real-life-apps-1fdf7df46092 <br/>
  上文“意外复杂性”文章的后续，讨论原则。

- **我希望我早知道的 Redux 经验** <br/>
  https://medium.com/horrible-hacks/things-i-wish-i-knew-about-redux-9924abf2f9e0 <br/>
  https://www.reddit.com/r/javascript/comments/4taau2/things_i_wish_i_knew_about_redux/ <br/>
  构建 Redux 应用后的众多实用技巧和经验教训，包含组件连接、数据选择和项目结构相关内容。附 Reddit 上更多讨论。

- **React+Redux：简洁、可靠且可维护代码的技巧和最佳实践** <br/>
  https://speakerdeck.com/goopscoop/react-plus-redux-tips-and-best-practices-for-clean-reliable-and-scalable-code <br/>
  优秀幻灯片，汇集多种提示和建议，包括保持 action 创建者简单和在 reducer 中操作数据、封装 API 调用、避免展开 Props 等。

- **大型 Web 应用中的状态管理：Redux** <br/>
  https://blog.mapbox.com/redux-for-state-management-in-large-web-apps-c7f3fab3ce9b <br/>
  极佳的惯用 Redux 架构探讨及实例，展示 Mapbox 如何在 Mapbox Studio 应用中应用这些方法。

## 应用和示例

- **React-Redux RealWorld 示例：真实世界的 TodoMVC** <br/>
  https://github.com/GoThinkster/redux-review <br/>
  以 Redux 构建的全栈“真实世界”示例应用。演示了 Medium 风格的社交博客站点，具备 JWT 认证、CRUD、文章收藏、关注用户、路由等功能。RealWorld 项目同时包含多个不同服务器端和客户端实现，目的是展示同一项目和 API 规范的不同实现对比。

- **Mini-Mek 项目** <br/>
  https://github.com/markerikson/project-minimek <br/>
  用于示范多种实用 Redux 技巧的示例应用，配套“实用 Redux”博客系列 https://blog.isquaredsoftware.com/series/practical-redux。

- **react-redux-yelp-clone** <br/>
  https://github.com/mohamed-ismat/react-redux-yelp-clone <br/>
  FullStackReact “Yelp 克隆”应用的改编版，使用 Redux 和 Redux Saga 替代本地状态，以及 React Router v4、styled-components 和其它现代标准。基于 React-Boilerplate 启动套件。

- **WordPress-Calypso** <br/>
  https://github.com/Automattic/wp-calypso <br/>
  新版 JavaScript 和 API 驱动的 WordPress.com。

- **Sound-Redux** <br/>
  https://github.com/andrewngu/sound-redux <br/>
  使用 React / Redux 构建的 Soundcloud 客户端。

- **Webamp** <br/>
  https://webamp.org <br/>
  https://github.com/captbaritone/webamp <br/>
  浏览器内复刻 Winamp2 的应用，基于 React 和 Redux。支持播放 MP3，且可加载本地 MP3 文件。

- **Tello** <br/>
  https://github.com/joshwcomeau/Tello <br/>
  一个简单且愉快的电视节目跟踪和管理工具。

- **io-808** <br/>
  https://github.com/vincentriemer/io-808 <br/>
  企图完整复刻基于网页的 TR-808 鼓机。

## Redux 文档翻译

- [中文文档](http://camsong.github.io/redux-in-chinese/) — 中文
- [繁體中文文件](https://github.com/chentsulin/redux) — 繁体中文
- [Redux in Russian](https://github.com/rajdee/redux-in-russian) — 俄语
- [Redux en Español](https://es.redux.js.org/) - 西班牙语
- [Redux in Korean](https://ko.redux.js.org/) - 韩语

## 书籍

- **Redux 实战** <br/>
  https://www.manning.com/books/redux-in-action <br/>
  一本全面介绍使用 Redux 各关键方面的书，包括 reducer、action 基础、与 React 的结合、复杂中间件和副作用、应用结构、性能、测试等。很好地解释了多种 Redux 使用方式的优缺点和权衡。Redux 联合维护者 Mark Erikson 个人推荐。

- **完整 Redux 书** <br/>
  https://leanpub.com/redux-book <br/>
  在生产环境如何管理大型状态？为何需要 store 增强器？表单验证的最佳方式是什么？通过简单语言和示例代码解答这些问题及更多，学习使用 Redux 构建复杂且适合生产的 Web 应用。（注：该书现永久免费！）

- **驯服 React 中的状态** <br/>
  https://www.robinwieruch.de/learn-react-redux-mobx-state-management/ <br/>
  如果你已经学习过作者的前一本书《The Road to learn React》，那么《驯服 React 中的状态》将是深入学习 React 状态管理（包括 Redux 和 MobX）的完美补充。你将先学习纯 Redux 不考虑 React，随后学习如何将 Redux 连接到 React 应用。高级章节涵盖规范化、命名、selectors 及异步 action。最后构建一个真实的 React+Redux 应用。

## 课程

- **由 Stephen Grider 授课的现代 React 与 Redux（付费）** <br/>
  https://www.udemy.com/react-redux/ <br/>
  随着使用 React Router、Webpack 和 ES2015 开发应用，本教程帮你掌握 React 和 Redux 基础。课程帮助你快速上手，深入理解核心知识，构建 React 组件和使用 Redux 组建应用结构。

- **由 Tyler McGinnis 授课的 Redux（付费）** <br/>
  https://tylermcginnis.com/courses/redux/ <br/>
  学习 Redux 需在足够大的应用上下文中看到其优势，这也是课程内容丰富的原因。更合适的名字或许是“真实世界中的 Redux”。嫌弃“待办事项”教程？这里适合你。课程深入讲解 Redux 在管理应用状态中的独到之处。构建一个真实世界应用，展示 Redux 如何应对乐观更新和错误处理等边缘场景，同时涵盖 Firebase、CSS Modules 及其他与 Redux 搭配良好的技术。

- **由 Wes Bos 授课的学习 Redux（免费）** <br/>
  https://learnredux.com/ <br/>
  视频课程，带你构建“Reduxstagram” —— 一个简易照片应用，讲解 Redux、React Router 和 React.js 的核心理念。

## 更多资源

- [React-Redux 链接](https://github.com/markerikson/react-redux-links) 是一个精心策划的高质量文章、教程及相关内容目录，涉及 React、Redux、ES2015 等。
- [Redux 生态系统链接](https://github.com/markerikson/redux-ecosystem-links) 是 Redux 相关库、插件及工具的分类集合。
- [Awesome Redux](https://github.com/xgrommx/awesome-redux) 是一个广泛的 Redux 相关仓库列表。
- [DEV 社区](https://dev.to/t/redux) 是分享 Redux 项目、文章和教程，以及开启讨论和寻求 Redux 相关反馈的平台。欢迎各技能水平开发者参与。
