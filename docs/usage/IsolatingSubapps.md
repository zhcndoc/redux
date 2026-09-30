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

下面是一个子应用的根组件。和往常一样，它使用 `useSelector` 从 store 中读取数据，
并可以渲染同样读取 store 数据的子组件。
通常只需在应用顶层的 `<Provider>` 中渲染它即可。

```js
import { useSelector } from 'react-redux'

export default function App() {
  const items = useSelector(state => state.items)
  // ...
}
```

不过，如果希望隐藏子应用组件基于 Redux 实现这一事实，就不必在根部渲染 `<Provider><App /></Provider>`。

也许我们希望能够在同一个“更大”应用中运行多个实例，
并让它作为一个完整的黑盒，Redux 只是一个实现细节。

要在 React API 背后隐藏 Redux，可以将其包装在一个组件中，并在首次渲染时为其创建独立的 store：

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

`useState` 初始化函数只在首次渲染时运行，因此每个 `<SubApp>`
实例在其整个生命周期中都只会获得一个 store。[Next.js 配置指南](./nextjs.mdx#initial-setup)中的
`StoreProvider` 组件也采用了同样的做法，只是用 `useRef` 在首次渲染时保存 store。

这样，每个实例都会彼此独立。

该模式**不推荐**用于需要共享数据的同一个应用的不同部分。
但是当“大应用”无法访问“小应用”的内部功能，
并且希望 Redux 只是一个实现细节时，它非常有用。
每个组件实例将拥有自己的 store，因此它们彼此不会“知晓”。
