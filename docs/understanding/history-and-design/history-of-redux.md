---
id: history-of-redux
title: Redux 的历史
description: '理解 > Redux 的历史'
---

# Redux 的（简短）历史

## 2011：JavaScript MVC 框架

早期的 JavaScript MVC 框架如 AngularJS、Ember 和 Backbone 都存在一些问题。AngularJS 试图强制将“控制器”与模板分离，但没有任何机制阻止你在模板中写 `<div onClick="$ctrl.some.deeply.nested.field = 123">`。与此同时，Backbone 基于事件发布-订阅机制——模型（Models）、集合（Collections）和视图（Views）都能够发出事件。模型可能会触发 `"change:firstName"` 事件，视图会订阅这些事件。但_任何_代码都可以订阅这些事件并执行更多逻辑，这可能会触发_更多_事件。

这让这些框架非常难以调试和维护。比如，更新一个模型中的字段可能会触发几十个事件和应用中的各种逻辑；或者任何模板都可以随时修改状态，使得无法理解当你更新状态时会发生什么。

## 2014：Flux

大约在 2012-2013 年，当 React 首次公开发布时，Facebook 已内部使用 React 数年。他们遇到的问题之一是，就像“有多少未读通知”这样的数据需要多个独立 UI 组件访问，但他们发现使用 Backbone 风格代码时很难理清这些逻辑。

Facebook 最终提出了一种称为“Flux”的模式：创建多个单例的 Stores，比如 `PostsStore` 和 `CommentsStore`。这些 Store 实例会注册到一个 `Dispatcher`，而触发 Store 更新的_唯一_方式是调用 `Dispatcher.dispatch({type: "somethingHappened"})`。这个简单的对象被称为“action”。核心思想是所有状态更新逻辑都半集中化——你不能随意让应用中的任意部分去变更状态，所有的状态更新都是可预测的。

Facebook 于 2014 年左右宣布了这一“Flux 架构”概念，但并未提供完整的库实现。这促使 React 社区构建了数十个受 Flux 启发、但各有变体的库。

## 2015：Redux 的诞生

2015 年中，Dan Abramov 开始构建又一个受 Flux 启发的库，称为 Redux。这个库的目的是展示“时间旅行调试”，他在[一次大会演讲](https://youtu.be/xsSnOQynTHs?t=601)中展示了它。Redux 设计采用 Flux 模式，但加入了一些函数式编程的原则。不是用 Store _实例_，而是用可预测的 reducer 函数实现不可变更新。这让我们可以前后跳转来查看各个时间点上的状态，还使代码更简洁、易测试且易理解。

Redux 于 2015 年发布，迅速击败了其他所有受 Flux 启发的库。React 生态中的高级开发者率先采纳，到 2016 年，许多人开始说“如果你用 React，就_必须_用 Redux”。（坦白说，这导致很多人在不需要用 Redux 的地方也使用了它！）

当时还值得注意的是，React 只有旧版的 Context API，这个 API 基本上是坏的：它无法正确向下传递_更新后的_值。于是可以在 Context 中放事件发射器并订阅，但不能真正用来传递普通数据。这让许多人开始用 Redux，因为它是唯一能一致传递整个应用中更新值的方案。

Dan 早期就说过：“Redux 并非写最少代码的方式——它是为了让代码可预测且易懂”。这意味着状态更新必须遵循统一模式（状态由 reducer 更新，查看 reducer 逻辑即可知道状态可能是什么，action 有哪些，action 会造成何种更新）。与此同时，将逻辑移出组件树，UI 只需表达“发生了某事”，组件就变得更简单。此外，纯函数式代码（如 reducers 和 selectors）更易理解：输入参数、输出结果，别无他事。最后，Redux 的设计还支持 Redux DevTools，可展示可读的所有 dispatch 事件、每个 action/state 的内容及更新。

早期 Redux 模式模板代码非常多。通常会有 `actions/todos.js`、`reducers/todos.js`、`constants/todos.js`，仅为定义一个 action 类型（`const ADD_TODO = "ADD_TODO"`）、action 创建函数和 reducer 分支。你还需要用扩展运算符手写不可变更新，非常容易出错。大家确实会用 Redux 来缓存和请求服务器状态，但写 thunk 拉取数据、派发 action，管理 reducer 中的缓存状态都需大量手写代码。

虽然 Redux 因这些模板代码量而饱受诟病，但它依然受欢迎。

## 2017：生态系统的竞争

到了 2017-18 年，情况发生了变化。社区更多关注“数据获取与缓存”，而非“客户端状态管理”，于是出现了 Apollo、React Query、SWR 和 Urql 等数据获取库。与此同时，全新 React Context API 也发布，可正确传递更新值。

这意味着 Redux 不再“必需”——存在其他工具解决类似问题，且往往代码更少。“模板代码繁多”的抱怨也使 Redux 用户中产生不少担忧。

## 2019：Redux Toolkit

所以，在 2019 年，我们构建并发布了 Redux Toolkit（RTK），为用更少代码写 Redux 逻辑提供了更简单的方式。RTK 依旧是“Redux”（单一 Store，通过派发 action 触发不可变 reducer 更新），但 API 更简洁，默认行为更佳。它还包括了 RTK Query，受 React Query 和 Apollo 启发的内置数据获取与缓存库。

如今，[RTK 是编写 Redux 逻辑的标准方式](../../introduction/why-rtk-is-redux-today.md)。像所有工具一样，它有权衡。RTK 的代码量可能比 Zustand 多，但提供了有用的模式来将应用逻辑与 UI 分离。Redux 并非适合所有应用，但它仍是 React 应用中最广泛使用的状态管理库，拥有优良文档和丰富功能，帮助你构建结构一致且可预测的应用。

## 更多信息

- [Redux 的道——第 1 部分：实现与意图](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)
- [为什么 React Context 不是“状态管理”工具（以及为何不能替代 Redux）](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/)
- [规范的 Redux：Redux Toolkit 1.0](https://blog.isquaredsoftware.com/2019/10/redux-toolkit-1.0/)
- [Changelog #187：Dan Abramov 谈 Redux](https://changelog.com/podcast/187)
- [Redux 考古与设计笔记](https://gist.github.com/markerikson/2971210292a9c65138eeb33ae7d560b0)（含早期设计讨论链接和项目设计目标描述）