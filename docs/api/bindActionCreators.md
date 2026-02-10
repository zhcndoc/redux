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

通常你应该直接对你的 [`Store`](Store.md) 实例调用 [`dispatch`](Store.md#dispatchaction)。如果你使用的是 React 绑定的 Redux，[react-redux](https://github.com/gaearon/react-redux) 会直接为你提供 [`dispatch`](Store.md#dispatchaction) 函数，你也可以直接调用它。

使用 `bindActionCreators` 的唯一场景是在你想将一些 action creators 传递给一个不理解 Redux 的组件时，而你又不想传递 [`dispatch`](Store.md#dispatchaction) 或 Redux store 给它。

为了方便，你也可以传入单个 action creator 作为第一个参数，并得到一个被 dispatch 包裹的函数。

:::warning 警告

该方法最初是为搭配旧版 React-Redux 的 `connect` 方法设计的。它仍然可用，但很少需要。

:::

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
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as TodoActionCreators from './TodoActionCreators'
console.log(TodoActionCreators)
// {
//   addTodo: Function,
//   removeTodo: Function
// }

function TodoListContainer(props) {
  // 由 react-redux 注入：
  const { dispatch, todos } = props

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
  }, [])

  return <TodoList todos={todos} {...this.boundActionCreators} />

  // bindActionCreators 的另一种替代方案是直接传递
  // dispatch 函数，但这样的话，
  // 你的子组件就需要导入并了解 action creators。

  // return <TodoList todos={todos} dispatch={dispatch} />
}

export default connect(state => ({ todos: state.todos }))(TodoListContainer)
```