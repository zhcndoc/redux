---
id: initializing-state
title: 初始化状态
description: '结构化 Reducers > 初始化状态：Redux 状态是如何初始化的'
---

# 初始化状态

有两种主要方式来初始化应用的状态。`createStore` 方法可以接受一个可选的 `preloadedState` 作为第二个参数。Reducer 也可以通过检查传入的 `state` 参数是否为 `undefined`，并返回他们希望用作默认值的初始值来指定初始状态。这可以通过在 reducer 内部显式检查实现，或者使用默认参数语法，例如：`function myReducer(state = someDefaultValue, action)`。

这两种方法如何交互并不总是立刻很清楚。幸运的是，这个过程遵循一些可预测的规则。以下是它们如何结合在一起的说明。

## 概要

没有使用 `combineReducers()` 或类似的手动代码时，`preloadedState` 总是优先于 reducer 中的 `state = ...`，因为传递给 reducer 的 `state` 就是 `preloadedState`，且不是 `undefined`，所以默认参数语法不会生效。

使用 `combineReducers()` 时，行为则更加微妙。那些在 `preloadedState` 中指定了状态值的 reducer 将会接收到那个状态。其他 reducer 会接收到 `undefined`，**正由于此，它们会回退到各自指定的 `state = ...` 默认参数上。**

**一般来说，`preloadedState` 优先于 reducer 指定的状态。这让 reducer 可以指定对它们来说有意义的初始数据作为默认参数，同时也允许在从持久存储或服务器水化 store 时加载已有的数据（全部或部分）。**

_注意：使用 `preloadedState` 来填充初始状态的 reducer **仍然需要提供默认值** 来处理传入 `state` 为 `undefined` 的情况。所有 reducer 初始化时都会被传入 `undefined`，因此它们应当编写成在接收到 `undefined` 时能够返回某个值。这个值只要不是 `undefined` 即可；无需在默认值中重复 `preloadedState` 中的内容。_

## 深入解析

### 单个简单 Reducer

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
import { createStore } from 'redux'
const store = createStore(counter)
console.log(store.getState()) // 0
```

初始状态是 0。为什么？因为传给 `createStore` 的第二个参数是 `undefined`。这就是第一次调用 reducer 时传入的 `state`。Redux 初始化时会派发一个“虚拟”动作以填充状态。因此你的 `counter` reducer 被调用时，`state` 是 `undefined`。**这正是“激活”默认参数的情况。**所以此时 `state` 是默认值 `0`，并将返回该状态。

再看一种不同的场景：

```js
import { createStore } from 'redux'
const store = createStore(counter, 42)
console.log(store.getState()) // 42
```

为什么这次结果是 `42` 而不是 `0`？因为调用 `createStore` 时传入了第二个参数 `42`，这个值会作为 `state` 参数传给 reducer 以及虚拟动作。**此时 `state` 不再是 `undefined`（是 `42`），所以默认参数不会生效。**状态是 `42`，因此 reducer 返回了它。

### 组合 Reducers

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

如果调用 `createStore` 时没有传入 `preloadedState`，state 会初始化为 `{}`。因此，在调用 `a` 和 `b` 时，`state.a` 和 `state.b` 都是 `undefined`。**`a` 和 `b` reducer 接收的 `state` 参数都是 `undefined`，如果它们指定了默认值，则返回这些默认值。**这就是首次调用 combined reducer 返回 `{ a: 'lol', b: 'wat' }` 的原因。

```js
import { createStore } from 'redux'
const store = createStore(combined)
console.log(store.getState()) // { a: 'lol', b: 'wat' }
```

再看另一种情况：

```js
import { createStore } from 'redux'
const store = createStore(combined, { a: 'horse' })
console.log(store.getState()) // { a: 'horse', b: 'wat' }
```

这次我把 `preloadedState` 设定为 `{ a: 'horse' }` 传给了 `createStore()`。combined reducer 返回的状态将 `a` 的初始状态替换为我指定的 `horse`，而 `b` 依然返回其默认值 `'wat'`。

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

## 总结

总结一下，如果你遵守 Redux 约定，在 reducer 中当 `state` 参数为 `undefined` 时返回初始状态（实现方式最简单是给 `state` 指定默认参数值），组合 reducer 会表现得很合理。**它们会优先选择你传给 `createStore()` 的 `preloadedState` 中对应的值；如果未传入或对应字段不存在，则使用 reducer 指定的默认 `state` 参数。**这种方式工作得好，因为它既提供了初始化，也支持对已有数据进行水合（hydration）。而且如果某个 reducer 的数据未被保留，它还能重置自己的状态。当然，这模式可以递归应用：你可以在多个层级使用 `combineReducers()`，甚至手动调用 reducers，传递状态树的相关部分。