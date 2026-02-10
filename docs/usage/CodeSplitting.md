---
id: code-splitting
title: 代码拆分
---

# 代码拆分

在大型 Web 应用中，通常希望将应用代码拆分成多个 JS 包，以便按需加载。这种策略称为“代码拆分”，通过减少必须获取的初始 JS 负载大小，帮助提高应用的性能。

要使用 Redux 实现代码拆分，我们需要能够动态地向 store 添加 reducers。然而，Redux 实际上只有一个根 reducer 函数。这个根 reducer 通常是在应用初始化时通过调用 `combineReducers()` 或类似函数生成的。为了动态添加更多 reducers，我们需要重新调用该函数来重新生成根 reducer。下面，我们讨论一些解决该问题的方法，并参考两个提供此功能的库。

## 基本原理

### 使用 `replaceReducer`

Redux store 提供了一个 `replaceReducer` 函数，用于用新的根 reducer 函数替换当前的活动根 reducer。调用它会替换内部的 reducer 函数引用，并派发一个动作来帮助新添加的 slice reducers 初始化自己：

```js
const newRootReducer = combineReducers({
  existingSlice: existingSliceReducer,
  newSlice: newSliceReducer
})

store.replaceReducer(newRootReducer)
```

## Reducer 注入方法

本节将介绍一些手写的方法来注入 reducers。

### 定义一个 `injectReducer` 函数

我们可能希望在应用的任何位置调用 `store.replaceReducer()`。因此，定义一个可复用的 `injectReducer()` 函数来保存所有现有的 slice reducers 的引用，并将其附加到 store 实例上，这非常有用。

```js
import { createStore } from 'redux'

// 定义应用中始终存在的 Reducers
const staticReducers = {
  users: usersReducer,
  posts: postsReducer
}

// 配置 store
export default function configureStore(initialState) {
  const store = createStore(createReducer(), initialState)

  // 新增字典以追踪已注册的异步 reducers
  store.asyncReducers = {}

  // 创建一个注入 reducer 的函数
  // 此函数添加异步 reducer，并创建一个新的组合 reducer
  store.injectReducer = (key, asyncReducer) => {
    store.asyncReducers[key] = asyncReducer
    store.replaceReducer(createReducer(store.asyncReducers))
  }

  // 返回修改后的 store
  return store
}

function createReducer(asyncReducers) {
  return combineReducers({
    ...staticReducers,
    ...asyncReducers
  })
}
```

现在，只需调用 `store.injectReducer` 即可向 store 添加新的 reducer。

### 使用“Reducer 管理器”

另一种方法是创建一个“Reducer 管理器”对象，它跟踪所有注册的 reducers 并暴露一个 `reduce()` 函数。请看以下示例：

```js
export function createReducerManager(initialReducers) {
  // 创建一个对象映射 key 到 reducers
  const reducers = { ...initialReducers }

  // 创建初始的 combinedReducer
  let combinedReducer = combineReducers(reducers)

  // 用于在删除 reducer 时删除状态键的数组
  let keysToRemove = []

  return {
    getReducerMap: () => reducers,

    // 这个对象暴露的根 reducer 函数
    // 将传递给 store
    reduce: (state, action) => {
      // 如果有 reducer 被移除，先清理它们的状态
      if (keysToRemove.length > 0) {
        state = { ...state }
        for (let key of keysToRemove) {
          delete state[key]
        }
        keysToRemove = []
      }

      // 委托给组合的 reducer
      return combinedReducer(state, action)
    },

    // 添加指定 key 的新 reducer
    add: (key, reducer) => {
      if (!key || reducers[key]) {
        return
      }

      // 添加 reducer 到映射中
      reducers[key] = reducer

      // 生成新的组合 reducer
      combinedReducer = combineReducers(reducers)
    },

    // 移除指定 key 的 reducer
    remove: key => {
      if (!key || !reducers[key]) {
        return
      }

      // 从映射中移除它
      delete reducers[key]

      // 把 key 添加到待清理列表
      keysToRemove.push(key)

      // 生成新的组合 reducer
      combinedReducer = combineReducers(reducers)
    }
  }
}

const staticReducers = {
  users: usersReducer,
  posts: postsReducer
}

export function configureStore(initialState) {
  const reducerManager = createReducerManager(staticReducers)

  // 使用管理器提供的根 reducer 函数创建 store
  const store = createStore(reducerManager.reduce, initialState)

  // 可选：将 reducer 管理器放到 store 上，方便访问
  store.reducerManager = reducerManager
}
```

现在要添加新 reducer，可以调用 `store.reducerManager.add("asyncState", asyncReducer)`。

要移除 reducer，可以调用 `store.reducerManager.remove("asyncState")`。

## Redux Toolkit

Redux Toolkit 2.0 包含一些实用工具，用于简化 reducers 和中间件的代码拆分，包括对 Typescript 的良好支持（这对于懒加载 reducers 和中间件是一个常见挑战）。

### `combineSlices`

[`combineSlices`](https://redux-toolkit.js.org/api/combineSlices) 实用工具旨在轻松实现 reducer 注入。它也取代了 `combineReducers`，可以用来将多个切片和 reducers 组合成一个根 reducer。

在设置时，它接受一组切片和 reducer 映射，返回附带注入方法的 reducer 实例。

:::note

`combineSlices` 的“切片”通常通过 `createSlice` 创建，但可以是任何带有 `reducerPath` 和 `reducer` 属性的“类似切片”的对象（意味着 RTK Query API 实例也兼容）。

```ts
const withUserReducer = rootReducer.inject({
  reducerPath: 'user',
  reducer: userReducer
})

const withApiReducer = rootReducer.inject(fooApi)
```

为简单起见，这里文档将 `{ reducerPath, reducer }` 的形状称作“切片”。

:::

切片将挂载在它们的 `reducerPath` 下，reducer 映射中的项目将挂载到各自的 key 下。

```ts
const rootReducer = combineSlices(counterSlice, baseApi, {
  user: userSlice.reducer,
  auth: authSlice.reducer
})
// 等同于
const rootReducer = combineReducers({
  [counterSlice.reducerPath]: counterSlice.reducer,
  [baseApi.reducerPath]: baseApi.reducer,
  user: userSlice.reducer,
  auth: authSlice.reducer
})
```

:::caution

注意避免命名冲突 —— 后面的 key 会覆盖前面的，但 Typescript 无法对此进行检测。

:::

#### 切片注入

要注入切片，应调用从 `combineSlices` 返回的 reducer 实例上的 `rootReducer.inject(slice)`。这会将切片注入到其 `reducerPath` 处，并返回已注入的组合 reducer 实例，类型知道该切片已注入。

或者，可以调用 `slice.injectInto(rootReducer)`，这会返回一个已知被注入的切片实例。甚至可能要同时调用两者，因为每个调用都会返回有用的内容，并且 `combineSlices` 允许在相同的 `reducerPath` 注入相同的 reducer 实例，且不会有问题。

```ts
const withCounterSlice = rootReducer.inject(counterSlice)
const injectedCounterSlice = counterSlice.injectInto(rootReducer)
```

与典型的 reducer 注入不同，`combineSlice` 的“元 reducer”方式不会调用 `replaceReducer`。传递给 store 的 reducer 实例不会改变。

因此，注入切片时不会派发动作，因此注入的切片状态不会立即出现在状态中。状态只会在派发动作时显示在 store 的状态中。

不过，为避免选择器必须处理可能的 `undefined` 状态，`combineSlices` 提供了一些有用的[选择器工具](#selector-utilities)。

#### 声明懒加载切片

为了让懒加载切片显示在推断的状态类型中，提供了 `withLazyLoadedSlices` 辅助函数。你可以声明想要以后注入的切片，使它们作为可选项显示在状态类型中。

要完全避免在组合 reducer 文件中导入懒加载切片，可以使用模块增强。

```ts
// 文件：reducer.ts
import { combineSlices } from '@reduxjs/toolkit'
import { staticSlice } from './staticSlice'

export interface LazyLoadedSlices {}

export const rootReducer =
  combineSlices(staticSlice).withLazyLoadedSlices<LazyLoadedSlices>()

// 文件：counterSlice.ts
import type { WithSlice } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { rootReducer } from './reducer'

interface CounterState {
  value: number
}

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 } as CounterState,
  reducers: {
    increment: state => void state.value++
  },
  selectors: {
    selectValue: state => state.value
  }
})

declare module './reducer' {
  // WithSlice 工具假设 reducer 位于 slice.reducerPath 下
  export interface LazyLoadedSlices extends WithSlice<typeof counterSlice> {}

  // 如果不是，可以用普通 key
  export interface LazyLoadedSlices {
    aCounter: CounterState
  }
}

const injectedCounterSlice = counterSlice.injectInto(rootReducer)
const injectedACounterSlice = counterSlice.injectInto(rootReducer, {
  reducerPath: 'aCounter'
})
```

#### 选择器工具

除了 `inject`，组合的 reducer 实例还有 `.selector` 方法用于包裹选择器。它将状态对象包装在一个 `Proxy` 中，并为已注入但尚未在状态中出现的 reducer 提供初始状态。

调用 `inject` 的结果类型会保证被注入的切片在调用选择器时总是已定义。

```ts
const selectCounterValue = (state: RootState) => state.counter?.value // number | undefined

const withCounterSlice = rootReducer.inject(counterSlice)
const selectCounterValue = withCounterSlice.selector(
  state => state.counter.value // number - 如果不在 store，则使用初始状态
)
```

切片的“注入”实例对于切片选择器也做同样的处理 —— 如果传入的状态未包含对应切片，则使用初始状态。

```ts
const injectedCounterSlice = counterSlice.injectInto(rootReducer)

console.log(counterSlice.selectors.selectValue({})) // 运行时错误
console.log(injectedCounterSlice.selectors.selectValue({})) // 0
```

#### 典型用法

`combineSlices` 设计为切片在需要时立即被注入（即从已加载组件导入选择器或动作时）。

因此，典型用法大致如下。

```ts
// 文件：reducer.ts
import { combineSlices } from '@reduxjs/toolkit'
import { staticSlice } from './staticSlice'

export interface LazyLoadedSlices {}

export const rootReducer =
  combineSlices(staticSlice).withLazyLoadedSlices<LazyLoadedSlices>()

// 文件：store.ts
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from './reducer'

export const store = configureStore({ reducer: rootReducer })

// 文件：counterSlice.ts
import type { WithSlice } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { rootReducer } from './reducer'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => void state.value++
  },
  selectors: {
    selectValue: state => state.value
  }
})

export const { increment } = counterSlice.actions

declare module './reducer' {
  export interface LazyLoadedSlices extends WithSlice<typeof counterSlice> {}
}

const injectedCounterSlice = counterSlice.injectInto(rootReducer)

export const { selectValue } = injectedCounterSlice.selectors

// 文件：Counter.tsx
// 通过从 counterSlice 导入，确保
// 注入在组件定义前发生
import { increment, selectValue } from './counterSlice'
import { useAppDispatch, useAppSelector } from './hooks'

export default function Counter() {
  const dispatch = usAppDispatch()
  const value = useAppSelector(selectValue)
  return (
    <>
      <p>{value}</p>
      <button onClick={() => dispatch(increment())}>递增</button>
    </>
  )
}

// 文件：App.tsx
import { Provider } from 'react-redux'
import { store } from './store'

// 懒加载组件意味着代码直到组件渲染时才加载和执行。
// 这意味着注入调用仅在 Counter 渲染后发生
const Counter = React.lazy(() => import('./Counter'))

function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  )
}
```

### `createDynamicMiddleware`

`createDynamicMiddleware` 实用工具创建一个“元中间件”，允许在 store 初始化后注入中间件。

```ts
import { createDynamicMiddleware, configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import reducer from './reducer'

const dynamicMiddleware = createDynamicMiddleware()

const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(dynamicMiddleware.middleware)
})

dynamicMiddleware.addMiddleware(logger)
```

#### `addMiddleware`

`addMiddleware` 会将中间件实例追加到由动态中间件实例处理的中间件链中。中间件按注入顺序应用，且通过函数引用存储（相同中间件无论注入多少次只应用一次）。

:::note

重要的是，所有注入的中间件都包含在**原始动态中间件实例内部**。

```ts
import { createDynamicMiddleware, configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import reducer from './reducer'

const dynamicMiddleware = createDynamicMiddleware()

const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(dynamicMiddleware.middleware)
})

dynamicMiddleware.addMiddleware(logger)

// 中间件链现在是 [thunk, logger]
```

如果想对顺序有更精细控制，可以使用多个实例。

```ts
import { createDynamicMiddleware, configureStore } from '@reduxjs/toolkit'
import logger from 'redux-logger'
import reducer from './reducer'

const beforeMiddleware = createDynamicMiddleware()
const afterMiddleware = createDynamicMiddleware()

const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .prepend(beforeMiddleware.middleware)
      .concat(afterMiddleware.middleware)
})

beforeMiddleware.addMiddleware(logger)
afterMiddleware.addMiddleware(logger)

// 中间件链现在是 [logger, thunk, logger]
```

:::

#### `withMiddleware`

`withMiddleware` 是一个动作创建函数，调度时会让中间件添加任何包括的中间件，并返回一个预类型化的 `dispatch`，带有任何添加的扩展。

```ts
const listenerDispatch = store.dispatch(
  withMiddleware(listenerMiddleware.middleware)
)

const unsubscribe = listenerDispatch(addListener({ actionCreator, effect }))
//    ^? () => void
```

这主要在非 React 场景下有用。对于 React，更适合使用[React 集成](#react-integration)。

#### React 集成

从 `@reduxjs/toolkit/react` 入口导入时，动态中间件实例将附加几个额外方法。

##### `createDispatchWithMiddlewareHook`

该方法调用 `addMiddleware`，并返回一个类型认识到已注入中间件的 `useDispatch` 版本。

```ts
import { createDynamicMiddleware } from '@reduxjs/toolkit/react'

const dynamicMiddleware = createDynamicMiddleware()

const useListenerDispatch = dynamicMiddleware.createDispatchWithMiddlewareHook(
  listenerMiddleware.middleware
)

function Component() {
  const dispatch = useListenerDispatch()

  useEffect(() => {
    const unsubscribe = dispatch(addListener({ actionCreator, effect }))
    return unsubscribe
  }, [dispatch])
}
```

:::caution

中间件在调用 `createDispatchWithMiddlewareHook` 时注入，**不是**在调用 `useDispatch` hook 时注入。

:::

##### `createDispatchWithMiddlewareHookFactory`

此方法接受一个 React context 实例，创建使用该 context 的 `createDispatchWithMiddlewareHook` 实例。（见[提供自定义 context](https://react-redux.js.org/using-react-redux/accessing-store#providing-custom-context)）

```ts
import { createContext } from 'react'
import { createDynamicMiddleware } from '@reduxjs/toolkit/react'
import type { ReactReduxContextValue } from 'react-redux'

const context = createContext<ReactReduxContextValue | null>(null)

const dynamicMiddleware = createDynamicMiddleware()

const createDispatchWithMiddlewareHook =
  dynamicMiddleware.createDispatchWithMiddlewareHookFactory(context)

const useListenerDispatch = createDispatchWithMiddlewareHook(
  listenerMiddleware.middleware
)

function Component() {
  const dispatch = useListenerDispatch()

  useEffect(() => {
    const unsubscribe = dispatch(addListener({ actionCreator, effect }))
    return unsubscribe
  }, [dispatch])
}
```

## 第三方库和框架

有一些很好的外部库可以帮助你自动实现上述功能：

- [Redux Ecosystem Links: Reducers - 动态 Reducer 注入](https://github.com/markerikson/redux-ecosystem-links/blob/master/reducers.md#dynamic-reducer-injection)