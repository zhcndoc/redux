---
id: reusing-reducer-logic
title: 重用 Reducer 逻辑
description: '结构化 Reducers > 重用 Reducer 逻辑：创建可重用 reducers 的模式'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# 重用 Reducer 逻辑

<HandWrittenReducersNote />

随着应用发展，reducer 逻辑中会逐渐出现常见模式。你可能发现 reducer 的多个部分在处理不同类型数据时做着相同的工作，希望复用相同逻辑来减少重复；也可能希望 store 同时处理某种数据类型的多个“实例”。不过，Redux store 的全局结构也有取舍：它便于跟踪应用整体状态，但可能让“定位”到需要更新某个特定状态片段的 action 更困难，尤其是在使用 `combineReducers` 时。

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

## 使用高阶 Reducer 自定义行为 {#customizing-behavior-with-higher-order-reducers}

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

这些基本模式可用于在 UI 中创建多个连接到 store 的组件实例，也可复用分页、排序等通用功能的逻辑。

除了用这种方式生成 reducer，你可能也想用相同思路生成 action creator；也可以通过辅助函数同时生成两者。

## 使用 `createSlice` 工厂复用逻辑 {#reusing-logic-with-a-createslice-factory}

使用 Redux Toolkit 时，`createSlice` 会自动实现“生成带前缀的 action 类型”这一方式。每个 slice 生成的 action 类型都以 slice 的 `name` 为前缀，因此每次以不同名称调用 `createSlice` 的函数，会生成只响应自身 action 的 reducer，并同时生成相应的 action creator：

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

这与上文的 `createCounterWithNamedType` 模式相同，只是 action 类型和 action creator 会自动生成。如果多个 slice 需要共享 reducer 逻辑，但保留各自独立的 action 类型，可以只定义一次 case reducer 函数，再分别传给每次 `createSlice` 调用。

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
