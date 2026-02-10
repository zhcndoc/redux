---
id: part-7-standard-patterns
title: 'Redux 基础，第七部分：标准 Redux 模式'
sidebar_label: '标准 Redux 模式'
description: 'Redux 官方基础教程：学习在实际 Redux 应用中使用的标准模式'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

<!-- prettier-ignore -->
import FundamentalsWarning from "../../components/_FundamentalsWarning.mdx";

:::tip 你将学到的内容

- 真实世界 Redux 应用中使用的标准模式，以及这些模式存在的原因：
  - 用于封装 action 对象的 action 创建函数
  - 用于提升性能的记忆化选择器
  - 通过加载状态枚举跟踪请求状态
  - 用于管理项目集合的状态归一化
  - 处理 Promise 和 thunk

:::

:::info 先决条件

- 理解之前所有章节的内容

:::

在[第六部分：异步逻辑与数据获取](./part-6-async-logic.md)中，我们了解了如何使用 Redux 中间件编写能够与 store 通信的异步逻辑。特别是，我们使用了 Redux 的 “thunk” 中间件编写可复用的异步逻辑函数，而无需提前知道它们将要操作的 Redux store。

到目前为止，我们已经覆盖了 Redux 的基本原理。然而，真实世界中的 Redux 应用会在这些基础之上使用一些额外的模式。

需要注意的是，**这些模式都不是使用 Redux 的 _必须_ 条件！** 但每种模式都有其深刻的理由，而且你几乎在每个 Redux 代码库中都会看到它们的一些或全部用法。

本节将重构我们现有的待办应用代码，使用其中一些模式，并讨论它们为何在 Redux 应用中被广泛使用。随后，在[第八部分](./part-8-modern-redux.md)中，我们将介绍“现代 Redux”，包括**如何使用官方的 [Redux Toolkit](https://redux-toolkit.js.org) 简化我们之前“手写”的全部 Redux 逻辑**，并且为什么**我们推荐将 Redux Toolkit 作为编写 Redux 应用的标准实践**。

<FundamentalsWarning />

## Action 创建函数

在我们的应用中，我们一直直接在代码中编写 action 对象，并直接分发：

```js
dispatch({ type: 'todos/todoAdded', payload: trimmedText })
```

但实际上，良好编写的 Redux 应用并不会直接在 dispatch 时内联编写 action 对象，而是使用“action 创建函数”。

**action 创建函数**是一个返回 action 对象的函数。我们通常使用它们，避免每次都手写 action 对象：

```js
const todoAdded = text => {
  return {
    type: 'todos/todoAdded',
    payload: text
  }
}
```

然后，我们通过**调用 action 创建函数**，再**将其生成的 action 对象直接传给 `dispatch`**：

```js
store.dispatch(todoAdded('Buy milk'))

console.log(store.getState().todos)
// [ {id: 0, text: 'Buy milk', completed: false}]
```

<DetailedExplanation title="详细说明：为什么使用 Action 创建函数？">

在我们的小型示例待办应用中，每次手写 action 对象其实也不难。实际上，切换到使用 action 创建函数我们反而写了 _更多_ 代码——现在需要编写函数 _和_ action 对象。

但是如果我们需要在应用的多个地方分发同样的 action，或者每次分发 action 都需要执行一些额外逻辑（比如创建唯一 ID），那我们就得在每次 dispatch 时复制粘贴那些逻辑。

Action 创建函数有两个主要用途：

- 它们准备和格式化 action 对象的内容
- 它们封装创建这些 action 时需要的额外工作

这样，我们就可以对创建 actions 有统一的方法，无论是否需要额外工作。thunks 也是同样的道理。

</DetailedExplanation>

### 使用 Action 创建函数

让我们更新 todos slice 文件，针对几个 action 类型使用 action 创建函数。

我们先改造迄今为止主要使用的两个动作：从服务器加载 todos 列表，以及保存到服务器后添加新 todo。

当前，`todosSlice.js` 直接分发 action 对象，如下所示：

```js
dispatch({ type: 'todos/todosLoaded', payload: response.todos })
```

我们创建一个函数，返回同样种类的 action 对象，但接收 todos 数组作为参数，并把它放进 action 的 `payload` 中。然后，我们可以在 `fetchTodos` thunk 内部用新的 action 创建函数派发该 action：

```js title="src/features/todos/todosSlice.js"
// highlight-start
export const todosLoaded = todos => {
  return {
    type: 'todos/todosLoaded',
    payload: todos
  }
}
// highlight-end

export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')
  // highlight-next-line
  dispatch(todosLoaded(response.todos))
}
```

同样，我们也为“todo added”动作做类似改动：

```js title="src/features/todos/todosSlice.js"
// highlight-start
export const todoAdded = todo => {
  return {
    type: 'todos/todoAdded',
    payload: todo
  }
}
// highlight-end

export function saveNewTodo(text) {
  return async function saveNewTodoThunk(dispatch, getState) {
    const initialTodo = { text }
    const response = await client.post('/fakeApi/todos', { todo: initialTodo })
    // highlight-next-line
    dispatch(todoAdded(response.todo))
  }
}
```

顺便，我们也为“颜色过滤器变化”动作同样使用 action 创建函数：

```js title="src/features/filters/filtersSlice.js"
// highlight-start
export const colorFilterChanged = (color, changeType) => {
  return {
    type: 'filters/colorFilterChanged',
    payload: { color, changeType }
  }
}
// highlight-end
```

由于该 action 是从 `<Footer>` 组件中 dispatch 的，我们需要在 `<Footer>` 中导入 `colorFilterChanged` 并使用它：

```js title="src/features/footer/Footer.js"
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { availableColors, capitalize } from '../filters/colors'
// highlight-next-line
import { StatusFilters, colorFilterChanged } from '../filters/filtersSlice'

// omit child components

const Footer = () => {
  const dispatch = useDispatch()

  const todosRemaining = useSelector(state => {
    const uncompletedTodos = state.todos.filter(todo => !todo.completed)
    return uncompletedTodos.length
  })

  const { status, colors } = useSelector(state => state.filters)

  const onMarkCompletedClicked = () => dispatch({ type: 'todos/allCompleted' })
  const onClearCompletedClicked = () =>
    dispatch({ type: 'todos/completedCleared' })

  // highlight-start
  const onColorChange = (color, changeType) =>
    dispatch(colorFilterChanged(color, changeType))
  // highlight-end

  const onStatusChange = status =>
    dispatch({ type: 'filters/statusFilterChanged', payload: status })

  // omit rendering output
}

export default Footer
```

注意，`colorFilterChanged` action 创建函数接受两个参数，然后组合它们形成正确的 `action.payload` 字段。

这不会改变应用的工作方式或 Redux 数据流 —— 我们仍然是创建 action 对象并分发它们。但现在我们不是在代码中直接写 action 对象，而是在 dispatch 之前用 action 创建函数做准备。

我们也可以将 action 创建函数与 thunk 函数结合使用，实际上[我们在前一节中已经用 action 创建函数包裹了 thunk](./part-6-async-logic.md#saving-todo-items)。我们专门用 thunk action 创建函数包裹了 `saveNewTodo`，以便传入 `text` 参数。虽然 `fetchTodos` 不接受参数，我们也可以将它包裹在 action 创建函数中：

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
export function fetchTodos() {
  return async function fetchTodosThunk(dispatch, getState) {
    const response = await client.get('/fakeApi/todos')
    dispatch(todosLoaded(response.todos))
  }
}
```

这意味着我们得在 `index.js` 中调用外层的 thunk action 创建函数，传给 `dispatch` 返回的内层 thunk 函数：

```js title="src/index.js"
import store from './store'
import { fetchTodos } from './features/todos/todosSlice'

// highlight-next-line
store.dispatch(fetchTodos())
```

到目前为止，我们用 `function` 关键字写 thunk 函数以明确它们的作用，不过也可以用箭头函数写。使用隐式返回可以缩短代码，虽然对于不熟悉箭头函数的人阅读体验可能稍差：

```js title="src/features/todos/todosSlice.js"
// 和上面例子功能一样！
// highlight-next-line
export const fetchTodos = () => async dispatch => {
  const response = await client.get('/fakeApi/todos')
  dispatch(todosLoaded(response.todos))
}
```

同样，如果愿意，普通的 action 创建函数也可以简写：

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
export const todoAdded = todo => ({ type: 'todos/todoAdded', payload: todo })
```

是否用这种箭头函数写法，完全取决于你个人喜好。

:::info

关于为何 action 创建函数有用的更多细节，请参见：

- [Idiomatic Redux: Why Use Action Creators?](https://blog.isquaredsoftware.com/2016/10/idiomatic-redux-why-use-action-creators/)

:::

## 记忆化选择器（Memoized Selectors）

我们已经见过可以写“选择器”函数，接受 Redux `state` 对象作为参数，返回某个值：

```js
const selectTodos = state => state.todos
```

如果我们需要 _派生_ 一些数据呢？比如，想得到只有 todo ID 的数组：

```js
const selectTodoIds = state => state.todos.map(todo => todo.id)
```

不过，`array.map()` 总是返回新的数组引用。我们知道 React-Redux 的 `useSelector` hook 会在 _每次_ dispatch 后重新运行选择器，如果选择器结果改变，组件会重渲。

在此例中，**每次调用 `useSelector(selectTodoIds)` 会导致组件在 _每个_ action 后都重新渲染，因为返回了新的数组引用！**

在第五部分，我们看到[可以给 `useSelector` 传入 `shallowEqual`](./part-5-ui-and-react.md#selecting-data-in-list-items-by-id)。但这里还有另一种解决方案：记忆化选择器。

**记忆化**是一种缓存技巧——保存某个耗时计算的结果，如果输入不变，就复用该结果。

**记忆化选择器函数**会缓存最近一次的结果值，如果多次用相同输入调用它，会返回相同的结果引用。输入变化时，会重新计算结果、缓存并返回新值。

### 使用 `createSelector` 记忆化选择器

**[Reselect 库](https://github.com/reduxjs/reselect)提供了 `createSelector` API 来生成记忆化选择器函数**。`createSelector` 接受一个或多个“输入选择器”函数，和一个“输出选择器”函数，并返回新的选择器函数。每次调用该选择器都发生如下：

- 所有输入选择器用所有参数运行
- 如果任一输入选择器返回值变化，输出选择器重新运行
- 所有输入选择器的结果会作为参数传给输出选择器
- 输出选择器返回的结果被缓存以备后续使用

让我们创建 `selectTodoIds` 的记忆化版本，并在 `<TodoList>` 中使用。

首先安装 Reselect：

```bash
npm install reselect
```

然后导入并用 `createSelector` 创建。我们的原 `selectTodoIds` 在 `TodoList.js` 中定义，但通常选择器写在对应的 slice 文件更合适。我们在 todos slice 中添加如下代码：

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
import { createSelector } from 'reselect'

// omit reducer

// omit action creators

// highlight-start
export const selectTodoIds = createSelector(
  // 首先传入一个或多个“输入选择器”：
  state => state.todos,
  // 然后是一个“输出选择器”，接收所有输入结果作为参数
  // 并返回最终结果
  todos => todos.map(todo => todo.id)
)
// highlight-end
```

再在 `<TodoList>` 中使用它：

```js title="src/features/todos/TodoList.js"
import React from 'react'
import { useSelector, shallowEqual } from 'react-redux'

// highlight-next-line
import { selectTodoIds } from './todosSlice'
import TodoListItem from './TodoListItem'

const TodoList = () => {
  // highlight-next-line
  const todoIds = useSelector(selectTodoIds)

  const renderedListItems = todoIds.map(todoId => {
    return <TodoListItem key={todoId} id={todoId} />
  })

  return <ul className="todo-list">{renderedListItems}</ul>
}
```

这行为与使用 `shallowEqual` 不完全相同。每当 `state.todos` 数组变化时，我们将创建新的 todo ID 数组。包括因为不可变更新（比如切换 `completed` 字段）导致创建的新数组。

:::tip

记忆化选择器仅当你真的基于原始数据派生出新值有帮助。若只是简单查询已有值，选择器仍然可用普通函数。

:::

### 多入参选择器

我们的待办应用支持根据完成状态过滤可见 todos。让我们写个返回过滤后 todos 列表的记忆化选择器。

我们知道输出选择器需要整个 todos 数组作为参数，还需传入当前的完成状态过滤值。为此，我们添加单独的“输入选择器”提取每个值，并把结果传给“输出选择器”。

```js title="src/features/todos/todosSlice.js"
import { createSelector } from 'reselect'
import { StatusFilters } from '../filters/filtersSlice'

// omit other code

// highlight-start
export const selectFilteredTodos = createSelector(
  // 第一输入选择器：所有 todos
  state => state.todos,
  // 第二输入选择器：当前状态过滤器
  state => state.filters.status,
  // 输出选择器：接收两个输入参数
  (todos, status) => {
    if (status === StatusFilters.All) {
      return todos
    }

    const completedStatus = status === StatusFilters.Completed
    // 根据过滤条件返回对应的 todo
    return todos.filter(todo => todo.completed === completedStatus)
  }
)
// highlight-end
```

:::caution

注意我们加了跨 slice 的依赖：`todosSlice` 导入了 `filtersSlice` 中的值。这是允许的，但要谨慎。**如果两个 slice 互相导入对方，就会出现“循环导入依赖”问题，可能导致代码崩溃**。若出现这种情况，应考虑把公共代码移动到独立文件再导入。

:::

接下来，我们可以把新建的“过滤后 todos”选择器用作另一个选择器的输入，返回过滤后 todos 的 id：

```js title="src/features/todos/todosSlice.js"
export const selectFilteredTodoIds = createSelector(
  // 用另一个记忆化选择器作为输入
  selectFilteredTodos,
  // 在输出选择器中派生数据
  filteredTodos => filteredTodos.map(todo => todo.id)
)
```

如果我们改用 `selectFilteredTodoIds`，就能标记几个 todo 为完成状态：

![待办应用 - 待办事项标记为已完成](/img/tutorials/fundamentals/todos-app-markedCompleted.png)

然后过滤只显示完成的：

![待办应用 - 仅显示已完成事项](/img/tutorials/fundamentals/todos-app-showCompleted.png)

之后我们还可以扩展 `selectFilteredTodos`，基于颜色过滤：

```js title="src/features/todos/todosSlice.js"
export const selectFilteredTodos = createSelector(
  // 第一个输入选择器：所有 todos
  selectTodos,
  // 第二个输入选择器：所有过滤值
  // highlight-next-line
  state => state.filters,
  // 输出选择器：接收所有输入
  (todos, filters) => {
    // highlight-start
    const { status, colors } = filters
    const showAllCompletions = status === StatusFilters.All
    if (showAllCompletions && colors.length === 0) {
      // highlight-end
      return todos
    }

    // highlight-next-line
    const completedStatus = status === StatusFilters.Completed
    // 根据过滤条件返回符合的 todos
    return todos.filter(todo => {
      // highlight-start
      const statusMatches =
        showAllCompletions || todo.completed === completedStatus
      const colorMatches = colors.length === 0 || colors.includes(todo.color)
      return statusMatches && colorMatches
      // highlight-end
    })
  }
)
```

注意封装逻辑后，组件代码并未改变，即使我们更新了过滤行为。现在能够同时基于状态和颜色过滤：

![待办应用 - 状态和颜色过滤器](/img/tutorials/fundamentals/todos-app-selectorFilters.png)

最后，我们的代码中多处查找 `state.todos`，接下来会调整状态设计，所以抽取出单一的 `selectTodos` 用于所有地方。同时把 `selectTodoById` 移入 `todosSlice`：

```js title="src/features/todos/todosSlice.js"
export const selectTodos = state => state.todos

export const selectTodoById = (state, todoId) => {
  return selectTodos(state).find(todo => todo.id === todoId)
}
```

:::info

关于为何使用选择器函数及如何用 Reselect 写记忆化选择器的更多细节，请参见：

- [使用 Redux：用选择器派生数据](../../usage/deriving-data-selectors.md)

:::

## 异步请求状态

我们用异步 thunk 去等待并获取服务器返回的最初 todos 列表。因为是模拟服务器，响应几乎是立刻返回。在真实应用中，API 调用可能耗时较长。此时，通常会在等待响应期间显示加载动画。

Redux 应用中常见做法是：

- 使用一些“加载状态”值指示请求当前状态
- 在调用 API 注意执行之前，先 dispatch 一条“请求开始”动作，由 reducer 更改 loading 状态值
- 请求完成时再 dispatch 另一个动作，更新 loading 状态显示请求已结束

UI 层在请求执行时显示加载动画，请求完成后切换为显示真实数据。

我们更新 todos slice 跟踪加载状态值，并在 `fetchTodos` thunk 中加入 `'todos/todosLoading'` 动作。

当前，todos reducer 的 `state` 只是 todos 数组。如果想把 loading 状态放进 todos slice，就得重新组织 todos 状态，设成包含 todos 数组 _和_ loading 状态值的对象。这样也意味着 reducer 处理代码要适应新增的嵌套层：

```js title="src/features/todos/todosSlice.js"
// highlight-start
const initialState = {
  status: 'idle',
  entities: []
}
// highlight-end

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/todoAdded': {
      // highlight-start
      return {
        ...state,
        entities: [...state.entities, action.payload]
      }
      // highlight-end
    }
    case 'todos/todoToggled': {
      // highlight-start
      return {
        ...state,
        entities: state.entities.map(todo => {
          if (todo.id !== action.payload) {
            return todo
          }

          return {
            ...todo,
            completed: !todo.completed
          }
        })
      }
      // highlight-end
    }
    // omit other cases
    default:
      return state
  }
}

// omit action creators

// highlight-next-line
export const selectTodos = state => state.todos.entities
```

这里几点需注意：

- todos 数组现在嵌套到 `state.entities` 中，这是 Redux store 中 `todosReducer` 的状态对象。`entities` 代表“有唯一 ID 的项目”，比较符合待办对象的实际。
- 这意味着在整个 Redux 状态树中数组访问路径是 `state.todos.entities`
- reducer 中需要额外步骤复制新增的嵌套结构，保证不可变更新：state 对象 -> entities 数组 -> todo 对象
- 因为 UI 只通过选择器访问 todos 状态，**只需更新 `selectTodos` 选择器即可**，其余 UI 代码无需变更，仍能正常工作

### 加载状态枚举值

你也许注意到了，加载状态字段用字符串枚举：

```js
{
  status: 'idle' // 或: 'loading', 'succeeded', 'failed'
}
```

而不是布尔值 `isLoading`。

布尔状态只能表示两种：加载中或非加载中。现实情况中，**请求可能处于 _多种不同状态_**，例如：

- 未开始
- 进行中
- 成功
- 失败
- 成功，但之后可能需要重新请求

应用逻辑可能还限定状态转移需符合特定规则，这用布尔值难以实现。

因此，我们推荐**采用字符串枚举来存储请求状态，而非布尔值标记**。

:::info

关于为什么加载状态要用枚举的详细解释，请参见：

- [Redux 风格指南：将 reducer 视作状态机](../../style-guide/style-guide.md#treat-reducers-as-state-machines)

:::

基于上述，我们新增一个“加载中”动作，把状态置为 `'loading'`，同时“加载完成”动作把状态复位为 `'idle'`：

```js title="src/features/todos/todosSlice.js"
const initialState = {
  status: 'idle',
  entities: []
}

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    // omit other cases
    // highlight-start
    case 'todos/todosLoading': {
      return {
        ...state,
        status: 'loading'
      }
    }
    // highlight-end
    case 'todos/todosLoaded': {
      return {
        ...state,
        // highlight-next-line
        status: 'idle',
        entities: action.payload
      }
    }
    default:
      return state
  }
}

// omit action creators

// Thunk 函数
export const fetchTodos = () => async dispatch => {
  // highlight-next-line
  dispatch(todosLoading())
  const response = await client.get('/fakeApi/todos')
  dispatch(todosLoaded(response.todos))
}
```

但在显示加载状态之前，需要修改模拟服务器 API，给请求添加人为延迟。打开 `src/api/server.js`，在第 63 行附近找到这条被注释掉的代码：

```js title="src/api/server.js"
new Server({
  routes() {
    this.namespace = 'fakeApi'
    // highlight-next-line
    // this.timing = 2000

    // omit other code
  }
})
```

取消注释这一行，模拟服务器会对所有 API 调用延迟 2 秒，足够让我们观察加载动画。

接着，在 `<TodoList>` 组件中读取加载状态，基于该状态显示加载指示动画：

```js title="src/features/todos/TodoList.js"
// omit imports

const TodoList = () => {
  const todoIds = useSelector(selectFilteredTodoIds)
  // highlight-start
  const loadingStatus = useSelector(state => state.todos.status)

  if (loadingStatus === 'loading') {
    return (
      <div className="todo-list">
        <div className="loader" />
      </div>
    )
  }
  // highlight-end

  const renderedListItems = todoIds.map(todoId => {
    return <TodoListItem key={todoId} id={todoId} />
  })

  return <ul className="todo-list">{renderedListItems}</ul>
}
```

在真实应用中，还应处理 API 错误和其他可能情况。

打开应用后，这样可以看到启用加载状态的效果（想再次看到加载动画，请刷新预览或新标签打开）：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-7-asyncLoading/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## Flux 标准 Action

Redux store 本身并不关心 action 对象中放了哪些字段。它唯一关心的是 `action.type` 存在且为字符串。也就是说，你可以向 action 放入任何字段。比如，`action.todo` 用于“添加 todo”动作，或 `action.color`，等等。

然而，如果各种 action 使用不同的字段名，Reducer 处理时就难以事先知道要处理哪些字段。

为此，Redux 社区提出了 [Flux 标准 Action（FSA）约定](https://github.com/redux-utilities/flux-standard-action#motivation)，也称“FSA”。这是组织 action 对象字段的一种建议做法，使开发者始终清楚每个字段存储何种数据。实际上，你从本教程开始就一直在使用此约定。

FSA 约定规定：

- 如果 action 对象有实际数据，该数据总放在 `action.payload` 中
- action 可带有 `action.meta` 字段存放额外描述信息
- action 可带有 `action.error` 字段存放错误信息

因此，**所有 Redux action 必须**：

- 是一个普通 JavaScript 对象
- 有一个 `type` 字段

写成符合 FSA 规则的 action 可以：

- 有 `payload` 字段
- 有 `error` 字段
- 有 `meta` 字段

<DetailedExplanation title="详细说明：FSA 与错误处理">

FSA 规范说明：

> 可选的 `error` 属性可设为 `true`，表示该 action 代表错误。对于 `error` 为 `true` 的 action，`payload` 应该是一个错误对象。若 `error` 为除 `true` 以外的任何值（比如 `undefined`、`null`），则该 action 不被视作错误。

FSA 还反对为“加载成功”、“加载失败”这类情况分别定义 action type。

但实际中，Redux 社区忽略了用 `action.error` 布尔标记的做法，倾向用不同的 action type 表示成功和失败，如 `'todos/todosLoadingSucceeded'` 及 `'todos/todosLoadingFailed'`。这是因为检查 action type 更直接，胜过先检测 `todos/todosLoaded` 再判断 `action.error`。

你可以采用自己喜欢的方法，但大多数应用用独立 action type 区分成功失败。

</DetailedExplanation>

## 归一化状态（Normalized State）

迄今为止，我们把 todos 放在数组中。因为服务器返回的数据即为数组，且我们也要循环 todos 展示列表，因此这样很合理。

但大型 Redux 应用中，数据常用 **归一化状态结构** 存储。归一化意味着：

- 让每条数据只保存一份拷贝
- 以方便根据 ID 查找的方式存储项目
- 引用其他项目时用 ID 而非复制整个项目

举例，在博客应用中，`Post` 对象引用 `User` 和 `Comment`。同一用户可能发多个帖子，如果每篇都包括完整的 `User` 对象，就会有多个冗余的 `User` 副本。反之，`Post` 仅保存用户 ID，详情通过 `state.users[post.user]` 查找。

典型归一化状态以对象而非数组存储项目，项目 ID 为键，项目对象为值，如下：

```js
const rootState = {
  todos: {
    status: 'idle',
    // highlight-start
    entities: {
      2: { id: 2, text: 'Buy milk', completed: false },
      7: { id: 7, text: 'Clean room', completed: true }
    }
    // highlight-end
  }
}
```

让我们改 todos slice 用归一化形式存储 todos，这需要大改 reducer 逻辑及选择器：

```js title="src/features/todos/todosSlice"
const initialState = {
  status: 'idle',
  // highlight-next-line
  entities: {}
}

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/todoAdded': {
      const todo = action.payload
      // highlight-start
      return {
        ...state,
        entities: {
          ...state.entities,
          [todo.id]: todo
        }
      }
      // highlight-end
    }
    case 'todos/todoToggled': {
      // highlight-start
      const todoId = action.payload
      const todo = state.entities[todoId]
      return {
        ...state,
        entities: {
          ...state.entities,
          [todoId]: {
            ...todo,
            completed: !todo.completed
          }
        }
      }
      // highlight-end
    }
    case 'todos/colorSelected': {
      // highlight-start
      const { color, todoId } = action.payload
      const todo = state.entities[todoId]
      return {
        ...state,
        entities: {
          ...state.entities,
          [todoId]: {
            ...todo,
            color
          }
        }
      }
      // highlight-end
    }
    case 'todos/todoDeleted': {
      // highlight-start
      const newEntities = { ...state.entities }
      delete newEntities[action.payload]
      return {
        ...state,
        entities: newEntities
      }
      // highlight-end
    }
    case 'todos/allCompleted': {
      // highlight-start
      const newEntities = { ...state.entities }
      Object.values(newEntities).forEach(todo => {
        newEntities[todo.id] = {
          ...todo,
          completed: true
        }
      })
      return {
        ...state,
        entities: newEntities
      }
      // highlight-end
    }
    case 'todos/completedCleared': {
      // highlight-start
      const newEntities = { ...state.entities }
      Object.values(newEntities).forEach(todo => {
        if (todo.completed) {
          delete newEntities[todo.id]
        }
      })
      return {
        ...state,
        entities: newEntities
      }
      // highlight-end
    }
    case 'todos/todosLoading': {
      return {
        ...state,
        status: 'loading'
      }
    }
    case 'todos/todosLoaded': {
      // highlight-start
      const newEntities = {}
      action.payload.forEach(todo => {
        newEntities[todo.id] = todo
      })
      return {
        ...state,
        status: 'idle',
        entities: newEntities
      }
      // highlight-end
    }
    default:
      return state
  }
}

// omit action creators

// highlight-start
const selectTodoEntities = state => state.todos.entities

export const selectTodos = createSelector(selectTodoEntities, entities =>
  Object.values(entities)
)

export const selectTodoById = (state, todoId) => {
  return selectTodoEntities(state)[todoId]
}
// highlight-end
```

因为 `state.entities` 现在是对象，不是数组，更新数据时要用嵌套对象展开运算符而非数组操作。此外，遍历对象不如遍历数组直接，多处用 `Object.values(entities)` 获取值数组以便循环。

好消息是，因我们用选择器封装状态访问，UI 代码不受影响。坏消息是 reducer 代码写得更长更复杂。

问题之一是，**这个 todo 应用示例并非大型真实项目**，归一化在此应用中用不上明显优势，且潜在利益较难体现。

好在在[第八部分：现代 Redux 和 Redux Toolkit](part-8-modern-redux.md)中，我们将看到怎样极大简化操作归一化状态的 reducer 代码。

现在你应了解：

- 归一化在 Redux 应用中很常用
- 主要好处是能按 ID 查找单条数据，且确保状态中数据只有一份唯一副本

:::info

关于 Redux 中归一化的更多细节，请参见：

- [结构化 Reducer：归一化状态形状](../../usage/structuring-reducers/NormalizingStateShape.md)

:::

## Thunks 和 Promise

最后一种模式，我们之前介绍过如何储存异步请求的加载状态。那如果想在组件中查看 thunk 执行结果呢？

调用 `store.dispatch(action)` 时，`dispatch` 会返回传入的 `action`。中间件能改变这个行为，返回其他内容。

Redux Thunk 中间件就是让我们可以向 `dispatch` 传入函数，并调用它，最后返回该函数执行结果：

```js title="reduxThunkMiddleware.js"
const reduxThunkMiddleware = storeAPI => next => action => {
  // 如果“action”实际是函数...
  if (typeof action === 'function') {
    // 调用它，传入 `dispatch` 和 `getState`
    // 同时返回 thunk 函数的返回值
    return action(storeAPI.dispatch, storeAPI.getState)
  }

  // 否则，正常 action，转发即可
  return next(action)
}
```

这意味着**我们可以写返回 Promise 的 thunk 函数，并在组件里等待它们的完成**。

我们已有 `<Header>` 组件 dispatch 保存新 todo 的 thunk。让我们给 `<Header>` 增加加载状态，当等待服务响应时禁用文本输入框，显示加载动画：

```js title="src/features/header/Header.js"
const Header = () => {
  const [text, setText] = useState('')
  // highlight-next-line
  const [status, setStatus] = useState('idle')
  const dispatch = useDispatch()

  const handleChange = e => setText(e.target.value)

  // highlight-start
  const handleKeyDown = async e => {
    // 用户按回车
    const trimmedText = text.trim()
    if (e.which === 13 && trimmedText) {
      // 创建并 dispatch thunk 函数
      setStatus('loading')
      // 等待 saveNewTodo 返回的 Promise 完成
      await dispatch(saveNewTodo(trimmedText))
      // 清空文本输入
      setText('')
      setStatus('idle')
    }
  }

  let isLoading = status === 'loading'
  let placeholder = isLoading ? '' : 'What needs to be done?'
  let loader = isLoading ? <div className="loader" /> : null
  // highlight-end

  return (
    <header className="header">
      <input
        className="new-todo"
        placeholder={placeholder}
        autoFocus={true}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        // highlight-next-line
        disabled={isLoading}
      />
      // highlight-next-line
      {loader}
    </header>
  )
}

export default Header
```

现在添加 todo 会看到头部有加载动画：

![待办应用 - 组件加载动画](/img/tutorials/fundamentals/todos-app-headerLoading.png)

## 你学到了什么

如你所见，Redux 中有诸多广泛使用的额外模式。这些模式并非必须，且一开始可能需要多写些代码，但带来的好处包括：提升逻辑复用性，封装实现细节，提升应用性能，方便数据查找。

:::info

关于为何存在这些模式以及 Redux 应该如何使用的更多信息，请参见：

- [Idiomatic Redux: The Tao of Redux, Part 1 - Implementation and Intent](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)
- [Idiomatic Redux: The Tao of Redux, Part 2 - Practice and Philosophy](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/)

:::

下面是我们应用在完全转换为这些模式后效果：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-8-normalizedState/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

:::tip 总结

- **Action 创建函数封装了准备 action 对象和 thunk 的过程**
  - Action 创建函数可接受参数，做准备逻辑，返回最终 action 对象或 thunk 函数
- **记忆化选择器有助于提升 Redux 应用性能**
  - Reselect 提供 `createSelector` API 生成记忆化选择器
  - 记忆化选择器在输入不变时返回相同结果引用
- **请求状态应用枚举存储，而非布尔值**
  - 使用像 `'idle'` 和 `'loading'` 的枚举，有助于一致跟踪状态
- **“Flux 标准 Action”是常见的 action 对象字段组织模式**
  - Action 用 `payload` 存数据，`meta` 存额外描述，`error` 存错误
- **归一化状态便于按 ID 查找项目**
  - 归一化数据以对象形式存储，ID 为键
- **Thunk 可以从 `dispatch` 返回 Promise**
  - 组件可以等待异步 thunk 完成，再执行后续操作

:::

## 下一步？

手写这些代码既耗时又容易出错。**这就是为什么推荐你使用官方的 [Redux Toolkit](https://redux-toolkit.js.org) 包来编写 Redux 逻辑**。

Redux Toolkit 提供的 API 能帮你**用更少代码写出典型 Redux 逻辑**，也有助于**避免状态被误修改等常见错误**。

在[第八部分：现代 Redux](./part-8-modern-redux.md)中，我们将介绍如何用 Redux Toolkit 简化之前写的所有代码。
