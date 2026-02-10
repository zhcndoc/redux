---
id: store
title: 存储
description: 'API > Store：核心 Redux 存储方法'
---

# 存储

存储包含了您应用程序的整个[状态树](../understanding/thinking-in-redux/Glossary.md#state)。
更改其内部状态的唯一方法是派发一个[action](../understanding/thinking-in-redux/Glossary.md#action)，这会触发[根 reducer 函数](../understanding/thinking-in-redux/Glossary.md#reducer)来计算新的状态。

存储不是一个类。它只是一个具有几个方法的对象。

要创建存储，**将您的根[reducer 函数](../understanding/thinking-in-redux/Glossary.md#reducer)传递给 Redux Toolkit 的 [`configureStore` 方法](https://redux-toolkit.js.org/api/configureStore)**，该方法将以良好的默认配置设置 Redux 存储。（或者，如果您还未使用 Redux Toolkit，可以使用原始的[`createStore`](createStore.md)方法，但我们鼓励您尽快[将代码迁移到使用 Redux Toolkit](../usage/migrating-to-modern-redux.mdx)）

## 存储方法

### getState()

返回您应用程序当前的状态树。
它等同于存储的 reducer 最后返回的状态值。

#### 返回值

_(any)_：您应用程序当前的状态树。

---

&nbsp;

### dispatch(action)

派发一个 action。这是触发状态改变的唯一方法。

存储的 reducer 函数将同步调用，传入当前的[`getState()`](#getstate)结果和给定的 `action`。它的返回值将被视为下一个状态。从此以后，调用[`getState()`](#getstate)将返回这个状态，且变更监听器会立即被通知。

:::caution

如果尝试在[reducer](../understanding/thinking-in-redux/Glossary.md#reducer)内部调用 `dispatch`，会抛出错误“Reducers may not dispatch actions.”。Reducer 是纯函数——它们只能返回新的状态值，且不能有副作用（而派发就是副作用）。

在 Redux 中，订阅函数在根 reducer 返回新状态后被调用，因此您**可以**在订阅监听器中派发。仅仅禁止在 reducer 内部派发，因为他们必须保持无副作用。如果您想在响应 action 时产生副作用，正确的地方是在可能是异步的[action 创建函数](../understanding/thinking-in-redux/Glossary.md#action-creator)中。

:::

#### 参数

1. `action` (_Object_<sup>†</sup>)：一个描述您应用中变更的普通对象。Action 是向存储传送数据的唯一方式，因此任何数据，无论是来自 UI 事件、网络回调，还是其他来源如 WebSocket，都最终需要作为 action 派发。Action 必须有一个 `type` 字段，用于表示执行的动作类型。类型可以定义为常量并从其他模块导入。使用字符串作为 `type` 比使用[符号](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol)更好，因为字符串是可序列化的。除 `type` 外，action 对象的结构由您决定。如果感兴趣，可参考[Flux 标准 Action](https://github.com/acdlite/flux-standard-action)了解构建 action 的推荐方案。

#### 返回值

(Object<sup>†</sup>)：派发的 action（详见备注）。

#### 备注

<sup>†</sup> 通过调用[`createStore`](createStore.md)获得的“原生”存储实现只支持普通对象 action，并立即将其发送给 reducer。

但是，如果使用[`applyMiddleware`](applyMiddleware.md)包装[`createStore`](createStore.md)，中间件可以对 action 做不同解释，并支持派发[异步 action](../understanding/thinking-in-redux/Glossary.md#async-action)。异步 action 通常是如 Promise、Observable 或 thunk 之类的异步原语。

中间件由社区创建，Redux 默认不含中间件。您需要显式安装诸如 [redux-thunk](https://github.com/reduxjs/redux-thunk) 或 [redux-promise](https://github.com/acdlite/redux-promise) 等包来使用它。您也可以创建自己的中间件。

如需了解如何描述异步 API 调用、在 action 创建中读取当前状态、执行副作用或链式执行异步操作，请查看[`applyMiddleware`](applyMiddleware.md)的示例。

#### 示例

```js
import { createStore } from 'redux'
const store = createStore(todos, ['Use Redux'])

function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}

store.dispatch(addTodo('Read the docs'))
store.dispatch(addTodo('Read about the middleware'))
```

---

&nbsp;

### subscribe(listener)

添加一个变更监听器。每当派发一个 action，且状态树的某部分可能变更时，它将被调用。您可以在回调中调用[`getState()`](#getstate)读取当前状态树。

您可以在变更监听器中调用[`dispatch()`](#dispatchaction)，但需注意以下几点：

1. 监听器应当仅在响应用户操作或特定条件（例如，当存储具有某个特定字段时派发 action）下调用[`dispatch()`](#dispatchaction)。技术上调用[`dispatch()`](#dispatchaction)无条件是可能的，但会导致无限循环，因为每次[`dispatch()`](#dispatchaction)调用通常会再次触发监听器。

2. 调用每个[`dispatch()`](#dispatchaction)前，订阅列表会被快照。如果在监听器调用期间订阅或取消订阅，此时对当前正在执行的[`dispatch()`](#dispatchaction)不会生效。但下一次[`dispatch()`](#dispatchaction)调用，无论是否嵌套，都会使用最新的订阅快照。

3. 监听器不应期望看到所有状态变更，因为在嵌套的[`dispatch()`](#dispatchaction)调用中状态可能多次更新，且在监听器被调用时。只保证所有在[`dispatch()`](#dispatchaction)开始前注册的订阅者，会在结束时全部以最新状态被调用。

这是较底层的 API。通常，您不会直接使用它，而是通过 React（或其他）绑定来使用。如果您常用此回调作为监听状态变更的钩子，可能会想写一个自定义的`observeStore`实用工具（参考：https://github.com/reduxjs/redux/issues/303#issuecomment-125184409）。`Store` 也是一个[`Observable`](https://github.com/zenparsing/es-observable)，您还可以使用如 [RxJS](https://github.com/ReactiveX/RxJS) 等库对变更做订阅。

要取消订阅，调用`subscribe`返回的函数。

#### 参数

1. `listener` (_Function_)：每当派发 action 且状态树可能变更时被调用的回调。在该回调内您可以调用[`getState()`](#getstate)读取当前状态。假设存储的 reducer 是纯函数，您可以比较状态树某深层路径的引用来判断其值是否已变。

##### 返回值

(_Function_)：取消变更监听的函数。

##### 示例

```js
function select(state) {
  return state.some.deep.property
}

let currentValue
function handleChange() {
  let previousValue = currentValue
  currentValue = select(store.getState())

  if (previousValue !== currentValue) {
    console.log(
      '某个深层嵌套属性已从',
      previousValue,
      '变化为',
      currentValue
    )
  }
}

const unsubscribe = store.subscribe(handleChange)
unsubscribe()
```

---

&nbsp;

### replaceReducer(nextReducer)

替换当前存储用于计算状态的 reducer。

这是一个高级 API。如果您的应用实现了代码拆分，并希望动态加载某些 reducer，可以用此 API。如果您实现了 Redux 的热重载机制，也可能需要它。

#### 参数

1. `nextReducer` (_Function_)：存储将要使用的下一个 reducer。