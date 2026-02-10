---
id: beyond-combinereducers
title: 超越 combineReducers
description: '结构化 Reducers > 超越 combineReducers：处理 combineReducers 无法涵盖的其他用例的 reducer 逻辑示例'
hide_title: true
---

&nbsp;

# 超越 `combineReducers`

Redux 自带的 `combineReducers` 工具非常实用，但它有意局限于处理一个常见用例：通过委托给特定的 slice reducer，更新由普通 JavaScript 对象组成的状态树中的每个状态片段。它 _不会_ 处理其他用例，例如状态树由 Immutable.js 的 Map 构成，传递状态树的其他部分作为额外参数给 slice reducer，或者执行 slice reducer 调用的“顺序”控制。它也不关心给定的 slice reducer 是如何完成它的工作。

那么常见的问题是：“如何用 `combineReducers` 来处理这些其他用例？” 答案很简单：“不能 — 你可能需要用别的东西”。**一旦超出 `combineReducers` 的核心用例，就该使用更“自定义”的 reducer 逻辑了**，无论是针对一次性用例的特定逻辑，还是可以广泛共享的可复用函数。这里给出一些处理几个典型用例的建议，但欢迎你自己提出方法。

## slice reducer 之间共享数据

类似地，如果 `sliceReducerA` 处理某个 action 时恰好需要从 `sliceReducerB` 的状态片段中获取一些数据，或 `sliceReducerB` 需要整个状态树作为参数，`combineReducers` 本身是不支持的。这可以通过编写一个自定义函数来解决，该函数知道在特定情况下将所需数据作为额外参数传递，比如：

```js
function combinedReducer(state, action) {
  switch (action.type) {
    case 'A_TYPICAL_ACTION': {
      return {
        a: sliceReducerA(state.a, action),
        b: sliceReducerB(state.b, action)
      }
    }
    case 'SOME_SPECIAL_ACTION': {
      return {
        // 特别传入 state.b 作为额外参数
        a: sliceReducerA(state.a, action, state.b),
        b: sliceReducerB(state.b, action)
      }
    }
    case 'ANOTHER_SPECIAL_ACTION': {
      return {
        a: sliceReducerA(state.a, action),
        // 特别传入整个状态作为额外参数
        b: sliceReducerB(state.b, action, state)
      }
    }
    default:
      return state
  }
}
```

另一种解决“共享 slice 更新”问题的方案是，在 action 中携带更多数据。使用 thunk 函数或类似手段很容易做到，例如：

```js
function someSpecialActionCreator() {
  return (dispatch, getState) => {
    const state = getState()
    const dataFromB = selectImportantDataFromB(state)

    dispatch({
      type: 'SOME_SPECIAL_ACTION',
      payload: {
        dataFromB
      }
    })
  }
}
```

因为来自 B 的数据已经在 action 中了，根 reducer 不用特别处理也能让 `sliceReducerA` 使用这些数据。

第三种方法是用 `combineReducers` 生成的 reducer 处理每个 slice reducer 能独立更新的“简单”情况，同时用另一个 reducer 处理需要跨 slice 共享数据的“特殊”情况。然后用一个包裹函数依次调用这两个 reducer 来生成最终结果：

```js
const combinedReducer = combineReducers({
  a: sliceReducerA,
  b: sliceReducerB
})

function crossSliceReducer(state, action) {
  switch (action.type) {
    case 'SOME_SPECIAL_ACTION': {
      return {
        // 特别传入 state.b 作为额外参数
        a: handleSpecialCaseForA(state.a, action, state.b),
        b: sliceReducerB(state.b, action)
      }
    }
    default:
      return state
  }
}

function rootReducer(state, action) {
  const intermediateState = combinedReducer(state, action)
  const finalState = crossSliceReducer(intermediateState, action)
  return finalState
}
```

事实上，有一个名叫 [reduce-reducers](https://github.com/acdlite/reduce-reducers) 的实用工具可以简化这一过程。它接收多个 reducer 并对它们执行 `reduce()`，把中间状态传递给下一个 reducer：

```js
// 与上面“手写” rootReducer 相同
const rootReducer = reduceReducers(combinedReducers, crossSliceReducer)
```

注意使用 `reduceReducers` 时，应确保列表中的第一个 reducer 能定义初始状态，因为后面的 reducer 通常假设整个状态已存在，不会去提供默认值。

## 进一步建议

再次强调，Redux 的 reducers _只是_ 函数。虽然 `combineReducers` 很实用，但它只是工具箱中的一个工具。函数能包含除 switch 语句以外的条件逻辑，函数可以组合嵌套调用，函数也能调用其他函数。比如你想要某个 slice reducer 能够重置状态，并且只响应特定动作，你可以这样写：

```js
const undoableFilteredSliceA = compose(
  undoReducer,
  filterReducer('ACTION_1', 'ACTION_2'),
  sliceReducerA
)
const rootReducer = combineReducers({
  a: undoableFilteredSliceA,
  b: normalSliceReducerB
})
```

注意 `combineReducers` 并不知道也不关心负责管理 `a` 的 reducer 函数有什么特别。我们没修改 `combineReducers` 来实现撤销功能——只是把需要的功能组合成了一个新的函数。

此外，尽管 `combineReducers` 是 Redux 内置的唯一 reducer 工具函数，但已经有大量第三方 reducer 工具被开发出来以供复用。[Redux Addons Catalog](https://github.com/markerikson/redux-ecosystem-links) 列出了很多此类工具。如果没有合适的工具满足你的用例，你也完全可以自己写一个专门满足你需求的函数。