---
id: server-rendering
title: 服务器渲染
---

# 服务器渲染

服务器端渲染最常见的用例是在用户（或搜索引擎爬虫）首次请求我们的应用时处理 _初始渲染_。当服务器接收到请求时，它将所需的组件渲染成一个 HTML 字符串，然后将其作为响应发送给客户端。从那时起，客户端接管渲染任务。

:::tip 如果可以，优先使用框架

如今，大多数服务器渲染应用都使用框架来处理请求生命周期、路由、数据加载和水合，例如 [Next.js](https://nextjs.org/)、[框架模式下的 React Router](https://reactrouter.com/start/framework/installation) 或 [TanStack Start](https://tanstack.com/start/latest)。如果使用其中之一，请遵循其数据加载约定，并参阅[使用 Next.js 配置 Redux Toolkit](./nextjs.mdx)，了解如何在该环境中为每个请求创建 store。

本页解释其底层机制：Redux 在服务器端需要做什么、状态如何传到浏览器，以及需要注意哪些问题。这有助于理解框架替你完成的工作，也有助于使用普通 Node 服务器自行搭建相关流程。

:::

下面的示例使用 React，但相同技术也适用于其他支持服务器渲染的视图库。

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

下面的示例使用一个只有 `counter` slice 的小型计数器应用，并以 [Express](https://expressjs.com/) 作为 Web 服务器。任何 Node HTTP 服务器都可以采用相同方式；Express 只是提供了请求处理器和响应对象。

```sh
npm install express @reduxjs/toolkit react-redux
```

由于共享代码使用 TypeScript 和 JSX，你需要使用 `tsx`、Vite 的 SSR 构建或 `tsc` 等工具将其编译为 Node 可运行的代码。具体步骤因工具而异，本页不作介绍。

Store 配置与纯客户端应用相同，区别在于这里导出的是工厂函数，而不是单个 store 实例：

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

下面是服务器端的大致结构。我们会使用 `app.use` 设置一个 [Express middleware](https://expressjs.com/guide/using-middleware.html)，处理所有到达服务器的请求。如果你不熟悉 Express 或 middleware，只需知道服务器每收到一个请求，就会调用 `handleRender` 函数。

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

服务器端渲染的关键步骤是：在将组件的初始 HTML 发送到客户端_**之前**_先完成渲染。为此，我们使用 `react-dom/server` 中的 [`renderToString()`](https://react.dev/reference/react-dom/server/renderToString)。

然后使用 [`store.getState()`](../api/Store.md#getstate) 从 Redux store 获取初始状态。稍后会看到 `renderFullPage` 函数如何传递该状态。

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

:::caution 不要在请求之间共享 Store

必须在请求处理器内部创建 store。在模块作用域创建的 store 会被服务器处理的所有请求共享，因此一个用户的数据可能泄漏到另一个用户的页面中。这同样适用于 Express 处理器、框架 loader 和 React Server Components。

:::

### 注入组件初始 HTML 和状态 {#inject-initial-component-html-and-state}

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

客户端的处理非常直接：从 `window.__PRELOADED_STATE__` 中取得初始状态，并将它作为 `preloadedState` 传给 `makeStore`。

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

你可以配置所选的构建工具（Vite、webpack 等），将 bundle 编译到 `static/bundle.js`。

页面加载时会启动 bundle 文件， [`hydrateRoot()`](https://react.dev/reference/react-dom/client/hydrateRoot) 会复用服务器渲染出的 HTML。它会将 React 连接到现有 DOM，而不是从头创建。由于 Redux store 的初始状态相同，且视图组件使用了相同代码，最终得到的 DOM 也会一致。

就是这样！这就是实现服务器渲染所需做的全部工作。

不过结果看起来很简单。它本质上是从动态代码渲染出静态视图。接下来我们要做的是动态生成初始状态，使得渲染的视图也能是动态的。

:::info

我们建议将 `window.__PRELOADED_STATE__` 直接传给 `makeStore`，避免为预加载状态创建额外引用（例如 `const preloadedState = window.__PRELOADED_STATE__`），这样它才能被垃圾回收。

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

服务器端渲染最常见的问题是处理异步获取的状态。`renderToString` 是同步函数，因此首次渲染所需的数据必须在调用它_之前_加载。由于请求处理器是 `async` 函数，我们可以先 `await` 数据，再创建 store 并进行渲染。

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

同样，这只是一个模拟 API，因此我们用 `setTimeout` 模拟耗时 500 毫秒的网络请求（真实 API 通常会快得多）。实际客户端会返回 `fetch` 或数据库查询的 Promise。

在服务器端，我们先 `await` 请求结果，再创建 store：

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

由于我们在调用 `res.send()` 前使用了 `await`，服务器会保持连接，直到获取操作完成后才发送数据。新增 API 调用会让每个服务器请求增加 500 毫秒延迟。更完善的实现还会妥善处理 API 错误，例如错误响应或超时。

也可以通过 store 本身加载数据：先创建 store，再执行 `await store.dispatch(someThunk())`；使用 RTK Query 时则执行 `await store.dispatch(api.endpoints.getCounter.initiate())`，随后再渲染。结果相同，但数据加载逻辑位于 Redux 代码中，也可以在客户端复用。

### 安全注意事项

由于我们引入了更多依赖用户生成内容（UGC）和输入的代码，应用的攻击面增大了。确保对输入进行适当清理很重要，以防范跨站脚本攻击（XSS）或代码注入。

示例中，我们采取了初级安全措施。解析请求参数时，我们对 `counter` 参数使用了 `parseInt`，保证其为数字。如果不这么做，攻击者可能在请求中加入恶意脚本标签，比如：`?counter=</script><script>doSomethingBad();</script>`，这会被直接渲染进 HTML。

对于本例这种简单情况，将输入转换为数字就足够安全。如果处理更复杂的输入（例如自由格式文本），则应使用合适的清理库处理输入。

此外，你还可以添加额外的安全层，对状态输出进行清理。`JSON.stringify` 可能引发脚本注入。为防止，通常对字符串进行替换，去除 HTML 标签和其他危险字符。例如使用 `JSON.stringify(state).replace(/</g, '\\u003c')`，或者更复杂的库，如 [serialize-javascript](https://github.com/yahoo/serialize-javascript)。

将状态作为 JSON 嵌入 `<script>` 标签，也是传递给浏览器最快的方式。不同方案的性能数据和需要遵循的转义规则，请参阅[将状态传递给 JavaScript 的最快方式：再探](https://calendar.perfplanet.com/2023/fastest-way-passing-state-javascript-revisited/)。

## 后续步骤 {#next-steps}

你可以阅读 [Redux 基础第 6 部分：异步逻辑和数据获取](../tutorials/fundamentals/part-6-async-logic.md)，了解如何使用 Promise 和 thunk 等异步原语在 Redux 中表达异步流程。请注意，这些知识同样适用于服务器渲染。

如果使用路由器，通常应将每个路由的数据需求写在路由定义旁，在渲染前加载数据，并等数据进入 store 后再渲染。React Router 的框架模式和 TanStack Start 都提供了 route loader；Next.js 也有自己的数据加载约定。如何在框架中为每个请求创建 store，请参阅[使用 Next.js 配置 Redux Toolkit](./nextjs.mdx)。

React 18 及更高版本还支持通过 [`renderToPipeableStream`](https://react.dev/reference/react-dom/server/renderToPipeableStream) 进行流式服务器渲染。Redux 的处理方式相同：为每个请求创建 store，并将状态传给客户端。框架会负责随 HTML 一同流式传输状态的具体细节。
