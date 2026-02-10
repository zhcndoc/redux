---
id: prior-art
title: 先前技术
description: '理解 > 先前技术：对 Redux 设计的影响'
---

# 先前技术

Redux 有着混合的血统。它与一些设计模式和技术类似，但在重要方面也与它们不同。我们将在下面探讨一些相似点和不同点。

## 开发者体验

Dan Abramov（Redux 作者）在准备他的 React Europe 讲座[“时光旅行的热重载”](https://www.youtube.com/watch?v=xsSnOQynTHs)时编写了 Redux。他的目标是创建一个具有最小 API 但行为完全可预测的状态管理库。Redux 让实现日志记录、热重载、时光旅行、通用应用、录制回放成为可能，且无需开发者额外介入。

Dan 在[Changelog 第187集](https://changelog.com/187)中谈到了他的部分意图和方法。

## 影响

Redux 继承并发展了[Flux](https://facebookarchive.github.io/flux/)的理念，但通过借鉴[Elm](https://github.com/evancz/elm-architecture-tutorial/)避免了复杂性。
即使你没用过 Flux 或 Elm，Redux 也只需几分钟即可上手。

### Flux

Redux 受到了[Flux](https://facebookarchive.github.io/flux/)若干重要特性的启发。和 Flux 一样，Redux 规定你应将模型更新逻辑集中在应用的某一层（Flux 中叫“stores”，Redux 中叫“reducers”）。应用代码不应直接修改数据，而是要将每次变更描述为一个被称作“action”的普通对象。

与 Flux 不同，**Redux 没有 Dispatcher 的概念**。这是因为它依赖纯函数而非事件发射器，纯函数易于组合且无需额外实体进行管理。根据你怎么看 Flux，可能把这看作偏离或实现细节。Flux 常被[描述为 `(state, action) => state`](https://speakerdeck.com/jmorrell/jsconf-uy-flux-those-who-forget-the-past-dot-dot-dot-1)。从这个角度看，Redux 忠于 Flux 架构，但通过纯函数让它更简单。

另一个与 Flux 的重要区别是 **Redux 假设你绝不会修改你的数据**。你可以用普通对象和数组作为状态，但强烈不建议在 reducers 中对它们进行变更。你应始终返回一个新对象，可用对象展开运算符或[Immer 不可变更新库](https://immerjs.github.io/immer/)完成。

虽然技术上可以[编写非纯的 reducer](https://github.com/reduxjs/redux/issues/328#issuecomment-125035516)来改变数据以提升性能，但我们强烈不鼓励这样做。这样会破坏时光旅行、录制回放、热重载等开发特性。况且大部分真实应用中，不可变性并不会带来性能问题；正如[Om](https://github.com/omcljs/om)演示的，即使你放弃了对象分配，也能通过避免昂贵的重新渲染和重新计算获益，因为纯 reducer 让你确切知道了变化所在。

值得一提的是，Flux 的创造者对[Redux](https://twitter.com/fisherwebdev/status/616286955693682688)给予了[认可](https://twitter.com/jingc/status/616608251463909376)。

### Elm

[Elm](https://elm-lang.org/) 是一种受 Haskell 启发，由 [Evan Czaplicki](https://twitter.com/evancz) 创建的函数式编程语言。它强制执行[“模型-视图-更新”架构](https://github.com/evancz/elm-architecture-tutorial/)，其中更新函数签名为 `(action, state) => state`。Elm 中的“updaters”相当于 Redux 中的 reducers。

不同于 Redux，Elm 是一门语言，因此能够受益于强制的纯函数、静态类型、开箱即用的不可变性和模式匹配（使用 `case` 表达式）。即使你不打算用 Elm，也应该了解它的架构并试用。有一个有趣的[JavaScript 库 playground，借鉴了类似的理念](https://github.com/paldepind/noname-functional-frontend-framework)，我们可以从中为 Redux 寻找灵感！想要更接近 Elm 的静态类型能力，可以尝试[使用像 Flow 这样的渐进式类型方案](https://github.com/reduxjs/redux/issues/290)。

### Immutable

[Immutable](https://facebook.github.io/immutable-js) 是一个实现持久化数据结构的 JavaScript 库，性能良好且 API 语义贴近 JavaScript。

（注意，虽然 Immutable.js 曾启发 Redux，但我们今天建议[使用 Immer 来进行不可变更新](../../style-guide/style-guide.md#use-immer-for-writing-immutable-updates)）。

**Redux 不关心你如何存储状态——它可以是普通对象、Immutable 对象或任何其它形式。** 你可能需要一个（反）序列化机制来编写通用应用并从服务器激活状态，但除此之外，只要支持不可变性，你可以使用任何数据存储库。例如，直接用 Backbone 作为 Redux 状态就不合理，因为 Backbone 模型是可变的。

即使你的不可变库支持光标（cursors），你也不该在 Redux 应用中使用。整个状态树应被视为只读，且应通过 Redux 来更新状态和订阅状态更新。因此通过光标写入不适合 Redux。**如果你使用光标的唯一目的是将状态树与 UI 树解耦并逐步细化光标，应该转向使用选择器（selectors）。** 选择器是可组合的 getter 函数。参见 [reselect](https://github.com/faassen/reselect) ，这是一个很好且简洁的选择器实现。

### Baobab

[Baobab](https://github.com/Yomguithereal/baobab) 是另一个流行的库，提供了更新普通 JavaScript 对象的不可变 API。尽管可以和 Redux 一起使用，但两者结合的收益不大。

Baobab 主要功能集中在通过光标更新数据，而 Redux 强制通过分发 action 来修改数据。因此它们解决了同一个问题，但方式不同，互不补充。

与 Immutable 不同，Baobab 目前没有实现任何特殊的高效数据结构，因此与 Redux 结合并不带来额外优势。这种情况下更简单的做法是直接使用普通对象。

### RxJS

[RxJS](https://github.com/ReactiveX/RxJS) 是管理异步应用复杂性的极佳工具。事实上，已经有一个[项目尝试将人机交互建模为相互依赖的 observables](https://cycle.js.org)。

将 Redux 与 RxJS 一起使用合理吗？当然！它们配合得非常好。例如，你可以很容易地将 Redux store 暴露为一个 observable：

```js
function toObservable(store) {
  return {
    subscribe({ next }) {
      const unsubscribe = store.subscribe(() => next(store.getState()))
      next(store.getState())
      return { unsubscribe }
    }
  }
}
```

同样，你可以组合不同的异步流，将它们转换成 action，然后喂给 `store.dispatch()`。

问题是：如果已经使用了 Rx，真的还需要 Redux 吗？可能不需要。用 Rx 来[重新实现 Redux](https://github.com/jas-chen/rx-redux)并不难。有些人说只需两行代码，利用 Rx 的 `.scan()` 方法。很有可能是这样！

如果你犹豫不决，可以查看 Redux 源代码（其实并不复杂），以及它的生态系统（例如，[开发者工具](https://github.com/reduxjs/redux-devtools)）。如果对 Redux 不那么在意，而想一路走到底用响应式数据流，你可能想探索像 [Cycle](https://cycle.js.org) 这样的方案，或者将它与 Redux 结合。告诉我们你的体验吧！

## 评价

> [“喜欢你们在 Redux 上做的事情”](https://twitter.com/jingc/status/616608251463909376)
> Flux 创造者 Jing Chen

> [“我在 FB 的内部 JS 讨论组征求对 Redux 的评价，得到了一致的好评。真是太棒的工作。”](https://twitter.com/fisherwebdev/status/616286955693682688)
> Flux 文档作者 Bill Fisher

> [“很酷，你们发明了一种不是 Flux 的更好 Flux。”](https://twitter.com/andrestaltz/status/616271392930201604)
> Cycle 创造者 André Staltz

## 致谢

- [Elm 架构](https://github.com/evancz/elm-architecture-tutorial)，极佳的用 reducers 建模状态更新介绍；
- [Turning the database inside-out](https://www.confluent.io/blog/turning-the-database-inside-out-with-apache-samza/)，给我带来巨大启发；
- [使用 Figwheel 开发 ClojureScript](https://www.youtube.com/watch?v=j-kj2qwJa_E)，让我相信重新求值应当“开箱即用”；
- [Webpack](https://webpack.js.org/concepts/hot-module-replacement/) 的热模块替换；
- [Flummox](https://github.com/acdlite/flummox)，让我学会以无样板代码、无单例的方式使用 Flux；
- [disto](https://github.com/threepointone/disto)，热加载 Store 的概念性验证；
- [NuclearJS](https://github.com/optimizely/nuclear-js)，证明这种架构可以高性能；
- [Om](https://github.com/omcljs/om)，推广了单状态原子的思想；
- [Cycle](https://github.com/cyclejs/cycle-core)，展示了函数时常是最佳工具；
- [React](https://github.com/facebook/react)，务实的创新。

特别感谢 [Jamie Paton](https://jdpaton.github.io) 将 `redux` NPM 包名转交给我们。

## 赞助人

Redux 的最初工作由[社区资助](https://www.patreon.com/reactdx)完成。
以下是部分杰出公司名单：

- [Webflow](https://github.com/webflow)
- [Ximedes](https://www.ximedes.com/)

[完整的 Redux 赞助人列表](https://github.com/reduxjs/redux/blob/master/PATRONS.md) 以及持续增长的[使用 Redux 的个人和公司列表](https://github.com/reduxjs/redux/issues/310)。
