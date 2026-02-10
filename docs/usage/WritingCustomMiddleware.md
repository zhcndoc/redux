---
id: writing-custom-middleware
title: 编写自定义中间件
---

# 编写自定义中间件

:::tip 你将学到什么

- 何时使用自定义中间件
- 中间件的标准模式
- 如何确保你的中间件与其他 Redux 项目兼容

:::

Redux 中的中间件主要用于：

- 为动作创建副作用，
- 修改或取消动作，或
- 修改 dispatch 接受的输入。

大多数使用场景属于第一类：例如，[Redux-Saga](https://github.com/redux-saga/redux-saga/)、[redux-observable](https://github.com/redux-observable/redux-observable) 和 [RTK 监听器中间件](https://redux-toolkit.js.org/api/createListenerMiddleware) 都是创建响应动作的副作用。这些例子也表明，这是一种非常常见的需求：能够响应动作，而不仅仅是通过状态变更。

修改动作可以用于例如增强动作，添加来自状态或外部输入的信息，或者对动作进行节流、防抖或门控。

修改 dispatch 输入的最明显示例是 [Redux Thunk](https://github.com/reduxjs/redux-thunk)，它通过调用函数将返回动作的函数转变为动作。

## 何时使用自定义中间件

大多数情况下，你实际上不需要自定义中间件。中间件最可能的用途是处理副作用，并且市场上有许多以良好方式封装副作用的包，这些包经过长时间的使用，解决了你自己构建时可能遇到的微妙问题。一个很好的起点是用于管理服务器端状态的 [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) 和用于其他副作用的 [RTK 监听器中间件](https://redux-toolkit.js.org/api/createListenerMiddleware)。

但你可能仍会在以下两种情况下想使用自定义中间件：

1. 如果你只需要一个单一且非常简单的副作用，添加一个完整的额外框架可能不值得。但请确保当你的应用增长时切换到现成框架，而不是扩展自己的解决方案。
2. 如果你需要修改或取消动作。

## 中间件的标准模式

### 为动作创建副作用

这是最常见的中间件。下面是 [rtk 监听器中间件](https://github.com/reduxjs/redux-toolkit/blob/0678c2e195a70c34cd26bddbfd29043bc36d1362/packages/toolkit/src/listenerMiddleware/index.ts#L427) 的示例：

```ts
const middleware: ListenerMiddleware<S, D, ExtraArgument> =
  api => next => action => {
    if (addListener.match(action)) {
      return startListening(action.payload)
    }

    if (clearAllListeners.match(action)) {
      clearListenerMiddleware()
      return
    }

    if (removeListener.match(action)) {
      return stopListening(action.payload)
    }

    // 需要在 reducer 处理 action 之前获取此状态
    let originalState: S | typeof INTERNAL_NIL_TOKEN = api.getState()

    // `getOriginalState` 只能同步调用。
    // @see https://github.com/reduxjs/redux-toolkit/discussions/1648#discussioncomment-1932820
    const getOriginalState = (): S => {
      if (originalState === INTERNAL_NIL_TOKEN) {
        throw new Error(
          `${alm}: getOriginalState 只能同步调用`
        )
      }

      return originalState as S
    }

    let result: unknown

    try {
      // 实际上先将 action 传给 reducer，再处理监听器
      result = next(action)

      if (listenerMap.size > 0) {
        let currentState = api.getState()
        // 解决 ESBuild + TS 转译问题
        const listenerEntries = Array.from(listenerMap.values())
        for (let entry of listenerEntries) {
          let runListener = false

          try {
            runListener = entry.predicate(action, currentState, originalState)
          } catch (predicateError) {
            runListener = false

            safelyNotifyError(onError, predicateError, {
              raisedBy: 'predicate'
            })
          }

          if (!runListener) {
            continue
          }

          notifyListener(entry, action, api, getOriginalState)
        }
      }
    } finally {
      // 从此作用域移除 `originalState` 存储
      originalState = INTERNAL_NIL_TOKEN
    }

    return result
  }
```

第一部分监听 `addListener`、`clearAllListeners` 和 `removeListener` 动作，以决定后续应调用哪些监听器。

第二部分主要计算通过其他中间件和 reducer 后的状态，然后将原始状态和来自 reducer 的新状态传递给监听器。

通常在分发动作之后做副作用，因为这允许同时考虑原始状态和新状态，并且来自副作用的交互不应影响当前动作的执行（否则就不算是副作用了）。

### 修改或取消动作，或修改 dispatch 接受的输入

虽然这些模式较少见，但其中大多数（取消动作除外）都被 [redux thunk 中间件](https://github.com/reduxjs/redux-thunk/blob/587a85b1d908e8b7cf2297bec6e15807d3b7dc62/src/index.ts#L22) 使用：

```ts
const middleware: ThunkMiddleware<State, BasicAction, ExtraThunkArg> =
  ({ dispatch, getState }) =>
  next =>
  action => {
    // thunk 中间件查找传递给 `store.dispatch` 的函数。
    // 如果这个“动作”真的是一个函数，就调用它并返回结果。
    if (typeof action === 'function') {
      // 注入 store 的 `dispatch` 和 `getState` 方法，及任何“额外参数”
      return action(dispatch, getState, extraArgument)
    }

    // 否则按常规将动作传递给中间件链
    return next(action)
  }
```

通常，`dispatch` 只能处理 JSON 格式的动作。这个中间件添加了处理函数形式动作的能力。它还通过将函数动作的返回值传递为 dispatch 函数的返回值来改变 dispatch 本身的返回类型。

## 使中间件兼容的规则

原则上，中间件是一种非常强大的模式，可以对动作做任何处理。但现有中间件可能对其周围中间件的行为有一些假设，了解这些假设有助于确保你的中间件能与常用中间件良好协作。

我们的中间件和其他中间件有两个接触点：

### 调用下一个中间件

调用 `next` 时，中间件期望传入某种形式的动作。除非你明确想修改它，否则应直接传递你收到的动作。

更微妙的是，有些中间件期望中间件和 `dispatch` 在同一个事件循环（tick）内调用，所以你的中间件应该同步调用 `next`。

### 返回 dispatch 的返回值

除非中间件需要显式修改 `dispatch` 的返回值，否则应直接返回从 `next` 得到的值。如果你确实需要修改返回值，那么你的中间件必须放在中间件链的一个非常特定的位置，才能正确发挥作用 —— 你需要手动检查与所有其他中间件的兼容性，并决定它们如何协同工作。

这有一个棘手的后果：

```ts
const middleware: Middleware = api => next => async action => {
  const response = next(action)

  // 在动作到达 reducer 后做一些事情
  const afterState = api.getState()
  if (action.type === 'some/action') {
    const data = await fetchData()
    api.dispatch(dataFetchedAction(data))
  }

  return response
}
```

虽然看起来我们没有修改 `response`，但实际上我们修改了：因为 async-await，`response` 现在是一个 Promise。这会破坏像 RTK Query 这样的某些中间件。

那我们该如何改写这个中间件呢？

```ts
const middleware: Middleware = api => next => action => {
  const response = next(action)

  // 在动作到达 reducer 后做一些事情
  const afterState = api.getState()
  if (action.type === 'some/action') {
    void loadData(api)
  }

  return response
}

async function loadData(api) {
  const data = await fetchData()
  api.dispatch(dataFetchedAction(data))
}
```

只需将异步逻辑移到单独的函数中，这样你仍然可以使用 async-await，但不会在中间件中等待 Promise 解析。使用 `void` 标明你决定不显式等待这个 Promise，而不会影响代码行为。

## 接下来

如果还没看过，[了解 Redux 一文中的中间件章节](../understanding/history-and-design/middleware.md) 是个不错的补充，帮助你理解中间件的底层工作原理。