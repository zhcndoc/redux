---
id: reusing-reducer-logic
title: 重用 Reducer 逻辑
description: '结构化 Reducers > 重用 Reducer 逻辑：创建可重用 reducers 的模式'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# Reusing Reducer Logic

<HandWrittenReducersNote />

As an application grows, common patterns in reducer logic will start to emerge. You may find several parts of your reducer logic doing the same kinds of work for different types of data, and want to reduce duplication by reusing the same common logic for each data type. Or, you may want to have multiple "instances" of a certain type of data being handled in the store. However, the global structure of a Redux store comes with some trade-offs: it makes it easy to track the overall state of an application, but can also make it harder to "target" actions that need to update a specific piece of state, particularly if you are using `combineReducers`.

举个例子，假设我们想在应用程序中跟踪多个计数器，命名为 A、B 和 C。我们定义了初始的 `counter` reducer，并使用 `combineReducers` 来设置状态：

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

const rootReducer = combineReducers({
  counterA: counter,
  counterB: counter,
  counterC: counter
})
```

不幸的是，这种设置存在一个问题。因为 `combineReducers` 会用相同的 action 调用每个切片 reducer，分发 `{type : 'INCREMENT'}` 实际上会导致**所有三个**计数器的值都增加，而不是仅一个。我们需要某种方式来包装 `counter` 逻辑，以确保只有我们关心的计数器被更新。

## 使用高阶 Reducer 自定义行为

正如在 [拆分 Reducer 逻辑](SplittingReducerLogic.md) 中定义的，高阶 reducer 是一个函数，它接受一个 reducer 函数作为参数，和/或返回一个新的 reducer 函数。它也可以被看作是一个“reducer 工厂”。`combineReducers` 就是高阶 reducer 的一个例子。我们可以使用这种模式来创建自己 reducer 函数的专用版本，每个版本只响应特定的动作。

专门化 reducer 最常见的两种方式是生成具有给定前缀或后缀的新动作常量，或者在动作对象中附加额外的信息。示例如下：

```js
function createCounterWithNamedType(counterName = '') {
  return function counter(state = 0, action) {
    switch (action.type) {
      case `INCREMENT_${counterName}`:
        return state + 1
      case `DECREMENT_${counterName}`:
        return state - 1
      default:
        return state
    }
  }
}

function createCounterWithNameData(counterName = '') {
  return function counter(state = 0, action) {
    const { name } = action
    if (name !== counterName) return state

    switch (action.type) {
      case `INCREMENT`:
        return state + 1
      case `DECREMENT`:
        return state - 1
      default:
        return state
    }
  }
}
```

现在我们应该可以使用任一方法生成专门化的计数器 reducers，然后分发影响我们关心的状态部分的动作：

```js
const rootReducer = combineReducers({
  counterA: createCounterWithNamedType('A'),
  counterB: createCounterWithNamedType('B'),
  counterC: createCounterWithNamedType('C')
})

store.dispatch({ type: 'INCREMENT_B' })
console.log(store.getState())
// {counterA : 0, counterB : 1, counterC : 0}

function incrementCounter(type = 'A') {
  return {
    type: `INCREMENT_${type}`
  }
}
store.dispatch(incrementCounter('C'))
console.log(store.getState())
// {counterA : 0, counterB : 1, counterC : 1}
```

我们也可以稍作变通，创建一个更通用的高阶 reducer，接受给定的 reducer 函数和一个名称或标识符：

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

function createNamedWrapperReducer(reducerFunction, reducerName) {
  return (state, action) => {
    const { name } = action
    const isInitializationCall = state === undefined
    if (name !== reducerName && !isInitializationCall) return state

    return reducerFunction(state, action)
  }
}

const rootReducer = combineReducers({
  counterA: createNamedWrapperReducer(counter, 'A'),
  counterB: createNamedWrapperReducer(counter, 'B'),
  counterC: createNamedWrapperReducer(counter, 'C')
})
```

你甚至可以制作通用的过滤高阶 reducer：

```js
function createFilteredReducer(reducerFunction, reducerPredicate) {
  return (state, action) => {
    const isInitializationCall = state === undefined
    const shouldRunWrappedReducer =
      reducerPredicate(action) || isInitializationCall
    return shouldRunWrappedReducer ? reducerFunction(state, action) : state
  }
}

const rootReducer = combineReducers({
  // check for suffixed strings
  counterA: createFilteredReducer(counter, action =>
    action.type.endsWith('_A')
  ),
  // check for extra data in the action
  counterB: createFilteredReducer(counter, action => action.name === 'B'),
  // respond to all 'INCREMENT' actions, but never 'DECREMENT'
  counterC: createFilteredReducer(
    counter,
    action => action.type === 'INCREMENT'
  )
})
```

These basic patterns allow you to do things like having multiple instances of a store-connected component within the UI, or reuse common logic for generic capabilities such as pagination or sorting.

In addition to generating reducers this way, you might also want to generate action creators using the same approach, and could generate them both at the same time with helper functions.

## Reusing Logic with a `createSlice` Factory

With Redux Toolkit, the "generate prefixed action types" approach falls out of `createSlice` for free. Every action type a slice generates is prefixed with the slice's `name`, so a function that calls `createSlice` with a different name each time produces reducers that only respond to their own actions, along with matching action creators:

```ts
import { configureStore, createSlice } from '@reduxjs/toolkit'

function makeCounterSlice(name: string) {
  return createSlice({
    name,
    initialState: 0,
    reducers: {
      incremented: state => state + 1,
      decremented: state => state - 1
    }
  })
}

const counterA = makeCounterSlice('counterA')
const counterB = makeCounterSlice('counterB')
const counterC = makeCounterSlice('counterC')

const store = configureStore({
  reducer: {
    counterA: counterA.reducer,
    counterB: counterB.reducer,
    counterC: counterC.reducer
  }
})

store.dispatch(counterB.actions.incremented())
// dispatches { type: 'counterB/incremented' }
console.log(store.getState())
// { counterA: 0, counterB: 1, counterC: 0 }
```

This is the `createCounterWithNamedType` pattern from above, with the action types and action creators generated for you. If you need several slices to share reducer logic but keep separate action types, define the case reducer functions once and pass them into each `createSlice` call.

## 集合 / 条目 Reducer 模式

该模式允许你拥有多个状态，且使用公共 reducer 根据 action 对象内的额外参数更新每个状态。

```js
function counterReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

function countersArrayReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
    case 'DECREMENT':
      return state.map((counter, index) => {
        if (index !== action.index) return counter
        return counterReducer(counter, action)
      })
    default:
      return state
  }
}

function countersMapReducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
    case 'DECREMENT':
      return {
        ...state,
        [action.name]: counterReducer(state[action.name], action)
      }
    default:
      return state
  }
}
```