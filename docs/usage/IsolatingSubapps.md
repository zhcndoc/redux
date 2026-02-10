---
id: isolating-redux-sub-apps
title: 隔离 Redux 子应用
---

# 隔离 Redux 子应用

考虑一种“大型”应用（包含在 `<BigApp>` 组件中），
该应用嵌入了较小的“子应用”（包含在 `<SubApp>` 组件中）：

```js
import React, { Component } from 'react'
import SubApp from './subapp'

class BigApp extends Component {
  render() {
    return (
      <div>
        <SubApp />
        <SubApp />
        <SubApp />
      </div>
    )
  }
}
```

这些 `<SubApp>` 组件将完全独立。它们不会共享数据或动作，也不会相互看到或通信。

最好不要将这种方法与标准的 Redux reducer 组合混用。
对于典型的网页应用，坚持使用 reducer 组合。
而对于“产品中心”、“仪表盘”或将不同工具组合成统一包的企业软件，可以尝试使用子应用方法。

对于按产品或功能垂直划分的大型团队，子应用方法也非常有用。
这些团队可以独立发布子应用，或与外层的“应用框架”组合发布。

下面是一个子应用的根连接组件。
通常，它可以渲染更多连接或未连接的子组件。
通常我们会将其渲染在 `<Provider>` 中，然后完成。

```js
class App extends Component { ... }
export default connect(mapStateToProps)(App)
```

但是，如果我们想隐藏子应用组件是 Redux 应用这层事实，
就不用调用 `ReactDOM.render(<Provider><App /></Provider>)`。

也许我们希望能够在同一个“更大”应用中运行多个实例，
并让它作为一个完整的黑盒，Redux 只是一个实现细节。

为了在 React API 后面隐藏 Redux，可以用一个特殊组件包装，
在构造函数中初始化 store：

```js
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducer from './reducers'
import App from './App'

class SubApp extends Component {
  constructor(props) {
    super(props)
    this.store = createStore(reducer)
  }

  render() {
    return (
      <Provider store={this.store}>
        <App />
      </Provider>
    )
  }
}
```

这样每个实例都会独立存在。

该模式**不推荐**用于需要共享数据的同一个应用的不同部分。
但是当“大应用”无法访问“小应用”的内部功能，
并且希望 Redux 只是一个实现细节时，它非常有用。
每个组件实例将拥有自己的 store，因此它们彼此不会“知晓”。