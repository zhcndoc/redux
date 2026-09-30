---
id: faq
title: 常见问题索引
sidebar_label: 常见问题索引
description: '常见问题索引：关于 Redux 的常见问题解答'
---

# Redux 常见问题

## 目录

- **通用问题**
  - [我什么时候应该学习 Redux？](faq/General.md#when-should-i-learn-redux)
  - [我什么时候应该使用 Redux？](faq/General.md#when-should-i-use-redux)
  - [Redux 只能和 React 一起使用吗？](faq/General.md#can-redux-only-be-used-with-react)
  - [使用 Redux 需要特定的构建工具吗？](faq/General.md#do-i-need-to-have-a-particular-build-tool-to-use-redux)
- **Reducer**
  - [如何在两个 reducer 之间共享状态？我必须使用 combineReducers 吗？](faq/Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)
  - [处理 action 一定要用 switch 语句吗？](faq/Reducers.md#do-i-have-to-use-the-switch-statement-to-handle-actions)
- **状态组织**
  - [我必须把所有状态都放进 Redux 吗？我还应该使用 React 的 `useState` 或 `useReducer` 吗？](faq/OrganizingState.md#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-usestate-or-usereducer)
  - [可以把函数、Promise 或其他不可序列化的值放进 store 状态吗？](faq/OrganizingState.md#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state)
  - [如何组织嵌套或重复的数据？](faq/OrganizingState.md#how-do-i-organize-nested-or-duplicate-data-in-my-state)
  - [应该把表单状态或其他 UI 状态放进 store 吗？](faq/OrganizingState.md#should-i-put-form-state-or-other-ui-state-in-my-store)
- **Store 配置**
  - [可以或应该创建多个 store 吗？可以直接导入 store 并在组件中使用吗？](faq/StoreSetup.md#can-or-should-i-create-multiple-stores-can-i-import-my-store-directly-and-use-it-in-components-myself)
  - [store enhancer 中可以有多条中间件链吗？中间件函数里的 next 和 dispatch 有什么区别？](faq/StoreSetup.md#is-it-ok-to-have-more-than-one-middleware-chain-in-my-store-enhancer-what-is-the-difference-between-next-and-dispatch-in-a-middleware-function)
  - [如何只订阅部分状态？能否在订阅回调中获取派发的 action？](faq/StoreSetup.md#how-do-i-subscribe-to-only-a-portion-of-the-state-can-i-get-the-dispatched-action-as-part-of-the-subscription)
- **Action**
  - [为什么 type 应该是字符串或至少可序列化？为什么 action 类型应该是常量？](faq/Actions.md#why-should-type-be-a-string-why-should-my-action-types-be-constants)
  - [reducer 和 action 总是一一对应吗？](faq/Actions.md#is-there-always-a-one-to-one-mapping-between-reducers-and-actions)
  - [如何表示 AJAX 调用等“副作用”？为什么需要 action creator、thunk 和 middleware 来处理异步行为？](faq/Actions.md#how-can-i-represent-side-effects-such-as-ajax-calls-why-do-we-need-things-like-action-creators-thunks-and-middleware-to-do-async-behavior)
  - [应该使用哪种异步中间件？如何在 thunk、saga、observable 等方案之间选择？](faq/Actions.md#what-async-middleware-should-i-use-how-do-you-decide-between-thunks-sagas-observables-or-something-else)
  - [应该在一个 action creator 中连续派发多个 action 吗？](faq/Actions.md#should-i-dispatch-multiple-actions-in-a-row-from-one-action-creator)
- **不可变数据**
  - [不可变性有哪些好处？](faq/ImmutableData.md#what-are-the-benefits-of-immutability)
  - [为什么 Redux 要求不可变性？](faq/ImmutableData.md#why-is-immutability-required-by-redux)
  - [有哪些处理数据不可变性的方法？必须使用 Immer 吗？](faq/ImmutableData.md#what-approaches-are-there-for-handling-data-immutability-do-i-have-to-use-immer)
  - [手动编写不可变更新有哪些问题？](faq/ImmutableData.md#what-are-the-issues-with-writing-immutable-updates-by-hand)
- **代码结构**
  - [文件结构应该是什么样？如何组织 action creator、reducer 和 selector？](faq/CodeStructure.md#what-should-my-file-structure-look-like-how-should-i-group-my-action-creators-and-reducers-in-my-project-where-should-my-selectors-go)
  - [如何在 reducer 和 action creator 之间拆分逻辑？“业务逻辑”应该放在哪里？](faq/CodeStructure.md#how-should-i-split-my-logic-between-reducers-and-action-creators-where-should-my-business-logic-go)
  - [为什么要使用 action creator？](faq/CodeStructure.md#why-should-i-use-action-creators)
  - [WebSocket 和其他持久连接应该放在哪里？](faq/CodeStructure.md#where-should-websockets-and-other-persistent-connections-live)
  - [如何在非组件文件中使用 Redux store？](faq/CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files)
- **性能**
  - [Redux 在性能和架构方面的扩展能力如何？](faq/Performance.md#how-well-does-redux-scale-in-terms-of-performance-and-architecture)
  - [每个 action 都调用所有 reducer，会不会很慢？](faq/Performance.md#wont-calling-all-my-reducers-for-each-action-be-slow)
  - [必须在 reducer 中深拷贝状态吗？复制状态会不会很慢？](faq/Performance.md#do-i-have-to-deep-clone-my-state-in-a-reducer-isnt-copying-my-state-going-to-be-slow)
  - [如何减少 store 更新事件的次数？](faq/Performance.md#how-can-i-reduce-the-number-of-store-update-events)
  - [只有一棵状态树会造成内存问题吗？派发很多 action 会占用内存吗？](faq/Performance.md#will-having-one-state-tree-cause-memory-problems-will-dispatching-many-actions-take-up-memory)
  - [缓存远程数据会造成内存问题吗？](faq/Performance.md#will-caching-remote-data-cause-memory-problems)
- **设计决策**
  - [为什么 Redux 不把 state 和 action 传给订阅者？](faq/DesignDecisions.md#why-doesnt-redux-pass-the-state-and-action-to-subscribers)
  - [为什么 Redux 不支持用类定义 action 和 reducer？](faq/DesignDecisions.md#why-doesnt-redux-support-using-classes-for-actions-and-reducers)
  - [为什么 middleware 的签名使用柯里化？](faq/DesignDecisions.md#why-does-the-middleware-signature-use-currying)
  - [为什么 applyMiddleware 用闭包封装 dispatch？](faq/DesignDecisions.md#why-does-applymiddleware-use-a-closure-for-dispatch)
  - [为什么 `combineReducers` 调用每个 reducer 时不把整个 state 作为第三个参数传入？](faq/DesignDecisions.md#why-doesnt-combinereducers-include-a-third-argument-with-the-entire-state-when-it-calls-each-reducer)
  - [为什么 mapDispatchToProps 不能使用 `getState()` 或 `mapStateToProps()` 的返回值？](faq/DesignDecisions.md#why-doesnt-mapdispatchtoprops-allow-use-of-return-values-from-getstate-or-mapstatetoprops)
- **React Redux**
  - [为什么要使用 React-Redux？](faq/ReactRedux.md#why-should-i-use-react-redux)
  - [为什么我的组件没有重新渲染？](faq/ReactRedux.md#why-isnt-my-component-re-rendering)
  - [为什么我的组件重新渲染得太频繁？](faq/ReactRedux.md#why-is-my-component-re-rendering-too-often)
  - [如何从 store 中选择多个值？](faq/ReactRedux.md#how-do-i-select-multiple-values-from-the-store)
  - [如何在 React 18 和 React 19 中使用 Redux？](faq/ReactRedux.md#how-do-i-use-redux-with-react-18-and-react-19)
  - [如何在组件外访问 store？](faq/ReactRedux.md#how-do-i-access-the-store-outside-a-component)
  - [如何为 `useSelector` 和 `useDispatch` 添加类型？](faq/ReactRedux.md#how-do-i-type-useselector-and-usedispatch)
  - [`connect` 仍受支持吗？](faq/ReactRedux.md#is-connect-still-supported)
  - [Redux 与 React Context API 有什么区别？](faq/ReactRedux.md#how-does-redux-compare-to-the-react-context-api)
- **其他问题**
  - [有哪些规模较大的“真实” Redux 项目？](faq/Miscellaneous.md#are-there-any-larger-real-redux-projects)
  - [如何在 Redux 中实现身份验证？](faq/Miscellaneous.md#how-can-i-implement-authentication-in-redux)
