---
id: configuring-your-store
title: 配置你的商店
sidebar_label: 配置你的商店
---

# 配置你的商店

在["Redux 基础"教程](../tutorials/fundamentals/part-1-overview.md)中，我们通过构建一个示例Todo列表应用引入了Redux的基本概念。作为其中一部分，我们讨论了[如何创建和配置Redux商店](../tutorials/fundamentals/part-4-store.md)。

现在我们将探讨如何自定义商店以添加额外功能。我们将从["Redux 基础"第五部分：UI和React](../tutorials/fundamentals/part-5-ui-and-react.md)的源码开始。你可以在[Github上的示例应用仓库](https://github.com/reduxjs/redux-fundamentals-example-app/tree/checkpoint-5-uiAllActions)查看该教程阶段的源码，或者通过[CodeSandbox在线浏览](https://codesandbox.io/s/github/reduxjs/redux-fundamentals-example-app/tree/checkpoint-5-uiAllActions/)。

## 创建商店

首先，让我们看看最初创建商店的 `index.js` 文件：

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from './reducers'
import App from './components/App'

const store = createStore(rootReducer)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

在此代码中，我们将reducers传递给Redux的 `createStore` 函数，该函数返回一个 `store` 对象。然后，我们将该对象传给 `react-redux` 的 `Provider` 组件，该组件渲染在组件树的顶层。

这确保了当我们通过 `react-redux` 的 `connect` 连接Redux时，store对我们的组件可用。

## 扩展Redux功能

大多数应用通过添加中间件或商店增强器来扩展Redux商店的功能（注：中间件较为常见，增强器较少见）。中间件为Redux的 `dispatch` 函数添加额外功能；增强器为Redux商店本身添加额外功能。

我们将添加两种中间件和一种增强器：

- [`redux-thunk` 中间件](https://github.com/reduxjs/redux-thunk)，它允许简单的异步dispatch。
- 一个中间件，用来记录被dispatch的动作及由此产生的新状态。
- 一个增强器，用来记录reducers处理每个动作所花费的时间。

#### 安装 `redux-thunk`

```sh
npm install redux-thunk
```

#### middleware/logger.js

```js
const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

export default logger
```

#### enhancers/monitorReducer.js

```js
const round = number => Math.round(number * 100) / 100

const monitorReducerEnhancer =
  createStore => (reducer, initialState, enhancer) => {
    const monitoredReducer = (state, action) => {
      const start = performance.now()
      const newState = reducer(state, action)
      const end = performance.now()
      const diff = round(end - start)

      console.log('reducer process time:', diff)

      return newState
    }

    return createStore(monitoredReducer, initialState, enhancer)
  }

export default monitorReducerEnhancer
```

让我们把这些添加到现有的 `index.js` 中。

- 首先，我们需要导入 `redux-thunk` 以及我们的 `loggerMiddleware` 和 `monitorReducerEnhancer`，并导入Redux提供的两个额外函数：`applyMiddleware` 和 `compose`。
- 然后，我们使用 `applyMiddleware` 创建一个增强器，该增强器会将我们的 `loggerMiddleware` 和 `thunk` 中间件应用到商店的dispatch函数。
- 接着，我们用 `compose` 将新的 `middlewareEnhancer` 和 `monitorReducerEnhancer` 组合成一个函数。

  这样做是因为 `createStore` 只能接收一个增强器，要使用多个增强器，必须先将它们组合成一个更大的增强器，如本例所示。

- 最后，我们将新的 `composedEnhancers` 函数作为第三个参数传入 `createStore`。_注意：第二个参数（这里忽略了）允许你向商店预加载状态。_

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore, compose } from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import loggerMiddleware from './middleware/logger'
import monitorReducerEnhancer from './enhancers/monitorReducer'
import App from './components/App'

const middlewareEnhancer = applyMiddleware(loggerMiddleware, thunk)
const composedEnhancers = compose(middlewareEnhancer, monitorReducerEnhancer)

const store = createStore(rootReducer, undefined, composedEnhancers)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

## 这种方法的问题

虽然这段代码可用，但对于典型应用来说并不理想。

大多数应用会使用多个中间件，而且每个中间件通常都需要一些初始化设置。如此一来，`index.js` 会迅速变得杂乱难维护，因为逻辑没有很好地组织。

## 解决方案：`configureStore`

解决这个问题的方法是创建一个新的 `configureStore` 函数，把商店的创建逻辑封装起来，然后放在单独的文件中，方便扩展。

最终我们的 `index.js` 会变成这样：

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import configureStore from './configureStore'

const store = configureStore()

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

所有与配置商店相关的逻辑 —— 包括导入reducers、中间件和增强器 —— 都集中在专门的文件里处理。

为了实现这一点，`configureStore` 函数如下：

```js
import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware, thunk]
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer]
  const composedEnhancers = compose(...enhancers)

  const store = createStore(rootReducer, preloadedState, composedEnhancers)

  return store
}
```

这个函数遵循上面列出的步骤，不过将一些逻辑拆分出来以便扩展，这使得未来添加更多内容变得更简单：

- `middlewares` 和 `enhancers` 都定义为数组，跟使用它们的函数分开。

  这样我们可以根据不同条件方便地添加更多中间件或增强器。

  例如，在开发模式下常常只添加一些中间件，这时只需在 if 语句内向中间件数组添加：

  ```js
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(secretMiddleware)
  }
  ```

- 预加载状态 `preloadedState` 参数传递至 `createStore`，方便后续想预加载状态时使用。

这也让我们的 `createStore` 过程更易理解——每一步都清晰分离，更直观明了。

## 集成开发者工具扩展

另一个你可能想给应用加入的常见功能是 `redux-devtools-extension` 集成。

该扩展是Redux商店管理的强大工具套件，它允许你检查和重放动作，在不同的时间点探索状态，直接向商店派发动作，等等。[点击这里阅读更多功能详情。](https://github.com/reduxjs/redux-devtools/tree/main/extension)

集成扩展的方式有多种，我们将使用最方便的方案。

首先，通过 npm 安装该包：

```sh
npm install --save-dev redux-devtools-extension
```

接着，移除我们导入自 `redux` 的 `compose` 函数，改为导入自 `redux-devtools-extension` 的新函数 `composeWithDevTools`。

最终代码如下：

```js
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware, thunk]
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer]
  const composedEnhancers = composeWithDevTools(...enhancers)

  const store = createStore(rootReducer, preloadedState, composedEnhancers)

  return store
}
```

就这么简单！

现在，如果你在带有该扩展的浏览器中打开应用，就能使用强大的新工具进行探索和调试。

## 热重载

另一个强大的工具是热重载，它能让你在不重启整个应用的情况下替换代码片段。

例如，当你运行应用，操作一段时间后想修改某个reducer时，通常修改后应用会重启，导致Redux状态回到初始值。

启用热模块重载后，只有你修改的reducer会被重新加载，允许你修改代码时**不**重置状态，从而让开发过程更快更顺畅。

我们将同时为Redux reducers和React组件添加热重载。

首先，给 `configureStore` 函数添加热重载：

```js
import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureStore(preloadedState) {
  const middlewares = [loggerMiddleware, thunk]
  const middlewareEnhancer = applyMiddleware(...middlewares)

  const enhancers = [middlewareEnhancer, monitorReducersEnhancer]
  const composedEnhancers = compose(...enhancers)

  const store = createStore(rootReducer, preloadedState, composedEnhancers)

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
  }

  return store
}
```

新代码被包裹在 `if` 语句内，仅在非生产环境且支持模块热加载功能时执行。

Webpack 和 Parcel 等打包工具支持 `module.hot.accept` 方法，用于指定热重载模块以及模块变化时的处理，这里我们监听 `./reducers` 模块，并在变化时调用 `store.replaceReducer` 替换reducer。

我们会用相同模式给 `index.js` 添加组件热重载：

```js
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './components/App'
import configureStore from './configureStore'

const store = configureStore()

const renderApp = () =>
  render(
    <Provider store={store}>
      <App />
    </Provider>,
    document.getElementById('root')
  )

if (process.env.NODE_ENV !== 'production' && module.hot) {
  module.hot.accept('./components/App', renderApp)
}

renderApp()
```

这里唯一的额外改动是将应用渲染封装进了新的 `renderApp` 函数，以便重新渲染。

## 使用 Redux Toolkit 简化设置

Redux核心库设计上是不偏不倚的。它允许你自行决定如何处理一切，如商店配置、状态结构和reducer构建。

这有时候是好事，因为它提供了灵活性，但灵活性并非总是必须的。有时我们只想用最简单的方式快速入门，且有些良好的默认行为。

[Redux Toolkit](https://redux-toolkit.js.org/) 包旨在简化几个常见的Redux用例，包括商店配置。让我们看看它如何帮助简化商店配置流程。

Redux Toolkit包含一个预构建的[`configureStore`函数](https://redux-toolkit.js.org/api/configureStore)，类似之前示例中的版本。

最快的用法是直接传入根reducer函数：

```js
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducers'

const store = configureStore({
  reducer: rootReducer
})

export default store
```

注意这里接受的是一个带命名参数的对象，更清晰明了。

默认情况下，Redux Toolkit 的 `configureStore` 会：

- 使用[默认中间件列表，包括 `redux-thunk`](https://redux-toolkit.js.org/api/getDefaultMiddleware)，以及一些仅开发时启用的中间件，用于捕获状态变异等常见错误
- 调用 `composeWithDevTools` 来集成Redux开发者工具扩展

借助Redux Toolkit，热重载示例如下：

```js
import { configureStore } from '@reduxjs/toolkit'

import monitorReducersEnhancer from './enhancers/monitorReducers'
import loggerMiddleware from './middleware/logger'
import rootReducer from './reducers'

export default function configureAppStore(preloadedState) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware().prepend(loggerMiddleware),
    preloadedState,
    enhancers: [monitorReducersEnhancer]
  })

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))
  }

  return store
}
```

这无疑简化了部分配置过程。

## 后续步骤

现在你已了解如何封装store配置以便维护，可以[查看Redux Toolkit的 `configureStore` API](https://redux-toolkit.js.org/api/configureStore)，或者深入了解[Redux生态系统中可用的一些扩展](../introduction/Ecosystem.md#debuggers-and-viewers)。