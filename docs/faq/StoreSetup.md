---
id: store-setup
title: 商店设置
sidebar_label: 商店设置
---

## Redux 常见问答：商店设置

### 我可以或应该创建多个 store 吗？我能否直接导入我的 store，并自己在组件中使用？

最初的 Flux 模式描述的是在一个应用中拥有多个“stores”，每个 store 保存不同领域的数据。这可能会引入诸如需要一个 store “`waitFor`” 另一个 store 更新的问题。在 Redux 中不需要这样做，因为通过将单一 reducer 拆分为多个小的 reducer，已经实现了数据领域的分离。

和其他几个问题类似，在页面中 _可以_ 创建多个独立的 Redux store，但推荐的模式是只有一个 store。拥有单一 store 能够使用 Redux DevTools，使持久化和重新加载数据更简单，并简化订阅逻辑。

使用多个 Redux store 的一些合理理由可能包括：

- 通过性能分析确认某部分状态更新过于频繁，导致性能问题时使用。
- 将 Redux 应用隔离为更大应用中的一个组件，在这种情况下，您可能希望为每个根组件实例创建一个 store。

但是，创建新 store 不应成为你的第一选择，特别是如果你来自 Flux 背景。先尝试 reducer 组合，只有在这无法解决问题时才使用多个 store。

类似地，虽然你 _可以_ 直接通过导入方式引用你的 store 实例，但这不是 Redux 推荐的模式。如果你创建 store 实例并从模块中导出它，它将成为单例。这意味着如果需要将 Redux 应用隔离为更大的应用组件，或者启用服务器端渲染时会更困难，因为在服务器上你希望为每个请求创建独立的 store 实例。

在使用 [React Redux](https://github.com/reduxjs/react-redux) 时，`connect()` 函数生成的包装类确实会查找 `props.store`（如果存在），但最好是将根组件包裹在 `<Provider store={store}>` 中，并让 React Redux 负责传递 store。这样组件无需关心导入 store 模块，且后续隔离 Redux 应用或启用服务器渲染更容易。

#### 进一步信息

**文档**

- [API: Store](../api/Store.md)

**讨论**

- [#1346: 仅有一个 'stores' 目录是不是不好的实践？](https://github.com/reduxjs/redux/issues/1436)
- [Stack Overflow: Redux 多个 stores，为什么不推荐？](https://stackoverflow.com/questions/33619775/redux-multiple-stores-why-not)
- [Stack Overflow: 如何在 action 创建者中访问 Redux 状态](https://stackoverflow.com/questions/35667249/accessing-redux-state-in-an-action-creator)
- [Gist: 跳出 Redux 范式以隔离应用](https://gist.github.com/gaearon/eeee2f619620ab7b55673a4ee2bf8400)

### 在我的 store enhancer 中使用多个中间件链可以吗？中间件函数中 `next` 和 `dispatch` 的区别是什么？

Redux 中间件就像一个链表。每个中间件函数可以调用 `next(action)` 将 action 传递给链中的下一个中间件，调用 `dispatch(action)` 重新从链的开头处理这个 action，或者完全不调用任何函数以阻止该 action 继续被处理。

这一中间件链由在创建 store 时传递给 `applyMiddleware` 函数的参数定义。定义多个链将无法正常工作，因为它们会拥有不同的 `dispatch` 引用，不同的链将实际上相互断开。

#### 进一步信息

**文档**

- [Redux 基础知识：Store - 中间件](../tutorials/fundamentals/part-4-store.md#middleware)
- [API: applyMiddleware](../api/applyMiddleware.md)

**讨论**

- [#1051: 现有 applyMiddleware 和 createStore 组合的缺陷](https://github.com/reduxjs/redux/issues/1051)
- [认识 Redux 中间件](https://medium.com/@meagle/understanding-87566abcfb7a)
- [探讨 Redux 中间件](https://blog.krawaller.se/posts/exploring-redux-middleware/)

### 如何只订阅部分状态？是否可以在订阅时获取派发的 action？

Redux 提供了单个的 `store.subscribe` 方法，用于通知监听者 store 已更新。监听器回调不会接收当前状态作为参数——它只是表明 _某些_ 状态发生了变化。订阅逻辑可以随后调用 `getState()` 来获取当前状态值。

此 API 设计为一个低级原语，没有依赖和复杂性，可用于构建更高级的订阅逻辑。UI 绑定诸如 React Redux 可以为每个连接组件创建一个订阅。也可以编写函数，智能地比较旧状态与新状态，并在某些部分变化时执行额外逻辑。例子包括 [redux-watch](https://github.com/jprichardson/redux-watch)、[redux-subscribe](https://github.com/ashaffer/redux-subscribe) 和 [redux-subscriber](https://github.com/ivantsov/redux-subscriber)，它们提供了不同的指定订阅和处理变化的方法。

新状态不会传递给监听器，是为了简化像 Redux DevTools 这样的 store enhancer 的实现。此外，订阅者的目的是响应状态本身，而不是 action。如果 action 很重要并需要专门处理，则应该使用中间件。

#### 进一步信息

**文档**

- [基础知识：Store](../tutorials/fundamentals/part-4-store.md)
- [API: Store](../api/Store.md)

**讨论**

- [#303: subscribe API 希望带有状态参数](https://github.com/reduxjs/redux/issues/303)
- [#580: 能否在 store.subscribe 中获取 action 和 state？](https://github.com/reduxjs/redux/issues/580)
- [#922: 提议：在中间件 API 中添加 subscribe](https://github.com/reduxjs/redux/issues/922)
- [#1057: 订阅监听器可以获得 action 参数吗？](https://github.com/reduxjs/redux/issues/1057)
- [#1300: Redux 很棒，但缺少主要功能](https://github.com/reduxjs/redux/issues/1300)

**库**

- [Redux 附加组件目录：Store 变更订阅](https://github.com/markerikson/redux-ecosystem-links/blob/master/store.md#store-change-subscriptions)