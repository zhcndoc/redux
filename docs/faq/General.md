---
id: general
title: 通用
sidebar_label: 通用
---

# Redux 常见问题：通用

## 我什么时候应该学习 Redux？

对于 JavaScript 开发者来说，选择学什么可能是一个让人不知所措的问题。通过一次学习一件事，聚焦于工作中遇到的问题，可以缩小选择范围。Redux 是一种管理应用状态的模式。如果你在状态管理上没有遇到问题，可能会难以理解 Redux 的好处。有些 UI 库（比如 React）有它们自己的状态管理系统。如果你正在使用这些库中的一个，尤其是刚开始学习使用它们，我们建议你先学习内置系统的功能。这可能就是构建应用所需要的全部内容。如果你的应用变得非常复杂，以至于你对状态存储的位置或者状态如何变化感到困惑，那么就是学习 Redux 的好时机。

:::tip

**我们建议大多数新手先专注于学习 React，等你对 React 已经比较熟悉后再学习 Redux**。这样一来，学习时需掌握的新概念就会减少，更容易区分哪些概念是 React 自有的，哪些是 Redux 的。你也会更好地理解如何在 React 应用中使用 Redux，以及为什么 Redux 会有用。

:::

#### 进一步信息

**文章**

- [Deciding What Not To Learn](https://gedd.ski/post/what-not-to-learn/)
- [How to learn web frameworks](https://ux.shopify.com/how-to-learn-web-frameworks-9d447cb71e68)
- [Redux vs MobX vs Flux vs... Do you even need that?](https://goshakkk.name/redux-vs-mobx-vs-flux-etoomanychoices/)

**讨论**

- [Ask HN: Overwhelmed with learning front-end, how do I proceed?](https://news.ycombinator.com/item?id=12882816)
- [Twitter: If you want to teach someone to use an abstraction...](https://twitter.com/acemarke/status/901329101088215044)
- [Twitter: it was never intended to be learned before...](https://twitter.com/dan_abramov/status/739961787295117312)
- [Twitter: Learning Redux before React?](https://twitter.com/dan_abramov/status/739962098030137344)
- [Twitter: This was my experience with Redux...](https://twitter.com/garetmckinley/status/901500556568645634)
- [Dev.to: When is it time to use Redux?](https://dev.to/dan_abramov/comment/1n2k)

## 我什么时候应该使用 Redux？

**并非所有应用都需要 Redux。理解你正在构建的应用类型、你需要解决的问题类型，以及哪些工具最适合解决这些问题，都非常重要。**

Redux 帮助你处理共享状态管理，但像任何工具一样，它有权衡取舍。Redux 不是为了写最短或最快的代码设计的。它旨在帮助回答“某个状态片段何时变化，数据来自哪里？”这个问题，并保证行为可预测。需要学习的概念更多，写的代码也更多。它还增加了一些代码间接性，并要求你遵循某些限制。这是在短期生产力和长期生产力之间的权衡。

正如 React 早期贡献者 Pete Hunt 所说：

> 你会知道你什么时候需要 Flux。如果你不确定自己是否需要它，那就说明你不需要。

类似的，Redux 创始人之一 Dan Abramov 说：

> 我想补充一点：在你遇到 vanilla React 难以解决的问题之前，不要用 Redux。

**Redux 最适合用于以下情况：**

- 你有大量应用状态需要在应用中多个地方使用
- 应用状态经常被更新
- 更新状态的逻辑可能比较复杂
- 应用代码规模中等或较大，可能由多人协作开发
- 你需要观察状态随时间的变化过程

还有许多其他工具可以帮助解决 Redux 关注的一些相同问题：状态管理、缓存服务器获取的数据、通过 UI 传递数据。

:::info

如果你不确定 Redux 是否适合你的应用，这些资源提供了更多指导：

- **[什么时候（什么时候不）选择 Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)**
- **[Redux 的道，第一部分 - 实现与意图](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**
- **[你可能不需要 Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)**

:::

归根结底，Redux 只是一个工具。它是个很棒的工具，也有使用它的充分理由，但也有你可能不想使用它的原因。要做出明智的工具选择，并理解每个决策中的权衡取舍。

#### 进一步信息

**文档**

- [Redux 思考方式：动机](../understanding/thinking-in-redux/Motivation.md)

**文章**

- **[什么时候（什么时候不）选择 Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)**
- **[Redux 的道，第一部分 - 实现与意图](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)**
- [你可能不需要 Redux](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367)
- [Flux 的案例](https://medium.com/swlh/the-case-for-flux-379b7d1982c6)

**讨论**

- [Twitter: 使用Redux之前不要...](https://twitter.com/dan_abramov/status/699241546248536064)
- [Twitter: Redux 设计的目的是可预测，而非简洁](https://twitter.com/dan_abramov/status/733742952657342464)
- [Twitter: Redux 有助于消除深层传递 props](https://twitter.com/dan_abramov/status/732912085840089088)
- [Twitter: 除非你对局部组件状态不满意，否则不要用 Redux](https://twitter.com/dan_abramov/status/725089243836588032)
- [Twitter: 如果你的数据永远不变，那么你不需要 Redux](https://twitter.com/dan_abramov/status/737036433215610880)
- [Twitter: 如果你的 reducer 看起来很无聊，那就别用 Redux](https://twitter.com/dan_abramov/status/802564042648944642)
- [Reddit: 如果你的应用只在单页获取数据，那你不需要 Redux](https://www.reddit.com/r/reactjs/comments/5exfea/feedback_on_my_first_redux_app/dagglqp/)
- [Stack Overflow: 为什么用 Redux 而不是 Facebook Flux？](https://stackoverflow.com/questions/32461229/why-use-redux-over-facebook-flux)
- [Stack Overflow: 为什么我在这个例子中应该用 Redux？](https://stackoverflow.com/questions/35675339/why-should-i-use-redux-in-this-example)
- [Stack Overflow: 使用 Redux 代替 Flux 可能有哪些缺点？](https://stackoverflow.com/questions/32021763/what-could-be-the-downsides-of-using-redux-instead-of-flux)
- [Stack Overflow: 什么时候应该给 React 应用添加 Redux？](https://stackoverflow.com/questions/36631761/when-should-i-add-redux-to-a-react-app)
- [Stack Overflow: Redux 与纯 React？](https://stackoverflow.com/questions/39260769/redux-vs-plain-react/39261546#39261546)
- [Twitter: Redux 是一个平台，供开发者基于可复用的东西构建定制化状态管理](https://twitter.com/acemarke/status/793862722253447168)

## Redux 只能和 React 一起使用吗？

Redux 可以作为任何 UI 层的数据存储。最常用的就是和 React 及 React Native 一起使用，但也有 Angular、Angular 2、Vue、Mithril 等的绑定。Redux 仅仅提供了一个订阅机制，任何其他代码都可使用。也就是说，Redux 最有用的场景是配合声明式视图实现，一旦状态改变可以推断出界面更新，例如 React 或类似的库。

## 使用 Redux 需要特定构建工具吗？

Redux 使用现代 JS 语法（ES2020）编写，但代码相当简单。

如果你需要支持较旧浏览器，请自行进行转译。

[counter-vanilla](https://github.com/reduxjs/redux/tree/master/examples/counter-vanilla) 示例展示了如何用 ES5 基础用法，并通过 `<script>` 标签引入 Redux。正如相关 PR 中所说：

> 新的 Counter Vanilla 示例旨在打破 Redux 需要 Webpack、React、热重载、sagas、action creators、常量、Babel、npm、CSS 模块、装饰器、流利的拉丁语、Egghead 订阅、博士学位或 “超过预期” 的 O.W.L. 级别的谣言。
>
> 不，它只是 HTML，一些手工制作的 `<script>` 标签，和经典的 DOM 操作。享受吧！