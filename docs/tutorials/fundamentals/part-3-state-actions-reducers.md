---
id: part-3-state-actions-reducers
title: 'Redux 基础，第三部分：状态、动作与 reducers'
sidebar_label: '状态、动作与 Reducers'
description: '官方 Redux 基础教程：学习 reducers 如何根据动作更新状态'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

<!-- prettier-ignore -->
import FundamentalsWarning from "../../components/_FundamentalsWarning.mdx";

:::tip 你将学到什么

- 如何定义包含应用数据的状态值
- 如何定义描述应用中发生的事情的动作对象
- 如何编写 reducer 函数，根据现有状态和动作计算更新后的状态

:::

:::info 先决条件

- 熟悉 Redux 关键术语和概念，如“actions”、“reducers”、“store”和“dispatching”。（参见 **[第二部分：Redux 概念与数据流](./part-2-concepts-data-flow.md)** 了解这些术语的解释。）

:::

## 简介

在 [第二部分：Redux 概念与数据流](./part-2-concepts-data-flow.md) 中，我们了解了 Redux 如何通过提供一个集中管理全局应用状态的地方，帮助我们构建可维护的应用。我们还讨论了核心 Redux 概念，比如分发动作对象和使用返回新状态值的 reducer 函数。

现在你已经对这些组成部分有了一些认识，是时候将这些知识付诸实践了。我们将构建一个小型示例应用，看看这些部分如何真正协同工作。

<FundamentalsWarning />

### 项目搭建

本教程提供了一个预配置的起始项目，已经配置好了 React，包含一些默认样式，并且内置了一个假 REST API，允许我们在应用中实际编写 API 请求。你将以此为基础编写实际的应用代码。

开始之前，你可以打开并 Fork 这个 CodeSandbox：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/master/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

你也可以 [从此 Github 仓库克隆同一项目](https://github.com/reduxjs/redux-fundamentals-example-app)。克隆后，使用 `npm install` 安装项目依赖，用 `npm start` 启动项目。

如果你想看我们将要构建的最终版本，可以查看 [**`tutorial-steps` 分支**](https://github.com/reduxjs/redux-fundamentals-example-app/tree/tutorial-steps)，或查看 [这个 CodeSandbox 中的最终版本](https://codesandbox.io/s/github/reduxjs/redux-fundamentals-example-app/tree/tutorial-steps)。

#### 新建 Redux + React 项目

完成本教程后，你可能想尝试自己动手建项目。**我们推荐使用 [Create-React-App 的 Redux 模板](https://github.com/reduxjs/cra-template-redux)，这是创建 Redux + React 项目的最快方式**。它内置了 Redux Toolkit 和 React-Redux，使用了[第一部分中你见过的「计数器」应用的现代版本](./part-1-overview.md)。这样你可以直接编写业务代码，而无需手动添加 Redux 包和配置 store。

如果你想知道如何具体将 Redux 添加到项目中，可以参考此说明：

<DetailedExplanation title="详细说明：向 React 项目添加 Redux">

CRA 的 Redux 模板已经集成了 Redux Toolkit 和 React-Redux。如果你从头开始搭建新项目，未使用该模板，则需要执行以下步骤：

- 添加 `@reduxjs/toolkit` 和 `react-redux` 包
- 使用 RTK 的 `configureStore` API 创建 Redux store，并至少传入一个 reducer 函数
- 在应用入口文件（如 `src/index.js`）中引入 Redux store
- 用 React-Redux 的 `<Provider>` 组件包裹根 React 组件，如：

```jsx
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

</DetailedExplanation>

#### 初始项目结构概览

该初始项目基于标准 [Vite](https://create-react-app.dev/docs/getting-started) 项目模板，做了一些修改。

让我们快速看一下项目包含的内容：

- `/src`
  - `index.js`：应用入口文件，渲染主 `<App>` 组件。
  - `App.js`：主应用组件。
  - `index.css`：整个应用的样式文件
  - `/api`
    - `client.js`：一个小型的 `fetch` 封装客户端，允许我们发起 HTTP GET 和 POST 请求
    - `server.js`：提供了一个假 REST API 用于模拟数据，应用后续会从这些假端点请求数据。
  - `/exampleAddons`：包含一些额外 Redux 插件，后面教程将用到，演示功能如何实现

运行应用，你会看到一条欢迎消息，但应用其它部分仍然是空的。

好了，让我们开始吧！

## 启动 Todo 示例应用

我们的示例应用是一个小型“待办事项”应用。你可能以前见过不少 todo 应用示例，因为它们能很好展示如何跟踪条目列表、处理用户输入以及数据变化时更新 UI——这些都是常见应用中经常发生的事情。

### 确定需求

首先确定应用的初始业务需求：

- UI 应包含三个主要部分：
  - 一个输入框，允许用户输入新的代办事项文本
  - 一个显示所有现有代办事项的列表
  - 一个页脚区域，显示未完成事项的数量，以及筛选选项
- 代办列表项应带有切换“完成”状态的复选框，还应能为项添加颜色编码的类别标签（从预定义颜色列表中选），并能删除代办项。
- 计数器应根据激活的待办项数进行复数化显示：“0 items”、“1 item”、“3 items”等。
- 应有按钮标记所有代办事项为已完成，且能清除（删除）所有已完成事项。
- 应有两种方式过滤列表中的代办项：
  - 根据“全部”、“未完成”和“已完成”筛选
  - 根据选定的一个或多个颜色筛选，显示标签颜色匹配的代办项

后续我们会增加更多需求，但这些足以启动。

最终目标是实现如图所示的应用：

![示例 Todo 应用截图](/img/tutorials/fundamentals/todos-app-screenshot.png)

### 设计状态值

React 和 Redux 的核心原则之一是 **UI 应基于状态来定义**。所以，设计应用的一个思路是先思考描述应用工作所需的全部状态。尽量用尽可能少的状态值描述 UI，也是一种好的做法，这样就不用跟踪和维护过多数据。

该应用概念上有两个主要方面：

- 当前代办事项列表
- 当前的筛选选项

我们还需追踪用户在“添加代办”输入框内输入的内容，不过这部分不重要，稍后再处理。

每个代办事项需要存储几项信息：

- 用户输入的文本
- 是否完成的布尔标志
- 唯一 ID
- 选定的颜色分类（如果有）

我们的筛选行为可以用一些枚举值来描述：

- 完成状态： "全部"、"未完成"、"已完成"
- 颜色： "红色"、"黄色"、"绿色"、"蓝色"、"橙色"、"紫色"

从这些值来看，代办事项是“应用状态”（应用核心处理的数据），而筛选值是“UI 状态”（描述当前应用操作的状态）。区分这些类别，有助于理解状态的不同使用方式。

### 设计状态结构

在 Redux 中，**应用状态始终使用普通 JavaScript 对象和数组存储**。这意味着你不能把其他类型放入 Redux 状态，比如类实例、内置 JS 类型（`Map` / `Set` / `Promise` / `Date`）、函数等非纯 JS 数据。

**根 Redux 状态值几乎总是一个普通 JS 对象**，内部包含其他数据。

据此，我们可以描述 Redux 状态中应包含的值类型：

- 需要一个存储代办事项对象的数组。每项包含：
  - `id`：唯一编号
  - `text`：用户输入的文本
  - `completed`：布尔完成状态
  - `color`：可选的颜色分类
- 然后，需要描述筛选选项：
  - 当前的“完成状态”筛选值
  - 当前选中的颜色类别数组

示例应用状态如下：

```js
const todoAppState = {
  todos: [
    { id: 0, text: 'Learn React', completed: true },
    { id: 1, text: 'Learn Redux', completed: false, color: 'purple' },
    { id: 2, text: 'Build something fun!', completed: false, color: 'blue' }
  ],
  filters: {
    status: 'Active',
    colors: ['red', 'blue']
  }
}
```

需要指出的是，**Redux 之外维护其他状态值是没问题的！** 这个示例较小，全部状态都放在 Redux store 中，但如我们后面会看到，某些数据其实无需存入 Redux（比如“这个下拉是否展开？”或者“表单输入当前值”）。

### 设计动作（Actions）

**动作是带有 `type` 属性的普通 JavaScript 对象**。如前所述，**你可以把动作看作描述应用中发生事件的对象**。

和设计状态结构一样，我们也能根据业务需求列出描述事件动作的列表：

- 添加新的代办事项，基于用户输入的文本
- 切换代办事项的完成状态
- 为代办事项选择颜色分类
- 删除代办事项
- 将所有代办事项标记为已完成
- 清除所有已完成的代办事项
- 更改“完成状态”筛选值
- 新增颜色筛选
- 删除颜色筛选

额外描述事件所需的数据通常放在 `action.payload` 字段里，可能是数字、字符串，或者包含多个字段的对象。

Redux store 对 `action.type` 字段具体值没有要求。但你的代码会通过判断 `action.type` 来决定是否更新状态。且调试时通常会在 Redux DevTools Extension 中查看这些动作类型字符串。因而，选择易懂且能明确描述事件的类型字符串很重要，方便后续理解。

基于上述事件列表，我们可以创建以下动作：

- `{type: 'todos/todoAdded', payload: todoText}`
- `{type: 'todos/todoToggled', payload: todoId}`
- `{type: 'todos/colorSelected', payload: {todoId, color}}`
- `{type: 'todos/todoDeleted', payload: todoId}`
- `{type: 'todos/allCompleted'}`
- `{type: 'todos/completedCleared'}`
- `{type: 'filters/statusFilterChanged', payload: filterValue}`
- `{type: 'filters/colorFilterChanged', payload: {color, changeType}}`

这里大多数动作只带一条额外数据，我们直接放入了 `action.payload` 字段。颜色筛选的动作其实可以拆为两个：一个“添加”，一个“删除”，但这里我们用一个动作并在 payload 里额外带字段来表示变化类型，也展示了动作载荷可以是对象。

和状态数据一样，**动作应只包含描述事件所需的最小信息量**。

## 编写 Reducers

既然知道了状态结构和动作格式，就该写第一个 reducer 了。

**Reducer 函数接受当前的 `state` 和 `action` 两个参数，并返回更新后的新 `state`。也就是说，形式是** **`(state, action) => newState`**。

### 创建根 reducer

**Redux 应用实际上只有一个 reducer 函数：即后续传递给 `createStore` 的“根 reducer”函数**。该函数负责处理所有分发的动作，计算整棵状态树完整的新值。

让我们在 `src` 目录下新建一个 `reducer.js` 文件，与 `index.js` 和 `App.js` 并列。

每个 reducer 都需要初始状态，因此先创建几条假代办项准备使用。然后，写一个大致的 reducer 代码框架：

```js title="src/reducer.js"
const initialState = {
  todos: [
    { id: 0, text: 'Learn React', completed: true },
    { id: 1, text: 'Learn Redux', completed: false, color: 'purple' },
    { id: 2, text: 'Build something fun!', completed: false, color: 'blue' }
  ],
  filters: {
    status: 'All',
    colors: []
  }
}

// 用 initialState 作为默认值
export default function appReducer(state = initialState, action) {
  // reducer 根据动作类型决定行为
  switch (action.type) {
    // 根据不同动作类型执行相应逻辑
    default:
      // 若不识别动作类型或不关心该动作，返回当前状态
      return state
  }
}
```

当应用初始化时，reducer 可能会被传入 `undefined` 作为状态值。这时需要提供一个初始状态，供后续代码使用。**通常通过函数参数默认值 `(state = initialState, action)` 来实现。**

接下来，我们添加处理类型为 `'todos/todoAdded'` 的动作逻辑。

首先判断动作类型是否匹配该字符串。接着，返回一个新的状态对象，包含所有现有状态字段，即使有的字段没变。

```js title="src/reducer.js"
function nextTodoId(todos) {
  const maxId = todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1)
  return maxId + 1
}

// 用 initialState 作为默认值
export default function appReducer(state = initialState, action) {
  // reducer 根据动作类型决定行为
  switch (action.type) {
    case 'todos/todoAdded': {
      return {
        // 复制之前的状态
        ...state,
        // todo 数组换成新数组
        todos: [
          // 之前的 todos
          ...state.todos,
          // 新增的 todo 对象
          {
            id: nextTodoId(state.todos), // 简单递增 ID
            text: action.payload,
            completed: false
          }
        ]
      }
    }
    default:
      return state
  }
}
```

这就是添加一个 todo 项要做的所有工作。为什么要这么麻烦呢？

### Reducer 的规则

之前说过，**reducers 必须 _始终_ 遵守一些特殊规则**：

- 只根据传入的 `state` 和 `action` 参数计算新状态值
- 不允许修改（mutate）现有状态，必须进行 _不可变更新_，即复制原状态并修改副本
- 不能执行异步逻辑或其它“副作用”

:::tip

**所谓“副作用”是指函数返回值之外的任何可观察行为变化**，常见副作用有：

- 打印日志到控制台
- 保存文件
- 设置异步定时器
- 发起 HTTP 请求
- 修改函数外的状态，或改变函数参数所指向的值
- 生成随机数或唯一 ID（如 `Math.random()`、`Date.now()`）

:::

遵守规则的函数也叫做**“纯函数”**，即使没明确写成 reducer。

那规则为什么重要？原因很多：

- Redux 旨在使代码可预测。函数输出仅依赖输入时，更容易理解和测试
- 函数依赖外部变量或表现随机时，执行结果不可预期
- 修改其它值（包括函数参数）可能导致状态变更行为异常，常见 bug 如“状态更新了，但 UI 没有刷新”
- Redux DevTools 依赖 reducer 正确遵守规则才能正常使用

其中“不可变更新”规则尤为关键，值得进一步说明。

### Reducer 里的不可变更新

之前提过，“变异”指修改已有对象/数组，“不可变”意味着不能更改原值。

:::warning

在 Redux 中，**reducers _绝不允许_ 直接修改原有状态！**

```js
// ❌ 非法 - 默认会直接修改状态！
state.value = 123
```

:::

不能变异状态有多个原因：

- 引起 bug，例如 UI 无法正确显示最新状态
- 使状态更新原因难以理解
- 增加测试难度
- 破坏“时间旅行调试”功能
- 违背 Redux 使用规范与设计理念

那么，不能直接修改，怎么返回新状态呢？

:::tip

**Reducer 只能生成原状态的 _副本_，基于副本做修改。**

```js
// ✅ 这是安全的，因为复制了状态副本
return {
  ...state,
  value: 123
}
```

:::

我们已经看过，使用 JavaScript 数组/对象扩展运算符及返回副本的函数，可以手写不可变更新。

但数据嵌套时，更新就更麻烦。**不可变更新的核心规则是，必须对每层需要更新的嵌套都进行复制。**

如果你觉得“用手写方式做不可变更新难以记住且易出错”…那你说对了！:)

手写不可变更新非常难，也是 Redux 用户最常犯的错误。

:::tip

**真实项目中，你不用亲手写复杂的嵌套不可变更新**。在[第八部分：使用 Redux Toolkit 的现代 Redux](./part-8-modern-redux.md) 中，你将学习如何用 Redux Toolkit 简化 reducer 中不可变更新的写法。

:::

### 处理其他动作

了解规则后，我们再继续添加一些逻辑。先处理基于 ID 切换代办完成状态：

```js title="src/reducer.js"
export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/todoAdded': {
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: nextTodoId(state.todos),
            text: action.payload,
            completed: false
          }
        ]
      }
    }
    case 'todos/todoToggled': {
      return {
        ...state,
        todos: state.todos.map(todo => {
          if (todo.id !== action.payload) {
            return todo
          }

          return {
            ...todo,
            completed: !todo.completed
          }
        })
      }
    }
    default:
      return state
  }
}
```

还没处理完“切换完成”动作，我们再加一个处理“切换筛选状态”动作的例子：

```js title="src/reducer.js"
export default function appReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/todoAdded': {
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: nextTodoId(state.todos),
            text: action.payload,
            completed: false
          }
        ]
      }
    }
    case 'todos/todoToggled': {
      return {
        ...state,
        todos: state.todos.map(todo => {
          if (todo.id !== action.payload) {
            return todo
          }

          return {
            ...todo,
            completed: !todo.completed
          }
        })
      }
    }
    case 'filters/statusFilterChanged': {
      return {
        ...state,
        filters: {
          ...state.filters,
          status: action.payload
        }
      }
    }
    default:
      return state
  }
}
```

只写了 3 个动作处理，代码已经有点长。如果把所有动作都写到一个 reducer 函数里，阅读和维护就会很难。

因此，**通常会把 reducer 拆分成多个小函数**，方便理解和维护。

## 拆分 Reducers

拆分时，**Redux reducer 通常根据它所管理 Redux 状态的部分进行拆分**。我们的 Todo 应用状态主要包含两部分：`state.todos` 和 `state.filters`。因此我们可以把大的根 reducer 拆为两个小 reducer：`todosReducer` 和 `filtersReducer`。

这些拆分出来的 reducer 应该放哪里？

**建议你按「特性」（feature）组织 Redux 代码——将代码按应用中某一特定功能或领域划分。**每个特性的 Redux 代码通常写在一个文件内，称作「slice」文件，包含该部分状态的 reducer 和动作相关代码。

基于此，**管理 Redux 某段状态的 reducer 被称作“slice reducer”**。通常，某些动作只关心某个 slice，因此动作的类型字符串一般以该特性名开头（例如 `'todos'`），接着是事件描述（例如 `'todoAdded'`），以斜杠 `/` 拼接成 `'todos/todoAdded'`。

在项目中，新建 `features` 文件夹，里面新建 `todos` 文件夹，再创建 `todosSlice.js` 文件，把有关 todos 的初始状态部分剪切过来：

```js title="src/features/todos/todosSlice.js"
const initialState = [
  { id: 0, text: 'Learn React', completed: true },
  { id: 1, text: 'Learn Redux', completed: false, color: 'purple' },
  { id: 2, text: 'Build something fun!', completed: false, color: 'blue' }
]

function nextTodoId(todos) {
  const maxId = todos.reduce((maxId, todo) => Math.max(todo.id, maxId), -1)
  return maxId + 1
}

export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state
  }
}
```

接下来复制处理 todos 的更新逻辑。但这里有一个重要区别。**这个文件只针对 todos 相关状态更新——它的状态本身就是数组，不再嵌套！**这是拆分 reducer 的另一个理由。因 todos 状态本身即数组，这里无须复制外层根状态对象，代码更简洁易读。

这就是**reducer 组合（reducer composition）**，是构建 Redux 应用的基本模式。

处理动作后的更新 reducer 如下：

```js title="src/features/todos/todosSlice.js"
export default function todosReducer(state = initialState, action) {
  switch (action.type) {
    case 'todos/todoAdded': {
      return [
        ...state,
        {
          id: nextTodoId(state),
          text: action.payload,
          completed: false
        }
      ]
    }
    case 'todos/todoToggled': {
      return state.map(todo => {
        if (todo.id !== action.payload) {
          return todo
        }

        return {
          ...todo,
          completed: !todo.completed
        }
      })
    }
    default:
      return state
  }
}
```

稍微短一点，也更易读。

同样方法对过滤器逻辑处理。新建 `src/features/filters/filtersSlice.js`，把过滤相关代码移动到这里：

```js title="src/features/filters/filtersSlice.js"
const initialState = {
  status: 'All',
  colors: []
}

export default function filtersReducer(state = initialState, action) {
  switch (action.type) {
    case 'filters/statusFilterChanged': {
      return {
        ...state,
        status: action.payload
      }
    }
    default:
      return state
  }
}
```

这里还是复制了 filters 对象，但层级减少了，整体逻辑更清晰。

:::info

为了简化本页面，后面的动作更新实现将不再展示。

**请你根据[需求描述](#defining-requirements)，自己尝试实现其它动作的 reducer 逻辑。**

如遇困难，可以参考 [页面末尾的 CodeSandbox](#what-youve-learned) 查看完整实现。

:::

## 合并 Reducers

目前我们有两个独立的 slice 文件和 reducer 函数，但前面提到 Redux store 创建时需要一个根 reducer 函数。那如何避免把所有代码塞回一个大函数？

由于 reducers 都是正常的 JS 函数，我们可以将 slice reducer 导入 `reducer.js`，写一个新的根 reducer，专门调用它们两个：

```js title="src/reducer.js"
import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

export default function rootReducer(state = {}, action) {
  return {
    todos: todosReducer(state.todos, action),
    filters: filtersReducer(state.filters, action)
  }
}
```

**注意这里每个 reducer 管理自己状态片段对应的 `state` 参数**。

这让我们能根据 slice 和特性拆分逻辑，维护性更好。

### `combineReducers`

看到这里，根 reducer 实际就是重复调用各 slice reducer，传入对应状态片段，并将其返回值赋给根状态相应属性。如果切更多 slices，无非是更多重复。

Redux 核心库自带了一个实用工具 —— [`combineReducers`](../../api/combineReducers.md) 来帮我们自动处理这类模版代码。用它就能替换手写的根 reducer。

**使用 `combineReducers` 之前，需先安装 Redux 核心库：**

```js
npm install redux
```

安装完成即可导入并使用 `combineReducers`：

```js title="src/reducer.js"
// highlight-next-line
import { combineReducers } from 'redux'

import todosReducer from './features/todos/todosSlice'
import filtersReducer from './features/filters/filtersSlice'

const rootReducer = combineReducers({
  todos: todosReducer,
  filters: filtersReducer
})

export default rootReducer
```

`combineReducers` 传入的是一个对象，键名对应根状态对象中字段名称，键值为对应的切片 reducer 函数。

**切记，传给 `combineReducers` 的键名决定了你的根状态对象的字段名称！**

## 你学到了什么

**状态、动作和 reducers 是 Redux 的构建基石**。每个 Redux 应用有状态值，创建动作描述事件，使用 reducer 函数根据之前的状态与动作计算新的状态值。

这是我们目前应用的内容：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-1-combinedReducers/?codemirror=1&fontsize=14&hidenavigation=1&module=%2Fsrc%2Freducer.js&theme=dark&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
  sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
></iframe>

:::tip 总结

- **Redux 应用使用普通 JS 对象、数组和原始值作为状态**
  - 根状态值应是普通 JS 对象
  - 状态应包含完成应用功能所需的最小数据量
  - 类实例、Promises、函数等非纯值不应放入 Redux 状态
  - Reducer 中不能生成随机值，如 `Math.random()` 或 `Date.now()`
  - Redux 外部可并存其他状态（例如局部组件状态）
- **动作是带有 `type` 字段的普通对象，描述发生了什么**
  - `type` 字段应是易读字符串，通常写作 `'特性/事件名'` 格式
  - 动作可带其它数据，通常放在 `action.payload`
  - 动作应只包含描述发生事件的最少信息
- **Reducers 是 `(state, action) => newState` 形式的函数**
  - 必须遵守特别规则：
    - 只能基于传入 `state` 和 `action` 计算新状态
    - 永远不修改原状态，始终返回副本
    - 不能有副作用，例如 HTTP 请求或异步逻辑
- **Reducer 应拆分，方便阅读和维护**
  - 通常按顶层状态键或“slice”拆分 reducer
  - Reducer 通常写在“slice”文件内，按“特性”文件夹组织
  - 可以用 Redux 的 `combineReducers` 合并拆分的 reducer
  - `combineReducers` 中的键名决定顶级状态对象的字段名

:::

## 下一步？

我们已经编写出能更新状态的 reducer 逻辑，但它们本身不会自动执行。需要创建 Redux store，store 会在事件发生时调用 reducer。

在 [第四部分：Store](./part-4-store.md) 中，我们将学习如何创建 Redux store 并运行 reducer 逻辑。