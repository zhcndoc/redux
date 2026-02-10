---
id: basic-reducer-structure
title: 基本 Reducer 结构
sidebar_label: 基本 Reducer 结构
description: '构建 Reducers > 基本 Reducer 结构：Reducer 函数如何与 Redux 状态协作的概览'
---

# 基本 Reducer 结构和状态形状

## 基本 Reducer 结构

首先，非常重要的一点是，你的整个应用实际上只有**一个单一的 reducer 函数**：即你传入 `createStore` 的第一个参数的那个函数。这个唯一的 reducer 函数最终需要完成以下几件事：

- 当 reducer 第一次被调用时，`state` 的值将是 `undefined`。Reducer 需要处理这种情况，在处理传入的 action 之前提供一个默认的状态值。
- 它需要查看之前的状态和被分发的 action，并确定需要执行什么样的操作。
- 假设需要进行实际的更改，它需要创建带有更新数据的新对象和数组并返回它们。
- 如果不需要更改，它应当直接返回现有状态。

编写 reducer 逻辑最简单的方式是将所有内容放入一个函数声明中，如下所示：

```js
function counter(state, action) {
  if (typeof state === 'undefined') {
    state = 0 // 如果 state 是 undefined，初始化为默认值
  }

  if (action.type === 'INCREMENT') {
    return state + 1
  } else if (action.type === 'DECREMENT') {
    return state - 1
  } else {
    return state // 对于我们不理解的 action 类型，返回当前状态
  }
}
```

注意，这个简单的函数满足了所有基本需求。它在不存在状态值时返回默认值，实现了对 store 的初始化；它根据 action 类型确定需要执行哪种更新并返回新值；如果无需任何处理，则返回之前的状态。

我们可以对这个 reducer 做一些简单的调整。首先，重复的 `if` / `else` 语句很快会变得单调乏味，因此使用 `switch` 语句非常常见。其次，我们可以使用默认参数值来处理初始的“无状态数据”情况。做了这些改变后，reducer 看起来像这样：

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
```

这就是一个典型 Redux reducer 函数使用的基本结构。

## 基本状态形状

Redux 鼓励你以所需管理的数据为核心来考虑你的应用。任一时刻的数据就是你应用的“状态”，而该状态的结构和组织通常称为其“形状”。状态的形状在你如何构造 reducer 逻辑上起着重要作用。

Redux 状态通常以一个普通的 JavaScript 对象作为状态树的顶层节点。（虽然也可以是其他类型的数据，比如单个数字、数组或者特殊数据结构，但大多数库都假设顶层值是一个普通对象。）组织顶层对象内数据最常见的方式是进一步将数据划分为子树，每个顶层键代表一些相关数据的“领域”或“切片”。例如，一个基本的 Todo 应用的状态可能如下：

```js
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: '考虑使用 Redux',
      completed: true,
    },
    {
      text: '将所有状态保存在一棵树中',
      completed: false
    }
  ]
}
```

在这个例子中，`todos` 和 `visibilityFilter` 都是状态中的顶层键，每个都表示某个特定概念的数据“切片”。

大多数应用会处理多种类型的数据，这些数据大致可以分为三类：

- _领域数据_：应用需要展示、使用或修改的数据（比如“从服务器检索到的所有 Todo”）
- _应用状态_：特定于应用行为的数据（比如“当前选中的 Todo #5”，或“正在进行请求以获取 Todos”）
- _UI 状态_：表示界面当前展示方式的数据（比如“EditTodo 模态对话框当前是打开的”）

由于 store 体现了应用的核心，你应当**按照领域数据和应用状态来定义状态形状，而非 UI 组件树**。举例来说，状态路径像 `state.leftPane.todoList.todos` 就不是好主意，因为“todos”这一概念是整个应用的核心，而不仅仅是 UI 的某个部分。`todos` 切片应出现在状态树的顶层。

你的 UI 树和状态形状极少会一一对应。例外情况也许是你明确在 Redux store 中跟踪多种 UI 方面数据，但即使如此，UI 数据的形状和领域数据的形状也通常会不同。

一个典型应用的状态形状大致可能如下：

```js
{
    domainData1 : {},
    domainData2 : {},
    appState1 : {},
    appState2 : {},
    ui : {
        uiState1 : {},
        uiState2 : {},
    }
}
```