---
id: combinereducers
title: combineReducers
hide_title: true
description: 'API > combineReducers：合并切片 reducer 以创建组合状态'
---

<!-- prettier-ignore -->
import CoreApiNote from "../components/_CoreApiNote.mdx";

&nbsp;

# `combineReducers(reducers)`

## 概述

The `combineReducers` helper function turns an object whose values are different "slice reducer" functions into a single combined reducer function you can pass to the store.

生成的组合 reducer 会在每次派发动作时调用所有切片 reducer，并将它们的结果收集到一个单一的状态对象中。这使得将 reducer 逻辑拆分为独立的函数成为可能，每个函数独立管理自己状态的切片。

<CoreApiNote />

You should rarely need to call `combineReducers` yourself. `configureStore` calls it for you if you pass in an object of slice reducers:

```ts
const store = configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer
  }
})
```

You can still call `combineReducers()` directly if you need to construct the root reducer manually first, and Redux Toolkit's [`combineSlices`](/toolkit/api/combineSlices) does the same job with support for lazy-loaded slices.

### 状态切片

**由 `combineReducers()` 生成的状态会按传入 `combineReducers()` 的键将各个 reducer 的状态分别命名空间**

示例：

```js
rootReducer = combineReducers({potato: potatoReducer, tomato: tomatoReducer})
// 这将产生如下状态对象
{
  potato: {
    // ... 由 potatoReducer 管理的土豆相关状态 ...
  },
  tomato: {
    // ... 由 tomatoReducer 管理的西红柿相关状态，可能还有美味的酱汁？ ...
  }
}
```

你可以通过在传入对象中使用不同的键来控制状态的键名。例如，你可以调用 `combineReducers({ todos: myTodosReducer, counter: myCounterReducer })`，得到的状态形状为 `{ todos, counter }`。

## 参数

1. `reducers` (_对象_): 其属性值对应需要合并成一个的不同 reducer 函数。

```ts
combineReducers({
  posts: postsReducer,
  comments: commentsReducer
})
```

请参见下面的注意事项，了解传入的每个 reducer 必须遵守的规则。

### 返回值

(_函数_): 一个 reducer 函数，会调用 `reducers` 对象中的每个 reducer，并构建一个形状与其相同的状态对象。

## 注意事项

此函数带有一定的设计偏好，旨在帮助初学者避免常见错误。这就是它尝试强制执行某些规则的原因，如果你手动编写根 reducer，则不必遵守这些规则。

传入 `combineReducers` 的任何 reducer 必须满足以下规则：

- 对于任何未识别的动作，它必须返回作为第一个参数传入的 `state`。

- 它绝不能返回 `undefined`。很容易因早期的 `return` 语句导致返回了 `undefined`，因此 `combineReducers` 会在你返回 `undefined` 时抛出错误，而不是让错误在别处显现。

- 如果传入的 `state` 是 `undefined`，它必须返回该 reducer 的初始状态。根据前面的规则，初始状态也不得为 `undefined`。你可以使用可选参数语法指定初始状态，也可以显式检查第一个参数是否为 `undefined`。

While `combineReducers` attempts to check that your reducers conform to some of these rules, you should remember them, and do your best to follow them. `combineReducers` will check your reducers by passing `undefined` to them; this is done even if you specify initial state with `configureStore({ reducer, preloadedState })`. Therefore, you **must** ensure your reducers work properly when receiving `undefined` as state, even if you never intend for them to actually receive `undefined` in your own code.

## 示例

#### `reducers/todos.js`

```js
export default function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([action.text])
    default:
      return state
  }
}
```

#### `reducers/counter.js`

```js
export default function counter(state = 0, action) {
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

#### `reducers/index.js`

```js
import { combineReducers } from '@reduxjs/toolkit'
import todos from './todos'
import counter from './counter'

export default combineReducers({
  todos,
  counter
})
```

#### `App.js`

```js
import { configureStore } from '@reduxjs/toolkit'
import reducer from './reducers/index'

const store = configureStore({
  reducer
})
console.log(store.getState())
// {
//   counter: 0,
//   todos: []
// }

store.dispatch({
  type: 'ADD_TODO',
  text: 'Use Redux'
})
console.log(store.getState())
// {
//   counter: 0,
//   todos: [ 'Use Redux' ]
// }
```

## 小贴士

- 这个辅助函数只是一个方便工具！你可以编写自己的 `combineReducers`，实现[不同的行为](https://github.com/redux-utilities/reduce-reducers)，甚至手动从子 reducer 组装状态对象，显式地编写一个根 reducer 函数，就像写任何其他函数一样。

- 你可以在 reducer 层级的任何层次调用 `combineReducers`。它不必只在顶层使用。实际上，你可以再次使用它，将过于复杂的子 reducer 拆分成更小的孙子 reducer，依此类推。