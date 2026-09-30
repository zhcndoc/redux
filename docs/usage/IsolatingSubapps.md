---
id: isolating-redux-sub-apps
title: 隔离 Redux 子应用
---

# 隔离 Redux 子应用

考虑一种“大型”应用（包含在 `<BigApp>` 组件中），
该应用嵌入了较小的“子应用”（包含在 `<SubApp>` 组件中）：

```js
import SubApp from './subapp'

function BigApp() {
  return (
    <div>
      <SubApp />
      <SubApp />
      <SubApp />
    </div>
  )
}
```

这些 `<SubApp>` 组件将完全独立。它们不会共享数据或动作，也不会相互看到或通信。

最好不要将这种方法与标准的 Redux reducer 组合混用。
对于典型的网页应用，坚持使用 reducer 组合。
而对于“产品中心”、“仪表盘”或将不同工具组合成统一包的企业软件，可以尝试使用子应用方法。

对于按产品或功能垂直划分的大型团队，子应用方法也非常有用。
这些团队可以独立发布子应用，或与外层的“应用框架”组合发布。

Below is a sub-app's root component. As usual, it reads from the store with
`useSelector` and can render more components that do the same as children.
Usually we'd render it inside `<Provider>` at the top of the app and be done with it.

```js
import { useSelector } from 'react-redux'

export default function App() {
  const items = useSelector(state => state.items)
  // ...
}
```

However, we don't have to render `<Provider><App /></Provider>` at the root
if we're interested in hiding the fact that the sub-app component is a Redux app.

也许我们希望能够在同一个“更大”应用中运行多个实例，
并让它作为一个完整的黑盒，Redux 只是一个实现细节。

To hide Redux behind a React API, we can wrap it in a component that creates
its own store once, when it first renders:

```js
import { useState } from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import reducer from './reducers'
import App from './App'

export default function SubApp() {
  const [store] = useState(() => configureStore({ reducer }))

  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}
```

The `useState` initializer runs only on the first render, so each `<SubApp>`
instance gets exactly one store for its lifetime. The
[Next.js setup guide](./nextjs.mdx#initial-setup) does the same thing in its
`StoreProvider` component, using a `useRef` that is filled on first render.

This way every instance will be independent.

该模式**不推荐**用于需要共享数据的同一个应用的不同部分。
但是当“大应用”无法访问“小应用”的内部功能，
并且希望 Redux 只是一个实现细节时，它非常有用。
每个组件实例将拥有自己的 store，因此它们彼此不会“知晓”。