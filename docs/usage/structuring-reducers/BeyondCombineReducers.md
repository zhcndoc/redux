---
id: beyond-combinereducers
title: 超越 combineReducers
description: '结构化 Reducers > 超越 combineReducers：处理 combineReducers 无法涵盖的其他用例的 reducer 逻辑示例'
hide_title: true
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

&nbsp;

# 超越 `combineReducers`

<HandWrittenReducersNote />

The `combineReducers` utility included with Redux is very useful, but is deliberately limited to handle a single common use case: updating a state tree that is a plain Javascript object, by delegating the work of updating each slice of state to a specific slice reducer. It does _not_ handle other use cases, such as trying to pass other portions of the state tree as an additional argument to a slice reducer, or performing "ordering" of slice reducer calls. It also does not care how a given slice reducer does its work.

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

As it turns out, there's a useful utility called [reduce-reducers](https://github.com/redux-utilities/reduce-reducers) that can make that process easier. It simply takes multiple reducers and runs `reduce()` on them, passing the intermediate state values to the next reducer in line:

```js
// 与上面“手写” rootReducer 相同
const rootReducer = reduceReducers(combinedReducers, crossSliceReducer)
```

注意使用 `reduceReducers` 时，应确保列表中的第一个 reducer 能定义初始状态，因为后面的 reducer 通常假设整个状态已存在，不会去提供默认值。

The most common cross-slice case, where several slices each need to respond to the same action, doesn't need any of this. With Redux Toolkit, each slice can handle that action in its `extraReducers` option, and `configureStore` combines the slice reducers as usual. The custom root reducer approach above is only needed when one slice's update depends on the _current_ state of another slice.

## Further Suggestions

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

Also, while `combineReducers` is the one reducer utility function that's built into Redux, there's a wide variety of third-party reducer utilities that have been published for reuse. Or, if none of the published utilities solve your use case, you can always write a function yourself that does just exactly what you need.
