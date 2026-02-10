---
id: reusing-reducer-logic
title: 重用 Reducer 逻辑
description: '结构化 Reducers > 重用 Reducer 逻辑：创建可重用 reducers 的模式'
---

# 重用 Reducer 逻辑

随着应用程序规模的增长，reducer 逻辑中的常见模式将开始显现。你可能会发现 reducer 逻辑的多个部分针对不同类型的数据做着相同类型的工作，想通过重用相同的公共逻辑来减少重复。或者，你可能想在 store 中处理某种类型数据的多个“实例”。然而，Redux store 的全局结构带来了一些权衡：它使得跟踪应用程序的整体状态变得容易，但也会使“定位”需要更新特定状态的动作变得更困难，尤其是当你使用 `combineReducers` 时。

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
        const isInitializationCall = state === undefined;
        const shouldRunWrappedReducer = reducerPredicate(action) || isInitializationCall;
        return shouldRunWrappedReducer ? reducerFunction(state, action) : state;
    }
}

const rootReducer = combineReducers({
    // 检查后缀字符串
    counterA : createFilteredReducer(counter, action => action.type.endsWith('_A')),
    // 检查 action 中的额外数据
    counterB : createFilteredReducer(counter, action => action.name === 'B'),
    // 响应所有 'INCREMENT' 动作，但永远不响应 'DECREMENT'
    counterC : createFilteredReducer(counter, action => action.type === 'INCREMENT')
};
```

这些基本模式允许你做到，比如在 UI 中拥有多个智能连接组件的实例，或重用通用功能（如分页或排序）的公共逻辑。

除了用这种方式生成 reducers，你也可能想用相同方法生成 action creators，可以使用辅助函数同时生成它们。参见 [Action/Reducer Generators](https://github.com/markerikson/redux-ecosystem-links/blob/master/action-reducer-generators.md) 和 [Reducers](https://github.com/markerikson/redux-ecosystem-links/blob/master/reducers.md) 库，了解 action/reducer 的实用工具。

## 集合 / 条目 Reducer 模式

该模式允许你拥有多个状态，且使用公共 reducer 根据 action 对象内的额外参数更新每个状态。

```js
function counterReducer(state, action) {
    switch(action.type) {
        case "INCREMENT" : return state + 1;
        case "DECREMENT" : return state - 1;
    }
}

function countersArrayReducer(state, action) {
    switch(action.type) {
        case "INCREMENT":
        case "DECREMENT":
            return state.map( (counter, index) => {
                if(index !== action.index) return counter;
                return counterReducer(counter, action);
            });
        default:
            return state;
    }
}

function countersMapReducer(state, action) {
    switch(action.type) {
        case "INCREMENT":
        case "DECREMENT":
            return {
                ...state,
                state[action.name] : counterReducer(state[action.name], action)
            };
        default:
            return state;
    }
}
```