---
id: faq
title: 常见问题索引
sidebar_label: 常见问题索引
description: '常见问题索引：关于 Redux 的常见问题解答'
---

# Redux 常见问题

## 目录

- **通用**
  - [我应该什么时候学习 Redux？](faq/General.md#when-should-i-learn-redux)
  - [我应该什么时候使用 Redux？](faq/General.md#when-should-i-use-redux)
  - [Redux 只能和 React 一起使用吗？](faq/General.md#can-redux-only-be-used-with-react)
  - [使用 Redux 需要特定的构建工具吗？](faq/General.md#do-i-need-to-have-a-particular-build-tool-to-use-redux)
- **Reducers（状态修改函数）**
  - [如何在两个 reducer 之间共享状态？我必须使用 combineReducers 吗？](faq/Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)
  - [处理 action 一定要用 switch 语句吗？](faq/Reducers.md#do-i-have-to-use-the-switch-statement-to-handle-actions)
- **状态组织**
  - [我必须把所有状态放到 Redux 中吗？我还应该使用 React 的 `useState` 或 `useReducer` 吗？](faq/OrganizingState.md#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-usestate-or-usereducer)
  - [我可以把函数、Promise 或其他不可序列化的内容放入 store 状态中吗？](faq/OrganizingState.md#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)
  - [我如何组织嵌套或重复的数据状态？](faq/OrganizingState.md#how-do-i-organize-nested-or-duplicate-data-in-my-state)
  - [我应该把表单状态或其他 UI 状态放入 store 吗？](faq/OrganizingState.md#should-i-put-form-state-or-other-ui-state-in-my-store)
- **Store 配置**
  - [我可以或应该创建多个 store 吗？我能直接导入 store，自己在组件中使用吗？](faq/StoreSetup.md#can-or-should-i-create-multiple-stores-can-i-import-my-store-directly-and-use-it-in-components-myself)
  - [在 store enhancer 中可以或应该有多条 middleware 链吗？中间件函数中的 next 和 dispatch 有什么区别？](faq/StoreSetup.md#is-it-ok-to-have-more-than-one-middleware-chain-in-my-store-enhancer-what-is-the-difference-between-next-and-dispatch-in-a-middleware-function)
  - [我如何只订阅部分状态？可以在订阅中获取被派发的 action 吗？](faq/StoreSetup.md#how-do-i-subscribe-to-only-a-portion-of-the-state-can-i-get-the-dispatched-action-as-part-of-the-subscription)
- **Actions（动作）**
  - [为什么 type 要是字符串，或者至少可序列化？为什么我的 action 类型应该是常量？](faq/Actions.md#why-should-type-be-a-string-why-should-my-action-types-be-constants)
  - [reducer 和 action 之间总是一一对应的吗？](faq/Actions.md#is-there-always-a-one-to-one-mapping-between-reducers-and-actions)
  - [我如何表示诸如 AJAX 调用的“副作用”？为什么我们需要“action creators”、“thunks”和“middleware” 来处理异步行为？](faq/Actions.md#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)
  - [我应该用什么异步中间件？如何在 thunks、sagas、observables 等之间做选择？](faq/Actions.md#what-async-middleware-should-i-use-how-do-you-decide-between-thunks-sagas-observables-or-something-else)
  - [我应该在一个 action creator 里连续派发多个 action 吗？](faq/Actions.md#should-i-dispatch-multiple-actions-in-a-row-from-one-action-creator)
- **不可变数据**
  - [不可变性的好处有哪些？](faq/ImmutableData.md#what-are-the-benefits-of-immutability)
  - [为什么 Redux 要求数据不可变？](faq/ImmutableData.md#why-is-immutability-required-by-redux)
  - [处理数据不可变有哪些方法？我必须用 Immer 吗？](faq/ImmutableData.md#what-approaches-are-there-for-handling-data-immutability-do-i-have-to-use-immer)
  - [使用纯 JavaScript 处理不可变操作有哪些问题？](faq/ImmutableData.md#what-are-the-issues-with-using-plain-javascript-for-immutable-operations)
- **代码结构**
  - [我的文件结构应该是什么样的？我应该如何在项目中组织 action creators 和 reducers？selectors 应该放在哪里？](faq/CodeStructure.md#what-should-my-file-structure-look-like-how-should-i-group-my-action-creators-and-reducers-in-my-project-where-should-my-selectors-go)
  - [我应该如何拆分 reducers 和 action creators 之间的逻辑？我的“业务逻辑”应该放在哪里？](faq/CodeStructure.md#how-should-i-split-my-logic-between-reducers-and-action-creators-where-should-my-business-logic-go)
  - [为什么我应该使用 action creators？](faq/CodeStructure.md#why-should-i-use-action-creators)
  - [websocket 和其他持久连接应该放在哪里？](faq/CodeStructure.md#where-should-websockets-and-other-persistent-connections-live)
  - [我如何在非组件文件中使用 Redux store？](faq/CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files)
- **性能**
  - [Redux 在性能和架构上“扩展”得如何？](faq/Performance.md#how-well-does-redux-scale-in-terms-of-performance-and-architecture)
  - [调用“所有 reducer”处理每个 action 会不会很慢？](faq/Performance.md#wont-calling-all-my-reducers-for-each-action-be-slow)
  - [我必须在 reducer 中深拷贝状态吗？拷贝状态不会很慢吗？](faq/Performance.md#do-i-have-to-deep-clone-my-state-in-a-reducer-isnt-copying-my-state-going-to-be-slow)
  - [我如何减少 store 更新事件的数量？](faq/Performance.md#how-can-i-reduce-the-number-of-store-update-events)
  - [拥有“一棵状态树”会导致内存问题吗？派发很多 action 会占用内存吗？](faq/Performance.md#will-having-one-state-tree-cause-memory-problems-will-dispatching-many-actions-take-up-memory)
  - [缓存远程数据会导致内存问题吗？](faq/Performance.md#will-caching-remote-data-cause-memory-problems)
- **设计决策**
  - [为什么 Redux 不把状态和 action 传给订阅者？](faq/DesignDecisions.md#why-doesnt-redux-pass-the-state-and-action-to-subscribers)
  - [为什么 Redux 不支持用类来定义 actions 和 reducers？](faq/DesignDecisions.md#why-doesnt-redux-support-using-classes-for-actions-and-reducers)
  - [为什么 middleware 的签名使用了柯里化？](faq/DesignDecisions.md#why-does-the-middleware-signature-use-currying)
  - [为什么 applyMiddleware 使用了闭包来封装 dispatch？](faq/DesignDecisions.md#why-does-applymiddleware-use-a-closure-for-dispatch)
  - [为什么 `combineReducers` 在调用每个 reducer 时不包含整个状态作为第三个参数？](faq/DesignDecisions.md#why-doesnt-combinereducers-include-a-third-argument-with-the-entire-state-when-it-calls-each-reducer)
  - [为什么 mapDispatchToProps 不允许使用从 `getState()` 或 `mapStateToProps()` 返回的值？](faq/DesignDecisions.md#why-doesnt-mapdispatchtoprops-allow-use-of-return-values-from-getstate-or-mapstatetoprops)
- **React Redux**
  - [我为什么要使用 React-Redux？](faq/ReactRedux.md#why-should-i-use-react-redux)
  - [为什么我的组件不重新渲染，或者 mapStateToProps 不执行？](faq/ReactRedux.md#why-isnt-my-component-re-rendering-or-my-mapstatetoprops-running)
  - [为什么我的组件渲染太频繁？](faq/ReactRedux.md#why-is-my-component-re-rendering-too-often)
  - [我如何加速 mapStateToProps？](faq/ReactRedux.md#how-can-i-speed-up-my-mapstatetoprops)
  - [为什么我的连接组件没有 this.props.dispatch？](faq/ReactRedux.md#why-dont-i-have-thispropsdispatch-available-in-my-connected-component)
  - [我应该只连接顶层组件，还是可以在组件树中连接多个组件？](faq/ReactRedux.md#should-i-only-connect-my-top-component-or-can-i-connect-multiple-components-in-my-tree)
- **其他**
  - [有没有什么大型的“真实” Redux 项目？](faq/Miscellaneous.md#are-there-any-larger-real-redux-projects)
  - [我如何在 Redux 中实现身份验证？](faq/Miscellaneous.md#how-can-i-implement-authentication-in-redux)