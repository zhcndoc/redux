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

Redux 自带的 `combineReducers` 工具非常有用，但它有意只处理一种常见用例：状态树是普通 JavaScript 对象，并将各状态 slice 的更新工作委托给对应的 slice reducer。它_不会_处理其他用例，例如将状态树的其他部分作为额外参数传给 slice reducer，或对 slice reducer 的调用进行“排序”。它也不关心具体的 slice reducer 如何完成工作。

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

实际上，有一个名为 [reduce-reducers](https://github.com/redux-utilities/reduce-reducers) 的实用工具可以简化这一过程。它接收多个 reducer，并对它们运行 `reduce()`，将中间状态值依次传给下一个 reducer：

```js
// 与上面“手写” rootReducer 相同
const rootReducer = reduceReducers(combinedReducers, crossSliceReducer)
```

注意使用 `reduceReducers` 时，应确保列表中的第一个 reducer 能定义初始状态，因为后面的 reducer 通常假设整个状态已存在，不会去提供默认值。

最常见的跨 slice 用例是多个 slice 都需要响应同一个 action，这不需要上述任何做法。使用 Redux Toolkit 时，每个 slice 都可以在 `extraReducers` 选项中处理该 action，而 `configureStore` 会照常组合 slice reducer。只有当一个 slice 的更新依赖另一个 slice 的_当前_状态时，才需要上文介绍的自定义根 reducer 方法。

## 更多建议 {#further-suggestions}

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

另外，虽然 `combineReducers` 是 Redux 内置的唯一 reducer 工具函数，但也有许多第三方 reducer 工具可供复用。如果已有工具都无法满足你的用例，也可以自行编写恰好符合需求的函数。
