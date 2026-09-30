---
id: refactoring-reducer-example
title: 重构 Reducers 示例
sidebar_label: 重构 Reducers 示例
description: '结构化 Reducers > 重构 Reducers：重构 reducer 逻辑的示例方法'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# 使用函数分解和 Reducer 组合重构 Reducer 逻辑

<HandWrittenReducersNote />

了解不同类型的子 reducer 函数长什么样、如何配合使用，会很有帮助。下面演示如何将一个大型 reducer 函数重构为多个较小函数的组合。

> **注意**：本示例故意采用冗长的样式以便于说明概念和重构过程，而不是追求代码的极致简洁。

#### 初始 Reducer

假设我们的初始 reducer 是这样的：

```js
const initialState = {
  visibilityFilter: 'SHOW_ALL',
  todos: []
}

function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER': {
      return Object.assign({}, state, {
        visibilityFilter: action.filter
      })
    }
    case 'ADD_TODO': {
      return Object.assign({}, state, {
        todos: state.todos.concat({
          id: action.id,
          text: action.text,
          completed: false
        })
      })
    }
    case 'TOGGLE_TODO': {
      return Object.assign({}, state, {
        todos: state.todos.map(todo => {
          if (todo.id !== action.id) {
            return todo
          }

          return Object.assign({}, todo, {
            completed: !todo.completed
          })
        })
      })
    }
    case 'EDIT_TODO': {
      return Object.assign({}, state, {
        todos: state.todos.map(todo => {
          if (todo.id !== action.id) {
            return todo
          }

          return Object.assign({}, todo, {
            text: action.text
          })
        })
      })
    }
    default:
      return state
  }
}
```

这个函数相当短，但已经逐渐变得复杂。我们在处理两个不同关注点（过滤器 vs 管理待办事项列表），嵌套使得更新逻辑难以阅读，而且整体上也不够清晰。

#### 提取工具函数

一个好的第一步是提取一个工具函数，用来返回带有更新字段的新对象。还有一个重复的模式——尝试更新数组中某个特定项，也可以提取出一个函数：

```js
function updateObject(oldObject, newValues) {
  // 封装了传递一个新对象作为 Object.assign 第一个参数的思想
  // 确保正确复制数据而不是进行变异
  return Object.assign({}, oldObject, newValues)
}

function updateItemInArray(array, itemId, updateItemCallback) {
  const updatedItems = array.map(item => {
    if (item.id !== itemId) {
      // 只想更新一个项目，所以保持其他项目不变
      return item
    }

    // 使用提供的回调创建更新后的项目
    const updatedItem = updateItemCallback(item)
    return updatedItem
  })

  return updatedItems
}

function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER': {
      return updateObject(state, { visibilityFilter: action.filter })
    }
    case 'ADD_TODO': {
      const newTodos = state.todos.concat({
        id: action.id,
        text: action.text,
        completed: false
      })

      return updateObject(state, { todos: newTodos })
    }
    case 'TOGGLE_TODO': {
      const newTodos = updateItemInArray(state.todos, action.id, todo => {
        return updateObject(todo, { completed: !todo.completed })
      })

      return updateObject(state, { todos: newTodos })
    }
    case 'EDIT_TODO': {
      const newTodos = updateItemInArray(state.todos, action.id, todo => {
        return updateObject(todo, { text: action.text })
      })

      return updateObject(state, { todos: newTodos })
    }
    default:
      return state
  }
}
```

这减少了重复代码，也使代码更易读。

#### 提取 Case Reducers

接下来，可以把每个具体 case 拆成一个独立函数：

```js
// 省略
function updateObject(oldObject, newValues) {}
function updateItemInArray(array, itemId, updateItemCallback) {}

function setVisibilityFilter(state, action) {
  return updateObject(state, { visibilityFilter: action.filter })
}

function addTodo(state, action) {
  const newTodos = state.todos.concat({
    id: action.id,
    text: action.text,
    completed: false
  })

  return updateObject(state, { todos: newTodos })
}

function toggleTodo(state, action) {
  const newTodos = updateItemInArray(state.todos, action.id, todo => {
    return updateObject(todo, { completed: !todo.completed })
  })

  return updateObject(state, { todos: newTodos })
}

function editTodo(state, action) {
  const newTodos = updateItemInArray(state.todos, action.id, todo => {
    return updateObject(todo, { text: action.text })
  })

  return updateObject(state, { todos: newTodos })
}

function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return setVisibilityFilter(state, action)
    case 'ADD_TODO':
      return addTodo(state, action)
    case 'TOGGLE_TODO':
      return toggleTodo(state, action)
    case 'EDIT_TODO':
      return editTodo(state, action)
    default:
      return state
  }
}
```

现在，每个 case 的处理逻辑非常清晰。我们还可以开始看到一些模式。

#### 按领域分离数据处理

我们的 appReducer 仍然处理了所有不同的应用情况。我们可以尝试把过滤逻辑和待办事项逻辑分开：

```js
// 省略
function updateObject(oldObject, newValues) {}
function updateItemInArray(array, itemId, updateItemCallback) {}

function setVisibilityFilter(visibilityState, action) {
  // 技术上，我们甚至不关心之前的状态
  return action.filter
}

function visibilityReducer(visibilityState = 'SHOW_ALL', action) {
  switch (action.type) {
    case 'SET_VISIBILITY_FILTER':
      return setVisibilityFilter(visibilityState, action)
    default:
      return visibilityState
  }
}

function addTodo(todosState, action) {
  const newTodos = todosState.concat({
    id: action.id,
    text: action.text,
    completed: false
  })

  return newTodos
}

function toggleTodo(todosState, action) {
  const newTodos = updateItemInArray(todosState, action.id, todo => {
    return updateObject(todo, { completed: !todo.completed })
  })

  return newTodos
}

function editTodo(todosState, action) {
  const newTodos = updateItemInArray(todosState, action.id, todo => {
    return updateObject(todo, { text: action.text })
  })

  return newTodos
}

function todosReducer(todosState = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return addTodo(todosState, action)
    case 'TOGGLE_TODO':
      return toggleTodo(todosState, action)
    case 'EDIT_TODO':
      return editTodo(todosState, action)
    default:
      return todosState
  }
}

function appReducer(state = initialState, action) {
  return {
    todos: todosReducer(state.todos, action),
    visibilityFilter: visibilityReducer(state.visibilityFilter, action)
  }
}
```

注意，因为这两个 “状态切片” 的 reducers 现在只接收它们自己对应的部分状态作为参数，它们不再需要返回复杂的嵌套状态对象，因此更简单了。

#### 减少模板代码

差不多完成了。许多人不喜欢 switch 语句，所以常用一个函数创建一个从 action 类型映射到 case 函数的查找表。我们使用 [减少模板代码](../reducing-boilerplate) 中介绍的 `createReducer` 函数：

```js
// 省略
function updateObject(oldObject, newValues) {}
function updateItemInArray(array, itemId, updateItemCallback) {}

function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

// 省略
function setVisibilityFilter(visibilityState, action) {}

const visibilityReducer = createReducer('SHOW_ALL', {
  SET_VISIBILITY_FILTER: setVisibilityFilter
})

// 省略
function addTodo(todosState, action) {}
function toggleTodo(todosState, action) {}
function editTodo(todosState, action) {}

const todosReducer = createReducer([], {
  ADD_TODO: addTodo,
  TOGGLE_TODO: toggleTodo,
  EDIT_TODO: editTodo
})

function appReducer(state = initialState, action) {
  return {
    todos: todosReducer(state.todos, action),
    visibilityFilter: visibilityReducer(state.visibilityFilter, action)
  }
}
```

#### 按状态切片合并 Reducers

最后一步，我们可以使用 Redux 内置的 `combineReducers` 工具，来处理顶层 appReducer 的状态切片逻辑。最终结果如下：

```js
// 可复用的工具函数

function updateObject(oldObject, newValues) {
  // 封装了传递一个新对象作为 Object.assign 第一个参数的思想
  // 确保正确复制数据而不是进行变异
  return Object.assign({}, oldObject, newValues)
}

function updateItemInArray(array, itemId, updateItemCallback) {
  const updatedItems = array.map(item => {
    if (item.id !== itemId) {
      // 只想更新一个项目，所以保持其他项目不变
      return item
    }

    // 使用提供的回调创建更新后的项目
    const updatedItem = updateItemCallback(item)
    return updatedItem
  })

  return updatedItems
}

function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action)
    } else {
      return state
    }
  }
}

// 具体 case 的处理函数（“case reducer”）
function setVisibilityFilter(visibilityState, action) {
  // 技术上，我们甚至不关心之前的状态
  return action.filter
}

// 整个状态切片的处理函数（“slice reducer”）
const visibilityReducer = createReducer('SHOW_ALL', {
  SET_VISIBILITY_FILTER: setVisibilityFilter
})

// case reducer
function addTodo(todosState, action) {
  const newTodos = todosState.concat({
    id: action.id,
    text: action.text,
    completed: false
  })

  return newTodos
}

// case reducer
function toggleTodo(todosState, action) {
  const newTodos = updateItemInArray(todosState, action.id, todo => {
    return updateObject(todo, { completed: !todo.completed })
  })

  return newTodos
}

// case reducer
function editTodo(todosState, action) {
  const newTodos = updateItemInArray(todosState, action.id, todo => {
    return updateObject(todo, { text: action.text })
  })

  return newTodos
}

// slice reducer
const todosReducer = createReducer([], {
  ADD_TODO: addTodo,
  TOGGLE_TODO: toggleTodo,
  EDIT_TODO: editTodo
})

// “根 reducer”
const appReducer = combineReducers({
  visibilityFilter: visibilityReducer,
  todos: todosReducer
})
```

我们现在有了几个拆分 reducer 函数的示例：辅助工具函数如 `updateObject` 和 `createReducer`，具体 case 的处理函数如 `setVisibilityFilter` 和 `addTodo`，以及状态切片的处理函数如 `visibilityReducer` 和 `todosReducer`。我们还看到 `appReducer` 是 “根 reducer” 的一个示例。

虽然本例的最终代码明显比原始版本长，但主要是因为提取了工具函数、添加了注释，以及为了清晰而有意采用较详尽的写法（例如使用单独的 return 语句）。单独看每个函数，它们现在承担的职责更少，意图也更清楚。在真实应用中，这些函数可能会进一步拆分到不同文件，例如 `reducerUtilities.js`、`visibilityReducer.js`、`todosReducer.js` 和 `rootReducer.js`。

#### 使用 Redux Toolkit 实现相同结果

上面提取出的每个部分在 Redux Toolkit 中都有对应实现。`createSlice` 像手写的 `createReducer` 一样使用 case reducer 查找表，并替我们生成 action 类型和 action creator。Immer 则处理原先由 `updateObject` 和 `updateItemInArray` 完成的复制操作。向 `configureStore` 传入 slice reducer 对象时，它会调用 `combineReducers`。因此，最后一步的两个 slice 使用 Redux Toolkit 编写后如下所示：

```ts
import { configureStore, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type VisibilityFilter = 'SHOW_ALL' | 'SHOW_ACTIVE' | 'SHOW_COMPLETED'

const visibilitySlice = createSlice({
  name: 'visibilityFilter',
  initialState: 'SHOW_ALL' as VisibilityFilter,
  reducers: {
    // Case reducer: returning a value replaces the slice state
    visibilityFilterSet(state, action: PayloadAction<VisibilityFilter>) {
      return action.payload
    }
  }
})

interface Todo {
  id: string
  text: string
  completed: boolean
}

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    // Case reducers: "mutating" the draft is converted to an immutable update
    todoAdded(state, action: PayloadAction<{ id: string; text: string }>) {
      state.push({ ...action.payload, completed: false })
    },
    todoToggled(state, action: PayloadAction<string>) {
      const todo = state.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
    },
    todoEdited(state, action: PayloadAction<{ id: string; text: string }>) {
      const todo = state.find(todo => todo.id === action.payload.id)
      if (todo) {
        todo.text = action.payload.text
      }
    }
  }
})

export const { visibilityFilterSet } = visibilitySlice.actions
export const { todoAdded, todoToggled, todoEdited } = todosSlice.actions

// "Root reducer": configureStore combines these for us
export const store = configureStore({
  reducer: {
    visibilityFilter: visibilitySlice.reducer,
    todos: todosSlice.reducer
  }
})
```

整体结构与手动重构得到的结果相同：case reducer 组成 slice reducer，再组合为根 reducer。区别在于，工具函数、action 常量和 action creator 都是自动生成的，而不是手动编写的。
