---
id: three-principles
title: 三大原则
description: '介绍 > 三大原则：使用 Redux 的三个关键原则'
---

# 三大原则

Redux 可以用三个基本原则来描述：

### 单一数据源

**你的应用的[全局状态](./Glossary.md#state)存储在一个单一的[store](./Glossary.md#store)中的对象树里。**

这使得创建通用应用变得容易，因为你可以将服务器端的状态序列化并在客户端恢复，且无需额外编码。单一的状态树也让调试或检查应用变得更简单；它还允许你在开发过程中持久化应用的状态，从而实现更快的开发周期。一些传统上难以实现的功能——例如撤销/重做——如果所有状态都存储在单个树中，变得异常简单。

```js
console.log(store.getState())

/* 打印结果
{
  visibilityFilter: 'SHOW_ALL',
  todos: [
    {
      text: '考虑使用 Redux',
      completed: true,
    },
    {
      text: '把所有状态存储在单一树中',
      completed: false
    }
  ]
}
*/
```

### 状态只读

**更改状态的唯一方式是发出一个描述发生了什么的[action](./Glossary.md)对象。**

这确保视图或网络回调绝不会直接写入状态。相反，它们表达了一个意图去转换状态。因为所有更改都是集中进行且按严格顺序依次发生，所以没有需要担心的微妙竞态条件。由于 actions 只是普通对象，它们可以被记录、序列化、存储，之后可以重新播放用于调试或测试。

```js
store.dispatch({
  type: 'COMPLETE_TODO',
  index: 1
})

store.dispatch({
  type: 'SET_VISIBILITY_FILTER',
  filter: 'SHOW_COMPLETED'
})
```

### 通过纯函数进行更改

**为了指定状态树如何根据 action 转换，你需要编写纯[reducer](./Glossary.md#reducer)。**

Reducers 是纯函数，接收上一个状态和一个动作，返回下一个状态。记住要返回新的状态对象，而不是修改之前的状态。你可以从单一 reducer 开始，随着应用的增长，拆分成管理状态树特定部分的小 reducers。因为 reducers 只是函数，你可以控制它们被调用的顺序，传递额外数据，甚至创建可复用的 reducer 来完成诸如分页等常见任务。

```js
function visibilityFilter(state = 'SHOW_ALL', action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return action.filter
    default:
      return state
  }
}

function todos(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [
        ...state,
        {
          text: action.text,
          completed: false
        }
      ]
    case 'COMPLETE_TODO':
      return state.map((todo, index) => {
        if (index === action.index) {
          return Object.assign({}, todo, {
            completed: true
          })
        }
        return todo
      })
    default:
      return state
  }
}

import { combineReducers, createStore } from 'redux'
const reducer = combineReducers({ visibilityFilter, todos })
const store = createStore(reducer)
```

就是这样！现在你明白 Redux 的核心理念了。