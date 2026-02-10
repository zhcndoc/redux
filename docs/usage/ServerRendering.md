---
id: server-rendering
title: 服务器渲染
---

# 服务器渲染

服务器端渲染最常见的用例是在用户（或搜索引擎爬虫）首次请求我们的应用时处理 _初始渲染_。当服务器接收到请求时，它将所需的组件渲染成一个 HTML 字符串，然后将其作为响应发送给客户端。从那时起，客户端接管渲染任务。

下面的示例中我们将使用 React，但同样的技术也可以用于其他支持服务器渲染的视图框架。

### 服务器上的 Redux

当在服务器渲染中使用 Redux 时，必须将应用的状态一并发送给客户端，以便客户端将其作为初始状态使用。这一点很重要，因为如果我们在生成 HTML 之前预加载了任何数据，我们希望客户端也能访问这些数据。否则，客户端生成的标记将与服务器的不匹配，客户端就需要重新加载数据。

为了将数据传递给客户端，我们需要：

- 在每个请求上创建一个新的 Redux store 实例；
- 可选地分发一些 action；
- 从 store 中获取状态；
- 然后将状态传递给客户端。

在客户端，将创建一个新的 Redux store，并用服务器提供的状态进行初始化。
Redux 在服务器端的**唯一**职责是提供应用的**初始状态**。

## 环境搭建

在接下来的示例中，我们将演示如何设置服务器端渲染。我们将使用简单的 [Counter 应用](https://github.com/reduxjs/redux/tree/master/examples/counter) 来作为示例，展示服务器如何根据请求提前渲染状态。

### 安装依赖包

在这个例子中，我们将使用 [Express](https://expressjs.com/) 作为简单的 Web 服务器。由于 Redux 默认不包含 React 绑定，我们还需要安装 React 与 Redux 的绑定库。

```sh
npm install express react-redux
```

## 服务器端

服务器端的大致框架如下。我们将使用 [Express 中间件](https://expressjs.com/guide/using-middleware.html)，通过 [app.use](http://expressjs.com/api.html#app.use) 处理传入服务器的所有请求。如果你不熟悉 Express 或中间件，只需知道每当服务器收到请求时，我们的 `handleRender` 函数都会被调用。

另外，由于我们使用现代 JS 和 JSX 语法，需要用 [Babel](https://babeljs.io/) 编译（参见 [使用 Babel 的 Node 服务器示例](https://github.com/babel/example-node-server)），并使用 [React preset](https://babeljs.io/docs/plugins/preset-react/)。

##### `server.js`

```js
import path from 'path'
import Express from 'express'
import React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import counterApp from './reducers'
import App from './containers/App'

const app = Express()
const port = 3000

// 提供静态文件服务
app.use('/static', Express.static('static'))

// 每次服务器接收到请求时都会触发
app.use(handleRender)

// 以下函数将在后续章节中完善
function handleRender(req, res) {
  /* ... */
}
function renderFullPage(html, preloadedState) {
  /* ... */
}

app.listen(port)
```

### 处理请求

我们在每次请求时首先应做的，是创建一个新的 Redux store 实例。该 store 实例的唯一用途是提供应用的初始状态。

渲染时，我们将根组件 `<App />` 包裹在 `<Provider>` 中，使 store 可供组件树中的所有组件访问，就像我们在[“Redux 基础”第五部分：UI 与 React](../tutorials/fundamentals/part-5-ui-and-react.md)中看到的那样。

服务器渲染的关键步骤是 _**在发送给客户端之前**_ 渲染组件的初始 HTML。为此，我们使用 [ReactDOMServer.renderToString()](https://react.dev/reference/react-dom/server/renderToString)。

接着，我们通过 [`store.getState()`](../api/Store.md#getState) 获取 Redux store 的初始状态。如何将这个状态传递出去，我们将在 `renderFullPage` 函数中看到。

```js
import { renderToString } from 'react-dom/server'

function handleRender(req, res) {
  // 创建一个新的 Redux store 实例
  const store = createStore(counterApp)

  // 将组件渲染为字符串
  const html = renderToString(
    <Provider store={store}>
      <App />
    </Provider>
  )

  // 从 Redux store 获取初始状态
  const preloadedState = store.getState()

  // 将渲染的页面发送回客户端
  res.send(renderFullPage(html, preloadedState))
}
```

### 注入初始组件 HTML 和状态

服务器端的最后一步，是将我们的初始组件 HTML 和初始状态注入一个模板中，以便客户端渲染。为了传递状态，我们添加了一个 `<script>` 标签，将 `preloadedState` 赋值给 `window.__PRELOADED_STATE__`。

客户端将通过访问 `window.__PRELOADED_STATE__` 来获得这个状态。

我们还通过 script 标签引入了客户端应用的捆绑文件。这个文件是打包工具输出的客户端入口点，可能是静态文件，也可能是热重载开发服务器的 URL。

```js
function renderFullPage(html, preloadedState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Universal Example</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script>
          // 警告：关于在 HTML 中嵌入 JSON 的安全问题，请参见：
          // https://redux.js.org/usage/server-rendering#security-considerations
          window.__PRELOADED_STATE__ = ${JSON.stringify(preloadedState).replace(
            /</g,
            '\\u003c'
          )}
        </script>
        <script src="/static/bundle.js"></script>
      </body>
    </html>
    `
}
```

## 客户端

客户端非常直接。我们只需要从 `window.__PRELOADED_STATE__` 中获取初始状态，并将它作为初始状态传给 [`createStore()`](../api/createStore.md) 函数。

来看一下客户端的文件：

#### `client.js`

```js
import React from 'react'
import { hydrate } from 'react-dom'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import App from './containers/App'
import counterApp from './reducers'

// 用服务器注入的状态创建 Redux store
const store = createStore(counterApp, window.__PRELOADED_STATE__)

// 允许注入的状态被垃圾回收
delete window.__PRELOADED_STATE__

hydrate(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)
```

你可以使用你偏好的构建工具（Webpack、Browserify 等）将文件编译并输出为 `static/bundle.js`。

页面加载时，该捆绑文件启动，[`ReactDOM.hydrate()`](https://reactjs.org/docs/react-dom.html#hydrate) 会复用服务端渲染的 HTML。这会将新启动的 React 实例连接到服务器用的虚拟 DOM。由于我们有相同的 Redux 初始状态，并且所有视图组件使用了相同代码，输出的真实 DOM 结构将保持一致。

就是这样！这就是实现服务器渲染所需做的全部工作。

不过结果看起来很简单。它本质上是从动态代码渲染出静态视图。接下来我们要做的是动态生成初始状态，使得渲染的视图也能是动态的。

:::info

我们建议直接将 `window.__PRELOADED_STATE__` 传递给 `createStore`，避免创建额外的引用（例如 `const preloadedState = window.__PRELOADED_STATE__`），以促进垃圾回收。

:::

## 准备初始状态

客户端运行的是持续执行的代码，它可以从空的初始状态开始，并按需或随着时间获取所需状态。服务器端渲染是同步的，在渲染视图时通常只有一次机会。我们需要在请求期间动态构造初始状态，这必须能响应输入并获取外部状态（例如 API 或数据库）。

### 处理请求参数

服务器端代码的唯一输入，是浏览器加载你的应用页面时发起的请求。你可以在服务器启动时配置（如开发环境与生产环境的不同），但这些配置是静态的。

请求包含描述所请求 URL 的信息，包括查询参数，在使用类似 [React Router](https://github.com/remix-run/react-router) 时这很有用。请求还可能包含如 cookie、授权信息的 headers 或 POST 请求体数据。来看如何根据查询参数设置计数器的初始状态。

#### `server.js`

```js
import qs from 'qs' // 文件顶部添加此行
import { renderToString } from 'react-dom/server'

function handleRender(req, res) {
  // 读取请求中的 counter 参数（如果提供的话）
  const params = qs.parse(req.query)
  const counter = parseInt(params.counter, 10) || 0

  // 编译初始状态
  let preloadedState = { counter }

  // 创建新的 Redux store 实例
  const store = createStore(counterApp, preloadedState)

  // 将组件渲染为字符串
  const html = renderToString(
    <Provider store={store}>
      <App />
    </Provider>
  )

  // 获取 Redux store 中的最终状态
  const finalState = store.getState()

  // 将渲染的页面发送给客户端
  res.send(renderFullPage(html, finalState))
}
```

代码从 Express 的 `Request` 对象中读取请求参数。参数被解析成数字后设置到初始状态中。如果你在浏览器中访问 [http://localhost:3000/?counter=100](http://localhost:3000/?counter=100)，你会看到计数器从 100 开始。在渲染后的 HTML 中，计数器显示为 100，`__PRELOADED_STATE__` 变量中也包含了该值。

### 异步数据获取

服务器渲染最常见的问题是异步状态的处理。服务器渲染本质上是同步的，因此需要将异步请求转换为同步操作。

最简单的方式是通过回调函数将异步结果传递回同步代码。在这里，这个回调函数会引用响应对象，负责发送渲染好的 HTML 给客户端。别担心，没想象的那么难。

举例来说，我们假设有一个外部数据源存储计数器的初始值（Counter As A Service，简称 CaaS）。我们模拟调用该服务构建初始状态。先实现 API 调用：

#### `api/counter.js`

```js
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min
}

export function fetchCounter(callback) {
  setTimeout(() => {
    callback(getRandomInt(1, 100))
  }, 500)
}
```

这只是一个模拟 API，使用 `setTimeout` 模拟网络请求，延迟 500 毫秒（真实 API 应更快）。异步通过回调返回一个随机数。如果你用的是基于 Promise 的 API 客户端，回调可以写在 `then` 里。

服务器端，我们只需将已有代码包裹在 `fetchCounter` 内，通过回调接收结果：

#### `server.js`

```js
// 导入新增模块
import { fetchCounter } from './api/counter'
import { renderToString } from 'react-dom/server'

function handleRender(req, res) {
  // 异步调用模拟 API
  fetchCounter(apiResult => {
    // 读取请求中的 counter 参数（如果提供的话）
    const params = qs.parse(req.query)
    const counter = parseInt(params.counter, 10) || apiResult || 0

    // 编译初始状态
    let preloadedState = { counter }

    // 创建 Redux store 实例
    const store = createStore(counterApp, preloadedState)

    // 渲染组件成字符串
    const html = renderToString(
      <Provider store={store}>
        <App />
      </Provider>
    )

    // 获取最终状态
    const finalState = store.getState()

    // 发送页面给客户端
    res.send(renderFullPage(html, finalState))
  })
}
```

由于我们在回调内调用了 `res.send()`，服务器会保持连接直到回调执行。你会注意到现在每个请求都会额外有 500 毫秒的延迟。更高级的用法会优雅处理 API 错误，比如返回错误或请求超时。

### 安全注意事项

由于我们引入了更多依赖用户生成内容（UGC）和输入的代码，应用的攻击面增大了。确保对输入进行适当清理很重要，以防范跨站脚本攻击（XSS）或代码注入。

示例中，我们采取了初级安全措施。解析请求参数时，我们对 `counter` 参数使用了 `parseInt`，保证其为数字。如果不这么做，攻击者可能在请求中加入恶意脚本标签，比如：`?counter=</script><script>doSomethingBad();</script>`，这会被直接渲染进 HTML。

对于简单示例，将输入强制转换为数字已足够安全。若处理更复杂输入（如自由文本），建议使用合适的清理工具，例如 [xss-filters](https://github.com/yahoo/xss-filters)。

此外，你还可以添加额外的安全层，对状态输出进行清理。`JSON.stringify` 可能引发脚本注入。为防止，通常对字符串进行替换，去除 HTML 标签和其他危险字符。例如使用 `JSON.stringify(state).replace(/</g, '\\u003c')`，或者更复杂的库，如 [serialize-javascript](https://github.com/yahoo/serialize-javascript)。

## 后续步骤

你可以阅读[“Redux 基础”第六部分：异步逻辑与数据获取](../tutorials/fundamentals/part-6-async-logic.md)，进一步了解如何用 Promise 和 thunk 等异步原语表达 Redux 中的异步流程。请记住，这些知识同样适用于通用渲染。

如果你用的是类似 [React Router](https://github.com/remix-run/react-router) 的路由库，你可能想把数据获取依赖表达为路由处理组件上的静态 `fetchData()` 方法。它们可返回 [thunks](../tutorials/fundamentals/part-6-async-logic.md)，让你的 `handleRender` 函数能基于路由匹配路由处理组件，分发每个组件的 `fetchData()` 返回结果，并在所有 Promise 完成后再渲染页面。这样不同路由所需的 API 调用就和路由组件定义放在一起了。客户端也可用类似方法，阻止路由切换直到数据加载完成。