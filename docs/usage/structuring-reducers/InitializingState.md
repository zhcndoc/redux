---
id: initializing-state
title: 初始化状态
description: '结构化 Reducers > 初始化状态：Redux 状态是如何初始化的'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# Initializing State

<HandWrittenReducersNote />

There are two main ways to initialize state for your application. `configureStore` accepts an optional `preloadedState` value (the same value is the second argument to the core `createStore` function). Reducers can also specify an initial value by looking for an incoming state argument that is `undefined`, and returning the value they'd like to use as a default. This can either be done with an explicit check inside the reducer, or by using the default argument value syntax: `function myReducer(state = someDefaultValue, action)`.

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
import { configureStore } from '@reduxjs/toolkit'
const store = configureStore({ reducer: counter })
console.log(store.getState()) // 0
```

The initial state is zero. Why? Because no `preloadedState` was passed, so it was `undefined`. This is the `state` passed to your reducer the first time. When Redux initializes it dispatches a "dummy" action to fill the state. So your `counter` reducer was called with `state` equal to `undefined`. **This is exactly the case that "activates" the default argument.** Therefore, `state` is now `0` as per the default `state` value (`state = 0`). This state (`0`) will be returned.

再看一种不同的场景：

```js
import { configureStore } from '@reduxjs/toolkit'
const store = configureStore({ reducer: counter, preloadedState: 42 })
console.log(store.getState()) // 42
```

Why is it `42`, and not `0`, this time? Because `42` was passed as the `preloadedState`. This value becomes the `state` passed to your reducer along with the dummy action. **This time, `state` is not undefined (it's `42`!), so default argument syntax has no effect.** The `state` is `42`, and `42` is returned from the reducer.

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

If we create the store without a `preloadedState`, the combined reducer is going to initialize the `state` to `{}`. Therefore, `state.a` and `state.b` will be `undefined` by the time it calls `a` and `b` reducers. **Both `a` and `b` reducers will receive `undefined` as _their_ `state` arguments, and if they specify default `state` values, those will be returned.** This is how the combined reducer returns a `{ a: 'lol', b: 'wat' }` state object on the first invocation.

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

Now I specified a `preloadedState`. The state returned from the combined reducer _combines_ the initial state I specified for the `a` reducer with the `'wat'` default argument specified that `b` reducer chose itself.

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

To sum this up, if you stick to Redux conventions and return the initial state from reducers when they're called with `undefined` as the `state` argument (the easiest way to implement this is to specify the `state` default argument value), you're going to have a nice useful behavior for combined reducers. **They will prefer the corresponding value in the `preloadedState` object you pass when creating the store, but if you didn't pass any, or if the corresponding field is not set, the default `state` argument specified by the reducer is chosen instead.** This approach works well because it provides both initialization and hydration of existing data, but lets individual reducers reset their state if their data was not preserved. Of course you can apply this pattern recursively, as you can use `combineReducers()` on many levels, or even compose reducers manually by calling reducers and giving them the relevant part of the state tree.

The `initialState` option of Redux Toolkit's `createSlice` works the same way: the generated slice reducer returns that value when it receives `undefined`, and a `preloadedState` passed to `configureStore` still takes precedence for that slice.
