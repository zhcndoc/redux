---
id: server-rendering
title: 服务器渲染
---

# 服务器渲染

服务器端渲染最常见的用例是在用户（或搜索引擎爬虫）首次请求我们的应用时处理 _初始渲染_。当服务器接收到请求时，它将所需的组件渲染成一个 HTML 字符串，然后将其作为响应发送给客户端。从那时起，客户端接管渲染任务。

:::tip Use a framework if you can

Most apps that render on the server today use a framework that handles the request lifecycle, routing, data loading, and hydration for you: [Next.js](https://nextjs.org/), [React Router in framework mode](https://reactrouter.com/start/framework/installation), or [TanStack Start](https://tanstack.com/start/latest). If you use one of those, follow its data-loading conventions and see [Redux Toolkit Setup with Next.js](./nextjs.mdx) for how to create a per-request store in that setting.

This page explains the mechanics underneath: what Redux has to do on the server, how the state gets to the browser, and what to watch out for. That is useful for understanding what a framework does for you, or for wiring it up yourself with a plain Node server.

:::

We will use React in the examples below, but the same techniques can be used with other view frameworks that can render on the server.

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

The examples below use a small counter app with a single `counter` slice, and [Express](https://expressjs.com/) as the web server. Any Node HTTP server works the same way; Express just gives us a request handler and a response object.

```sh
npm install express @reduxjs/toolkit react-redux
```

Because the shared code is TypeScript and JSX, you'll need to compile it for Node with a tool such as `tsx`, Vite's SSR build, or `tsc`. The details vary by tool and are not covered here.

The store setup is the same one you would use in a client-only app, except that it exports a factory function rather than a single store instance:

##### `app/store.ts`

```ts
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from '../features/counter/counterSlice'

const rootReducer = {
  counter: counterReducer
}

export function makeStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
```

## 服务器端

The following is the outline for what our server side is going to look like. We are going to set up an [Express middleware](https://expressjs.com/guide/using-middleware.html) using `app.use` to handle all requests that come in to our server. If you're unfamiliar with Express or middleware, just know that our `handleRender` function will be called every time the server receives a request.

##### `server.tsx`

```tsx
import express from 'express'
import type { Request, Response } from 'express'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import { makeStore } from './app/store'
import type { RootState } from './app/store'
import App from './App'

const app = express()
const port = 3000

// Serve static files
app.use('/static', express.static('static'))

// 每次服务器接收到请求时都会触发
app.use(handleRender)

// We are going to fill these out in the sections to follow
async function handleRender(req: Request, res: Response) {
  /* ... */
}
function renderFullPage(html: string, preloadedState: RootState) {
  /* ... */
}

app.listen(port)
```

### 处理请求

我们在每次请求时首先应做的，是创建一个新的 Redux store 实例。该 store 实例的唯一用途是提供应用的初始状态。

渲染时，我们将根组件 `<App />` 包裹在 `<Provider>` 中，使 store 可供组件树中的所有组件访问，就像我们在[“Redux 基础”第五部分：UI 与 React](../tutorials/fundamentals/part-5-ui-and-react.md)中看到的那样。

The key step in server side rendering is to render the initial HTML of our component _**before**_ we send it to the client side. To do this, we use [`renderToString()`](https://react.dev/reference/react-dom/server/renderToString) from `react-dom/server`.

We then get the initial state from our Redux store using [`store.getState()`](../api/Store.md#getstate). We will see how this is passed along in our `renderFullPage` function.

```tsx
async function handleRender(req: Request, res: Response) {
  // Create a new Redux store instance
  const store = makeStore()

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

:::caution Never share a store between requests

The store must be created inside the request handler. A store created at module scope would be shared by every request the server handles, so one user's data would leak into another user's page. This applies equally to Express handlers, framework loaders, and React Server Components.

:::

### Inject Initial Component HTML and State

服务器端的最后一步，是将我们的初始组件 HTML 和初始状态注入一个模板中，以便客户端渲染。为了传递状态，我们添加了一个 `<script>` 标签，将 `preloadedState` 赋值给 `window.__PRELOADED_STATE__`。

客户端将通过访问 `window.__PRELOADED_STATE__` 来获得这个状态。

我们还通过 script 标签引入了客户端应用的捆绑文件。这个文件是打包工具输出的客户端入口点，可能是静态文件，也可能是热重载开发服务器的 URL。

```tsx
function renderFullPage(html: string, preloadedState: RootState) {
  return `
    <!doctype html>
    <html>
      <head>
        <title>Redux Server Rendering Example</title>
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

The client side is very straightforward. All we need to do is grab the initial state from `window.__PRELOADED_STATE__`, and pass it to `makeStore` as the `preloadedState`.

来看一下客户端的文件：

#### `client.tsx`

```tsx
import { hydrateRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { makeStore } from './app/store'
import type { RootState } from './app/store'
import App from './App'

declare global {
  interface Window {
    __PRELOADED_STATE__?: RootState
  }
}

// Create Redux store with state injected by the server
const store = makeStore(window.__PRELOADED_STATE__)

// 允许注入的状态被垃圾回收
delete window.__PRELOADED_STATE__

hydrateRoot(
  document.getElementById('root')!,
  <Provider store={store}>
    <App />
  </Provider>
)
```

You can set up your build tool of choice (Vite, webpack, etc.) to compile a bundle file into `static/bundle.js`.

When the page loads, the bundle file will be started up and [`hydrateRoot()`](https://react.dev/reference/react-dom/client/hydrateRoot) will reuse the server-rendered HTML. This attaches React to the existing DOM instead of creating it from scratch. Since we have the same initial state for our Redux store and used the same code for all our view components, the result will be the same real DOM.

就是这样！这就是实现服务器渲染所需做的全部工作。

不过结果看起来很简单。它本质上是从动态代码渲染出静态视图。接下来我们要做的是动态生成初始状态，使得渲染的视图也能是动态的。

:::info

We recommend passing `window.__PRELOADED_STATE__` directly to `makeStore` and avoid creating additional references to the preloaded state (e.g. `const preloadedState = window.__PRELOADED_STATE__`) so that it can be garbage collected.

:::

## 准备初始状态

客户端运行的是持续执行的代码，它可以从空的初始状态开始，并按需或随着时间获取所需状态。服务器端渲染是同步的，在渲染视图时通常只有一次机会。我们需要在请求期间动态构造初始状态，这必须能响应输入并获取外部状态（例如 API 或数据库）。

### 处理请求参数

服务器端代码的唯一输入，是浏览器加载你的应用页面时发起的请求。你可以在服务器启动时配置（如开发环境与生产环境的不同），但这些配置是静态的。

请求包含描述所请求 URL 的信息，包括查询参数，在使用类似 [React Router](https://github.com/remix-run/react-router) 时这很有用。请求还可能包含如 cookie、授权信息的 headers 或 POST 请求体数据。来看如何根据查询参数设置计数器的初始状态。

#### `server.tsx`

```tsx
async function handleRender(req: Request, res: Response) {
  // Read the counter from the request, if provided
  const counter = parseInt(String(req.query.counter), 10) || 0

  // Compile an initial state
  const preloadedState = { counter: { value: counter } }

  // Create a new Redux store instance
  const store = makeStore(preloadedState)

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

The most common issue with server side rendering is dealing with state that comes in asynchronously. `renderToString` is synchronous, so any data the first render needs has to be loaded _before_ we call it. Because our request handler is an `async` function, we can `await` the data, then build the store and render.

举例来说，我们假设有一个外部数据源存储计数器的初始值（Counter As A Service，简称 CaaS）。我们模拟调用该服务构建初始状态。先实现 API 调用：

#### `api/counter.ts`

```ts
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}

export function fetchCounter(): Promise<number> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getRandomInt(1, 100))
    }, 500)
  })
}
```

Again, this is just a mock API, so we use `setTimeout` to simulate a network request that takes 500 milliseconds to respond (this should be much faster with a real world API). A real client would return the promise from `fetch` or a database query instead.

On the server side, we `await` the result before creating the store:

#### `server.tsx`

```tsx
// Add this to our imports
import { fetchCounter } from './api/counter'

async function handleRender(req: Request, res: Response) {
  // Query our mock API asynchronously
  const apiResult = await fetchCounter()

  // Read the counter from the request, if provided
  const counter = parseInt(String(req.query.counter), 10) || apiResult || 0

  // Compile an initial state
  const preloadedState = { counter: { value: counter } }

  // Create a new Redux store instance
  const store = makeStore(preloadedState)

  // Render the component to a string
  const html = renderToString(
    <Provider store={store}>
      <App />
    </Provider>
  )

  // Grab the initial state from our Redux store
  const finalState = store.getState()

  // Send the rendered page back to the client
  res.send(renderFullPage(html, finalState))
}
```

Because we `await` before calling `res.send()`, the server will hold open the connection and won't send any data until the fetch completes. You'll notice a 500ms delay is now added to each server request as a result of our new API call. A more advanced usage would handle errors in the API gracefully, such as a bad response or timeout.

You can also do the loading through the store itself: create the store first, `await store.dispatch(someThunk())` or `await store.dispatch(api.endpoints.getCounter.initiate())` for RTK Query, then render. The result is the same, but the data-loading logic lives in your Redux code and can be reused on the client.

### 安全注意事项

由于我们引入了更多依赖用户生成内容（UGC）和输入的代码，应用的攻击面增大了。确保对输入进行适当清理很重要，以防范跨站脚本攻击（XSS）或代码注入。

示例中，我们采取了初级安全措施。解析请求参数时，我们对 `counter` 参数使用了 `parseInt`，保证其为数字。如果不这么做，攻击者可能在请求中加入恶意脚本标签，比如：`?counter=</script><script>doSomethingBad();</script>`，这会被直接渲染进 HTML。

For our simplistic example, coercing our input into a number is sufficiently secure. If you're handling more complex input, such as freeform text, then you should run that input through an appropriate sanitization library.

此外，你还可以添加额外的安全层，对状态输出进行清理。`JSON.stringify` 可能引发脚本注入。为防止，通常对字符串进行替换，去除 HTML 标签和其他危险字符。例如使用 `JSON.stringify(state).replace(/</g, '\\u003c')`，或者更复杂的库，如 [serialize-javascript](https://github.com/yahoo/serialize-javascript)。

Embedding the state as JSON in a `<script>` tag is also the fastest way to hand it to the browser. See [The Fastest Way of Passing State to JavaScript, Re-visited](https://calendar.perfplanet.com/2023/fastest-way-passing-state-javascript-revisited/) for measurements of the alternatives and the escaping rules you need to follow.

## Next Steps

You may want to read [Redux Fundamentals Part 6: Async Logic and Data Fetching](../tutorials/fundamentals/part-6-async-logic.md) to learn more about expressing asynchronous flow in Redux with async primitives such as Promises and thunks. Keep in mind that anything you learn there can also be applied to server rendering.

If you use a router, you'll usually want to express each route's data requirements next to the route definition, load them before rendering, and render only after the data is in the store. React Router's framework mode and TanStack Start both provide route loaders for this, and Next.js has its own data-loading conventions; see [Redux Toolkit Setup with Next.js](./nextjs.mdx) for an example of creating the store per request in a framework.

React 18+ also supports streaming server rendering with [`renderToPipeableStream`](https://react.dev/reference/react-dom/server/renderToPipeableStream). Redux works the same way there: create the store per request and pass the state to the client. Frameworks handle the details of streaming state alongside the HTML.
