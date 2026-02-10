---
id: actions
title: 操作（Actions）
sidebar_label: 操作（Actions）
---

## Redux 常见问题：操作（Actions）

### 为什么 `type` 应该是字符串？为什么我的操作类型应该是常量？

与状态一样，可序列化的操作支持 Redux 的几个核心特性，比如时间旅行调试，以及记录和重放操作。如果 `type` 使用类似 `Symbol` 的类型或对操作本身使用 `instanceof` 检查，就会破坏这些功能。字符串是可序列化且自描述的，因此是更好的选择。请注意，如果操作旨在由中间件使用，操作中使用 Symbols、Promises 或其他不可序列化的值也是可以的。操作只需在真正到达 store 并传递给 reducer 时是可序列化的。

出于性能考虑，我们无法可靠地强制所有操作都可序列化，所以 Redux 仅检查每个操作必须是一个普通对象，且 `type` 是字符串。其余由你自己决定，但你可能会发现保持一切可序列化有助于调试和重现问题。

封装并集中常用代码片段是编程的关键概念。虽然确实可以在任何地方手动创建操作对象并手写每个 `type` 字符串，但定义可复用的常量会使代码维护更便捷。如果把常量放到单独的文件中，还可以通过工具[检查导入语句中的拼写错误](https://www.npmjs.com/package/eslint-plugin-import)，防止意外使用错误的字符串。

#### 更多信息

**文档**

- [使用 Redux: 减少样板代码](../usage/ReducingBoilerplate.md#actions)

**讨论**

- [#384: 建议将操作常量命名为过去式](https://github.com/reactjs/redux/issues/384)
- [#628: 简化操作创建的方案](https://github.com/reactjs/redux/issues/628)
- [#1024: 提案：声明式 reducer](https://github.com/reactjs/redux/issues/1024)
- [#1167: 不用 switch 的 reducer](https://github.com/reactjs/redux/issues/1167)
- [Stack Overflow: 为什么 Redux 需要“操作”作为数据？](https://stackoverflow.com/q/34759047/62937)
- [Stack Overflow: Redux 中定义常量的意义是什么？](https://stackoverflow.com/q/34965856/62937)

### reducer 和操作之间是否总是一一对应的？

不是。我们建议编写独立的小型 reducer 函数，每个 reducer 负责特定状态片段的更新。我们称这种模式为“reducer 组合”。一个操作可以被全部、部分或无任何 reducer 处理。这样保持组件与实际数据变动解耦，因为一个操作可能影响状态树的不同部分，组件无需知道这些细节。一些用户会选择更紧密地绑定它们，比如“ducks” 文件结构，但默认情况下绝不存在一一对应关系。如果你发现需要在多个 reducer 中处理同一个操作，应该跳出一一对应的思维模式。

#### 更多信息

**文档**

- [基础知识：状态、操作、reducers](../tutorials/fundamentals/part-3-state-actions-reducers.md)
- [使用 Redux：组织 reducers](../usage/structuring-reducers/StructuringReducers.md)

**讨论**

- [Twitter：最常见的 Redux 误解](https://twitter.com/dan_abramov/status/682923564006248448)
- [#1167: 不用 switch 的 reducer](https://github.com/reactjs/redux/issues/1167)
- [Reduxible #8: Reducers 和 action creators 不是一一对应](https://github.com/reduxible/reduxible/issues/8)
- [Stack Overflow: 能否在没有 Redux Thunk 中间件的情况下分发多个操作？](https://stackoverflow.com/questions/35493352/can-i-dispatch-multiple-actions-without-redux-thunk-middleware/35642783)

### 如何表现 “副作用” 例如 AJAX 请求？为什么需要 “操作创建者”、“thunks” 和 “中间件” 来处理异步行为？

这是一个复杂且意见多样的话题，关于代码应如何组织以及应采用何种方案各家观点不一。

任何有意义的 Web 应用都需要执行复杂逻辑，通常包括异步工作，如 AJAX 请求。这类代码不再单纯是输入的函数，其与外部世界的交互称为[“副作用”](https://en.wikipedia.org/wiki/Side_effect_%28computer_science%29)。

Redux 受到函数式编程的启发，开箱即用时没有执行副作用的方案。具体来说，reducer 函数必须始终是纯函数，形式为 `(state, action) => newState`。但 Redux 的中间件可以拦截派发的操作并在周围添加复杂行为，包括副作用。

通常，Redux 建议把副作用代码放进操作创建流程中。尽管这些逻辑可以写在 UI 组件中，但通常更合理抽象成可复用函数，这样同一逻辑可被多处调用，也就是操作创建者函数。

最简单且常用的做法是添加 [Redux Thunk](https://github.com/reduxjs/redux-thunk) 中间件，允许你编写包含更复杂异步逻辑的操作创建者。另一种广泛使用的方案是 [Redux Saga](https://github.com/yelouafi/redux-saga)，它使用 generator 函数编写看似同步的代码，能够表现像 Redux 应用中的“后台线程”或“守护进程”。还有一种方案是 [Redux Loop](https://github.com/raisemarketplace/redux-loop)，它通过倒置流程，使 reducer 在响应状态变化时声明副作用，由其他机制执行。除此之外，社区还开发了许多其他库和思路，每个都有自己对副作用管理的看法。

#### 更多信息

**文档**

- [Redux 基础：异步逻辑和数据流](../tutorials/fundamentals/part-6-async-logic.md)
- [Redux 基础：Store - Middleware（中间件）](../tutorials/fundamentals/part-4-store.md#middleware)

**文章**

- [Redux 副作用与您](https://medium.com/@fward/redux-side-effects-and-you-66f2e0842fc3)
- [Redux 中的纯功能和副作用](http://blog.hivejs.org/building-the-ui-2/)
- [从 Flux 到 Redux：简单易用的异步操作](http://danmaz74.me/2015/08/19/from-flux-to-redux-async-actions-the-easy-way/)
- [React/Redux 资源链接：“Redux 副作用”分类](https://github.com/markerikson/react-redux-links/blob/master/redux-side-effects.md)
- [Gist: Redux-Thunk 示例](https://gist.github.com/markerikson/ea4d0a6ce56ee479fe8b356e099f857e)

**讨论**

- [#291: 试图把 API 调用放到合适位置](https://github.com/reactjs/redux/issues/291)
- [#455: 副作用建模](https://github.com/reactjs/redux/issues/455)
- [#533: 简明介绍异步操作创建者](https://github.com/reactjs/redux/issues/533)
- [#569: 提案：显式副作用 API](https://github.com/reactjs/redux/pull/569)
- [#1139: 基于 generator 和 saga 的替代副作用模型](https://github.com/reactjs/redux/issues/1139)
- [Stack Overflow: 为什么 Redux 中异步流程需要中间件？](https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux)
- [Stack Overflow: 如何带超时分发 Redux 操作？](https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559)
- [Stack Overflow: Redux 中同步副作用该放哪里？](https://stackoverflow.com/questions/32982237/where-should-i-put-synchronous-side-effects-linked-to-actions-in-redux/33036344)
- [Stack Overflow: 如何在 Redux 中处理复杂副作用？](https://stackoverflow.com/questions/32925837/how-to-handle-complex-side-effects-in-redux/33036594)
- [Stack Overflow: 如何单元测试异步 Redux 操作并模拟 ajax 响应？](https://stackoverflow.com/questions/33011729/how-to-unit-test-async-redux-actions-to-mock-ajax-response/33053465)
- [Stack Overflow: 如何在 Redux 状态变化时触发 AJAX 请求？](https://stackoverflow.com/questions/35262692/how-to-fire-ajax-calls-in-response-to-the-state-changes-with-redux/35675447)
- [Reddit: 使用 Redux-Promise Middleware 完成异步 API 调用的帮助](https://www.reddit.com/r/reactjs/comments/469iyc/help_performing_async_api_calls_with_reduxpromise/)
- [Twitter: 可能的 saga、loops 和其他方案对比](https://twitter.com/dan_abramov/status/689639582120415232)

### 应该使用哪种异步中间件？如何在 thunks、sagas、observables 或其他方案间做选择？

有[许多可用的异步/副作用中间件](https://github.com/markerikson/redux-ecosystem-links/blob/master/side-effects.md)，但最常用的是 [`redux-thunk`](https://github.com/reduxjs/redux-thunk)、[`redux-saga`](https://github.com/redux-saga/redux-saga) 和 [`redux-observable`](https://github.com/redux-observable/redux-observable)。这些工具各有特长、弱点和适用场景。

通用建议：

- Thunks 适合复杂的同步逻辑（尤其是需要读取整个 Redux store 状态的代码）和简单异步逻辑（如基本 AJAX 请求）。借助 `async/await`，thunks 也能胜任部分较复杂的 Promise 逻辑。
- Sagas 适合复杂异步逻辑和解耦的“后台线程”类型行为，尤其是在需要监听派发操作时（这是 thunks 做不到的）。使用时需要熟悉 generator 函数及 `redux-saga` 的“effects”操作符。
- Observables 与 sagas 解决同样的问题，但依赖 RxJS 来实现异步行为。使用时需熟悉 RxJS API。

我们建议大多数 Redux 用户从 thunks 开始使用，只有在应用确实需要更复杂的异步逻辑处理时，才添加 sagas 或 observables 等副作用库。

因为 sagas 和 observables 适用场景相同，一个应用一般选其一，而不会两者兼用。但注意，**使用 thunks 以及 sagas 或 observables 其一是完全可以共存的**，因为它们解决的是不同的问题。

**文章**

- [Decembersoft：Redux 中异步操作的正确用法？](https://decembersoft.com/posts/what-is-the-right-way-to-do-asynchronous-operations-in-redux/)
- [Redux-Thunk vs Redux-Saga：概览](https://medium.com/@shoshanarosenfield/redux-thunk-vs-redux-saga-93fe82878b2d)
- [Redux-Saga 与 Redux-Observable 对比](https://hackmd.io/s/H1xLHUQ8e#side-by-side-comparison)

**讨论**

- [Reddit: 关于同时使用 thunks 和 sagas 以及 sagas 优缺点的讨论](https://www.reddit.com/r/reactjs/comments/8vglo0/react_developer_map_by_adamgolab/e1nr597/)
- [Stack Overflow: 使用 ES2015 生成器的 redux-saga 与 ES2017 async/await 的 redux-thunk 优缺点](https://stackoverflow.com/questions/34930735/pros-cons-of-using-redux-saga-with-es6-generators-vs-redux-thunk-with-es2017-asy)
- [Stack Overflow: 为什么使用 Redux-Observable 而非 Redux-Saga？](https://stackoverflow.com/questions/40021344/why-use-redux-observable-over-redux-saga/40027778#40027778)

### 我应该在一个操作创建者中连续派发多个操作吗？

对于操作的结构没有硬性规定。像 Redux Thunk 这样的异步中间件当然支持连续派发多个相关但不同的操作，派发表示 AJAX 请求进度的操作，根据状态条件派发操作，甚至派发某个操作后立即检查更新的状态。

一般来说，考虑这些操作是相关但独立的，还是应该合并为一个操作。根据你的具体情况做决定，但要权衡 reducer 的可读性和操作日志的可读性。例如，一个包含整个新状态树的操作会让 reducer 变成一行代码，但缺点是你失去了变化原因的历史记录，调试会非常困难。反之，如果你通过循环发送多个细粒度操作，那可能意味着你应该引入一种新的操作类型，并通过不同方式处理。

如果你关心性能，尽量避免在同一时刻连续同步派发多次操作。有许多插件和方案可以对 dispatch 操作进行合并批处理。

#### 更多信息

**文档**

- [FAQ: 性能 - 减少更新事件次数](./Performance.md#how-can-i-reduce-the-number-of-store-update-events)

**文章**

- [Idiomatic Redux: 关于 Thunks、Sagas、抽象和可复用性的思考](https://blog.isquaredsoftware.com/2017/01/idiomatic-redux-thoughts-on-thunks-sagas-abstraction-and-reusability/#multiple-dispatching)

**讨论**

- [#597: 在事件处理器中派发多个操作是否合法？](https://github.com/reactjs/redux/issues/597)
- [#959: 多个操作合成一个 dispatch？](https://github.com/reactjs/redux/issues/959)
- [Stack Overflow: 我应该用一个还是多个操作类型来表示这个异步操作？](https://stackoverflow.com/questions/33637740/should-i-use-one-or-several-action-types-to-represent-this-async-action/33816695)
- [Stack Overflow: 事件和操作在 Redux 中是否一一对应？](https://stackoverflow.com/questions/35406707/do-events-and-actions-have-a-11-relationship-in-redux/35410524)
- [Stack Overflow: “显示/隐藏加载屏幕”这类操作应该由响应相关操作的 reducer 处理，还是由操作创建者本身生成？](https://stackoverflow.com/questions/33220776/should-actions-like-showing-hiding-loading-screens-be-handled-by-reducers-to-rel/33226443#33226443)
- [Twitter: 关于 Redux Thunk 问题的有价值讨论](https://twitter.com/dan_abramov/status/800310164792414208)