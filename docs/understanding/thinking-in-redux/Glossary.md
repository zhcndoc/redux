---
id: glossary
title: 术语表
---

# 术语表

这是 Redux 核心术语的词汇表，以及它们的类型签名。类型使用的是 [Flow 语法](https://flow.org/en/docs/types)。

## 状态（State）

```js
type State = any
```

_状态_（也称为 _状态树_）是一个广义的术语，但在 Redux API 中通常指的是由 store 管理并由 [`getState()`](api/Store.md#getState) 返回的单一状态值。它代表整个 Redux 应用的状态，通常是一个深度嵌套的对象。

按照惯例，顶层状态是一个对象或类似 Map 这样的键值集合，但从技术上讲，它可以是任何类型。不过，你应该尽力保持状态可序列化。不要把不能轻易转成 JSON 的东西放进去。

## Action（动作）

```js
type Action = Object
```

一个_动作_是一个普通对象，表示改变状态的意图。动作是将数据送入 store 的唯一途径。任何数据，不论是来自 UI 事件、网络回调，还是其他来源（例如 WebSocket），最终都需要被派发为动作。

动作必须有一个 `type` 字段，表示正在执行的动作的类型。类型可以定义成常量并从别的模块导入。使用字符串作为 `type` 比使用 [Symbol](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol) 更好，因为字符串是可序列化的。

除了 `type`，动作对象的结构完全由你决定。如果感兴趣，可以看看 [Flux 标准动作](https://github.com/acdlite/flux-standard-action) 对动作构造的推荐。

参见下文的 [异步动作](#异步动作)。

## Reducer（纯函数）

```js
type Reducer<S, A> = (state: S, action: A) => S
```

_Reducer_ 是一个函数，接受一个累积值和一个新值，返回新的累积值。它们用于将一组值归约为单一值。

Reducer 并非 Redux 独有——它是函数式编程的基本概念。即使是非函数式语言，如 JavaScript 也内置了归约的 API，即 [`Array.prototype.reduce()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)。

在 Redux 中，累积值就是状态对象，被归约的值是动作。Reducer 根据先前状态和动作计算出新的状态。它们必须是_纯函数_——对相同输入返回完全相同输出的函数，且应无副作用。这正是支持热重载和时间旅行等特性的基础。

Reducer 是 Redux 中最重要的概念。

_不要把 API 调用放进 reducer。_

## 派发函数（Dispatching Function）

```js
type BaseDispatch = (a: Action) => Action
type Dispatch = (a: Action | AsyncAction) => any
```

_派发函数_（或简称 _dispatch 函数_）是一个接受动作或[异步动作](#异步动作)的函数；它可能会也可能不会向 store 派发一个或多个动作。

我们需要区分一般的派发函数以及没有任何中间件时由 store 实例提供的基础 [`dispatch`](api/Store.md#dispatchaction) 函数。

基础的 dispatch 函数_总是_同步地将动作连同 store 返回的之前的状态一并发送到 reducer 来计算新的状态。它期望动作是纯对象，能被 reducer 消费。

[中间件](#中间件)包装基础 dispatch 函数，使得 dispatch 函数能够处理[异步动作](#异步动作)和普通动作。中间件可以在传给下一个中间件之前，对动作或异步动作进行转换、延迟、忽略或其他处理。详情见下文。

## Action 创建者（Action Creator）

```js
type ActionCreator<A, P extends any[] = any[]> = (...args: P) => Action | AsyncAction
```

_动作创建者_ 简单说就是一个创建动作的函数。不要混淆这两个名词——动作是信息的载体，动作创建者是制造动作的“工厂”。

调用动作创建者只是生成动作，并不会派发它。你需要调用 store 的 [`dispatch`](api/Store.md#dispatchaction) 函数来触发状态更新。我们有时说_绑定动作创建者_，指的是调用动作创建者并立即将其结果派发给特定 store 实例的函数。

如果动作创建者需要读取当前状态、执行 API 调用或产生副作用（比如路由跳转），它应该返回一个[异步动作](#异步动作)，而不是普通动作。

## 异步动作（Async Action）

```js
type AsyncAction = any
```

_异步动作_ 是发送给派发函数的值，但还未准备好直接被 reducer 消费。它会被[中间件](#中间件)转换成一个（或一系列）动作，然后再发送给基础的 [`dispatch()`](api/Store.md#dispatchaction) 函数。异步动作的具体类型取决于你使用的中间件。它们通常是异步原语，比如 Promise 或 thunk，不会立刻传给 reducer，而是在某项操作完成后触发动作派发。

## 中间件（Middleware）

```js
type MiddlewareAPI = { dispatch: Dispatch, getState: () => State }
type Middleware = (api: MiddlewareAPI) => (next: Dispatch) => Dispatch
```

中间件是高阶函数，组合一个[派发函数](#派发函数)来返回一个新的派发函数。它通常将[异步动作](#异步动作)转换成动作。

中间件可通过函数组合来组合。它对于记录动作日志、执行副作用（如路由）或将异步 API 调用转换为一系列同步动作非常有用。

详细介绍请参阅 [`applyMiddleware(...middlewares)`](../../api/applyMiddleware.md)。

## Store（状态存储）

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

- [`dispatch(action)`](api/Store.md#dispatchaction) 是上文描述的基础派发函数。
- [`getState()`](api/Store.md#getState) 返回当前 store 的状态。
- [`subscribe(listener)`](api/Store.md#subscribelistener) 注册一个回调函数，在状态改变时调用。
- [`replaceReducer(nextReducer)`](api/Store.md#replacereducernextreducer) 可用于实现热重载和代码拆分。大多数情况下你不会用到它。

详见完整的 [store API 参考](api/Store.md#dispatchaction)。

## Store 创建者（Store creator）

```js
type StoreCreator = (reducer: Reducer, preloadedState: ?State) => Store
```

Store 创建者是创建 Redux store 的函数。和派发函数一样，我们需要区分基础 store 创建者，即 Redux 包导出的 [`createStore(reducer, preloadedState)`](api/createStore.md)，与由 store 增强器返回的 store 创建者。

## Store 增强器（Store enhancer）

```js
type StoreEnhancer = (next: StoreCreator) => StoreCreator
```

Store 增强器是高阶函数，它组合一个 store 创建者并返回一个增强后的 store 创建者。这与中间件类似，允许你以可组合的方式改变 store 的接口。

Store 增强器非常类似于 React 中的高阶组件（HOC），后者有时也称为“组件增强器”。

因为 store 不是实例，而是包含函数的普通对象集合，可以轻松复制和修改而不改变原 store。[`compose`](api/compose.md) 文档中有相关示例。

大多数情况下你不会编写 store 增强器，但你可能会用到开发者工具提供的那个。它让时间旅行得以实现，而应用本身无需知晓这一过程。有趣的是，[Redux 的中间件实现](api/applyMiddleware.md) 本身就是一个 store 增强器。