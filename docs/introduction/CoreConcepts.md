---
id: core-concepts
title: 核心概念
description: "介绍 > 核心概念：Redux 的关键思想、reducer 函数简要概述"
---

# 核心概念

想象你的应用状态是由一个普通对象描述的。例如，一个待办事项应用的状态可能如下所示：

```js
{
  todos: [{
    text: '吃饭',
    completed: true
  }, {
    text: '锻炼',
    completed: false
  }],
  visibilityFilter: 'SHOW_COMPLETED'
}
```

这个对象就像一个“模型”，但没有 setter。这样做是为了防止代码的不同部分随意修改状态，避免产生难以重现的错误。

要修改状态中的内容，你需要派发一个 action。action 是一个普通的 JavaScript 对象（注意我们没有引入任何魔法），它描述了发生了什么。这里有几个示例 action：

```js
{ type: 'ADD_TODO', text: '去游泳池' }
{ type: 'TOGGLE_TODO', index: 1 }
{ type: 'SET_VISIBILITY_FILTER', filter: 'SHOW_ALL' }
```

强制将每一次状态变化都描述为一个 action，让我们可以清晰地了解应用发生了什么。如果状态发生了变化，我们知道为什么会变。actions 就像是发生过的事件的面包屑。

最后，为了将 state 和 actions 连接起来，我们编写一个叫做 reducer 的函数。依旧没有魔法 — 它只是一个接受 state 和 action 作为参数，并返回应用下一个状态的函数。

对于大型应用，写一个这样的函数会很难，因此我们写更小的函数管理状态的各个部分：

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  if (action.type === 'SET_VISIBILITY_FILTER') {
    return action.filter
  } else {
    return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return state.concat([{ text: action.text, completed: false }])
    case 'TOGGLE_TODO':
      return state.map((todo, index) =>
        action.index === index
          ? { text: todo.text, completed: !todo.completed }
          : todo
      )
    default:
      return state
  }
}
```

然后我们写另一个 reducer，通过调用这两个 reducer 来管理应用的完整状态，针对相应的状态键进行调用：

```js
function todoApp(state = {}, action) {
  return {
    todos: todos(state.todos, action),
    visibilityFilter: visibilityFilter(state.visibilityFilter, action)
  }
}
```

这基本上就是 Redux 的全部思想。注意这里我们并没有使用任何 Redux 的 API。Redux 提供了一些工具以方便这种模式，但主要思想是你描述你的状态如何随着 action 对象随时间更新，而你写的 90% 代码只是普通的 JavaScript，没有使用 Redux 本身、它的 API，或任何魔法。