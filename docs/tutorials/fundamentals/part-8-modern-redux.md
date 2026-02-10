---
id: part-8-modern-redux
title: 'Redux 基础，第8部分：使用 Redux Toolkit 的现代 Redux'
sidebar_label: '使用 Redux Toolkit 的现代 Redux'
description: 'Redux 官方基础教程：学习书写 Redux 逻辑的现代方式'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

:::tip 你将学到的内容

- 如何使用 Redux Toolkit 简化 Redux 逻辑
- 学习和使用 Redux 的后续步骤

:::

恭喜你，已经来到本教程的最后一章！在结束之前，我们还有一个主题要讲。

如果你想回顾一下到目前为止我们所学的内容，可以看看这个总结：

:::info

<DetailedExplanation title="回顾：你学到了什么">

- [第1部分：概览](./part-1-overview.md)：
  - 什么是 Redux，何时/为何使用它，以及 Redux 应用的基本组成部分
- [第2部分：概念和数据流](./part-2-concepts-data-flow.md)：
  - Redux 如何采用“一路单向数据流”模式
- [第3部分：状态、动作和 reducers](./part-3-state-actions-reducers.md)：
  - Redux 状态由普通的 JS 数据构成
  - 动作是描述应用中“发生了什么”事件的对象
  - Reducers 接收当前状态和动作，计算出新的状态
  - Reducers 必须遵守“不变更新”和“无副作用”的规则
- [第4部分：Store](./part-4-store.md)：
  - `createStore` API 创建带有根 reducer 函数的 Redux 存储
  - 可以使用“增强器”和“中间件”自定义 Store
  - Redux DevTools 扩展让你可以查看状态随时间的变化
- [第5部分：UI 和 React](./part-5-ui-and-react.md)：
  - Redux 与 UI 分离，但经常与 React 一起使用
  - React-Redux 提供 API 让 React 组件可以与 Redux Store 通信
  - `useSelector` 读取 Redux 状态中的值并订阅更新
  - `useDispatch` 允许组件派发动作
  - `<Provider>` 包裹你的应用，使组件可以访问 Store
- [第6部分：异步逻辑和数据获取](./part-6-async-logic.md)：
  - Redux 中间件允许编写带有副作用的逻辑
  - 中间件在 Redux 数据流中增加一步，支持异步逻辑
  - Redux “thunk” 函数是书写基础异步逻辑的标准方式
- [第7部分：标准 Redux 模式](./part-7-standard-patterns.md)：
  - 动作创建函数封装动作对象和 thunk 的准备工作
  - 记忆化选择器优化计算转换后的数据
  - 请求状态应通过加载状态枚举值进行跟踪
  - 归一化状态便于按 ID 查找项目

</DetailedExplanation>

:::

正如你所见，Redux 的许多方面都涉及编写一些可能比较冗长的代码，例如不变更新、动作类型和动作创建函数、以及归一化状态等。这些模式存在着合理的原因，但“手写”那些代码可能很困难。此外，搭建 Redux store 的过程需要多个步骤，我们还需要为诸如在 thunk 中派发“加载”动作或处理归一化数据等逻辑自行设计流程。最后，很多时候用户也不确定该如何写出“正确的” Redux 逻辑。

这就是 Redux 团队创建 [**Redux Toolkit**：官方的、有自己观点的、“内置电池”工具包，用于高效开发 Redux 应用](https://redux-toolkit.js.org) 的原因。

Redux Toolkit 包含我们认为构建 Redux 应用不可或缺的包和函数。Redux Toolkit 内置了我们推荐的最佳实践，简化了大多数 Redux 任务，防止常见错误，并让编写 Redux 应用更容易。

因此，**Redux Toolkit 是编写 Redux 应用逻辑的标准方式**。你到目前为止在本教程中手写的 Redux 逻辑都是可运行的代码，但**你不应该手写 Redux 逻辑**——我们在本教程中介绍这些方法，是为了让你理解 Redux 的工作原理。然而，**对于真实的应用，你应该使用 Redux Toolkit 来编写 Redux 逻辑。**

当你使用 Redux Toolkit 时，到目前为止我们讲解的所有概念（动作、reducers、store 设置、动作创建者、thunks 等）依然存在，但**Redux Toolkit 提供更简单的方式来书写这些代码**。

:::tip

Redux Toolkit _仅_覆盖 Redux 逻辑——我们仍然使用 React-Redux 让 React 组件与 Redux store 通信，包括 `useSelector` 和 `useDispatch`。

:::

那么，让我们看看如何用 Redux Toolkit 来简化我们示例待办应用中已经写好的代码。我们主要会重写“slice”文件，但应当能保持所有 UI 代码不变。

在继续之前，**为你的应用添加 Redux Toolkit 包**：

```bash
npm install @reduxjs/toolkit
```

## Store 设置

我们经过了几轮的 Redux store 设置逻辑，目前代码如下：

```js title="src/rootReducer.js"
import { combineReducers } from 'redux'

import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

const rootReducer = combineReducers({
  // 定义顶级状态字段 `todos`，由 `todosReducer` 处理
  todos: todosReducer,
  filters: filtersReducer
})

export default rootReducer
```

```js title="src/store.js"
import { createStore, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducer'

const composedEnhancer = composeWithDevTools(applyMiddleware(thunk))

const store = createStore(rootReducer, composedEnhancer)
export default store
```

注意，搭建流程包含多个步骤。我们需要：

- 将各个 slice 的 reducers 组合成根 reducer
- 在 store 文件中引入根 reducer
- 引入 thunk 中间件、`applyMiddleware` 和 `composeWithDevTools` API
- 用中间件和 devtools 创建 store 增强器
- 用根 reducer 创建 store

如果能减少这些步骤就好了。

### 使用 `configureStore`

**Redux Toolkit 提供了 `configureStore` API 来简化 store 设置过程**。`configureStore` 是对 Redux 核心 `createStore` API 的封装，自动帮我们完成大部分 store 设置。实际上，我们可以把它简化成一步：

```js title="src/store.js"
// highlight-next-line
import { configureStore } from '@reduxjs/toolkit'

import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

// highlight-start
const store = configureStore({
  reducer: {
    // 定义顶级状态字段 `todos`，由 `todosReducer` 处理
    todos: todosReducer,
    filters: filtersReducer
  }
})
// highlight-end

export default store
```

这句 `configureStore` 调用帮我们完成了所有工作：

- 它将 `todosReducer` 和 `filtersReducer` 合并成根 reducer 函数，根状态形态是 `{todos, filters}`
- 它用该根 reducer 创建 Redux store
- 自动添加了 `thunk` 中间件
- 自动添加了额外的中间件来检测诸如意外改变状态的错误
- 自动设置了 Redux DevTools 扩展连接

我们可以打开示例待办应用确认它能正常运行。我们的所有功能代码都继续正常工作！我们派发动作，派发了 thunk，UI 中读取了状态，在 DevTools 中看到了动作历史，所有这些都在正常工作。我们只是换掉了 store 设置代码而已。

我们来看看如果不小心在 reducer 中改变了状态会怎样。如果把 “todos 正在加载” 的 reducer 修改成直接改变状态字段，而不是不变地拷贝：

```js title="src/features/todos/todosSlice"
export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    // 省略其他 case
    case 'todos/todosLoading': {
      // ❌ 警告：此处为示例 - 正常 reducer 不应这样写！
      state.status = 'loading'
      return state
    }
    default:
      return state
  }
}
```

哎呀，我们的整个应用崩溃了！发生了什么？

![不可变性检查中间件错误](/img/tutorials/fundamentals/immutable-error.png)

**这个错误信息是 _好事_ —— 我们捕获到代码中的错误了！**`configureStore` 特别添加了一个额外的中间件，在开发环境中如果检测到状态被意外修改就立即抛出错误。这有助于我们在写代码时捕捉错误。

### 包清理

Redux Toolkit 已经包含了我们之前用到的几个包，如 `redux`，`redux-thunk` 和 `reselect`，并重新导出了它们的 API。因此，我们可以简化项目依赖。

首先，将 `createSelector` 的导入改为从 `'@reduxjs/toolkit'` 而非 `'reselect'`。然后，可以删除 `package.json` 中单独列出的这些包：

```bash
npm uninstall redux redux-thunk reselect
```

需要说明的是，**我们依然在用这些包，也需要它们被安装**。不过，由于 Redux Toolkit 依赖这些包，当你安装 `@reduxjs/toolkit` 时它们会自动安装，因此不必在 `package.json` 中单独声明。

## 编写 Slice

随着功能增加，slice 文件变得更大更复杂。特别是 `todosReducer`，因大量内嵌对象展开写不变更新，代码难以阅读，同时有多组动作创建函数。

**Redux Toolkit 提供了 `createSlice` API，帮我们简化 Redux reducer 逻辑和动作的编写**。`createSlice` 帮助我们：

- 可以把 case reducers 写成对象里的函数，无需写 `switch/case` 语句
- reducer 中可以写更简洁的不变更新代码
- 根据我们写的 reducers，自动生成所有动作创建函数

### 使用 `createSlice`

`createSlice` 接收一个包含三个主要字段的对象：

- `name`：字符串，作为生成动作类型的前缀
- `initialState`：reducer 的初始状态
- `reducers`：对象，键为动作名，值为对应的 case reducer 函数

先看看一个小的独立例子。

```js title="createSlice  example"
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  entities: [],
  status: null
}

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action) {
      // ✅ 在 createSlice 内部写这样“可变”代码是允许的！
      state.entities.push(action.payload)
    },
    todoToggled(state, action) {
      const todo = state.entities.find(todo => todo.id === action.payload)
      todo.completed = !todo.completed
    },
    todosLoading(state, action) {
      return {
        ...state,
        status: 'loading'
      }
    }
  }
})

export const { todoAdded, todoToggled, todosLoading } = todosSlice.actions

export default todosSlice.reducer
```

这个例子中有几个要点：

- 我们把 case reducer 函数放在了 `reducers` 对象里，取了可读名称
- **`createSlice` 自动生成了相应的动作创建函数**
- `createSlice` 会自动在默认情况下返回原状态
- **在 `createSlice` 里，可以安全地写“修改”状态的代码！**
- 但如果想，也可以像之前一样返回不变复制

生成的动作创建函数在 `slice.actions.todoAdded` 等字段中，通常我们解构导出它们，就像之前写的动作创建函数一样。完整 reducer 函数在 `slice.reducer`，一般选择默认导出。

这些自动生成的动作对象长这样？试着调用一个动作创建函数并打印：

```js
console.log(todoToggled(42))
// {type: 'todos/todoToggled', payload: 42}
```

`createSlice` 组合了 slice 的 `name` 字段和 reducer 函数名生成动作类型字符串。默认动作创建函数接受一个参数，赋给动作对象的 `payload`。

内部生成的 reducer 函数会检查触发的动作 `action.type` 是否与生成的类型匹配。如果匹配，调用对应 case reducer。模式跟之前我们写的 `switch/case` 一样，但 `createSlice` 自动帮我们写了。

值得深入说说 “修改” 这一点。

### 使用 Immer 实现不变更新

前面讲过 “修改”（直接改动对象/数组）和“不变性”（数据不可修改）的概念。

:::warning

在 Redux 里，**reducers _绝不能_ 直接修改传进来的原始状态值！**

```js
// ❌ 非法 - 默认情况下这会直接改写状态！
state.value = 123
```

:::

那如果不能改原对象，怎么返回更新后的状态？

:::tip

**reducers 只能创建原状态的拷贝，再对拷贝做“修改”。**

```js
// 这很安全，因为我们创建了拷贝
return {
  ...state,
  value: 123
}
```

:::

如你所见，我们可以用 JS 的扩展运算符和返回副本的函数手写不变更新。但写这样的代码很难，而且不小心直接修改状态是 Redux 最常见的错误。

**这就是 Redux Toolkit 的 `createSlice` 可以让你更轻松写不变更新的原因！**

`createSlice` 内部使用了 [Immer](https://immerjs.github.io/immer/) 库。Immer 利用 JS 的 `Proxy` 包装数据，让你写看似“直接修改”的代码。这些“修改”实际上会被 Immer 跟踪，最后生成一个安全的不变更新结果，好像你手动写了不变逻辑一样。

比如，代替这个复杂展开写法：

```js
function handwrittenReducer(state, action) {
  return {
    ...state,
    first: {
      ...state.first,
      second: {
        ...state.first.second,
        [action.someId]: {
          ...state.first.second[action.someId],
          fourth: action.someValue
        }
      }
    }
  }
}
```

你可以写成这样：

```js
function reducerWithImmer(state, action) {
  state.first.second[action.someId].fourth = action.someValue
}
```

更易读！

但这里有个 _非常_ 重要的注意点：

:::warning

**只有在 Redux Toolkit 的 `createSlice` 和 `createReducer` 中，才可以写“修改”逻辑！因为它们用的是 Immer！如果你在普通 reducer 中写了直接修改代码，就会出错！**

:::

Immer 仍然允许我们手写不变更新并返回新值，也可以混用。例如，过滤数组时，用 `array.filter()` 更简单，可以调用该方法然后赋值给状态：

```js
// 在 Immer 中可以混用“修改”和“不变”代码：
state.todos = state.todos.filter(todo => todo.id !== action.payload)
```

### 转换 Todos Reducer

先从 todos slice 文件开始使用 `createSlice` 重写。先挑几个 switch 语句中的具体 case 示范转换过程。

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  status: 'idle',
  entities: {}
}

// highlight-start
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action) {
      const todo = action.payload
      state.entities[todo.id] = todo
    },
    todoToggled(state, action) {
      const todoId = action.payload
      const todo = state.entities[todoId]
      todo.completed = !todo.completed
    }
  }
})

export const { todoAdded, todoToggled } = todosSlice.actions

export default todosSlice.reducer
// highlight-end
```

由于示例应用的 todos reducer 仍使用嵌套归一化状态，代码和之前的小例略有不同。你还记得我们之前写的切换 todo 任务时用了好多层展开操作吗？现在同样的逻辑短且清晰多了。

我们来添加更多 case。

```js title="src/features/todos/todosSlice.js"
const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoAdded(state, action) {
      const todo = action.payload
      state.entities[todo.id] = todo
    },
    todoToggled(state, action) {
      const todoId = action.payload
      const todo = state.entities[todoId]
      todo.completed = !todo.completed
    },
    // highlight-start
    todoColorSelected: {
      reducer(state, action) {
        const { color, todoId } = action.payload
        state.entities[todoId].color = color
      },
      prepare(todoId, color) {
        return {
          payload: { todoId, color }
        }
      }
    },
    todoDeleted(state, action) {
      delete state.entities[action.payload]
    }
    // highlight-end
  }
})

export const { todoAdded, todoToggled, todoColorSelected, todoDeleted } =
  todosSlice.actions

export default todosSlice.reducer
```

`todoAdded` 和 `todoToggled` 的动作创建函数只需一个参数，比如整个 todo 对象或 todo 的 ID。但若需要多个参数，或需要提前处理（如生成唯一 ID），怎么办？

`createSlice` 允许通过添加 “prepare 回调” 来支持。你可以传入一个带有 `reducer` 和 `prepare` 函数的对象。调用生成的动作创建函数时，会先调用 `prepare`，它接收参数并返回对象，包含符合 Flux Standard Action 规范的 `payload` 字段（也可包含 `meta` 和 `error` 字段）。

这里的例子，prepare 回调让 `todoColorSelected` 动作接受单独的 `todoId` 和 `color` 参数，并组装成对象赋给 `action.payload`。

在 `todoDeleted` reducer 中，我们使用了 JS 的 `delete` 操作符，移除归一化状态中的项。

我们可以用相同模式重写 todosSlice.js 和 filtersSlice.js 里剩余的 reducers。

整合后的完整代码如下：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-9-createSlice/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&module=%2Fsrc%2Ffeatures%2Ftodos%2FtodosSlice.js&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

## 编写 Thunks

我们之前看过如何[写 thunk 来派发 “加载中”、“请求成功” 和 “请求失败” 动作](./part-7-standard-patterns.md#loading-state-enum-values)，要写动作创建函数、动作类型和 reducers。

由于这个模式极为常见，**Redux Toolkit 提供了 `createAsyncThunk` API 自动帮我们生成这些 thunk**。它还生成各种状态的动作类型和动作创建函数，并根据 Promise 结果自动派发。

:::tip

Redux Toolkit 还有一个新[**RTK Query 数据获取 API**](https://redux-toolkit.js.org/rtk-query/overview)。RTK Query 是专门为 Redux 应用打造的数据获取和缓存方案，**它可以完全省去你写任何 thunk 和 reducer 来管理数据获取的需求**。推荐你试试，看看是否能简化你自己的数据获取代码！

我们会在今后的 Redux 教程中增加 RTK Query 内容。之前可以查看[Redux Toolkit 官方文档中的 RTK Query 部分](https://redux-toolkit.js.org/rtk-query/overview)。

:::

### 使用 `createAsyncThunk`

我们来用 `createAsyncThunk` 替换之前的 `fetchTodos` thunk。

`createAsyncThunk` 接收两个参数：

- 用作生成动作类型前缀的字符串
- 返回 Promise 的“payload 创建函数”，通常用 `async/await` 写，因为 async 函数自动返回 Promise

```js title="src/features/todos/todosSlice.js"
// highlight-next-line
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// 省略导入和状态定义

// highlight-start
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})
// highlight-end

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // 省略 reducer
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        const newEntities = {}
        action.payload.forEach(todo => {
          newEntities[todo.id] = todo
        })
        state.entities = newEntities
        state.status = 'idle'
      })
  }
})

// 省略导出
```

我们传入 `'todos/fetchTodos'` 字符串和一个调用 API 返回 Promise 的 payload 创建函数。`createAsyncThunk` 会生成三个动作创建函数和动作类型，还有 thunk 函数自动派发动作。具体是：

- `fetchTodos.pending`：动作类型 `todos/fetchTodos/pending`
- `fetchTodos.fulfilled`：动作类型 `todos/fetchTodos/fulfilled`
- `fetchTodos.rejected`：动作类型 `todos/fetchTodos/rejected`

不过这些动作创建函数和类型定义在 `createSlice` 外。我们不能在 `reducers` 里处理，因为 `reducers` 用来生成新的动作类型。我们需要一种方式让 slice 监听 _别处定义的_ 动作类型。

**`createSlice` 允许传入 `extraReducers` 选项，让该 slice reducer 监听其他动作类型。**该选项是接收 `builder` 参数的回调函数，我们可以用 `builder.addCase(动作创建函数, caseReducer)` 来监听其它动作。

这里，我们调用 `builder.addCase(fetchTodos.pending, reducer)`，当该动作派发时，执行对应 reducer，将状态设为 `"loading"`，同我们之前写 switch 语句时完全一样。对 `fetchTodos.fulfilled` 同理。

再看另一个例子，转换 `saveNewTodo`。这个 thunk 以新 todo 文字作为参数，将其保存到服务器。怎么写？

```js title="src/features/todos/todosSlice.js"
// 省略导入

export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})

// highlight-start
export const saveNewTodo = createAsyncThunk('todos/saveNewTodo', async text => {
  const initialTodo = { text }
  const response = await client.post('/fakeApi/todos', { todo: initialTodo })
  return response.todo
})
// highlight-end

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // 省略 reducers
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        const newEntities = {}
        action.payload.forEach(todo => {
          newEntities[todo.id] = todo
        })
        state.entities = newEntities
        state.status = 'idle'
      })
      // highlight-start
      .addCase(saveNewTodo.fulfilled, (state, action) => {
        const todo = action.payload
        state.entities[todo.id] = todo
      })
    // highlight-end
  }
})

// 省略导出和选择器
```

`saveNewTodo` 的过程同 `fetchTodos`。调用 `createAsyncThunk`，传入动作前缀和 payload 创建函数，payload 创建函数发起异步调用并返回结果。

 dispatch `saveNewTodo(text)` 时，`text` 会作为第一个参数传给 payload 创建函数。

这里简单说明几点供参考：

- 你只能传进 thunk 一个参数，若需多个，传一个对象
- payload 创建函数收第二个参数对象，包含 `{getState, dispatch}` 等可用值
- thunk 会先派发 `pending` 动作，再执行 payload func，并根据 Promise 结果派发 `fulfilled` 或 `rejected`

## 归一化状态

之前看过如何归一化状态，使用对象根据 ID 存储项，方便通过 ID 查找，而不用遍历数组。但手写归一化更新逻辑非常冗长。用 Immer 写“修改”代码简化了，但很多操作仍重复，比如应用中可能有很多不同类型的数据需要加载，重复写同样的 reducer 代码。

**Redux Toolkit 提供了 `createEntityAdapter` API，提供预置 reducer，简化归一化数据的典型更新操作。**包括新增、更新、删除项的 reducers，并且还会生成一些用于读取数据的记忆化 selector。

### 使用 `createEntityAdapter`

调用 `createEntityAdapter` 会得到一个“adapter”对象，包含若干预制 reducer 函数，包括：

- `addOne` / `addMany`：新增一条或多条数据
- `upsertOne` / `upsertMany`：新增或更新一条或多条数据
- `updateOne` / `updateMany`：根据部分字段更新已有数据
- `removeOne` / `removeMany`：根据 ID 删除一条或多条数据
- `setAll`：替换所有已有数据

这些函数可以单独作为 case reducers，也可以作为 `createSlice` 里的“修改辅助函数”。

adapter 还提供：

- `getInitialState`：返回 `{ ids: [], entities: {} }` 形式的初始状态对象，用于存储归一化数据和所有 ID 数组
- `getSelectors`：生成一套标准 selector 函数

看看我们如何用它改写 todos slice：

```js title="src/features/todos/todosSlice.js"
// highlight-start
import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter
} from '@reduxjs/toolkit'
// 省略部分导入

// highlight-start
const todosAdapter = createEntityAdapter()

const initialState = todosAdapter.getInitialState({
  status: 'idle'
})
// highlight-end

// 省略 thunk

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    // 省略部分 reducers
    // highlight-start
    // 使用 adapter reducer 函数按 ID 删除 todo
    todoDeleted: todosAdapter.removeOne,
    // highlight-end
    completedTodosCleared(state, action) {
      const completedIds = Object.values(state.entities)
        .filter(todo => todo.completed)
        .map(todo => todo.id)
      // highlight-start
      // 用 adapter 函数作为“修改”辅助方法
      todosAdapter.removeMany(state, completedIds)
      // highlight-end
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        todosAdapter.setAll(state, action.payload)
        state.status = 'idle'
      })
      // highlight-start
      // 使用 adapter 函数作为 reducer 添加 todo
      .addCase(saveNewTodo.fulfilled, todosAdapter.addOne)
    // highlight-end
  }
})

// 省略选择器
```

不同 adapter 方法参数各异，均通过 `action.payload` 传入。`add` 和 `upsert` 接收对象或数组，`remove` 接收 ID 或 ID 数组，依此类推。

`getInitialState` 允许传入额外状态，例子里带入了 `status` 字段，最终 slice 状态结构是 `{ ids, entities, status }`，和之前很相似。

我们也可以替换 todos 选择器。adapter 的 `getSelectors` 返回一套选择器，比如返回全部 items 的 `selectAll`，以及根据 ID 返回单条的 `selectById`。但由于 `getSelectors` 不知道数据在全局 Redux 状态树的位置，我们需要传入一个 selector 提取 slice 状态。

用这些替换后，todos slice 的完整代码如下，展示最终用 Redux Toolkit 改写的版本：

```js title="src/features/todos/todosSlice.js"
import {
  createSlice,
  createSelector,
  createAsyncThunk,
  createEntityAdapter
} from '@reduxjs/toolkit'
import { client } from '../../api/client'
import { StatusFilters } from '../filters/filtersSlice'

const todosAdapter = createEntityAdapter()

const initialState = todosAdapter.getInitialState({
  status: 'idle'
})

// Thunk 函数
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})

export const saveNewTodo = createAsyncThunk('todos/saveNewTodo', async text => {
  const initialTodo = { text }
  const response = await client.post('/fakeApi/todos', { todo: initialTodo })
  return response.todo
})

const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    todoToggled(state, action) {
      const todoId = action.payload
      const todo = state.entities[todoId]
      todo.completed = !todo.completed
    },
    todoColorSelected: {
      reducer(state, action) {
        const { color, todoId } = action.payload
        state.entities[todoId].color = color
      },
      prepare(todoId, color) {
        return {
          payload: { todoId, color }
        }
      }
    },
    todoDeleted: todosAdapter.removeOne,
    allTodosCompleted(state, action) {
      Object.values(state.entities).forEach(todo => {
        todo.completed = true
      })
    },
    completedTodosCleared(state, action) {
      const completedIds = Object.values(state.entities)
        .filter(todo => todo.completed)
        .map(todo => todo.id)
      todosAdapter.removeMany(state, completedIds)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchTodos.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        todosAdapter.setAll(state, action.payload)
        state.status = 'idle'
      })
      .addCase(saveNewTodo.fulfilled, todosAdapter.addOne)
  }
})

export const {
  allTodosCompleted,
  completedTodosCleared,
  todoAdded,
  todoColorSelected,
  todoDeleted,
  todoToggled
} = todosSlice.actions

export default todosSlice.reducer

// highlight-start
export const { selectAll: selectTodos, selectById: selectTodoById } =
  todosAdapter.getSelectors(state => state.todos)
// highlight-end

export const selectTodoIds = createSelector(
  // 首先传入一个或多个“输入选择器”
  selectTodos,
  // 再传入一个“输出选择器”作为最终计算函数
  todos => todos.map(todo => todo.id)
)

export const selectFilteredTodos = createSelector(
  // 第一个输入选择器：所有 todos
  selectTodos,
  // 第二个输入选择器：过滤条件
  state => state.filters,
  // 输出选择器：收到 todos 和 filters 两个结果
  (todos, filters) => {
    const { status, colors } = filters
    const showAllCompletions = status === StatusFilters.All
    if (showAllCompletions && colors.length === 0) {
      return todos
    }

    const completedStatus = status === StatusFilters.Completed
    // 根据过滤器返回活跃或完成的 todos
    return todos.filter(todo => {
      const statusMatches =
        showAllCompletions || todo.completed === completedStatus
      const colorMatches = colors.length === 0 || colors.includes(todo.color)
      return statusMatches && colorMatches
    })
  }
)

export const selectFilteredTodoIds = createSelector(
  // 传入其它记忆化选择器
  selectFilteredTodos,
  // 在输出选择器中导出所需数据
  filteredTodos => filteredTodos.map(todo => todo.id)
)
```

我们调用 `todosAdapter.getSelectors`，并传入一个 `state => state.todos` 选择器提取该 slice 状态。adapter 就生成了一个 `selectAll` 选择器，接收整个 Redux 状态树，遍历 `state.todos.entities` 和 `state.todos.ids`，返回完整的 todo 数组。因为返回的函数名没表达选择具体是什么，可以用解构重命名为 `selectTodos`。`selectById` 亦然重命名为 `selectTodoById`。

注意，其他选择器仍用 `selectTodos` 作为输入，因为无论我们之前是将数组放在 `state.todos` 中还是嵌套，还是用归一化对象，选择器始终返回 todo 对象数组。随着数据存储方式变化，选择器的变化使我们其余代码保持不变，且记忆化选择器有助于避免不必要的 UI 重新渲染，提升性能。

## 你学到了什么

**恭喜你，完成了“Redux 基础”教程！**

现在，你应该对 Redux 是什么、如何工作、以及如何正确使用它有扎实的理解：

- 管理全局应用状态
- 保持应用状态为普通 JS 数据
- 编写描述“发生了什么”的动作对象
- 编写 reducer 函数查看当前状态和动作，创建新的不变状态
- 通过 `useSelector` 读取 React 组件中的 Redux 状态
- 通过 `useDispatch` 从 React 组件派发动作

此外，你已见识了 **Redux Toolkit 如何简化 Redux 逻辑**，以及 **为什么 Redux Toolkit 是编写真实 Redux 应用的标准方法**。通过先学习手写 Redux 代码，应当清楚 Redux Toolkit API 如 `createSlice` 为你做了什么事，这样你就不必自己写那样的代码。

:::info

关于 Redux Toolkit 的更多信息，包括用法指南和 API 参考，请参阅：

- Redux Toolkit 文档，地址为 **https://redux-toolkit.js.org**

:::

我们来最终看看使用 Redux Toolkit 完整转换后的待办应用代码：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-10-finalCode/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&module=%2Fsrc%2Ffeatures%2Ftodos%2FtodosSlice.js&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

我们最后总结这一部分的关键点：

:::tip 总结

- **Redux Toolkit (RTK) 是编写 Redux 逻辑的标准方式**
  - RTK 包含简化大多数 Redux 代码的 API
  - RTK 封装 Redux 核心，并包含其他有用包
- **`configureStore` 用良好默认配置搭建 Redux store**
  - 自动组合 slice reducers 创建根 reducer
  - 自动设置 Redux DevTools 扩展和调试中间件
- **`createSlice` 简化编写 Redux 动作和 reducers**
  - 自动根据 slice/reducer 名称生成动作创建函数
  - reducer 可通过 Immer 直接“修改”状态
- **`createAsyncThunk` 生成异步 thunk**
  - 自动生成 thunk 与 `pending/fulfilled/rejected` 动作创建函数
  - 派发 thunk 时运行 payload 创建函数并派发对应动作
  - thunk 动作可在 `createSlice.extraReducers` 中处理
- **`createEntityAdapter` 提供归一化状态的 reducers 和 selectors**
  - 包含添加/更新/删除项的预制 reducer
  - 生成记忆化选择器，例如 `selectAll` 和 `selectById`

:::

## Redux 学习和使用的后续步骤

既然你已经完成本教程，我们有几个建议，让你进一步深入学习 Redux。

“基础”教程聚焦于 Redux 的底层细节：手写动作类型和不变更新，Redux store 和中间件如何工作，以及为什么我们使用动作创建函数和归一化状态模式。而且，我们的示例 todo 应用较小，不代表构建完整应用的实际情境。

不过，我们的[**“Redux Essentials”教程**](../essentials/part-1-overview-concepts.md) 会专注教你 **如何构建“真实世界”类型的应用**。它强调“如何用正确方式使用 Redux”，并使用 Redux Toolkit 讲解更贴近大型应用的模式。包含与本“基础”教程相同的主题，比如为何 reducers 需要用不变更新方式，但重点是构建实际工作应用。**强烈推荐你作为下一步阅读“Redux Essentials”教程。**

与此同时，我们在本教程中涵盖的内容，应足够开始用 React 和 Redux 开发你自己的应用。此时开始做项目，巩固这些概念、观察它们的实际效果是极好的。如果不知道做什么项目，可参考 [这份项目灵感列表](https://github.com/florinpop17/app-ideas)。

[使用 Redux](../../usage/index.md) 部分包含许多重要概念的信息，比如 [如何结构化 Reducers](../../usage/structuring-reducers/StructuringReducers.md)，还有[**我们的风格指南页面**](../../style-guide/style-guide.md)，其中介绍推荐的模式和最佳实践。

如果你想了解更多 Redux 的历史缘由、解决方案及其使用意图，可以阅读 Redux 维护者 Mark Erikson 的文章 [《Redux 道之实施与意图（第一部分）》](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/) 和 [《Redux 道之实践与哲学（第二部分）》](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/)。

如果你在使用 Redux 遇到问题，欢迎加入 [Reactiflux 服务器中的 `#redux` 频道（Discord）](https://www.reactiflux.com)。

**感谢你阅读完本教程，希望你享受用 Redux 构建应用的过程！**