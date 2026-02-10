---
id: applymiddleware
title: applyMiddleware
hide_title: true
description: 'API > applyMiddleware：扩展 Redux store'
---

&nbsp;

# `applyMiddleware(...middleware)`

## 概述

中间件是扩展 Redux 以实现自定义功能的推荐方式。中间件可以让你包装 store 的 [`dispatch`](Store.md#dispatchaction) 方法，既有趣又实用。中间件的关键特点是它具备可组合性。多个中间件可以组合在一起，每个中间件不需要了解链中它之前或之后的中间件是做什么的。

:::warning 警告

你通常不需要直接调用 `applyMiddleware`。Redux Toolkit 的 [`configureStore` 方法](https://redux-toolkit.js.org/api/configureStore) 会自动为 store 添加一组默认的中间件，或者接受一个中间件列表以添加。

:::

中间件最常见的用例是支持异步动作，而无需大量模板代码或依赖像 [Rx](https://github.com/Reactive-Extensions/RxJS) 这样的库。中间件通过允许你分发[异步动作](../understanding/thinking-in-redux/Glossary.md#async-action)（除了普通动作之外）来实现这一点。

例如，[redux-thunk](https://github.com/reduxjs/redux-thunk) 允许 action 创建者通过分发函数来反转控制流。这些函数会接收 [`dispatch`](Store.md#dispatchaction) 作为参数，并且可以异步调用它。这类函数称为 _thunks_。另一个中间件示例是 [redux-promise](https://github.com/acdlite/redux-promise)。它允许你分发一个 [Promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise) 异步动作，并在 Promise 解析时分发一个普通动作。

Redux 原生的 [`createStore`](createStore.md) 方法默认并不支持中间件——必须通过 `applyMiddleware` 来配置，才能添加这类功能。然而，Redux Toolkit 的 [`configureStore` 方法](https://redux-toolkit.js.org/api/configureStore) 默认会自动添加中间件支持。

## 参数

- `...middleware` (_参数_): 符合 Redux _中间件 API_ 的函数。每个中间件接收 [`Store`](Store.md) 的 [`dispatch`](Store.md#dispatchaction) 和 [`getState`](Store.md#getstate) 函数作为具名参数，并返回一个函数。这个返回的函数接收链中下一个中间件的 dispatch 方法 `next`，然后返回一个接收 `action` 的函数。该函数通常会以不同的参数、不同的时机调用 `next(action)`，或者干脆不调用它。链中最后一个中间件接收的是 store 真实的 [`dispatch`](Store.md#dispatchaction) 方法作为 `next` 参数，链条至此结束。所以，中间件的签名是：`({ getState, dispatch }) => next => action`。

### 返回值

(_函数_) 返回一个 store 增强器，它会应用给定的中间件。store 增强器的签名是 `createStore => createStore`，但最简单的使用方式是将其作为最后一个 `enhancer` 参数传给 [`createStore()`](./createStore.md)。

## 示例

#### 示例：自定义日志中间件

```js
import { createStore, applyMiddleware } from 'redux'
import todos from './reducers'

function logger({ getState }) {
  return next => action => {
    console.log('即将分发', action)

    // 调用链中的下一个 dispatch 方法
    const returnValue = next(action)

    console.log('分发后的 state', getState())

    // 通常返回的将是 action 本身，除非链中后面的中间件做了修改
    return returnValue
  }
}

const store = createStore(todos, ['使用 Redux'], applyMiddleware(logger))

store.dispatch({
  type: 'ADD_TODO',
  text: '理解中间件'
})
// （以下这两行会被中间件日志打印出来：）
// 即将分发: { type: 'ADD_TODO', text: '理解中间件' }
// 分发后的 state: [ '使用 Redux', '理解中间件' ]
```

#### 示例：使用 thunk 中间件支持异步动作

```js
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk'
import * as reducers from './reducers'

const reducer = combineReducers(reducers)
// applyMiddleware 给 createStore 增强了中间件能力：
const store = createStore(reducer, applyMiddleware(thunk))

function fetchSecretSauce() {
  return fetch('https://www.google.com/search?q=secret+sauce')
}

// 这些是你之前见过的普通 action 创建函数。
// 它们返回的动作可以不借助中间件直接分发。
// 不过它们只表达“事实”，而非“异步流程”。
function makeASandwich(forPerson, secretSauce) {
  return {
    type: 'MAKE_SANDWICH',
    forPerson,
    secretSauce
  }
}

function apologize(fromPerson, toPerson, error) {
  return {
    type: 'APOLOGIZE',
    fromPerson,
    toPerson,
    error
  }
}

function withdrawMoney(amount) {
  return {
    type: 'WITHDRAW',
    amount
  }
}

// 即使没有中间件，你可以分发一个动作：
store.dispatch(withdrawMoney(100))

// 但是当你需要启动异步操作，比如 API 调用或路由切换时，怎么办？

// 这时就用到 thunk。
// thunk 是一个函数，返回另一个函数。
// 这是一个 thunk。
function makeASandwichWithSecretSauce(forPerson) {
  // 反转控制权！
  // 返回一个接收 `dispatch` 的函数，这样我们可以之后再分发动作。
  // thunk 中间件知道如何将 thunk 异步动作转换成普通动作。
  return function (dispatch) {
    return fetchSecretSauce().then(
      sauce => dispatch(makeASandwich(forPerson, sauce)),
      error => dispatch(apologize('三明治店', forPerson, error))
    )
  }
}

// thunk 中间件让我们能像普通动作一样分发 thunk 异步动作！
store.dispatch(makeASandwichWithSecretSauce('我'))

// 它还会将 thunk 返回的值从 dispatch 返回，
// 这样只要返回 Promise 就可以链式调用。
store.dispatch(makeASandwichWithSecretSauce('我妻子')).then(() => {
  console.log('完成！')
})

// 实际上，我可以写出能分发普通动作和异步动作的 action 创建者，
// 而且能用 Promise 来组织控制流程。
function makeSandwichesForEverybody() {
  return function (dispatch, getState) {
    if (!getState().sandwiches.isShopOpen) {
      // 你不必总是返回 Promise，但这是个好习惯，
      // 这样调用者就总能对异步分发结果调用 .then()。
      return Promise.resolve()
    }

    // 我们既能分发普通对象动作，也能分发 thunk，
    // 这样就可以把异步动作组合到一个流程中。
    return dispatch(makeASandwichWithSecretSauce('我奶奶'))
      .then(() =>
        Promise.all([
          dispatch(makeASandwichWithSecretSauce('我')),
          dispatch(makeASandwichWithSecretSauce('我妻子'))
        ])
      )
      .then(() => dispatch(makeASandwichWithSecretSauce('我们的孩子')))
      .then(() =>
        dispatch(
          getState().myMoney > 42
            ? withdrawMoney(42)
            : apologize('我', '三明治店')
        )
      )
  }
}

// 这对于服务器端渲染非常有用，因为我可以等数据准备好，
// 再同步渲染应用。

import { renderToString } from 'react-dom/server'

store
  .dispatch(makeSandwichesForEverybody())
  .then(() => response.send(renderToString(<MyApp store={store} />)))

// 我还可以在组件的 props 变化时分发 thunk 异步动作加载缺失数据。

import React from 'react'
import { connect } from 'react-redux'

function SandwichShop(props) {
  const { dispatch, forPerson } = props

  useEffect(() => {
    dispatch(makeASandwichWithSecretSauce(forPerson))
  }, [forPerson])

  return <p>{this.props.sandwiches.join('mustard')}</p>
}

export default connect(state => ({
  sandwiches: state.sandwiches
}))(SandwichShop)
```

## 小贴士

- 中间件只包装 store 的 [`dispatch`](Store.md#dispatchaction) 函数。从技术上讲，中间件能做的，你也可以通过手动包裹每次 `dispatch` 调用来实现，但把它集中管理在一个地方更加方便，可以对整个项目的动作进行统一转换。

- 如果你除了 `applyMiddleware` 还使用了其他 store 增强器，确保在组合链中将 `applyMiddleware` 放在它们之前，因为中间件可能是异步的。例如，它应该放在 [redux-devtools](https://github.com/reduxjs/redux-devtools) 之前，否则 DevTools 看不到 Promise 中间件等发出的原始动作。

- 如果你想有条件地应用某个中间件，确保只有在需要的时候才导入它：

  ```js
  let middleware = [a, b]
  if (process.env.NODE_ENV !== 'production') {
    const c = require('some-debug-middleware')
    const d = require('another-debug-middleware')
    middleware = [...middleware, c, d]
  }

  const store = createStore(
    reducer,
    preloadedState,
    applyMiddleware(...middleware)
  )
  ```

  这样有助于打包工具剔除不必要的模块，减小构建体积。

- 你可能想知道 `applyMiddleware` 本身是什么？它应该是一个比中间件更强大的扩展机制。确实，`applyMiddleware` 是最强大的 Redux 扩展机制类型之一——[store enhancers](../understanding/thinking-in-redux/Glossary.md#store-enhancer) 的一个示例。你很少会自己写 store enhancer。另一个 store enhancer 的实例是 [redux-devtools](https://github.com/reduxjs/redux-devtools)。中间件能力不如 store enhancer 强大，但更容易编写。

- 中间件听起来比实际复杂得多。理解中间件的最好方法是查看现有中间件的实现，尝试自己写一个。函数嵌套可能令人望而生畏，但大多数中间件实际上都只有 10 行左右代码，正是嵌套和可组合性让中间件系统如此强大。

- 如果你要同时应用多个 store enhancer，可以使用 [`compose()`](./compose.md) 来组成它们。