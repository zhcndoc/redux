---
id: initializing-state
title: 初始化状态
description: '结构化 Reducers > 初始化状态：Redux 状态是如何初始化的'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# 初始化状态

<HandWrittenReducersNote />

为应用初始化状态主要有两种方式。`configureStore` 接受可选的 `preloadedState` 值（这也是核心 `createStore` 函数的第二个参数）。Reducer 也可以通过检查传入的状态参数是否为 `undefined`，并返回想要使用的默认值来指定初始值。你可以在 reducer 中显式检查，也可以使用默认参数语法：`function myReducer(state = someDefaultValue, action)`。

这两种方法如何交互并不总是立刻很清楚。幸运的是，这个过程遵循一些可预测的规则。以下是它们如何结合在一起的说明。

## 概要 {#summary}

没有使用 `combineReducers()` 或类似的手动代码时，`preloadedState` 总是优先于 reducer 中的 `state = ...`，因为传递给 reducer 的 `state` 就是 `preloadedState`，且不是 `undefined`，所以默认参数语法不会生效。

使用 `combineReducers()` 时，行为则更加微妙。那些在 `preloadedState` 中指定了状态值的 reducer 将会接收到那个状态。其他 reducer 会接收到 `undefined`，**正由于此，它们会回退到各自指定的 `state = ...` 默认参数上。**

**一般来说，`preloadedState` 优先于 reducer 指定的状态。这让 reducer 可以指定对它们来说有意义的初始数据作为默认参数，同时也允许在从持久存储或服务器水化 store 时加载已有的数据（全部或部分）。**

_注意：使用 `preloadedState` 来填充初始状态的 reducer **仍然需要提供默认值** 来处理传入 `state` 为 `undefined` 的情况。所有 reducer 初始化时都会被传入 `undefined`，因此它们应当编写成在接收到 `undefined` 时能够返回某个值。这个值只要不是 `undefined` 即可；无需在默认值中重复 `preloadedState` 中的内容。_

## 深入解析

### 单个简单 Reducer {#single-simple-reducer}

先考虑一个只有单个 reducer 的情况，假设没有使用 `combineReducers()`。

你的 reducer 可能长这样：

```js
function counter(state = 0, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}
```

现在创建一个 store：

```js
import { configureStore } from '@reduxjs/toolkit'
const store = configureStore({ reducer: counter })
console.log(store.getState()) // 0
```

初始状态是 0。为什么？因为没有传入 `preloadedState`，所以它是 `undefined`。这就是 reducer 首次接收到的 `state`。Redux 初始化时会派发一个“虚拟”action 来填充状态，因此 `counter` reducer 收到的 `state` 为 `undefined`。**这正是会“激活”默认参数的情况。**所以，`state` 会采用默认值 `state = 0`，并返回状态值 `0`。

再看一种不同的场景：

```js
import { configureStore } from '@reduxjs/toolkit'
const store = configureStore({ reducer: counter, preloadedState: 42 })
console.log(store.getState()) // 42
```

这次为什么是 `42`，而不是 `0`？因为传入的 `preloadedState` 是 `42`。该值会与虚拟 action 一起作为 `state` 传给 reducer。**这次 `state` 不是 `undefined`（它是 `42`！），因此默认参数语法不会生效。**`state` 的值就是 `42`，reducer 也会返回 `42`。

### 组合 Reducer {#combined-reducers}

再来看使用 `combineReducers()` 的情况。假设有两个 reducer：

```js
function a(state = 'lol', action) {
  return state
}

function b(state = 'wat', action) {
  return state
}
```

`combineReducers({ a, b })` 生成的 reducer 大致是这样：

```js
// const combined = combineReducers({ a, b })
function combined(state = {}, action) {
  return {
    a: a(state.a, action),
    b: b(state.b, action)
  }
}
```

如果创建 store 时未传入 `preloadedState`，组合后的 reducer 会将 `state` 初始化为 `{}`。因此调用 `a` 和 `b` reducer 时，`state.a` 和 `state.b` 都是 `undefined`。**`a` 和 `b` reducer 各自收到的 `state` 参数都是 `undefined`；如果它们指定了默认 `state` 值，就会返回这些默认值。**这就是组合 reducer 首次运行时返回 `{ a: 'lol', b: 'wat' }` 状态对象的过程。

```js
import { configureStore } from '@reduxjs/toolkit'
const store = configureStore({ reducer: combined })
console.log(store.getState()) // { a: 'lol', b: 'wat' }
```

再看另一种情况：

```js
import { configureStore } from '@reduxjs/toolkit'
const store = configureStore({
  reducer: combined,
  preloadedState: { a: 'horse' }
})
console.log(store.getState()) // { a: 'horse', b: 'wat' }
```

现在我指定了 `preloadedState`。组合 reducer 返回的状态会_结合_我为 `a` reducer 指定的初始值，以及 `b` reducer 自己选择的默认值 `'wat'`。

回顾 combined reducer 的实现：

```js
// const combined = combineReducers({ a, b })
function combined(state = {}, action) {
  return {
    a: a(state.a, action),
    b: b(state.b, action)
  }
}
```

这里 `state` 有值，不再是默认的 `{}`。它是一个包含字段 `a: 'horse'`，但没有字段 `b` 的对象。因此，`a` reducer 收到的 `state` 是 `'horse'` 并直接返回它，而 `b` reducer 收到的是 `undefined`，因而返回自己设定的默认值 `'wat'`。这就得到最终的状态 `{ a: 'horse', b: 'wat' }`。

## 总结 {#summary}

总而言之，只要遵循 Redux 约定，在 reducer 收到 `undefined` 状态参数时返回初始状态值（最简单的方式是指定 `state` 默认参数），组合 reducer 就会表现得很实用。**它们会优先采用创建 store 时传入的 `preloadedState` 中对应的值；如果没有传入，或对应字段未设置，则使用 reducer 指定的 `state` 默认参数。**这种方式既支持初始化，也支持对已有数据进行水合；如果某个 reducer 的数据未保留，也能让它单独重置状态。当然，你可以递归应用这一模式，因为 `combineReducers()` 可以在多个层级使用，也可以手动调用 reducer 并传入状态树的相关部分来组合 reducer。

Redux Toolkit 的 `createSlice` 选项 `initialState` 也遵循相同规则：生成的 slice reducer 在收到 `undefined` 时会返回该值，而传给 `configureStore` 的 `preloadedState` 对该 slice 仍有更高优先级。
