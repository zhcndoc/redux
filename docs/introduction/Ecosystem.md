---
id: ecosystem
title: 生态系统
description: '介绍 > 生态系统：链接到流行的、推荐的、有趣的 Redux 相关库'
---

# 生态系统

Redux 是一个小巧的库，但它的契约和 API 精心设计，催生了一个工具和扩展的生态系统，社区创建了各种有用的插件、库和工具。你不需要使用任何这些插件来使用 Redux，但它们可以帮助你更容易地实现功能和解决应用中的问题。

想要查看与 Redux 相关的库、插件和工具的广泛目录，请查阅 [Redux Ecosystem Links](https://github.com/markerikson/redux-ecosystem-links) 列表。此外，[React/Redux Links](https://github.com/markerikson/react-redux-links) 列表包含了针对学习 React 或 Redux 的人有用的教程和其他资源。

本页列出了一些 Redux 维护者亲自审阅过，或在社区中被广泛采用的 Redux 相关插件。不要因为没在这里找到的插件而气馁！生态系统发展太快，我们没有足够时间覆盖所有内容。把这些看作是“官方精选”，如果你用 Redux 创造了很棒的东西，欢迎提交 PR。

## 目录

- [生态系统](#ecosystem)
  - [目录](#table-of-contents)
  - [库集成与绑定](#library-integration-and-bindings)
  - [Reducer](#reducers)
    - [Reducer 组合](#reducer-combination)
    - [Reducer 组合式](#reducer-composition)
    - [高阶 Reducer](#higher-order-reducers)
  - [动作](#actions)
  - [工具](#utilities)
  - [Store](#store)
    - [变更订阅](#change-subscriptions)
    - [批处理](#batching)
    - [持久化](#persistence)
  - [不可变数据](#immutable-data)
    - [数据结构](#data-structures)
    - [不可变更新工具](#immutable-update-utilities)
    - [不可变/Redux 互操作](#immutableredux-interop)
  - [副作用](#side-effects)
    - [广泛使用](#widely-used)
    - [Promises](#promises)
  - [中间件](#middleware)
    - [网络与 Socket](#networks-and-sockets)
    - [异步行为](#async-behavior)
    - [分析](#analytics)
  - [实体与集合](#entities-and-collections)
  - [组件状态与封装](#component-state-and-encapsulation)
  - [开发工具](#dev-tools)
    - [调试器与查看器](#debuggers-and-viewers)
    - [DevTools 监视器](#devtools-monitors)
    - [日志记录](#logging)
    - [变异检测](#mutation-detection)
  - [测试](#testing)
  - [路由](#routing)
  - [表单](#forms)
  - [更高级的抽象](#higher-level-abstractions)
  - [社区约定](#community-conventions)

## 库集成与绑定

**[reduxjs/react-redux](https://github.com/reduxjs/react-redux)** <br />
Redux 官方的 React 绑定，由 Redux 团队维护

**[angular-redux/ng-redux](https://github.com/angular-redux/ng-redux)** <br />
Angular 1 绑定 Redux

**[ember-redux/ember-redux](https://github.com/ember-redux/ember-redux)** <br />
Ember 绑定 Redux

**[glimmer-redux/glimmer-redux](https://github.com/glimmer-redux/glimmer-redux)** <br />
适用于 Ember 的 Glimmer 组件引擎的 Redux 绑定

**[tur-nr/polymer-redux](https://github.com/tur-nr/polymer-redux)** <br />
Redux 绑定 Polymer

**[lastmjs/redux-store-element](https://github.com/lastmjs/redux-store-element)** <br />
Redux 绑定自定义元素

## Reducer

#### Reducer 组合

**[ryo33/combineSectionReducers](https://gitlab.com/ryo33/combine-section-reducers)** <br />
`combineReducers` 的增强版本，允许传递 `state` 作为第三参数给所有切片 reducers。

**[KodersLab/topologically-combine-reducers](https://github.com/KodersLab/topologically-combine-reducers)** <br />
一种变体 `combineReducers`，允许运行切片之间的依赖关系定义，用于排序和数据传递

```js
var masterReducer = topologicallyCombineReducers(
  { auth, users, todos },
  // 定义依赖树
  { auth: ['users'], todos: ['auth'] }
)
```

#### Reducer 组合式

**[acdlite/reduce-reducers](https://github.com/acdlite/reduce-reducers)** <br />
提供同级 reducer 的顺序组合

```js
const combinedReducer = combineReducers({ users, posts, comments })
const rootReducer = reduceReducers(combinedReducer, otherTopLevelFeatureReducer)
```

**[mhelmer/redux-xforms](https://github.com/mhelmer/redux-xforms)** <br />
一组可组合的 reducer 转换器集合

```js
const createByFilter = (predicate, mapActionToKey) =>
  compose(
    withInitialState({}), // 注入初始状态 {}
    withFilter(predicate), // 仅通过 action 具备 filterName 时
    updateSlice(mapActionToKey), // 更新状态中单个键
    isolateSlice(mapActionToKey) // 在单个状态切片上运行 reducer
  )
```

**[adrienjt/redux-data-structures](https://github.com/adrienjt/redux-data-structures)** <br />
通用数据结构的 reducer 工厂函数：计数器，MAP，列表（队列，栈），集合等

```js
const myCounter = counter({
  incrementActionTypes: ['INCREMENT'],
  decrementActionTypes: ['DECREMENT']
})
```

#### 高阶 Reducer

**[omnidan/redux-undo](https://github.com/omnidan/redux-undo)** <br />
轻松实现撤销/重做以及动作历史管理

**[omnidan/redux-ignore](https://github.com/omnidan/redux-ignore)** <br />
通过数组或过滤函数忽略 Redux 动作

**[omnidan/redux-recycle](https://github.com/omnidan/redux-recycle)** <br />
在特定动作时重置 Redux 状态

**[ForbesLindesay/redux-optimist](https://github.com/ForbesLindesay/redux-optimist)** <br />
用于启用类型无关乐观更新的 reducer 增强器

## 工具

**[reduxjs/reselect](https://github.com/reduxjs/reselect)** <br />
创建可组合的备忘选择器函数，用于高效派生 store 状态数据

```js
const taxSelector = createSelector(
  [subtotalSelector, taxPercentSelector],
  (subtotal, taxPercent) => subtotal * (taxPercent / 100)
)
```

**[paularmstrong/normalizr](https://github.com/paularmstrong/normalizr)** <br />
根据 schema 标准化嵌套 JSON

```js
const user = new schema.Entity('users')
const comment = new schema.Entity('comments', { commenter: user })
const article = new schema.Entity('articles', {
  author: user,
  comments: [comment]
})
const normalizedData = normalize(originalData, article)
```

**[planttheidea/selectorator](https://github.com/planttheidea/selectorator)** <br />
在 Reselect 之上提供通用选择器用例的抽象

```js
const getBarBaz = createSelector(
  ['foo.bar', 'baz'],
  (bar, baz) => `${bar} ${baz}`
)
getBarBaz({ foo: { bar: 'a' }, baz: 'b' }) // "a b"
```

## Store

#### 变更订阅

**[jprichardson/redux-watch](https://github.com/jprichardson/redux-watch)** <br />
基于关键路径或选择器监听状态变化

```js
let w = watch(() => mySelector(store.getState()))
store.subscribe(
  w((newVal, oldVal) => {
    console.log(newval, oldVal)
  })
)
```

**[ashaffer/redux-subscribe](https://github.com/ashaffer/redux-subscribe)** <br />
基于路径的集中式状态变更订阅

```js
store.dispatch( subscribe("users.byId.abcd", "subscription1", () => {} );
```

#### 批处理

**[tappleby/redux-batched-subscribe](https://github.com/tappleby/redux-batched-subscribe)** <br />
可以防抖订阅通知的 store 增强器

```js
const debounceNotify = _.debounce(notify => notify())
const store = configureStore({
  reducer,
  enhancers: [batchedSubscribe(debounceNotify)]
})
```

**[manaflair/redux-batch](https://github.com/manaflair/redux-batch)** <br />
允许派发动作数组的 store 增强器

```js
const store = configureStore({
  reducer,
  enhancers: existingEnhancersArray => [
    reduxBatch,
    ...existingEnhancersArray,
    reduxBatch
  ]
})
store.dispatch([{ type: 'INCREMENT' }, { type: 'INCREMENT' }])
```

**[laysent/redux-batch-actions-enhancer](https://github.com/laysent/redux-batch-actions-enhancer)** <br />
接受批量动作的 store 增强器

```js
const store = configureStore({ reducer, enhancers: [batch().enhancer] })
store.dispatch(createAction({ type: 'INCREMENT' }, { type: 'INCREMENT' }))
```

**[tshelburne/redux-batched-actions](https://github.com/tshelburne/redux-batched-actions)** <br />
处理批量动作的高阶 reducer

```js
const store = configureStore({ reducer: enableBatching(rootReducer) })
store.dispatch(batchActions([{ type: 'INCREMENT' }, { type: 'INCREMENT' }]))
```

#### 持久化

**[rt2zz/redux-persist](https://github.com/rt2zz/redux-persist)** <br />
持久化并重新加载 Redux store，提供丰富的可扩展选项

```js
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

**[react-stack/redux-storage](https://github.com/react-stack/redux-storage)** <br />
为 Redux 提供具有灵活后端的持久化层

```js
const reducer = storage.reducer(combineReducers(reducers))
const engine = createEngineLocalStorage('my-save-key')
const storageMiddleware = storage.createMiddleware(engine)
const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware.concat(storageMiddleware)
})
```

**[redux-offline/redux-offline](https://github.com/redux-offline/redux-offline)** <br />
支持乐观 UI 的断网优先应用的持久化 store

```js
const store = configureStore({ reducer, enhancer: [offline(offlineConfig)] })
store.dispatch({
  type: 'FOLLOW_USER_REQUEST',
  meta: { offline: { effect: {}, commit: {}, rollback: {} } }
})
```

## 不可变数据

**[ImmerJS/immer](https://github.com/immerjs/immer)** <br />
使用 Proxy 实现普通命令式代码的不可变更新

```js
const nextState = produce(baseState, draftState => {
  draftState.push({ todo: 'Tweet about it' })
  draftState[1].done = true
})
```

## 副作用

#### 广泛使用

**[reduxjs/redux-thunk](https://github.com/reduxjs/redux-thunk)** <br />
允许派发函数，此函数被调用时接收 `dispatch` 和 `getState` 作为参数，作为 AJAX 请求和其他异步行为的突破口。

**适合**：入门，简单异步和复杂同步逻辑。

```js
function fetchData(someValue) {
    return (dispatch, getState) => {
        dispatch({type : "REQUEST_STARTED"});

        myAjaxLib.post("/someEndpoint", {data : someValue})
            .then(response => dispatch({type : "REQUEST_SUCCEEDED", payload : response}))
            .catch(error => dispatch({type : "REQUEST_FAILED", error : error}));
    };
}

function addTodosIfAllowed(todoText) {
    return (dispatch, getState) => {
        const state = getState();

        if(state.todos.length < MAX_TODOS) {
            dispatch({type : "ADD_TODO", text : todoText});
        }
    }
}
```

**[listenerMiddleware (Redux Toolkit)](https://redux-toolkit.js.org/api/createListenerMiddleware)** <br />
listenerMiddleware 是 Redux 常用异步中间件（sagas 和 observables）的轻量替代方案。与 thunk 的复杂度和概念类似，可用于模拟一些常见 saga 使用模式。

```js
listenerMiddleware.startListening({
  matcher: isAnyOf(action1, action2, action3),
  effect: (action, listenerApi) => {
    const user = selectUserDetails(listenerApi.getState())

    const { specialData } = action.meta

    analyticsApi.trackUsage(action.type, user, specialData)
  }
})
```

**[redux-saga/redux-saga](https://github.com/redux-saga/redux-saga)** <br />
使用看起来是同步的 generator 函数处理异步逻辑。Saga 返回效果描述，Saga 中间件执行这些效果，类似 JS 应用的“后台线程”。

**适合**：复杂异步逻辑，解耦流程

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

function* addTodosIfAllowed(action) {
  const { todoText } = action
  const todos = yield select(state => state.todos)

  if (todos.length < MAX_TODOS) {
    yield put({ type: 'ADD_TODO', text: todoText })
  }
}
```

**[redux-observable/redux-observable](https://github.com/redux-observable/redux-observable)**

使用 RxJS 可观察者链（称为“epics”）处理异步逻辑。组合和取消异步动作以创建副作用等。

**适合**：复杂异步逻辑，解耦流程

```js
const loginRequestEpic = action$ =>
  action$
    .ofType(LOGIN_REQUEST)
    .mergeMap(({ payload: { username, password } }) =>
      Observable.from(postLogin(username, password))
        .map(loginSuccess)
        .catch(loginFailure)
    )

const loginSuccessfulEpic = action$ =>
  action$
    .ofType(LOGIN_SUCCESS)
    .delay(2000)
    .mergeMap(({ payload: { msg } }) => showMessage(msg))

const rootEpic = combineEpics(loginRequestEpic, loginSuccessfulEpic)
```

**[redux-loop/redux-loop](https://github.com/redux-loop/redux-loop)**

将 Elm 架构移植到 Redux，通过从 reducer 返回副作用描述自然且纯粹地连续执行副作用。Reducer 现在返回状态和副作用描述两部分。

**适合**：尽可能在 Redux+JS 中模拟 Elm

```js
export const reducer = (state = {}, action) => {
  switch (action.type) {
    case ActionType.LOGIN_REQUEST:
      const { username, password } = action.payload
      return loop(
        { pending: true },
        Effect.promise(loginPromise, username, password)
      )
    case ActionType.LOGIN_SUCCESS:
      const { user, msg } = action.payload
      return loop(
        { pending: false, user },
        Effect.promise(delayMessagePromise, msg, 2000)
      )
    case ActionType.LOGIN_FAILURE:
      return { pending: false, err: action.payload }
    default:
      return state
  }
}
```

**[jeffbski/redux-logic](https://github.com/jeffbski/redux-logic)**

基于 observables 的副作用库，也支持回调、promise、async/await、观察者。提供声明式的动作处理。

**适合**：高度解耦的异步逻辑

```js
const loginLogic = createLogic({
  type: Actions.LOGIN_REQUEST,

  process({ getState, action }, dispatch, done) {
    const { username, password } = action.payload

    postLogin(username, password)
      .then(
        ({ user, msg }) => {
          dispatch(loginSucceeded(user))

          setTimeout(() => dispatch(showMessage(msg)), 2000)
        },
        err => dispatch(loginFailure(err))
      )
      .then(done)
  }
})
```

#### Promises

**[acdlite/redux-promise](https://github.com/acdlite/redux-promise)** <br />
将 Promise 作为动作载荷派发，并在 Promise 解决或拒绝时派发 FSA 规范的动作。

```js
dispatch({ type: 'FETCH_DATA', payload: myAjaxLib.get('/data') })
// 如果成功，将派发 {type : "FETCH_DATA", payload : response}，
// 如果失败，将派发 {type : "FETCH_DATA", payload : error, error : true}
```

**[lelandrichardson/redux-pack](https://github.com/lelandrichardson/redux-pack)** <br />
合理的、声明式、基于约定的 Promise 处理，引导用户走向好方式而不暴露全部 dispatch 威力。

```js
dispatch({type : "FETCH_DATA", payload : myAjaxLib.get("/data") });

// reducer 中：
        case "FETCH_DATA": =
            return handle(state, action, {
                start: prevState => ({
                  ...prevState,
                  isLoading: true,
                  fooError: null
                }),
                finish: prevState => ({ ...prevState, isLoading: false }),
                failure: prevState => ({ ...prevState, fooError: payload }),
                success: prevState => ({ ...prevState, foo: payload }),
            });
```

## 中间件

#### 网络与 Socket

**[svrcekmichal/redux-axios-middleware](https://github.com/svrcekmichal/redux-axios-middleware)** <br />
使用 Axios 拉取数据并派发 start/success/fail 动作

```js
export const loadCategories = () => ({ type: 'LOAD', payload: { request : { url: '/categories'} } });
```

**[agraboso/redux-api-middleware](https://github.com/agraboso/redux-api-middleware)** <br />
读取 API 调用动作，发起请求并派发 FSA 动作

```js
const fetchUsers = () => ({
  [CALL_API]: {
    endpoint: 'http://www.example.com/api/users',
    method: 'GET',
    types: ['REQUEST', 'SUCCESS', 'FAILURE']
  }
})
```

**[itaylor/redux-socket.io](https://github.com/itaylor/redux-socket.io)** <br />
一款针对 socket.io 与 Redux 连接的约定方案。

```js
const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware.concat(socketIoMiddleware)
})
store.dispatch({ type: 'server/hello', data: 'Hello!' })
```

**[tiberiuc/redux-react-firebase](https://github.com/tiberiuc/redux-react-firebase)** <br />
Firebase、React 和 Redux 的集成

#### 异步行为

**[rt2zz/redux-action-buffer](https://github.com/rt2zz/redux-action-buffer)** <br />
将所有动作缓冲到队列，直到满足中断条件后释放队列

**[wyze/redux-debounce](https://github.com/wyze/redux-debounce)** <br />
符合 FSA 的动作防抖中间件

**[mathieudutour/redux-queue-offline](https://github.com/mathieudutour/redux-queue-offline)** <br />
离线时排队动作，网络恢复时派发

#### 分析

**[rangle/redux-beacon](https://github.com/rangle/redux-beacon)** <br />
支持任何分析服务，可离线跟踪，解耦分析逻辑与应用逻辑

**[markdalgleish/redux-analytics](https://github.com/markdalgleish/redux-analytics)** <br />
监控带有 meta analytics 值的 Flux 标准动作，并进行处理

## 实体与集合

**[tommikaikkonen/redux-orm](https://github.com/tommikaikkonen/redux-orm)** <br />
用于管理 Redux store 中关系数据的简单不可变 ORM。

**[Versent/redux-crud](https://github.com/Versent/redux-crud)** <br />
基于约定的 CRUD 逻辑动作和 reducer

**[kwelch/entities-reducer](https://github.com/kwelch/entities-reducer)** <br />
处理 Normalizr 数据的高阶 reducer

**[amplitude/redux-query](https://github.com/amplitude/redux-query)** <br />
在组件中声明共存的数据依赖，组件挂载时运行查询，实现乐观更新，并通过 Redux 动作触发服务器变更。

**[cantierecreativo/redux-bees](https://github.com/cantierecreativo/redux-bees)** <br />
声明式 JSON-API 交互，支持数据标准化，带 React 高阶组件实现查询运行

**[GetAmbassador/redux-clerk](https://github.com/GetAmbassador/redux-clerk)** <br />
支持正规化、乐观更新、同步/异步动作创建器、选择器及可扩展 reducer 的异步 CRUD 处理。

**[shoutem/redux-io](https://github.com/shoutem/redux-io)** <br />
JSON-API 抽象，支持异步 CRUD、规范化、乐观更新、缓存、数据状态和错误处理。

**[jmeas/redux-resource](https://github.com/jmeas/redux-resource)** <br />
一个微型但强大的资源管理系统，管理持久化到远程服务器的数据。

## 组件状态与封装

**[threepointone/redux-react-local](https://github.com/threepointone/redux-react-local)** <br />
在 Redux 中实现组件本地状态，并处理组件动作

```js
@local({
  ident: 'counter', initial: 0, reducer : (state, action) => action.me ? state + 1 : state }
})
class Counter extends React.Component {
```

**[epeli/lean-redux](https://github.com/epeli/lean-redux)** <br />
使在 Redux 中的组件状态操作同样简单如调用 setState

```js
const DynamicCounters = connectLean(
    scope: "dynamicCounters",
    getInitialState() => ({counterCount : 1}),
    addCounter, removeCounter
)(CounterList);
```

**[DataDog/redux-doghouse](https://github.com/DataDog/redux-doghouse)** <br />
通过构建针对组件实例作用域的动作和 reducer，致力于让可复用组件更容易使用 Redux。

```js
const scopeableActions = new ScopedActionFactory(actionCreators)
const actionCreatorsScopedToA = scopeableActions.scope('a')
actionCreatorsScopedToA.foo('bar') //{ type: SET_FOO, value: 'bar', scopeID: 'a' }

const boundScopeableActions = bindScopedActionFactories(
  scopeableActions,
  store.dispatch
)
const scopedReducers = scopeReducers(reducers)
```

## 开发工具

#### 调试器与查看器

**[reduxjs/redux-devtools](https://github.com/reduxjs/redux-devtools)**

Dan Abramov 的原始 Redux DevTools 实现，支持应用内状态显示和时间旅行调试

**[zalmoxisus/redux-devtools-extension](https://github.com/zalmoxisus/redux-devtools-extension)**

Mihail Diordiev 的浏览器扩展，捆绑多个状态监视视图，并与浏览器开发工具集成

**[infinitered/reactotron](https://github.com/infinitered/reactotron)**

跨平台 Electron 应用，用于检查 React 和 React Native 应用，包括应用状态、API 请求、性能、错误、sagas、动作派发。

#### DevTools 监视器

**[Log Monitor](https://github.com/reduxjs/redux-devtools/tree/master/packages/redux-devtools-log-monitor)** <br />
Redux DevTools 的默认监视器，带有树形视图

**[Dock Monitor](https://github.com/reduxjs/redux-devtools/tree/master/packages/redux-devtools-dock-monitor)** <br />
Redux DevTools 监视器的可调整大小和可移动停靠窗口

**[Slider Monitor](https://github.com/calesce/redux-slider-monitor)** <br />
Redux DevTools 的自定义监视器，用于重放记录的 Redux 动作

**[Diff Monitor](https://github.com/whetstone/redux-devtools-diff-monitor)** <br />
Redux DevTools 的监视器，比较动作间的 Redux store 变化

**[Filterable Log Monitor](https://github.com/bvaughn/redux-devtools-filterable-log-monitor/)** <br />
支持过滤的树形视图 Redux DevTools 监视器

**[Filter Actions](https://github.com/zalmoxisus/redux-devtools-filter-actions)** <br />
带动作过滤功能的 Redux DevTools 组合监视器

#### 日志记录

**[evgenyrodionov/redux-logger](https://github.com/evgenyrodionov/redux-logger)** <br />
日志中间件，显示动作、状态及其差异

**[inakianduaga/redux-state-history](https://github.com/inakianduaga/redux-state-history)** <br />
增强器，提供时间旅行和高效动作记录功能，包括动作日志的导入/导出和回放。

**[joshwcomeau/redux-vcr](https://github.com/joshwcomeau/redux-vcr)** <br />
实时记录和回放用户会话

**[socialtables/redux-unhandled-action](https://github.com/socialtables/redux-unhandled-action)** <br />
开发时警告未引发状态变化的动作

#### 变异检测

**[leoasis/redux-immutable-state-invariant](https://github.com/leoasis/redux-immutable-state-invariant)** <br />
中间件，当尝试在 dispatch 内或 dispatch 之间修改状态时抛错

**[flexport/mutation-sentinel](https://github.com/flexport/mutation-sentinel)** <br />
帮助运行时深度检测变异并强制代码中不可变性

**[mmahalwy/redux-pure-connect](https://github.com/mmahalwy/redux-pure-connect)** <br />
检查并记录 react-redux 的 connect 是否传入了产生不纯属性的 `mapState` 函数

## 测试

**[arnaudbenard/redux-mock-store](https://github.com/arnaudbenard/redux-mock-store)** <br />
一个 mock store，保存已派发动作用于断言

**[Workable/redux-test-belt](https://github.com/Workable/redux-test-belt)** <br />
扩展 store API，便于断言、隔离和操作 store

**[conorhastings/redux-test-recorder](https://github.com/conorhastings/redux-test-recorder)** <br />
中间件，根据应用中的动作自动生成 reducer 测试

**[wix/redux-testkit](https://github.com/wix/redux-testkit)** <br />
用于测试 Redux 项目（reducer、选择器、动作、thunk）的完整且有指导的测试工具包

**[jfairbank/redux-saga-test-plan](https://github.com/jfairbank/redux-saga-test-plan)** <br />
让 saga 的集成和单元测试变得轻松

## 路由

**[supasate/connected-react-router](https://github.com/supasate/connected-react-router)**
同步 React Router v4+ 状态与 Redux store。

**[faceyspacey/redux-first-router](https://github.com/faceyspacey/redux-first-router)** <br />
无缝的 Redux 优先路由。将应用视为状态而非路由和组件，同时保持地址栏同步。所有一切皆为状态。连接组件，并只需派发 Flux 标准动作。

## 表单

**[erikras/redux-form](https://github.com/erikras/redux-form)** <br />
功能完善的库，使 React HTML 表单状态存储于 Redux。

**[davidkpiano/react-redux-form](https://github.com/davidkpiano/react-redux-form)** <br />
React Redux Form 是一组 reducer 创建器和动作创建器，使得利用 React 和 Redux 实现复杂且自定义的表单既简单又高效。

## 更高级的抽象

**[keajs/kea](https://github.com/keajs/kea)** <br />
Redux、Redux-Saga 和 Reselect 之上的抽象，提供应用动作、reducer、选择器和 saga 的框架。赋能 Redux，使其使用如同 setState，减少模板代码和冗余，同时保持可组合性。

**[TheComfyChair/redux-scc](https://github.com/TheComfyChair/redux-scc)** <br />
采用定义结构，并使用“行为”创建一套动作、reducer 响应和选择器。

**[Bloomca/redux-tiles](https://github.com/Bloomca/redux-tiles)** <br />
在 Redux 之上提供轻量抽象，方便组合，便于异步请求和合理的可测试性。

## 社区约定

**[Flux Standard Action](https://github.com/acdlite/flux-standard-action)** <br />
针对 Flux 动作对象的友好标准

**[Canonical Reducer Composition](https://github.com/gajus/canonical-reducer-composition)** <br />
针对嵌套 reducer 组合的主观标准

**[Ducks: Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux)** <br />
关于把 reducer、动作类型和动作打包的提案
