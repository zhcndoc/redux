---
id: glossary
title: 术语表
---

# 术语表

This is a glossary of the core terms in Redux, along with their type signatures. The types are documented using TypeScript-style type signatures.

## 状态（State） {#state}

```js
type State = any
```

_State_ (also called the _state tree_) is a broad term, but in the Redux API it usually refers to the single state value that is managed by the store and returned by [`getState()`](../../api/Store.md#getstate). It represents the entire state of a Redux application, which is often a deeply nested object.

按照惯例，顶层状态是一个对象或类似 Map 这样的键值集合，但从技术上讲，它可以是任何类型。不过，你应该尽力保持状态可序列化。不要把不能轻易转成 JSON 的东西放进去。

## Action（动作） {#action}

```js
type Action = Object
```

一个_动作_是一个普通对象，表示改变状态的意图。动作是将数据送入 store 的唯一途径。任何数据，不论是来自 UI 事件、网络回调，还是其他来源（例如 WebSocket），最终都需要被派发为动作。

动作必须有一个 `type` 字段，表示正在执行的动作的类型。类型可以定义成常量并从别的模块导入。使用字符串作为 `type` 比使用 [Symbol](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 更好，因为字符串是可序列化的。

Other than `type`, the structure of an action object is really up to you. If you're interested, check out [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action) for recommendations on how actions should be constructed.

参见下文的[异步动作](#async-action)。

## Reducer（纯函数） {#reducer}

```js
type Reducer<S, A> = (state: S, action: A) => S
```

_Reducer_ 是一个函数，接受一个累积值和一个新值，返回新的累积值。它们用于将一组值归约为单一值。

Reducer 并非 Redux 独有——它是函数式编程的基本概念。即使是非函数式语言，如 JavaScript 也内置了归约的 API，即 [`Array.prototype.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)。

在 Redux 中，累积值就是状态对象，被归约的值是动作。Reducer 根据先前状态和动作计算出新的状态。它们必须是_纯函数_——对相同输入返回完全相同输出的函数，且应无副作用。这正是支持热重载和时间旅行等特性的基础。

Reducer 是 Redux 中最重要的概念。

_不要把 API 调用放进 reducer。_

## 派发函数（Dispatching Function） {#派发函数}

```js
type BaseDispatch = (a: Action) => Action
type Dispatch = (a: Action | AsyncAction) => any
```

_派发函数_（或简称 _dispatch 函数_）是一个接受动作或[异步动作](#async-action)的函数；它可能会也可能不会向 store 派发一个或多个动作。

We must distinguish between dispatching functions in general and the base [`dispatch`](../../api/Store.md#dispatchaction) function provided by the store instance without any middleware.

基础的 dispatch 函数_总是_同步地将动作连同 store 返回的之前的状态一并发送到 reducer 来计算新的状态。它期望动作是纯对象，能被 reducer 消费。

[中间件](#middleware)包装基础 dispatch 函数，使得 dispatch 函数能够处理[异步动作](#async-action)和普通动作。中间件可以在传给下一个中间件之前，对动作或异步动作进行转换、延迟、忽略或其他处理。详情见下文。

## Action 创建者（Action Creator） {#action-creator}

```js
type ActionCreator<A, P extends any[] = any[]> = (...args: P) => Action | AsyncAction
```

_动作创建者_ 简单说就是一个创建动作的函数。不要混淆这两个名词——动作是信息的载体，动作创建者是制造动作的“工厂”。

Calling an action creator only produces an action, but does not dispatch it. You need to call the store's [`dispatch`](../../api/Store.md#dispatchaction) function to actually cause the mutation. Sometimes we say _bound action creators_ to mean functions that call an action creator and immediately dispatch its result to a specific store instance.

如果动作创建者需要读取当前状态、执行 API 调用或产生副作用（比如路由跳转），它应该返回一个[异步动作](#async-action)，而不是普通动作。

## 异步动作（Async Action） {#async-action}

```js
type AsyncAction = any
```

An _async action_ is a value that is sent to a dispatching function, but is not yet ready for consumption by the reducer. It will be transformed by [middleware](#middleware) into an action (or a series of actions) before being sent to the base [`dispatch()`](../../api/Store.md#dispatchaction) function. Async actions may have different types, depending on the middleware you use. They are often asynchronous primitives, like a Promise or a thunk, which are not passed to the reducer immediately, but trigger action dispatches once an operation has completed.

## 中间件（Middleware） {#middleware}

```js
type MiddlewareAPI = { dispatch: Dispatch, getState: () => State }
type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch
```

中间件是高阶函数，组合一个[派发函数](#派发函数)来返回一个新的派发函数。它通常将[异步动作](#async-action)转换成动作。

中间件可通过函数组合来组合。它对于记录动作日志、执行副作用（如路由）或将异步 API 调用转换为一系列同步动作非常有用。

详细介绍请参阅 [`applyMiddleware(...middlewares)`](../../api/applyMiddleware.md)。

## Store（状态存储） {#store}

```js
type Store = {
  dispatch: Dispatch
  getState: () => State
  subscribe: (listener: () => void) => () => void
  replaceReducer: (reducer: Reducer) => void
}
```

Store 是持有应用状态树的对象。
Redux 应用中应该只有一个 store，因为组合操作发生在 reducer 层级。

- [`dispatch(action)`](../../api/Store.md#dispatchaction) is the base dispatch function described above.
- [`getState()`](../../api/Store.md#getstate) returns the current state of the store.
- [`subscribe(listener)`](../../api/Store.md#subscribelistener) registers a function to be called on state changes.
- [`replaceReducer(nextReducer)`](../../api/Store.md#replacereducernextreducer) can be used to implement hot reloading and code splitting. Most likely you won't use it.

See the complete [store API reference](../../api/Store.md#dispatchaction) for more details.

## Store 创建者（Store creator）

```js
type StoreCreator = (reducer: Reducer, preloadedState: ?State) => Store
```

A store creator is a function that creates a Redux store. Like with dispatching function, we must distinguish the base store creator, [`createStore(reducer, preloadedState)`](../../api/createStore.md) exported from the Redux package, from store creators that are returned from the store enhancers.

## Store 增强器（Store enhancer） {#store-enhancer}

```js
type StoreEnhancer = (next: StoreCreator) => StoreCreator
```

Store 增强器是高阶函数，它组合一个 store 创建者并返回一个增强后的 store 创建者。这与中间件类似，允许你以可组合的方式改变 store 的接口。

Store 增强器非常类似于 React 中的高阶组件（HOC），后者有时也称为“组件增强器”。

Because a store is not an instance, but rather a plain-object collection of functions, copies can be easily created and modified without mutating the original store. There is an example in [`compose`](../../api/compose.md) documentation demonstrating that.

Most likely you'll never write a store enhancer, but you may use the one provided by the [developer tools](https://github.com/reduxjs/redux-devtools). It is what makes time travel possible without the app being aware it is happening. Amusingly, the [Redux middleware implementation](../../api/applyMiddleware.md) is itself a store enhancer.

## Selector

```js
type Selector<S, R> = (state: S) => R
```

A _selector_ is a function that accepts the Redux state (and optionally other arguments) and returns some value derived from it. Selectors let components and other code read from the store without knowing where a value lives in the state tree. Selectors that do expensive work are usually memoized with [Reselect's `createSelector`](https://reselect.js.org/), so they only recalculate when their inputs change.

See [Deriving Data with Selectors](../../usage/deriving-data-selectors.md) for details.

## Thunk

```js
type ThunkAction<R, S, E, A extends Action> = (
  dispatch: ThunkDispatch<S, E, A>,
  getState: () => S,
  extraArgument: E
) => R
```

A _thunk_ is a function passed to `dispatch` instead of an action object. The [redux-thunk middleware](https://github.com/reduxjs/redux-thunk), which `configureStore` includes by default, intercepts the function and calls it with `dispatch` and `getState`. Thunks are the standard place to put async logic and any logic that needs to read the current state before dispatching. They are the most common kind of [async action](#async-action).

See [Writing Logic with Thunks](../../usage/writing-logic-thunks.mdx) for details.

## Slice

A _slice_ is the reducer logic and actions for one feature of the app, usually corresponding to one top-level key in the state tree, such as `state.todos` or `state.users`. Redux Toolkit's [`createSlice`](/toolkit/api/createSlice) generates a slice reducer and matching action creators from a set of case reducer functions. The slice reducers are then combined into the root reducer with `combineReducers`, or by passing them as an object to `configureStore`.

See [Splitting Up Reducer Logic](../../usage/structuring-reducers/SplittingReducerLogic.md) for details.
