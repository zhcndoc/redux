---
id: part-4-store
title: 'Redux 基础，第 4 部分：存储（Store）'
sidebar_label: '存储（Store）'
description: '官方 Redux 基础教程：学习如何创建和使用 Redux store'
---

import { DetailedExplanation } from '../../components/DetailedExplanation'

<!-- prettier-ignore -->
import FundamentalsWarning from "../../components/_FundamentalsWarning.mdx";

:::tip 你将学到的内容

- 如何创建 Redux store
- 如何使用 store 来更新状态并监听状态更新
- 如何配置 store 扩展其功能
- 如何设置 Redux DevTools 扩展以调试你的应用

:::

## 介绍

在[第3部分：状态、动作和 reducers](./part-3-state-actions-reducers.md)中，我们开始编写示例待办事项应用。我们列出了业务需求，定义了使应用正常运行所需的**状态**结构，并创建了一系列动作类型来描述“发生了什么”，以匹配用户与应用交互时可能发生的事件。我们还编写了可以更新 `state.todos` 和 `state.filters` 部分的**reducer**函数，并看到了如何使用 Redux 的 `combineReducers` 函数来基于应用中每个功能的不同“切片 reducer”创建“根 reducer”。

现在，是时候将这些部分组合起来，Redux 应用的核心部分：**store（存储）**。

<FundamentalsWarning />

## Redux Store（存储）

Redux **store** 将组成你应用的状态、动作和 reducers 结合起来。store 有几个职责：

- 内部保存当前应用状态
- 通过 [`store.getState()`](../../api/Store.md#getState) 访问当前状态
- 通过 [`store.dispatch(action)`](../../api/Store.md#dispatch) 更新状态
- 通过 [`store.subscribe(listener)`](../../api/Store.md#subscribe) 注册监听回调
- 通过 [`store.subscribe(listener)`](../../api/Store.md#subscribe) 返回的 `unsubscribe` 函数取消注册监听

需要注意的是，**在 Redux 应用中你只会有一个单一的 store**。当你想拆分数据处理逻辑时，应使用[reducer 组合](./part-3-state-actions-reducers.md#splitting-reducers)，创建多个 reducer 并将它们合并，而不是创建多个 store。

### 创建 Store

**每个 Redux store 都有一个唯一的根 reducer 函数**。在上一节中，我们[使用 `combineReducers` 创建了根 reducer 函数](./part-3-state-actions-reducers.md#combinereducers)。该根 reducer 当前在示例应用的 `src/reducer.js` 中定义。让我们导入根 reducer 并创建第一个 store。

Redux 核心库提供了[**`createStore` API**](../../api/createStore.md) 用于创建 store。新建一个文件 `store.js`，导入 `createStore` 和根 reducer，然后调用 `createStore`，传入根 reducer：

```js title="src/store.js"
import { createStore } from 'redux'
import rootReducer from './reducer'

// highlight-next-line
const store = createStore(rootReducer)

export default store
```

### 加载初始状态

`createStore` 也可以接受第二个参数 `preloadedState`，用于添加初始数据，比如从服务器发送的 HTML 页面中包含的值，或持久化存储在 `localStorage` 中并在用户再次访问时读取的状态，如下示例：

```js title="storeStatePersistenceExample.js"
import { createStore } from 'redux'
import rootReducer from './reducer'

// highlight-start
let preloadedState
const persistedTodosString = localStorage.getItem('todos')

if (persistedTodosString) {
  preloadedState = {
    todos: JSON.parse(persistedTodosString)
  }
}

const store = createStore(rootReducer, preloadedState)
// highlight-end
```

## 派发动作（Dispatching Actions）

现在我们创建了 store，来验证程序是否正常工作！即使没有 UI，我们也能测试更新逻辑。

:::tip

在运行以下代码前，试着回到 `src/features/todos/todosSlice.js`，将 `initialState` 中所有示例待办事项对象删除，使其成为一个空数组。这样示例的输出会更易读。

:::

```js title="src/index.js"
// 省略已有的 React 导入

import store from './store'

// 打印初始状态
// highlight-next-line
console.log('Initial state: ', store.getState())
// {todos: [....], filters: {status, colors}}

// 每次状态改变时打印状态
// 注意 subscribe() 返回一个用来注销监听的函数
// highlight-start
const unsubscribe = store.subscribe(() =>
  console.log('State after dispatch: ', store.getState())
)
// highlight-end

// 现在，派发一些动作

// highlight-next-line
store.dispatch({ type: 'todos/todoAdded', payload: 'Learn about actions' })
store.dispatch({ type: 'todos/todoAdded', payload: 'Learn about reducers' })
store.dispatch({ type: 'todos/todoAdded', payload: 'Learn about stores' })

store.dispatch({ type: 'todos/todoToggled', payload: 0 })
store.dispatch({ type: 'todos/todoToggled', payload: 1 })

store.dispatch({ type: 'filters/statusFilterChanged', payload: 'Active' })

store.dispatch({
  type: 'filters/colorFilterChanged',
  payload: { color: 'red', changeType: 'added' }
})

// 停止监听状态更新
// highlight-next-line
unsubscribe()

// 派发最后一个动作看看结果

store.dispatch({ type: 'todos/todoAdded', payload: 'Try creating a store' })

// 省略已有的 React 渲染逻辑
```

请记住，每次调用 `store.dispatch(action)` 时：

- store 会调用 `rootReducer(state, action)`
  - 根 reducer 可能会调用其内部其他切片 reducer，如 `todosReducer(state.todos, action)`
- store 保存新的状态值
- store 调用所有监听订阅回调函数
- 如果监听器访问了 `store`，就可以调用 `store.getState()` 读取最新状态

从上面示例的控制台输出，可以看到每个动作派发后，Redux 状态是如何变化的：

![派发动作后日志的 Redux 状态](/img/tutorials/fundamentals/initial-state-updates.png)

注意我们的应用并没有记录最后一个动作的任何日志，因为我们调用了 `unsubscribe()` 取消了监听器，因此该动作派发后没有任何监听回调运行。

我们在开始写 UI 前就指定了应用的行为，这有助于我们确信应用会按预期工作。

:::info

你也可以尝试编写 reducer 的测试用例。由于 reducer 是[纯函数](../../understanding/thinking-in-redux/ThreePrinciples.md#changes-are-made-with-pure-functions)，测试非常直接。调用 reducer，传入示例 `state` 和 `action`，并检查结果是否符合预期：

```js title="todosSlice.spec.js"
import todosReducer from './todosSlice'

test('根据 id 切换待办状态', () => {
  const initialState = [{ id: 0, text: '测试文本', completed: false }]

  const action = { type: 'todos/todoToggled', payload: 0 }
  const result = todosReducer(initialState, action)
  expect(result[0].completed).toBe(true)
})
```

:::

## Redux Store 内部

看一下 Redux store 内部是如何工作的也很有帮助。下面是一个大约 25 行代码的迷你 Redux store 实现示例：

```js title="miniReduxStoreExample.js"
function createStore(reducer, preloadedState) {
  let state = preloadedState
  const listeners = []

  function getState() {
    return state
  }

  function subscribe(listener) {
    listeners.push(listener)
    return function unsubscribe() {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  function dispatch(action) {
    state = reducer(state, action)
    listeners.forEach(listener => listener())
  }

  dispatch({ type: '@@redux/INIT' })

  return { dispatch, subscribe, getState }
}
```

这个 Redux store 版本足够好用，甚至可以用它替换你应用中实际用的 Redux `createStore` 函数（不妨试试！）。[Redux 的真实实现更长且复杂一些](https://github.com/reduxjs/redux/blob/v4.0.5/src/createStore.js)，但大部分是注释、警告消息和一些异常情况处理。

核心逻辑看起来相当简洁：

- store 内部保存当前 `state` 和 `reducer`
- `getState` 返回当前状态
- `subscribe` 管理监听回调数组，并返回一个注销监听的函数
- `dispatch` 调用 reducer 更新状态，并通知每个监听者
- store 初始化时派发一次动作，初始化状态
- store API 是一个包含 `{dispatch, subscribe, getState}` 的对象

特别强调一点：注意 `getState` 只是返回当前 `state` 的引用。也就是说 **默认情况下，没有机制防止你意外修改状态！** 下面的代码虽然能运行，但不正确：

```js
const state = store.getState()
// ❌ 不要这样做 — 它会修改当前状态！
state.filters.status = 'Active'
```

换句话说：

- Redux store 调用 `getState()` 返回的状态是根 reducer 返回的相同引用，没有额外拷贝
- Redux store 不会阻止你意外修改状态。状态既可以在 reducer 内部修改，也可以在 store 外部修改，你必须小心避免这种情况

一个常见引发意外修改的例子是对数组排序。[**调用 `array.sort()` 实际是修改了原数组**](https://doesitmutate.xyz/sort/)。如果执行 `const sortedTodos = state.todos.sort()`，那么就会无意中修改真实的 store 状态。

:::tip

在[第 8 部分：现代 Redux](./part-8-modern-redux.md)中，我们会看到 Redux Toolkit 如何帮助避免在 reducer 内的状态修改，并检测和警告 reducer 外的意外修改。

:::

## 配置 Store

我们已经看到传入 `rootReducer` 和 `preloadedState` 可以创建 store。但是 `createStore` 还接受一个额外参数，用于定制 store 的功能并赋予它新能力。

Redux store 通过**store enhancer（增强器）**定制。store enhancer 就是一个特殊版本的 `createStore`，它包裹住原 Redux store，对其行为进行改变，为 store 的 `dispatch`、`getState` 和 `subscribe` 方法提供自定义版本。

本教程不深入增强器的内部工作原理，而专注于如何使用它们。

### 使用增强器创建 Store

我们项目中有两个示例 store enhancer，位于 `src/exampleAddons/enhancers.js`：

- `sayHiOnDispatch`：每当派发动作时，都会在控制台打印 `'Hi!'`
- `includeMeaningOfLife`：每次调用 `getState()` 都会返回一个带有 `meaningOfLife: 42` 字段的状态对象

先来看使用 `sayHiOnDispatch`。导入它，并传递给 `createStore`：

```js title="src/store.js"
import { createStore } from 'redux'
import rootReducer from './reducer'
import { sayHiOnDispatch } from './exampleAddons/enhancers'

const store = createStore(rootReducer, undefined, sayHiOnDispatch)

export default store
```

我们这里没有 `preloadedState`，所以第二参数传 `undefined`。

接着派发一个动作了解效果：

```js title="src/index.js"
import store from './store'

// highlight-start
console.log('Dispatching action')
store.dispatch({ type: 'todos/todoAdded', payload: 'Learn about actions' })
console.log('Dispatch complete')
// highlight-end
```

看看控制台，你会发现 `'Hi!'` 被打印在两条日志语句之间：

![sayHi store enhancer 日志](/img/tutorials/fundamentals/sayhi-enhancer-logging.png)

`sayHiOnDispatch` 用自己的 `dispatch` 函数包装了原始的 `store.dispatch`。当我们调用 `store.dispatch()`，实际执行的是这个包装函数，它调用原始 `dispatch` 后再打印“Hi”。

接下来试着添加第二个 enhancer。我们可以同时导入 `includeMeaningOfLife`，但问题来了。**`createStore` 作为第三个参数只接受一个 enhancer！** 如何同时传入两个 enhancer 呢？

此时我们需要一个合并多个 enhancer 的方法，生成一个组合 enhancer，然后传入。

幸运的是，**Redux 核心提供了[一个 `compose` 函数](../../api/compose.md)，可以合并多个 enhancer**。我们这样用：

```js title="src/store.js"
// highlight-next-line
import { createStore, compose } from 'redux'
import rootReducer from './reducer'
import {
  sayHiOnDispatch,
  includeMeaningOfLife
} from './exampleAddons/enhancers'

// highlight-next-line
const composedEnhancer = compose(sayHiOnDispatch, includeMeaningOfLife)

// highlight-next-line
const store = createStore(rootReducer, undefined, composedEnhancer)

export default store
```

然后运行看看：

```js title="src/index.js"
import store from './store'

store.dispatch({ type: 'todos/todoAdded', payload: 'Learn about actions' })
// log: 'Hi!'

console.log('State after dispatch: ', store.getState())
// log: {todos: [...], filters: {status, colors}, meaningOfLife: 42}
```

输出日志如下：

![meaningOfLife store enhancer 日志](/img/tutorials/fundamentals/meaningOfLife-enhancer-logging.png)

所以两个 enhancer 同时修改了 store 行为。`sayHiOnDispatch` 修改了 `dispatch`，`includeMeaningOfLife` 修改了 `getState`。

store enhancer 是非常强大的，可以深度定制 store，大多数 Redux 应用设置 store 时都会用到至少一个 enhancer。

:::tip

如果没有传入 `preloadedState`，也可以把 enhancer 作为第二参数传入：

```js
const store = createStore(rootReducer, storeEnhancer)
```

:::

## 中间件（Middleware）

增强器很强大，因为它们能覆盖或替换 store 的任意方法：`dispatch`、`getState` 和 `subscribe`。

不过很多时候，我们只想自定义 `dispatch` 的行为，希望在 `dispatch` 被调用时添加自定义逻辑。

Redux 使用一种特殊的插件称为**中间件（middleware）**来实现对 `dispatch` 的自定义。

如果你用过 Express 或 Koa 之类的库，可能已经熟悉中间件概念。这些框架中，中间件是放在请求和响应之间的代码，比如添加 CORS 头部、日志、压缩等。中间件的最大特性是它们可以串联组合，在一个项目中同时使用多个独立中间件。

Redux 中间件解决的是不同的问题，但理念类似。**Redux 中间件提供了一个第三方扩展点，介于派发动作和动作到达 reducer 之间。** 中间件可用于日志记录、崩溃报告、异步 API 调用、路由等。

先来看如何把中间件加入 store，再见识如何编写自定义中间件。

### 使用中间件

我们已经知道通过 store enhancer 可以自定义 store。Redux 中间件是基于 Redux 自带的一个特殊 store enhancer——**`applyMiddleware`** 实现的。

因为我们会用增强器，所以也可以使用中间件。以下示例使用了三个项目中包含的示例中间件：

```js title="src/store.js"
import { createStore, applyMiddleware } from 'redux'
import rootReducer from './reducer'
import { print1, print2, print3 } from './exampleAddons/middleware'

const middlewareEnhancer = applyMiddleware(print1, print2, print3)

// 没有 preloadedState，第二参数传 enhancer
const store = createStore(rootReducer, middlewareEnhancer)

export default store
```

这些中间件就是分别打印数字的函数。

派发动作时会怎样？

```js title="src/index.js"
import store from './store'

store.dispatch({ type: 'todos/todoAdded', payload: 'Learn about actions' })
// log: '1'
// log: '2'
// log: '3'
```

控制台输出：

![打印中间件日志](/img/tutorials/fundamentals/print-middleware-logging.png)

这是怎么做到的？

**中间件是包裹在 store 的 `dispatch` 方法外层的一条管线**。调用 `store.dispatch(action)`，实际执行的是管线中的第一个中间件。它可以对动作做任何处理。通常，中间件会检测动作类型，如果是它感兴趣的类型，就执行自定义逻辑，否则将动作传给下一个中间件。

与 reducer 不同的是，**中间件允许执行副作用代码**，包括定时器和其它异步逻辑。

此例中，动作依次经过：

1. `print1` 中间件（即 `store.dispatch`）
2. `print2` 中间件
3. `print3` 中间件
4. 原始的 `store.dispatch`
5. store 中的根 reducer

因为这些都是函数调用，所以调用栈会依次返回。因此 `print1` 是第一个运行的，也是最后完成的。

### 编写自定义中间件

你也可以编写自己的中间件。虽然没必要一直写自定义中间件，但中间件是向 Redux 应用添加特定行为的绝佳方式。

**Redux 中间件形态是一组嵌套的三层函数**。来看用 `function` 关键字写的例子，方便理解：

```js
// 使用 ES5 函数写的中间件

// 外层函数：
function exampleMiddleware(storeAPI) {
  return function wrapDispatch(next) {
    return function handleAction(action) {
      // 这里可以传递动作给 next(action),
      // 或调用 storeAPI.dispatch(action) 从管线起点重新开始，
      // 还可以使用 storeAPI.getState()

      return next(action)
    }
  }
}
```

解释这三层函数及参数：

- `exampleMiddleware`：外层函数即中间件本体，会被 `applyMiddleware` 调用，接收 `storeAPI`，包含 `{dispatch, getState}`。调用这个 `dispatch` 将动作送入中间件管线起点。此函数只调用一次。
- `wrapDispatch`：中间层函数参数是 `next`，表示管线中的下一个中间件函数。如果当前是最后一个中间件，则 `next` 是原始的 `store.dispatch`。调用 `next(action)` 把动作传给管线下一个。此函数也只调用一次。
- `handleAction`：内层函数接收当前 `action`，每次派发动作时都会调用。

:::tip

你可以给这三个函数起任意名字，但使用下面名字有助理解：

- 外层：`someCustomMiddleware`（你的中间件名）
- 中层：`wrapDispatch`
- 内层：`handleAction`

:::

用箭头函数也能写得更短，利用隐式返回：

```js
const anotherExampleMiddleware = storeAPI => next => action => {
  // 每次动作派发时这里执行

  return next(action)
}
```

依然是三层嵌套并返回函数，只是代码更简洁。

### 你的第一个自定义中间件

假如我们想给应用添加日志，打印每个动作和动作后状态：

:::info

这些示例中间件不属于实际 todo 应用，但你可以添加进项目看看效果。

:::

示例中间件：

```js
const loggerMiddleware = storeAPI => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', storeAPI.getState())
  return result
}
```

动作被派发时：

- `handleAction` 的第一条语句打印 'dispatching'
- 调用 `next(action)` 传给下一个中间件或真实的 `store.dispatch`
- reducer 运行，状态更新，`next` 返回
- 调用 `storeAPI.getState()` 查看新状态并打印
- 最后返回执行结果

任何中间件都能够返回任何值，而管线第一个中间件的返回值会成为调用 `store.dispatch()` 的返回结果。例如：

```js
const alwaysReturnHelloMiddleware = storeAPI => next => action => {
  const originalResult = next(action)
  // 忽略原始结果，返回其它值
  return 'Hello!'
}

const middlewareEnhancer = applyMiddleware(alwaysReturnHelloMiddleware)
const store = createStore(rootReducer, middlewareEnhancer)

const dispatchResult = store.dispatch({ type: 'some/action' })
console.log(dispatchResult)
// log: 'Hello!'
```

再尝试一个中间件，监听特定动作，并在延时后打印内容：

```js
const delayedMessageMiddleware = storeAPI => next => action => {
  if (action.type === 'todos/todoAdded') {
    setTimeout(() => {
      console.log('Added a new todo: ', action.payload)
    }, 1000)
  }

  return next(action)
}
```

此中间件监听“待办添加”动作，每次见到时设置 1 秒定时器，然后打印动作的有效载荷。

### 中间件的实际应用

中间件能对派发的动作做任何事：

- 打印日志
- 设置定时器
- 发起异步 API 调用
- 修改动作
- 暂停甚至阻止动作传递

以及你能想到的其他操作。

特别是，**中间件旨在执行副作用逻辑**。此外，**中间件还可以修改 `dispatch`，使它接受非普通动作对象**。这部分内容我们将在[第 6 部分：异步逻辑](./part-6-async-logic.md)中详细讲解。

## Redux DevTools

最后，还有一件重要的事要讲：配置 store。

**Redux 的设计初衷之一是方便理解状态随时间如何被改变**。因此，Redux 支持使用 **Redux DevTools** —— 一个展示动作历史、动作内容和状态变化的调试插件。

Redux DevTools UI 作为浏览器扩展提供，下载地址为 Chrome：[https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd?hl=en) 以及 Firefox：[https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)。如果还没安装，赶紧安装一下。

安装后打开浏览器开发者工具，你会看到多了个 “Redux” 标签。但它现在还没作用，需要先配置 store 让它能通信。

### 在 Store 中添加 DevTools 支持

安装扩展后，需要配置 store，添加 DevTools 增强器。官方文档（[Redux DevTools Extension docs](https://github.com/reduxjs/redux-devtools/tree/main/extension)）中配置方式略显复杂，但有个 NPM 包 `redux-devtools-extension` 能简化配置，它导出一个 `composeWithDevTools` 函数，替代 Redux 原来的 `compose`。

示例：

```js title="src/store.js"
import { createStore, applyMiddleware } from 'redux'
import { composeWithDevTools } from 'redux-devtools-extension'
import rootReducer from './reducer'
import { print1, print2, print3 } from './exampleAddons/middleware'

const composedEnhancer = composeWithDevTools(
  // EXAMPLE：这里添加你想用的中间件
  applyMiddleware(print1, print2, print3)
  // 其它 store 增强器，如果有的话
)

const store = createStore(rootReducer, composedEnhancer)
export default store
```

确保 `index.js` 在导入 store 后仍派发动作。打开浏览器 DevTools 里的 Redux 标签页，应该会看到类似下面界面：

![Redux DevTools 扩展：动作标签](/img/tutorials/fundamentals/devtools-action-tab.png)

左侧是派发动作列表。点击某个动作，右侧显示多个标签：

- 动作对象内容
- 运行 reducer 后完整状态
- 状态差异（diff）
- 开启时，调用 `store.dispatch()` 的代码堆栈跟踪

以下展示“State”和“Diff”标签页，执行 “add todo” 动作后：

![Redux DevTools 扩展：状态标签](/img/tutorials/fundamentals/devtools-state-tab.png)

![Redux DevTools 扩展：差异标签](/img/tutorials/fundamentals/devtools-diff-tab.png)

这些都是非常强大的工具，帮助我们调试应用，准确理解内部发生了什么。

## 你学到了什么

如你所见，store 是 Redux 应用的核心部分。store 包含状态，通过 reducer 处理动作，并且能够被定制以扩展额外功能。

来看我们示例应用此刻的样貌：

<iframe
  class="codesandbox"
  src="https://codesandbox.io/embed/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-2-storeSetup/?codemirror=1&fontsize=14&hidenavigation=1&theme=dark&module=%2Fsrc%2Fstore.js&runonclick=1"
  title="redux-fundamentals-example-app"
  allow="geolocation; microphone; camera; midi; vr; accelerometer; gyroscope; payment; ambient-light-sensor; encrypted-media; usb"
  sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
></iframe>

再来回顾本节内容：

:::tip 总结

- **Redux 应用始终只有一个 store**
  - 使用 Redux 的 `createStore` API 创建 store
  - 每个 store 有一个根 reducer 函数
- **store 有三个主要方法**
  - `getState` 返回当前状态
  - `dispatch` 派发动作给 reducer 更新状态
  - `subscribe` 注册监听器，每次动作派发时被调用
- **store enhancer 用于定制 store**
  - enhancer 包裹 store，可以覆盖 store 方法
  - `createStore` 只接受一个 enhancer 参数
  - 多个 enhancer 可以用 `compose` API 合并
- **中间件是定制 store 的主要方式**
  - 使用 `applyMiddleware` enhancer 添加中间件
  - 中间件由三层嵌套函数组成
  - 每次动作派发时都会执行中间件
  - 中间件中可以执行副作用
- **Redux DevTools 让你看到应用状态随时间变化**
  - 在浏览器安装 DevTools 扩展
  - store 需要用 `composeWithDevTools` 添加 DevTools enhancer
  - DevTools 显示派发动作和状态变化

:::

## 接下来？

我们现在有了一个能运行 reducer、并响应动作更新状态的 store。

然而，每个应用都需要 UI 来展示数据并让用户交互。在[第5部分：UI 和 React](./part-5-ui-and-react.md)中，我们将了解 Redux store 如何和 UI 配合，特别是在 React 中的应用。
