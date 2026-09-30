---
id: ecosystem
title: 生态系统
description: '介绍 > 生态系统：链接到流行的、推荐的、有趣的 Redux 相关库'
---

# 生态系统

Redux 是一个小巧的库，但它的契约和 API 精心设计，催生了一个工具和扩展的生态系统，社区创建了各种有用的插件、库和工具。你不需要使用任何这些插件来使用 Redux，但它们可以帮助你更容易地实现功能和解决应用中的问题。

Redux 早期社区单独构建的大多数扩展，如今都已成为 [Redux Toolkit](/toolkit) 的一部分：store 配置、不可变更新、action creator、归一化实体管理、数据获取与缓存，以及响应式副作用。考虑第三方库之前，先确认 RTK 是否已能满足你的用例。

本页列出了 Redux 维护者当前推荐的扩展，以及少数仍在维护、使用广泛的社区库。更完整（也更旧）的目录请参阅 [Redux 生态系统链接](https://github.com/markerikson/redux-ecosystem-links)，但要注意其中大多数库自 2020 年以来就没有更新。

## 目录

- [Redux Toolkit](#redux-toolkit)
- [DevTools 与调试](#devtools-and-debugging)
- [副作用](#side-effects)
- [持久化与路由](#persistence-and-routing)
- [测试与工具](#testing-and-utilities)

## Redux Toolkit

**[reduxjs/redux-toolkit](https://github.com/reduxjs/redux-toolkit)** <br />
Redux 开发的官方工具集，内置最佳实践和所需功能，是编写 Redux 逻辑的标准方式。Redux Toolkit 包含：

- [`configureStore`](/toolkit/api/configureStore)：配置 store、添加 thunk middleware 和 DevTools 集成，并在开发模式下检查意外修改及不可序列化的值。
- [`createSlice`](/toolkit/api/createSlice)：根据 reducer 函数生成 action creator 和 action 类型，并内置 [Immer](https://immerjs.github.io/immer/) 以便使用“修改式”语法进行不可变更新。
- [`createAsyncThunk`](/toolkit/api/createAsyncThunk)：围绕异步函数派发 pending、fulfilled 和 rejected action。
- [`createEntityAdapter`](/toolkit/api/createEntityAdapter)：为 `{ ids, entities }` 归一化状态提供预构建的 reducer 和 selector。
- [`createListenerMiddleware`](/toolkit/api/createListenerMiddleware)：响应已派发的 action 或状态变化运行副作用。
- [RTK Query](/toolkit/rtk-query/overview)：根据 API 定义生成数据获取和缓存逻辑。
- [`combineSlices`](/toolkit/api/combineSlices) 和 [`createDynamicMiddleware`](/toolkit/api/createDynamicMiddleware)：支持代码拆分的 reducer 与 middleware 延迟加载。

**[reduxjs/react-redux](https://github.com/reduxjs/react-redux)** <br />
由 Redux 团队维护的官方 React 绑定库，提供 `useSelector`、`useDispatch` hooks 和 `<Provider>` 组件。

**[reduxjs/reselect](https://github.com/reduxjs/reselect)** <br />
用于创建可组合的记忆化 selector 函数，以便高效地从 store 状态派生数据。Redux Toolkit 也重新导出了该库。

```ts
const selectTax = createSelector(
  [selectSubtotal, selectTaxPercent],
  (subtotal, taxPercent) => subtotal * (taxPercent / 100)
)
```

**[dai-shi/proxy-memoize](https://github.com/dai-shi/proxy-memoize)** <br />
另一个 selector 库。它使用 Proxy 跟踪 selector 实际读取的状态部分，而不是声明输入 selector；只有这些状态部分发生变化时才会重新计算。

```ts
const selectTax = memoize(
  (state: RootState) => state.cart.subtotal * (state.cart.taxPercent / 100)
)
```

**[immerjs/immer](https://github.com/immerjs/immer)** <br />
通过 Proxy 使用普通的修改式代码执行不可变更新。`createSlice` 和 `createReducer` 内部使用了 Immer，它也可以单独使用。

```ts
const nextState = produce(baseState, draftState => {
  draftState.push({ todo: 'Tweet about it' })
  draftState[1].done = true
})
```

## DevTools 与调试 {#devtools-and-debugging}

**[Redux DevTools Extension](https://github.com/reduxjs/redux-devtools/tree/main/extension)** <br />
适用于 [Chrome](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)、[Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/) 和 [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei) 的浏览器扩展，可展示已派发的 action 和状态差异，并支持在状态历史中进行时间旅行。`configureStore` 会在开发环境自动启用与扩展的连接。

**[reduxjs/redux-devtools](https://github.com/reduxjs/redux-devtools)** <br />
该 monorepo 包含浏览器扩展和 `@redux-devtools/*` 包，包括独立的 Remote DevTools 应用，以及可用于构建自定义调试界面的页面内监视组件。

**[matt-oakes/redux-devtools-expo-dev-plugin](https://github.com/matt-oakes/redux-devtools-expo-dev-plugin)** <br />
Expo 开发工具插件，可在使用 Expo 构建的 React Native 应用中嵌入 Redux DevTools 界面。

**[infinitered/reactotron](https://github.com/infinitered/reactotron)** <br />
跨平台桌面应用，用于检查 React 和 React Native 应用，包括应用状态、API 请求、性能、错误、saga 和 action 派发。

**[EskiMojo14/use-reducer-devtools](https://github.com/EskiMojo14/use-reducer-devtools)** <br />
一个 `useReducer` 包装器，可将组件本地 reducer 状态连接到 Redux DevTools 扩展，并支持时间旅行调试。

## 副作用 {#side-effects}

Redux Toolkit 的 `configureStore` 默认添加 thunk middleware，RTK 还包含 `createAsyncThunk`、`createListenerMiddleware` 和 RTK Query。这些工具能满足大多数应用的需求。不同方案的比较请参阅[副作用处理方案](../usage/side-effects-approaches.mdx)，关于何时使用各工具的建议请参阅[风格指南](../style-guide/style-guide.md#use-thunks-and-listeners-for-other-async-logic)。

**[reduxjs/redux-thunk](https://github.com/reduxjs/redux-thunk)** <br />
派发函数时会调用 thunk，并将 `dispatch` 和 `getState` 作为参数传入。Redux Toolkit 已包含 thunk，`configureStore` 会默认启用；只有使用核心 `createStore` API 时，才需要单独安装。

**适用场景**：异步请求，以及任何需要访问 `dispatch` 或 `getState` 的逻辑的默认选择。请参阅[使用 thunk 编写逻辑](../usage/writing-logic-thunks.mdx)。

```ts
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const response = await client.get('/fakeApi/todos')
  return response.todos
})

export const addTodoIfAllowed =
  (todoText: string): AppThunk =>
  (dispatch, getState) => {
    if (selectTodoCount(getState()) < MAX_TODOS) {
      dispatch(todoAdded(todoText))
    }
  }
```

**[createListenerMiddleware (Redux Toolkit)](/toolkit/api/createListenerMiddleware)** <br />
轻量级的 saga 和 observable 替代方案。匹配的 action 派发后，listener 会运行 effect；effect 可以等待后续 action 或状态变化、取消自身以及启动子任务。

**适用场景**：“发生 X 时执行 Y”类逻辑、分析统计以及响应状态变化。

```ts
listenerMiddleware.startListening({
  matcher: isAnyOf(todoAdded, todoToggled, todoDeleted),
  effect: (action, listenerApi) => {
    const user = selectUserDetails(listenerApi.getState())
    analyticsApi.trackUsage(action.type, user)
  }
})
```

**[redux-saga/redux-saga](https://github.com/redux-saga/redux-saga)** <br />
使用看起来接近同步的 generator 函数处理异步逻辑。Saga 会返回 effect 描述，由 saga middleware 执行，并在 JavaScript 应用中充当“后台线程”。

**适用场景**：需要取消、防抖或协调多个并发任务的复杂异步工作流。

```js
function* fetchData(action) {
  const { someValue } = action
  try {
    const response = yield call(myAjaxLib.post, '/someEndpoint', {
      data: someValue
    })
    yield put({ type: 'REQUEST_SUCCEEDED', payload: response })
  } catch (error) {
    yield put({ type: 'REQUEST_FAILED', error: error })
  }
}
```

**[redux-observable/redux-observable](https://github.com/redux-observable/redux-observable)** <br />
使用称为“epic”的 RxJS observable 链处理异步逻辑。可以组合和取消异步 action，以实现副作用等功能。

**适用场景**：已经使用 RxJS、希望在 Redux 逻辑中沿用相同操作符的团队。

```js
const loginRequestEpic = action$ =>
  action$.pipe(
    ofType(LOGIN_REQUEST),
    mergeMap(({ payload: { username, password } }) =>
      from(postLogin(username, password)).pipe(
        map(loginSuccess),
        catchError(loginFailure)
      )
    )
  )
```

## 持久化与路由 {#persistence-and-routing}

**[zewish/redux-remember](https://github.com/zewish/redux-remember)** <br />
将 store 的指定部分保存到 `localStorage`、`AsyncStorage` 或你提供的存储驱动中，并在启动时重新载入。该库仍在积极维护，设计时考虑了 `configureStore` 的用法。

**[rt2zz/redux-persist](https://github.com/rt2zz/redux-persist)** <br />
持久化并重新载入 Redux store，提供多种可扩展选项。这是使用最广泛的持久化库，但**目前无人维护**：最近一次发布是 2019 年的 v6.0.0，未处理仍然开放的 issue 和 pull request。它仍能与当前 Redux 版本一起使用。如果是新项目，建议优先选择 `redux-remember`，或使用 listener middleware 和 `preloadedState` 编写简单的持久化层。

```ts
const persistConfig = { key: 'root', version: 1, storage }
const persistedReducer = persistReducer(persistConfig, rootReducer)
export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})
export const persistor = persistStore(store)
```

路由状态建议保留在路由器中，而不是复制到 Redux store。常见问题中关于[哪些状态适合放入 store](../faq/OrganizingState.md#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-usestate-or-usereducer)的经验法则也适用于此。曾列于此处的 `connected-react-router` 不支持 React Router v6，且已停止维护。如果仍需将 history 同步到 store，[salvoravida/redux-first-history](https://github.com/salvoravida/redux-first-history) 是一个仍在维护的选项。

## 测试与工具 {#testing-and-utilities}

测试 Redux 应用时，建议使用真实 store 渲染真实组件，而不是模拟 store，或孤立地测试 reducer 和 action creator。完整方法和示例配置请参阅[编写测试](../usage/WritingTests.mdx)。

**[testing-library/react-testing-library](https://github.com/testing-library/react-testing-library)** <br />
以用户的方式渲染组件并查询 DOM。[编写测试](../usage/WritingTests.mdx)页面展示了 `renderWithProviders` helper，它会用 Redux `<Provider>` 包装组件。

**[mswjs/msw](https://github.com/mswjs/msw)** <br />
Mock Service Worker：在网络层拦截请求，因此可以针对真实的响应测试 thunk 和 RTK Query endpoint，而无需修改应用代码。

**[jfairbank/redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan)** <br />
如果使用 redux-saga，可用此库对 saga 进行集成和单元测试。

**[EskiMojo14/history-adapter](https://github.com/EskiMojo14/history-adapter)** <br />
由 Redux 维护者 Ben Durrant 编写，为基于 Immer 的状态提供撤销/重做功能。`history-adapter/redux` 入口提供 `undo`、`redo` 和 `undoableReducer` helper，可直接与 `createSlice` 配合使用。

```ts
const counterAdapter = createHistoryAdapter<CounterState>({ limit: 10 })

const counterSlice = createSlice({
  name: 'counter',
  initialState: counterAdapter.getInitialState({ value: 0 }),
  reducers: {
    undo: counterAdapter.undo,
    redo: counterAdapter.redo,
    increment: counterAdapter.undoableReducer(state => {
      state.value += 1
    })
  }
})
```

**[omnidan/redux-undo](https://github.com/omnidan/redux-undo)** <br />
可为任意 reducer 添加撤销/重做和 action 历史的高阶 reducer。仓库已于 2026 年 1 月归档，不再维护，但软件包仍可使用；[实现撤销历史](../usage/ImplementingUndoHistory.md)页面也采用了它。

**[paularmstrong/normalizr](https://github.com/paularmstrong/normalizr)** <br />
根据 schema 定义，将嵌套的 API 响应归一化为扁平的 `{ entities, result }` 结构。该库已停止维护（仓库已归档），但仍可使用；当服务器返回深度嵌套的数据，而你希望将其存入使用 `createEntityAdapter` 的 slice 时，它仍然有用。请参阅[标准化 State 结构](../usage/structuring-reducers/NormalizingStateShape.md)。

**[EskiMojo14/use-rtk-slice](https://github.com/EskiMojo14/use-rtk-slice)** <br />
一个类似 `useReducer` 的 hook，可使用 `createSlice` 创建的 slice 管理组件本地状态，适用于逻辑适合采用 Redux 风格 reducer、但状态不应放入 store 的场景。

**[redux-utilities/reduce-reducers](https://github.com/redux-utilities/reduce-reducers)** <br />
提供同一层级 reducer 的顺序组合，适用于多个 reducer 需要依次处理相同状态的场景。请参阅[超越 `combineReducers`](../usage/structuring-reducers/BeyondCombineReducers.md)。

```js
const combinedReducer = combineReducers({ users, posts, comments })
const rootReducer = reduceReducers(combinedReducer, otherTopLevelFeatureReducer)
```

**[Flux Standard Action](https://github.com/redux-utilities/flux-standard-action)** <br />
A human-friendly standard for Flux action objects. Redux Toolkit's `createAction` and `createSlice` generate actions that follow this shape (`type`, `payload`, optional `meta` and `error`).
