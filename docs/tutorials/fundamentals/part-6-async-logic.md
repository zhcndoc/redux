---
id: part-6-async-logic
title: 'Redux 基础，第 6 部分：异步逻辑与数据获取'
sidebar_label: '异步逻辑与数据获取'
description: '官方 Redux 基础教程：学习如何结合 Redux 使用异步逻辑'
---

<!-- prettier-ignore -->
import FundamentalsWarning from "../../components/_FundamentalsWarning.mdx";

:::tip 你将学到

- Redux 数据流如何处理异步数据
- 如何使用 Redux 中间件实现异步逻辑
- 异步请求状态处理的模式

:::

:::info 先决条件

- 熟悉使用 HTTP 请求从服务器获取和更新数据
- 理解 JavaScript 中的异步逻辑，包括 Promise

:::

## 引言

在[第 5 部分：UI 与 React](./part-5-ui-and-react.md)中，我们学习了如何使用 React-Redux 库让 React 组件与 Redux store 交互，包括调用 `useSelector` 读取 Redux 状态，调用 `useDispatch` 获取 `dispatch` 函数，以及用 `<Provider>` 组件包裹应用，为这些钩子提供 store 访问。

到目前为止，我们处理的所有数据都是直接存储在 React+Redux 客户端应用内部。然而，大多数真实应用需要通过 HTTP API 调用从服务器获取和保存数据。

本节中，我们将更新我们的待办应用，以从 API 获取待办事项，并通过保存到 API 添加新待办事项。

<FundamentalsWarning />

:::tip

Redux Toolkit 包含了 [**RTK Query 数据获取与缓存 API**](https://redux-toolkit.js.org/rtk-query/overview)。RTK Query 是专为 Redux 应用设计的数据获取和缓存方案，**能免去编写 _任何_ thunk 或 reducer 来管理数据获取的需求**。我们会在后续教程中作为默认数据获取方式介绍 RTK Query，而 RTK Query 本身建立在本页所展示的模式之上。

在 [Redux 精要，第 7 部分：RTK Query 基础](../essentials/part-7-rtk-query-basics.md) 中学习如何使用 RTK Query 进行数据获取。

:::

### 示例 REST API 与客户端

为保持示例项目的独立性但又具备现实感，初始项目配置了一个基于内存的假 REST API（通过 [Mirage.js 模拟 API 工具](https://miragejs.com/) 配置）。API 使用 `/fakeApi` 作为端点基础 URL，支持 `/fakeApi/todos` 的常见 HTTP 方法 `GET/POST/PUT/DELETE`。其定义在 `src/api/server.js`。

项目还包含一个小型 HTTP API 客户端对象，暴露了类似于流行 HTTP 库（如 `axios`）的 `client.get()` 和 `client.post()` 方法，定义在 `src/api/client.js`。

本节中，我们将使用 `client` 对象对内存中的假 REST API 发起 HTTP 调用。

## Redux 中间件与副作用

Redux store 本身并不知晓异步逻辑。它仅能同步派发动作，调用根 reducer 更新状态，并通知 UI 有所改变。任何异步操作都必须发生在 store 外部。

我们之前提到 Redux reducer 绝不能包含“副作用”。**“副作用”指任何函数返回值之外，对状态或行为的外部可见更改**。常见副作用包括：

- 在控制台打印日志
- 保存文件
- 设置异步定时器
- 发起 HTTP 请求
- 修改函数外部的状态，或变异函数参数
- 生成随机数或唯一随机 ID（如 `Math.random()` 或 `Date.now()`）

然而，任何真实应用都必须在某处进行上述操作。那么，若副作用不能放在 reducer 内，我们又该放在哪里？

**Redux 中间件的设计目的就是让我们能写入含副作用的逻辑**。

如我们[第 4 部分](./part-4-store.md#middleware-use-cases) 所述，Redux 中间件能在看到被派发的动作时做_任何_事情：打印日志、修改动作、延迟动作、发起异步调用，等等。而且，由于中间件在真正的 `store.dispatch` 函数周围形成管道，这也意味着我们可以传入非普通动作对象，只要有中间件拦截它并阻止其传入 reducer 即可。

中间件也能访问 `dispatch` 和 `getState`，这意味着你可以在中间件中编写异步逻辑，还能通过派发动作与 Redux store 交互。

### 使用中间件实现异步逻辑

让我们看几个示例，展示中间件如何使我们编写的异步逻辑与 Redux store 交互。

一种方式是写一个中间件，专门寻找特定的动作类型，并在看到这些动作时运行异步逻辑，如下例：

```js
import { client } from '../api/client'

const delayedActionMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/todoAdded') {
    setTimeout(() => {
      // 延迟派发此动作一秒
      next(action)
    }, 1000)
    return
  }

  return next(action)
}

const fetchTodosMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/fetchTodos') {
    // 发起 API 调用从服务器获取 todos
    client.get('todos').then(todos => {
      // 派发一个包含获取到 todos 的动作
      storeAPI.dispatch({ type: 'todos/todosLoaded', payload: todos })
    })
  }

  return next(action)
}
```

:::info

想了解 Redux 为什么使用中间件处理异步逻辑以及具体用法，可参考 Redux 创建者 Dan Abramov 在 StackOverflow 的回答：

- ["如何用超时派发 Redux 动作？"](https://stackoverflow.com/questions/35411423/how-to-dispatch-a-redux-action-with-a-timeout/35415559#35415559)
- ["为何异步流程需要中间件？"](https://stackoverflow.com/questions/34570758/why-do-we-need-middleware-for-async-flow-in-redux/34599594#34599594)

:::

### 编写异步函数中间件

上面两个中间件都很专一，只完成一件事。如果我们能提前写好_任意_异步逻辑，且与中间件本身分离，又能访问 `dispatch` 和 `getState` 来与 store 交互，那该多好。

**我们是否能写一个中间件，允许传递_函数_给 `dispatch` 而非普通动作对象？**中间件检查传入参数是函数时就直接调用该函数。这样，我们就可以在中间件定义外部写函数，实现异步逻辑。

该中间件大致实现如下：

```js title="异步函数中间件示例"
const asyncFunctionMiddleware = storeAPI => next => action => {
  // 如果“动作”其实是函数...
  if (typeof action === 'function') {
    // 调用它并传入 dispatch 和 getState
    return action(storeAPI.dispatch, storeAPI.getState)
  }

  // 否则，正常派发动作
  return next(action)
}
```

这样我们使用该中间件的示例：

```js
const middlewareEnhancer = applyMiddleware(asyncFunctionMiddleware)
const store = createStore(rootReducer, middlewareEnhancer)

// 写一个接收 dispatch 和 getState 的函数
const fetchSomeData = (dispatch, getState) => {
  // 发起异步 HTTP 请求
  client.get('todos').then(todos => {
    // 派发一个包含获取到 todos 的动作
    dispatch({ type: 'todos/todosLoaded', payload: todos })
    // 派发后读取更新后的 store 状态
    const allTodos = getState().todos
    console.log('加载后的 todos 数量: ', allTodos.length)
  })
}

// 将写好的_函数_传给 dispatch
store.dispatch(fetchSomeData)
// 控制台输出: '加载后的 todos 数量: ###'
```

注意，这个“异步函数中间件”允许我们向 `dispatch` 传函数！函数内部写异步 HTTP 请求，完成后再派发普通动作对象。

## Redux 异步数据流

那么中间件和异步逻辑如何影响 Redux 应用整体数据流？

和普通动作一样，先响应用户交互事件（如按钮点击），再调用 `dispatch()`，传入某个值，这个值可以是普通动作对象、函数，或者其他中间件能识别的值。

派发的值传到中间件时，中间件做异步调用，待调用完成后，再派发真实动作对象。

之前我们看到[表示常规同步 Redux 数据流的图示](./part-2-concepts-data-flow.md#redux-application-data-flow)，加入异步逻辑后，数据流增加了中间件执行异步操作然后派发动作这一步，异步数据流流程如下：

![Redux 异步数据流示意图](/img/tutorials/essentials/ReduxAsyncDataFlowDiagram.gif)

## 使用 Redux Thunk 中间件

实际中，Redux 已提供官方异步函数中间件，称为[**Redux "Thunk" 中间件**](https://github.com/reduxjs/redux-thunk)。Thunk 中间件允许编写接收 `dispatch` 和 `getState` 参数的函数，内部可写任意异步逻辑，根据需要派发动作并读取 store 状态。

**将异步逻辑写成 thunk 函数，能复用逻辑而无需提前知道使用哪一 Redux store。**

:::info

“thunk”是编程术语，意思是[“执行延迟工作的代码片段”](https://en.wikipedia.org/wiki/Thunk)。想了解更多 thunk 用法，可参考：

- [Using Redux: Writing Logic with Thunks](../../usage/writing-logic-thunks.mdx)

以及相关文章：

- [Thunk 是什么？](https://daveceddia.com/what-is-a-thunk/)
- [Redux 中的 Thunks：基础](https://medium.com/fullstack-academy/thunks-in-redux-the-basics-85e538a3fe60)

:::

### 配置 Store

Redux thunk 中间件的包名为 `redux-thunk`，需要先安装：

```bash
npm install redux-thunk
```

安装后我们把中间件添加到待办应用的 Redux store 配置：

```js title="src/store.js"
import { createStore, applyMiddleware } from 'redux'
// highlight-next-line
import { thunk } from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducer'

// highlight-next-line
const composedEnhancer = composeWithDevTools(applyMiddleware(thunk))

// store 现在支持在 `dispatch` 中传入 thunk 函数
const store = createStore(rootReducer, composedEnhancer)
export default store
```

### 从服务器获取 Todos

当前我们的待办事项只存在于客户端浏览器。需要实现应用启动时，从服务器加载待办列表。

先写一个 thunk 函数，向 `/fakeApi/todos` 端点发起 HTTP 请求，获取待办事项数组，然后派发一个包含数组作为载荷的动作。由于功能属于 todos，写在 `todosSlice.js`：

```js title="src/features/todos/todosSlice.js"
import { client } from '../../api/client'

const initialState = []

export default function todosReducer(state = initialState, action) {
  // 省略 reducer 逻辑
}

// Thunk 函数
// highlight-start
export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')
  dispatch({ type: 'todos/todosLoaded', payload: response.todos })
}
// highlight-end
```

该 API 调用只需在应用首次加载时执行一次，执行时机可放在：

- `<App>` 组件中的 `useEffect` 钩子
- `<TodoList>` 组件中的 `useEffect` 钩子
- 或直接在 `index.js` 文件导入 Store 后调用

这里演示放在 `index.js` 中：

```js title="src/index.js"
import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'

import './api/server'

// highlight-start
import store from './store'
import { fetchTodos } from './features/todos/todosSlice'

store.dispatch(fetchTodos)
// highlight-end

const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
```

页面刷新后 UI 看似无变化，但打开 Redux DevTools 扩展，应该会看到 `'todos/todosLoaded'` 动作被派发，其载荷含有假服务器生成的待办对象：

![Devtools - todosLoaded 动作内容](/img/tutorials/fundamentals/devtools-todosLoaded-action.png)

注意，虽然动作被派发，状态尚未发生改变。**需要在 todos reducer 中处理该动作，以更新状态。**

为 reducer 添加处理分支，将服务器数据加载进 store。因数据来自服务器，替换任何旧有 todos，故直接返回 `action.payload` 数组作为新状态：

```js title="src/features/todos/todosSlice.js"
import { client } from '../../api/client'

const initialState = []

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    // 省略其他 case
    // highlight-start
    case 'todos/todosLoaded': {
      // 直接用载荷替换当前状态
      return action.payload
    }
    // highlight-end
    default:
      return state
  }
}

export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')
  dispatch({ type: 'todos/todosLoaded', payload: response.todos })
}
```

派发动作会立即更新 store 状态，故 thunk 内也可调用 `getState` 读取派发后的最新状态。比如，在派发动作前后打印 todos 数量：

```js
export async function fetchTodos(dispatch, getState) {
  const response = await client.get('/fakeApi/todos')

  // highlight-next-line
  const stateBefore = getState()
  console.log('派发前 todos 数量: ', stateBefore.todos.length)

  dispatch({ type: 'todos/todosLoaded', payload: response.todos })

  // highlight-next-line
  const stateAfter = getState()
  console.log('派发后 todos 数量: ', stateAfter.todos.length)
}
```

### 保存 Todo 项目

创建新待办时，我们也要同步更新服务器。与其直接立即派发 `'todos/todoAdded'` 动作，不如调用 API 把新待办数据发给服务器，服务器返回新保存的待办项，再派发动作。

但若试图直接写 thunk 来实现此逻辑，就会遇到问题：我们在 `todosSlice.js` 文件中写 thunk，那个调用 API 的代码不知新待办的文本内容是什么：

```js title="src/features/todos/todosSlice.js"
async function saveNewTodo(dispatch, getState) {
  // ❌ 需要新待办文本，但 text 从哪来？
  // highlight-next-line
  const initialTodo = { text }
  const response = await client.post('/fakeApi/todos', { todo: initialTodo })
  dispatch({ type: 'todos/todoAdded', payload: response.todo })
}
```

必须写一个接收 `text` 参数的函数，再返回实际 thunk 函数，这样 thunk 内才能用 `text` 生成 API 请求。外层函数返回 thunk 函数，供组件里传给 `dispatch`：

```js title="src/features/todos/todosSlice.js"
// 写一个同步的外层函数，接收 `text` 参数：
export function saveNewTodo(text) {
  // 创建并返回异步 thunk 函数：
  return async function saveNewTodoThunk(dispatch, getState) {
    // ✅ 现在可以使用 text，发送给服务器
    const initialTodo = { text }
    const response = await client.post('/fakeApi/todos', { todo: initialTodo })
    dispatch({ type: 'todos/todoAdded', payload: response.todo })
  }
}
```

然后在 `<Header>` 组件中使用：

```js title="src/features/header/Header.js"
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'

// highlight-next-line
import { saveNewTodo } from '../todos/todosSlice'

const Header = () => {
  const [text, setText] = useState('')
  const dispatch = useDispatch()

  const handleChange = e => setText(e.target.value)

  const handleKeyDown = e => {
    // 用户按下回车键
    const trimmedText = text.trim()
    if (e.which === 13 && trimmedText) {
      // highlight-start
      // 用用户输入文本创建 thunk 函数
      const saveNewTodoThunk = saveNewTodo(trimmedText)
      // 派发 thunk 函数
      dispatch(saveNewTodoThunk)
      // highlight-end
      setText('')
    }
  }

  // 省略渲染逻辑
}
```

由于我们知道组件中会立刻把 thunk 函数传给 `dispatch`，可省略临时变量，直接将返回的 thunk 函数传给 `dispatch`：

```js title="src/features/header/Header.js"
const handleKeyDown = e => {
  // 用户按下回车
  const trimmedText = text.trim()
  if (e.which === 13 && trimmedText) {
    // highlight-start
    // 创建 thunk 并立即派发
    dispatch(saveNewTodo(trimmedText))
    // highlight-end
    setText('')
  }
}
```

组件实际并不“知道”派发的是 thunk 函数——`saveNewTodo` 封装了全部细节。`<Header>` 只需知道用户按回车时，派发_某个值_。

这种编写函数来准备可传入 `dispatch` 的值的模式，称为**“动作创建者（action creator）”模式**，我们将在[下一节](./part-7-standard-patterns.md)详细讲解。

我们现在能看到新的 `'todos/todoAdded'` 异步动作被派发：

![Devtools - async todoAdded 动作内容](/img/tutorials/fundamentals/devtools-async-todoAdded-action.png)

最后需要调整 reducer。POST 请求 `/fakeApi/todos` 服务器返回新 todo（含新 ID），因此 reducer 无需计算 ID 或填充字段，只需返回新状态数组，包含新 todo：

```js title="src/features/todos/todosSlice.js"
const initialState = []

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    // highlight-start
    case 'todos/todoAdded': {
      // 返回一个新数组，包含所有旧项和新待办
      return [...state, action.payload]
    }
    // highlight-end
    // 省略其他 case
    default:
      return state
  }
}
```

现在添加新待办能正常工作：

![Devtools - async todoAdded 状态差异](/img/tutorials/fundamentals/devtools-async-todoAdded-diff.png)

:::tip

Thunk 函数不仅能写异步逻辑，也能写同步逻辑。Thunk 提供了访问 `dispatch` 和 `getState` 的方法来编写任何可复用的逻辑。

:::

## 你学到了什么

我们已经成功更新了待办应用，通过“thunk”函数实现了向假服务器 API 发送 HTTP 请求，获取待办列表和保存新待办。

过程展示了使用 Redux 中间件实现异步调用，异步调用完成后再派发动作，与 Store 互动。

当前应用界面如下：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-6-asyncThunks/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

:::tip 总结

- **Redux 中间件的设计目的就是允许编写带副作用的逻辑**
  - “副作用”是指作用于函数渲染之外的状态或行为，如 HTTP 请求，修改函数参数，生成随机数等
- **中间件为标准 Redux 数据流增加了额外步骤**
  - 中间件可以拦截传给 `dispatch` 的任意值
  - 中间件能访问 `dispatch` 和 `getState`，可在异步逻辑中进一步派发动作
- **Redux "Thunk" 中间件让我们向 dispatch 传递函数**
  - Thunk 函数允许提前写好异步逻辑，且不依赖具体 Redux store
  - Thunk 函数会接收 `dispatch` 和 `getState`，能派发动作，比如使用 API 响应数据

:::

## 接下来做什么？

至此，我们已覆盖如何使用 Redux 的所有核心部分！你学到了：

- 如何编写 reducer 基于派发动作更新状态
- 如何创建并配置带有 reducer、增强器和中间件的 Redux store
- 如何利用中间件编写异步逻辑派发动作

在[第 7 部分：标准 Redux 模式](./part-7-standard-patterns.md)中，我们将探讨实战中典型的几种代码模式，使代码更一致，应用更易扩展。