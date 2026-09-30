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

Normally you should just call [`dispatch`](Store.md#dispatchaction) directly. If you use Redux with React, [React-Redux's `useDispatch` hook](/react-redux/api/hooks#usedispatch) gives you the `dispatch` function inside components.

The only use case for `bindActionCreators` is when you want to pass some action creators down to a component that isn't aware of Redux, and you don't want to pass `dispatch` or the Redux store to it. It was originally intended for use with the legacy React-Redux `connect` method, and is rarely needed today.

:::

For convenience, you can also pass an action creator as the first argument, and get a dispatch wrapped function in return.

## Parameters

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
