---
id: bindactioncreators
title: bindActionCreators
hide_title: true
description: 'API > bindActionCreators：包装 action creators 以便 dispatch 调用'
---

&nbsp;

# `bindActionCreators(actionCreators, dispatch)`

## 概述

将一个值为 [action creators](../understanding/thinking-in-redux/Glossary.md#action-creator) 的对象，转化为一个拥有相同键的对象，但每个 action creator 都被包装在一个 [`dispatch`](Store.md#dispatchaction) 调用中，这样它们可以直接被调用。

:::info

通常直接调用 [`dispatch`](Store.md#dispatchaction) 即可。在 React 中使用 Redux 时，[React-Redux 的 `useDispatch` hook](/react-redux/api/hooks#usedispatch) 会在组件中提供 `dispatch` 函数。

只有在需要把 action creator 传给不了解 Redux 的组件、又不想将 `dispatch` 或 Redux store 传给它时，才需要使用 `bindActionCreators`。它最初是为旧版 React-Redux 的 `connect` 方法设计的，如今很少需要使用。

:::

为了方便，你也可以将单个 action creator 作为第一个参数传入，并获得一个由 `dispatch` 包装的函数。

## 参数

1. `actionCreators`（_函数_ 或 _对象_）：一个 [action creator](../understanding/thinking-in-redux/Glossary.md#action-creator) ，或者一个值为 action creator 的对象。

2. `dispatch`（_函数_）：[`Store`](Store.md) 实例上的 [`dispatch`](Store.md#dispatchaction) 函数。

### 返回值

(_函数_ 或 _对象_)：返回一个模仿原始对象的对象，但其中的每个函数都会立即 dispatch 由对应 action creator 产生的 action。如果传入的是单个函数，则返回值也是一个函数。

## 示例

#### `TodoActionCreators.js`

```js
export function addTodo(text) {
  return {
    type: 'ADD_TODO',
    text
  }
}

export function removeTodo(id) {
  return {
    type: 'REMOVE_TODO',
    id
  }
}
```

#### `SomeComponent.js`

```js
import { useEffect, useMemo } from 'react'
import { bindActionCreators } from 'redux'
import { useDispatch, useSelector } from 'react-redux'

import * as TodoActionCreators from './TodoActionCreators'
console.log(TodoActionCreators)
// {
//   addTodo: Function,
//   removeTodo: Function
// }

export function TodoListContainer() {
  const dispatch = useDispatch()
  const todos = useSelector(state => state.todos)

  // 这是 bindActionCreators 的一个典型用例：
  // 你想让一个子组件完全不知道 Redux。
  // 我们现在创建这些函数的绑定版本，
  // 以便稍后传递给子组件。

  const boundActionCreators = useMemo(
    () => bindActionCreators(TodoActionCreators, dispatch),
    [dispatch]
  )
  console.log(boundActionCreators)
  // {
  //   addTodo: Function,
  //   removeTodo: Function
  // }

  useEffect(() => {
    // 注意：下面这样调用是不行的：
    // TodoActionCreators.addTodo('Use Redux')

    // 你只是调用了一个返回 action 的函数。
    // 你必须要把 action dispatch 出去！

    // 下面这样是可以的：
    let action = TodoActionCreators.addTodo('Use Redux')
    dispatch(action)
  }, [dispatch])

  return <TodoList todos={todos} {...boundActionCreators} />

  // bindActionCreators 的另一种替代方案是直接传递
  // dispatch 函数，但这样的话，
  // 你的子组件就需要导入并了解 action creators。

  // return <TodoList todos={todos} dispatch={dispatch} />
}
```
