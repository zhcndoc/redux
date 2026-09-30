---
id: configuring-your-store
title: 配置你的商店
sidebar_label: 配置你的商店
---

# 配置你的商店

在["Redux 基础"教程](../tutorials/fundamentals/part-1-overview.md)中，我们通过构建一个示例Todo列表应用引入了Redux的基本概念。作为其中一部分，我们讨论了[如何创建和配置Redux商店](../tutorials/fundamentals/part-4-store.md)。

现在来看看如何自定义 store 以添加额外功能：middleware、store enhancer、预加载状态、DevTools 集成和热重载。示例基于教程中的待办事项应用，并假设它有 `todos` 和 `filters` slice reducer。

## 创建商店

Redux Toolkit 的 [`configureStore`](/toolkit/api/configureStore) 用于创建 store。它接受一个包含命名选项的对象，其中只有 `reducer` 是必填项：

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    filters: filtersReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

当 `reducer` 是由 slice reducer 组成的对象时，`configureStore` 会替你调用 `combineReducers`。你也可以直接传入一个根 reducer 函数。

接下来，将 store 传给组件树顶层的 React-Redux `Provider`，这样任何组件都可以通过 `useSelector` 和 `useDispatch` 访问它：

```tsx title="main.tsx"
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

即使不传入其他选项，`configureStore` 也会自动完成以下工作：

- 添加 [`redux-thunk` middleware](https://github.com/reduxjs/redux-thunk)，以便派发函数来处理异步逻辑。
- 在开发环境中添加 middleware，警告 state 或 action 中的[意外状态修改](/toolkit/api/immutabilityMiddleware)和[不可序列化值](/toolkit/api/serializabilityMiddleware)。
- 如果浏览器已安装 [Redux DevTools 扩展](https://github.com/reduxjs/redux-devtools/tree/main/extension)，则启用它。

本页其余部分将介绍如何添加或修改这些默认配置。

## 扩展Redux功能

大多数应用通过添加中间件或商店增强器来扩展Redux商店的功能（注：中间件较为常见，增强器较少见）。中间件为Redux的 `dispatch` 函数添加额外功能；增强器为Redux商店本身添加额外功能。

我们将添加一个 middleware 和一个 enhancer：

- 一个记录已派发 action 及其产生的新状态的 middleware。
- 一个记录 reducer 处理每个 action 所耗时间的 enhancer。

```ts title="app/middleware/logger.ts"
import { isAction, type Middleware } from '@reduxjs/toolkit'

export const loggerMiddleware: Middleware = store => next => action => {
  console.group(isAction(action) ? action.type : 'unknown action')
  console.info('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}
```

```ts title="app/enhancers/monitorReducer.ts"
import type { StoreEnhancer } from '@reduxjs/toolkit'

const round = (number: number) => Math.round(number * 100) / 100

export const monitorReducerEnhancer: StoreEnhancer =
  createStore => (reducer, preloadedState) => {
    const monitoredReducer: typeof reducer = (state, action) => {
      const start = performance.now()
      const newState = reducer(state, action)
      const end = performance.now()

      console.log('reducer process time:', round(end - start))

      return newState
    }

    return createStore(monitoredReducer, preloadedState)
  }
```

`configureStore` 接受 `middleware` 和 `enhancers` 选项。每个选项都是一个回调，会收到返回默认列表的函数，因此你可以保留默认配置并添加自己的项目：

```ts title="app/store.ts"
import { configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'
import { loggerMiddleware } from './middleware/logger'
import { monitorReducerEnhancer } from './enhancers/monitorReducer'

export const store = configureStore({
  reducer: {
    todos: todosReducer,
    filters: filtersReducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(loggerMiddleware),
  enhancers: getDefaultEnhancers =>
    getDefaultEnhancers().concat(monitorReducerEnhancer)
})
```

还有几点需要了解：

- 派发 action 时，middleware 会按数组顺序运行。`concat` 会将自定义 middleware 放在默认项之后，因此 logger 看到 action 时，thunk middleware 已经处理过 thunk 函数。使用 `prepend` 可以让它运行在默认项之前。
- `getDefaultMiddleware()` 和 `getDefaultEnhancers()` 接受选项，可关闭或调整各项默认配置。请参阅 [`getDefaultMiddleware`](/toolkit/api/getDefaultMiddleware) 和 [`getDefaultEnhancers`](/toolkit/api/getDefaultEnhancers) 文档。
- 如果返回的列表不包含默认项，默认配置就不会添加。这在少数情况下是你想要的结果，但通常应保留它们。在 TypeScript 中，如果不保留默认项，列表应使用 Redux Toolkit 的 `new Tuple(...)`，而不是普通数组，这样 store 的 `dispatch` 类型才能正确推断。

有时只希望在开发环境中添加某些 middleware。由于该回调是普通函数，可以使用 `if` 语句：

```ts
middleware: getDefaultMiddleware => {
  const middleware = getDefaultMiddleware()
  if (process.env.NODE_ENV !== 'production') {
    return middleware.concat(loggerMiddleware)
  }
  return middleware
}
```

## 其他选项 {#other-options}

`configureStore` 还接受两个常用选项：

- `preloadedState`：store 的初始状态，其优先级高于 reducer 自己的初始状态。服务器渲染应用会通过它将状态传给客户端，应用也会用它恢复持久化状态。请参阅[初始化状态](./structuring-reducers/InitializingState.md)。
- `devTools`：默认为 `true`。设置为 `false` 可关闭 DevTools 扩展集成；也可以传入[选项对象](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md)，为 store 实例命名、设置 trace 上限，或在将 action 和 state 发送给扩展前进行清理。

```ts
export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  devTools: {
    name: 'Todo app',
    trace: true
  }
})
```

## 热重载 {#hot-reloading}

热模块重载允许你在应用运行时更改 reducer，而无需重置 store 状态。打包器会替换为新模块，然后你调用 `store.replaceReducer` 并传入更新后的根 reducer。

使用 Vite 时：

```ts title="app/store.ts"
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import todosReducer from '../features/todos/todosSlice'
import filtersReducer from '../features/filters/filtersSlice'

const rootReducer = combineReducers({
  todos: todosReducer,
  filters: filtersReducer
})

export const store = configureStore({ reducer: rootReducer })

if (import.meta.hot) {
  import.meta.hot.accept(
    ['../features/todos/todosSlice', '../features/filters/filtersSlice'],
    () => store.replaceReducer(rootReducer)
  )
}
```

使用 webpack 时，检查方式为 `module.hot`，调用方式为 `module.hot.accept('./reducers', () => store.replaceReducer(rootReducer))`。

React 组件无需为此添加额外代码。Vite 和当前大多数 React 配置都使用 React Fast Refresh，可在原位置重新渲染已更改的组件。store 模块本身未改变，因此状态会保留。

## `configureStore` 的底层工作 {#what-configurestore-does-underneath}

`configureStore` is a wrapper around the Redux core APIs. This is roughly what it does:

```ts
import { applyMiddleware, createStore } from 'redux'
import { thunk } from 'redux-thunk'
import { composeWithDevTools } from '@redux-devtools/extension'

const middlewareEnhancer = applyMiddleware(thunk, loggerMiddleware)
const composedEnhancers = composeWithDevTools(
  middlewareEnhancer,
  monitorReducerEnhancer
)

const store = createStore(rootReducer, preloadedState, composedEnhancers)
```

`applyMiddleware` 会把 middleware 列表转换为单个 store enhancer。`createStore` 只接受一个 enhancer，因此需要先将多个 enhancer 组合成一个；`composeWithDevTools` 会完成这项工作，并将 store 连接到 DevTools 扩展。仅在开发环境运行的检查也是默认列表中的额外 middleware。

要了解这些部分的更多细节，请参阅[理解 Middleware](../understanding/history-and-design/middleware.md)，以及 [`createStore`](../api/createStore.md)、[`applyMiddleware`](../api/applyMiddleware.md) 和 [`compose`](../api/compose.md) 的 API 参考页面。

## 后续步骤

现在你已经了解了 store 的配置方式，可以查看完整的 [Redux Toolkit `configureStore` API](/toolkit/api/configureStore)、阅读[编写自定义 middleware](./WritingCustomMiddleware.md)，或进一步了解 [Redux 生态中的 DevTools 和调试工具](../introduction/Ecosystem.md#devtools-and-debugging)。
