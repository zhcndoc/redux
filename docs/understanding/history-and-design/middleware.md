---
id: middleware
title: 中间件
description: '历史与设计 > 中间件：中间件如何帮助为 Redux 仓库添加额外功能'
---

# 中间件

你已经在【["Redux 基础教程"](../../tutorials/fundamentals/part-4-store.md#middleware)】中见识过中间件的实际应用。如果你用过服务器端库如 [Express](https://expressjs.com/) 和 [Koa](https://koajs.com/)，你可能也已经熟悉了 _中间件_ 的概念。在这些框架中，中间件是插入在框架接收请求和生成响应之间的一段代码。比如，Express 或 Koa 中间件可能会添加 CORS 头、日志记录、压缩等等。中间件最棒的特点就是它可以组成链条。你可以在一个项目里使用多个独立的第三方中间件。

Redux 中间件解决的问题和 Express 或 Koa 中间件不同，但概念上类似。**它提供了一个第三方扩展点，插入在派发（dispatch）一个 action 和它到达 reducer 之间的时刻。**人们用 Redux 中间件来做日志记录、崩溃报告、调用异步 API、路由等等。

本文分为一个深入的入门介绍，帮助你理解这个概念，以及最后的[几个实用示例](#seven-examples)，展示中间件的强大功能。你可能会发现来回在它们之间切换，会让你时而觉得无聊，时而受到启发。

## 理解中间件

虽然中间件可以用于各种用途，包括异步 API 调用，但理解它的来源非常重要。我们将通过使用日志记录和崩溃报告作为例子，引导你了解中间件的思考过程。

### 问题：日志记录

Redux 的一个好处是它让状态变化变得可预测且透明。每次派发一个 action 时，新的状态都会被计算并保存。状态本身不会自动变化，它只能作为某个特定 action 的结果而变化。

如果我们能记录应用中发生的每个 action 和它计算后的状态，那该多好？当出问题时，我们就可以回头查看日志，找出哪个 action 破坏了状态。

<img src='https://i.imgur.com/BjGBlES.png' width='70%' />

我们该如何用 Redux 解决这个问题？

### 方案一：手动记录

最幼稚的办法是每次调用 [`store.dispatch(action)`](../../api/Store.md#dispatchaction) 时手动记录 action 和更新后的状态。这其实不算真正的解决方案，而只是理解问题的第一步。

> ##### 注意
>
> 如果你使用了 [react-redux](https://github.com/reduxjs/react-redux) 或类似绑定，你的组件很可能没有直接访问 store 实例的权限。接下来的内容假设你显式地将 store 传递下去了。

假设你调用这个来创建一个待办事项：

```js
store.dispatch(addTodo('Use Redux'))
```

要记录 action 和状态，你可以改成这样：

```js
const action = addTodo('Use Redux')

console.log('dispatching', action)
store.dispatch(action)
console.log('next state', store.getState())
```

这样能够实现我们想要的效果，但你肯定不会每次都这么写。

### 方案二：包装 dispatch

你可以把日志记录提取成一个函数：

```js
function dispatchAndLog(store, action) {
  console.log('dispatching', action)
  store.dispatch(action)
  console.log('next state', store.getState())
}
```

然后到处用它替代 `store.dispatch()`：

```js
dispatchAndLog(store, addTodo('Use Redux'))
```

这行得通，但每次都得导入特定函数不够方便。

### 方案三：猴子补丁 dispatch

如果我们替换 store 实例上的 `dispatch` 函数呢？Redux store 就是一个带有[少数几个方法](../../api/Store.md)的普通对象，我们写的是 JavaScript，完全可以猴子补丁 (monkeypatch) `dispatch` 的实现：

```js
const next = store.dispatch
store.dispatch = function dispatchAndLog(action) {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}
```

这已经很接近我们想要的了！无论何处派发 action，都会被记录。猴子补丁看起来总不太合适，但暂时可以接受。

### 问题：崩溃报告

如果我们想对 `dispatch` 应用**多个**这样的方法呢？

另一个我想到的有用改造是向生产环境的崩溃报告服务上报 JavaScript 错误。全局的 `window.onerror` 事件不够可靠，因为一些旧浏览器不提供堆栈信息，而堆栈信息对理解错误至关重要。

如果每当派发一个 action 过程中抛出了错误，我们能把它连同堆栈、引发错误的 action 以及当前状态一起发送到崩溃报告服务（比如 [Sentry](https://getsentry.com/welcome/)），那该多好。这样在开发时就更容易复现错误。

但我们要保持日志记录和崩溃报告分离。理想状态下它们是不同的模块，甚至可能在不同的包里。否则我们就不能形成类似生态系统的工具集。（提示：我们正在慢慢逼近中间件的定义了！）

如果日志记录和崩溃报告是独立模块，它们可能长这样：

```js
function patchStoreToAddLogging(store) {
  const next = store.dispatch
  store.dispatch = function dispatchAndLog(action) {
    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    return result
  }
}

function patchStoreToAddCrashReporting(store) {
  const next = store.dispatch
  store.dispatch = function dispatchAndReportErrors(action) {
    try {
      return next(action)
    } catch (err) {
      console.error('Caught an exception!', err)
      Raven.captureException(err, {
        extra: {
          action,
          state: store.getState()
        }
      })
      throw err
    }
  }
}
```

如果这些函数作为独立模块发布，我们以后就可以用它们来给我们的 store 打补丁：

```js
patchStoreToAddLogging(store)
patchStoreToAddCrashReporting(store)
```

不过，这样看起来依然不美观。

### 方案四：隐藏猴子补丁

猴子补丁就是黑科技。“替换任何你想替换的方法”，这算什么 API？我们来弄清本质。之前我们的函数替换了 `store.dispatch`，如果它们**返回**新的 `dispatch` 函数如何？

```js
function logger(store) {
  const next = store.dispatch

  // 之前写的是：
  // store.dispatch = function dispatchAndLog(action) {

  return function dispatchAndLog(action) {
    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    return result
  }
}
```

我们可以在 Redux 内部提供一个辅助函数，作为实现细节，帮你应用真正的猴子补丁：

```js
function applyMiddlewareByMonkeypatching(store, middlewares) {
  middlewares = middlewares.slice()
  middlewares.reverse()

  // 用每个中间件依次改造 dispatch 函数
  middlewares.forEach(middleware => (store.dispatch = middleware(store)))
}
```

这样使用来应用多个中间件：

```js
applyMiddlewareByMonkeypatching(store, [logger, crashReporter])
```

但这依然是猴子补丁。即使隐藏在库内部，也改变不了这个事实。

### 方案五：去除猴子补丁

为什么我们要覆盖 `dispatch`？当然是为了以后还能调用它，但还有另一个原因：每个中间件都可以访问（并调用）之前包装过的 `store.dispatch`：

```js
function logger(store) {
  // 必须指向上一个中间件返回的函数：
  const next = store.dispatch

  return function dispatchAndLog(action) {
    console.log('dispatching', action)
    let result = next(action)
    console.log('next state', store.getState())
    return result
  }
}
```

中间件链里的这个调用是必不可少的！

如果 `applyMiddlewareByMonkeypatching` 不在处理第一个中间件后立即赋值 `store.dispatch`，`store.dispatch` 会一直指向原始的 `dispatch` 函数，那第二个中间件也会绑定到原始的函数上。

但还有另一种方式实现链式调用。中间件可以接受 `next()` 这个 dispatch 函数作为参数，而不是从 `store` 里取它。

```js
function logger(store) {
  return function wrapDispatchToAddLogging(next) {
    return function dispatchAndLog(action) {
      console.log('dispatching', action)
      let result = next(action)
      console.log('next state', store.getState())
      return result
    }
  }
}
```

这一刻有点像[“我们需要更深一层”](https://knowyourmeme.com/memes/we-need-to-go-deeper)的梗，理解它可能需要点时间。函数嵌套看起来令人畏惧，使用箭头函数会让这个[柯里化](https://en.wikipedia.org/wiki/Currying)的过程更容易理解：

```js
const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}

const crashReporter = store => next => action => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err)
    Raven.captureException(err, {
      extra: {
        action,
        state: store.getState()
      }
    })
    throw err
  }
}
```

**这就是 Redux 中间件的真实模样。**

现在中间件接受 `next()` dispatch 函数，返回一个新的 dispatch 函数，而它又作为左边中间件的 `next()`，如此往复。访问诸如 `getState()` 这样的 store 方法仍然非常有用，所以 `store` 依然作为顶层参数传入。

### 方案六：天真地应用中间件

我们不写 `applyMiddlewareByMonkeypatching()`，而写 `applyMiddleware()`，先获得最终完全包装好的 `dispatch()` 函数，然后返回使用它的新 store 复制品：

```js
// 警告：幼稚的实现！
// 这*不是* Redux API。
function applyMiddleware(store, middlewares) {
  middlewares = middlewares.slice()
  middlewares.reverse()
  let dispatch = store.dispatch
  middlewares.forEach(middleware => (dispatch = middleware(store)(dispatch)))
  return Object.assign({}, store, { dispatch })
}
```

Redux 自带的 [`applyMiddleware()`](../../api/applyMiddleware.md) 实现是类似的，但**在三个重要方面有所不同**：

- 它只对中间件暴露部分[store API](../../api/Store.md)：[`dispatch(action)`](../../api/Store.md#dispatchaction) 和 [`getState()`](../../api/Store.md#getState)。

- 它做了些技巧，确保如果你从中间件调用 `store.dispatch(action)` 而不是 `next(action)`，action 依然会走完整的中间件链（包括当前中间件）。[这对异步中间件非常有用](../../tutorials/fundamentals/part-6-async-logic.md)。不过对 setup 期间的 dispatch 有个警告，后面会讲。

- 为保证中间件只应用一次，它实际作用于 `createStore()`，而非 store 本身。它的签名不是 `(store, middlewares) => store`，而是 `(...middlewares) => (createStore) => createStore`。

因为要在用 `createStore()` 之前应用函数有点麻烦，所以 `createStore()` 支持一个可选的最后参数用来指定这类函数。

#### 警告：设置期间调用派发

虽然 `applyMiddleware` 执行并设置中间件时，`store.dispatch` 会暂时指向 `createStore` 提供的原始函数。此时调用 `dispatch`，不会经过其他中间件。如果你指望 setup 期间和其他中间件交互，可能会失望。因为这个意外行为，`applyMiddleware` 会抛错阻止你在 setup 结束前调用 dispatch。你应该改为通过一个公共对象（例如对于 API 调用中间件，就是你的 API 客户端对象）直接和那个中间件通信，或者用回调函数等方式等到中间件完全构造好后再调用。

### 最终方案

有了刚才写的这些中间件：

```js
const logger = store => next => action => {
  console.log('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  return result
}

const crashReporter = store => next => action => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err)
    Raven.captureException(err, {
      extra: {
        action,
        state: store.getState()
      }
    })
    throw err
  }
}
```

你可以这样把它们应用到 Redux store：

```js
import { createStore, combineReducers, applyMiddleware } from 'redux'

const todoApp = combineReducers(reducers)
const store = createStore(
  todoApp,
  // applyMiddleware() 告诉 createStore() 如何处理中间件
  applyMiddleware(logger, crashReporter)
)
```

就是这样！之后派发到该 store 实例的所有 action 都会经过 `logger` 和 `crashReporter`：

```js
// 会经过 logger 和 crashReporter 中间件！
store.dispatch(addTodo('Use Redux'))
```

## 七个示例

如果你读完以上内容感到头晕，那试想写它们是多么烧脑。这部分适合你我放松心情，也有助于激发灵感。

下面的函数都是合法的 Redux 中间件。它们并非绝对实用，但足够有趣。

```js
/**
 * 记录所有派发的 action 和更新后的状态。
 */
const logger = store => next => action => {
  console.group(action.type)
  console.info('dispatching', action)
  let result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}

/**
 * 在状态更新、监听者通知时发送崩溃报告。
 */
const crashReporter = store => next => action => {
  try {
    return next(action)
  } catch (err) {
    console.error('Caught an exception!', err)
    Raven.captureException(err, {
      extra: {
        action,
        state: store.getState()
      }
    })
    throw err
  }
}

/**
 * 调度带有 { meta: { delay: N } } 的 action，在 N 毫秒后延迟执行。
 * 这种情况下让 `dispatch` 返回一个取消该超时的函数。
 */
const timeoutScheduler = store => next => action => {
  if (!action.meta || !action.meta.delay) {
    return next(action)
  }

  const timeoutId = setTimeout(() => next(action), action.meta.delay)

  return function cancel() {
    clearTimeout(timeoutId)
  }
}

/**
 * 调度带有 { meta: { raf: true } } 的 action，使其在 requestAnimationFrame 循环帧内派发。
 * 这种情况下让 `dispatch` 返回一个函数，用于从队列中移除该 action。
 */
const rafScheduler = store => next => {
  const queuedActions = []
  let frame = null

  function loop() {
    frame = null
    try {
      if (queuedActions.length) {
        next(queuedActions.shift())
      }
    } finally {
      maybeRaf()
    }
  }

  function maybeRaf() {
    if (queuedActions.length && !frame) {
      frame = requestAnimationFrame(loop)
    }
  }

  return action => {
    if (!action.meta || !action.meta.raf) {
      return next(action)
    }

    queuedActions.push(action)
    maybeRaf()

    return function cancel() {
      queuedActions = queuedActions.filter(a => a !== action)
    }
  }
}

/**
 * 允许你派发 Promise，而非普通的 action。
 * 当 Promise 成功时，其结果会作为 action 被派发。
 * `dispatch` 会返回该 Promise，方便调用者处理拒绝。
 */
const vanillaPromise = store => next => action => {
  if (typeof action.then !== 'function') {
    return next(action)
  }

  return Promise.resolve(action).then(store.dispatch)
}

/**
 * 允许你派发带有 { promise } 字段的特殊 action。
 *
 * 该中间件会在开始时派发一个 action，
 * 并在 `promise` 被解决时派发成功或失败的 action。
 *
 * 为方便起见，`dispatch` 会返回该 promise，方便调用者等待。
 */
const readyStatePromise = store => next => action => {
  if (!action.promise) {
    return next(action)
  }

  function makeAction(ready, data) {
    const newAction = Object.assign({}, action, { ready }, data)
    delete newAction.promise
    return newAction
  }

  next(makeAction(false))
  return action.promise.then(
    result => next(makeAction(true, { result })),
    error => next(makeAction(true, { error }))
  )
}

/**
 * 允许你派发函数而非普通 action。
 * 这个函数会接收 `dispatch` 和 `getState` 作为参数。
 *
 * 适合提前返回（根据 `getState()` 判断）或异步流程控制（可派发其它 action）。
 *
 * `dispatch` 会返回被派发函数的返回值。
 */
const thunk = store => next => action =>
  typeof action === 'function'
    ? action(store.dispatch, store.getState)
    : next(action)

// 它们都可以一起用！（但不意味着你应该这么做。）
const todoApp = combineReducers(reducers)
const store = createStore(
  todoApp,
  applyMiddleware(
    rafScheduler,
    timeoutScheduler,
    thunk,
    vanillaPromise,
    readyStatePromise,
    logger,
    crashReporter
  )
)
```