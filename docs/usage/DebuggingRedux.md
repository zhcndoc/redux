---
id: debugging
title: 调试 Redux
description: '使用 Redux > 调试：调试思路及其在 Redux 应用中的实践'
---

# 调试 Redux

调试是找出程序为何没有按预期工作并修复问题的过程。开发者有很大一部分时间都在做这件事，但它很少被系统地教授。大多数人都是通过一次次处理 bug 艰难地学会调试。

本页介绍两方面内容：适用于各种软件的一般调试方法，以及将其应用到 Redux 应用时的具体工具和技巧。[故障排查](./Troubleshooting.md)页面列出了具体的错误消息及其修复方法；本页则介绍在没有明确错误消息时如何查找问题。

## 调试原则

每个问题都有原因。原因不一定容易找到，尤其是遇到非确定性行为、难以复现的操作步骤，或无法直接检查的运行环境时，但它一定存在。遵循一些原则可以大幅提高找到原因的可能性。

**明确系统应该如何工作。** Bug 就是“系统没有按预期工作”。如果不清楚正确行为是什么，就无法判断哪里出了问题。对于 Redux 应用，这意味着要知道用户执行某个操作后 store 中应当是什么状态，以及 UI 应该如何呈现该状态。

**复现问题。** 稳定复现可以确认问题_发生在哪里_，让你检查实际行为而不是猜测，并验证修复是否真正生效。尽量将复现步骤缩减到仍能触发 bug 的最少步骤。

**有计划地调试。** 把调试当作实验：针对原因提出假设，做出能够验证该假设的改动，并检查结果。一次只改一件事。如果同时改了三处后 bug 消失，你就不知道是哪处改动起了作用，而且可能引入了新问题。

**阅读代码，包括你没有编写的代码。** 理解 bug 往往需要查看所用抽象的底层实现，这也包括第三方库。库代码只是 `node_modules` 中的 JavaScript 文件。你可以阅读它、在其中设置断点，甚至临时添加 `console.log` 调用（之后记得撤销）。

**使用合适的工具。** 打印日志和单步调试器回答的是不同问题。添加日志很容易，可以观察值随时间如何变化；调试器可以暂停在某个位置并检查作用域内的所有内容。实际调试通常会同时使用两者。

**找到真正的错误。** 堆栈跟踪和错误消息通常指向距离根因好几步的表面症状。不断追问“_为什么_会发生这种情况？”，直到找到输入已经出错的步骤。

**知道何时暂停。** 建立对实际运行过程的认知需要时间和专注，也会让人疲惫。如果陷入停滞，不妨休息一下；重新开始时往往就能找到答案。

### 常见调试步骤

1. 理解问题描述。用户执行了什么操作、预期结果是什么、实际发生了什么？
2. 复现问题，并尽可能缩减复现步骤。
3. 判断问题为何发生：提出假设、验证假设并缩小可能原因的范围。
4. 追溯根因，而不只是停留在最先出现症状的位置。
5. 决定修复方法。尽可能修复根因，并理解相关约束（问题有多严重、还有哪些代码依赖此处）。
6. 做出改动，并添加测试或检查，避免同类问题再次发生。
7. 记录发现。下一个遇到此问题的人（也可能是你自己）会感谢你。

## 在 Redux 中实践

Redux 的数据流让上述方法更容易实践，因为它消除了 bug 可能藏匿的大部分位置：

- 所有状态更新都通过派发 action 发生。
- Store 使用 `(state, action)` 运行根 reducer 并保存结果。
- UI 读取最新状态，并在所选值发生变化时重新渲染。

因此，当界面出现问题时，只需依次询问三个问题：

1. **Action 是否已派发？** 如果没有，问题出在本应派发它的代码中：事件处理器没有运行、thunk 提前退出，或 action creator 虽然被调用却没有将结果传给 `dispatch`。
2. **Reducer 如何处理了它？** 如果 action 已派发，但状态没有按预期变化，问题出在 reducer：匹配了错误的 case（或没有匹配任何 case）、更新逻辑有误，或状态被原地修改，导致 store 没有看到新值。
3. **组件选择了什么？** 如果状态正确但 UI 错误，问题出在 selector 或渲染逻辑：selector 读取了错误路径、每次调用都返回新引用导致组件不断重新渲染，或组件渲染逻辑本身有误。

由于每次状态变化都对应一个 action，而 action 会被记录，已派发 action 列表就构成了应用行为的完整历史。这就是“可预测”在实践中的含义：你总能从错误状态值追溯到产生它的具体 action，再找到派发该 action 的代码。

Redux Toolkit 的开发模式检查可以在你手动排查前捕获其中一些问题。`configureStore` 会在开发环境添加 middleware，在 reducer 修改状态或 action、状态值不可序列化时抛出错误；selector 返回不稳定引用时，React-Redux 也会发出警告。相关错误及修复方法列在[故障排查](./Troubleshooting.md)页面中。如果尚未使用 Redux Toolkit，迁移到 RTK 可以从根本上消除一整类 bug。

## Redux DevTools

[Redux DevTools 扩展](https://github.com/reduxjs/redux-devtools/tree/main/extension)可以直接回答上述三个问题。可为 [Chrome](https://chromewebstore.google.com/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)、[Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/) 或 [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei) 安装扩展。`configureStore` 会在开发环境中自动连接，无需额外配置：打开浏览器开发者工具并切换到“Redux”面板即可。

### 查看 Action 历史

面板左侧按顺序列出每个已派发的 action 及其类型（`todos/todoAdded`）。选中某个 action 后，右侧会显示多个标签页：

- **Action（动作）**：action 对象的完整内容。如果 reducer 收到了正确类型但执行结果不对，可以在这里检查；常见原因是 `payload` 与预期不符。
- **State（状态）**：执行此 action 后的完整状态树。当 selector 返回 `undefined`，或不确定 reducer 是否已添加到 store 时，可在这里确认实际状态结构。
- **Diff（差异）**：此 action 导致的具体值变化。一个本应改变状态的 action 却显示空差异，通常表示 reducer 返回了原状态：要么没有匹配的 case，要么原地修改了状态而没有返回新值。
- **Trace（跟踪）**：派发此 action 的代码堆栈跟踪（需启用跟踪，见下文）。当出现意料之外的 action 时，这是回答“是谁派发的？”最快的方法。

查看列表时，应从上到下阅读，找到状态首次出错前的那个 action。Bug 出在该 action 对应的 reducer，或出在派发了错误内容的代码中。此后发生的一切都源自同一个问题。

如果预期的 action_不在_列表中，说明它从未被派发。不要再检查 reducer，而应检查本应调用 `dispatch` 的代码。

### 时间旅行调试

由于 reducer 是纯函数，DevTools 可以重新计算历史记录中任意时刻的状态。点击较早 action 旁的 **Jump（跳转）**，store 就会恢复到该 action 执行后的状态，你可以查看当时 UI 的样子。**Skip（跳过）**会从历史中移除某个 action，并在不执行它的情况下重新计算之后的所有状态，可快速验证“是不是这个 action 导致了问题”。面板底部的 **Reset（重置）**、**Revert（还原）**和 **Commit（提交）**控件可清空历史或设置新的起点。

只有 reducer 保持纯函数，时间旅行调试才能正常工作。如果跳回某个 action 后，应用的表现与当时不同，这本身就是值得追查的 bug：可能有状态保存在 store 之外，也可能 reducer 包含副作用。

### 手动派发 Action

面板底部的 **Dispatcher（派发器）**允许你输入 action 对象并将其派发给运行中的应用。它适合在不操作 UI 的情况下测试 reducer case，或将应用置于特定状态以复现问题。

### 启用 Trace 和其他选项

默认关闭 Trace 捕获，因为为每次 dispatch 生成堆栈跟踪会降低速度。可以通过 `devTools` 选项启用：

```ts
import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducer'

export const store = configureStore({
  reducer: rootReducer,
  devTools: {
    trace: true,
    traceLimit: 25
  }
})
```

其他值得了解的选项：

- `maxAge`：历史中保留的 action 数量（默认 50）。需要的 action 被滚出列表时可以调高；应用事件频繁、DevTools 变慢时可以调低。
- `actionSanitizer` 和 `stateSanitizer`：将 action 和 state 发送给扩展前对其进行转换的函数。可用它们移除导致面板变慢的大型 payload（例如图像数据或超大数组），且不会改变真实状态。
- `actionsDenylist` / `actionsAllowlist`：按 action 类型名称或正则表达式筛选要记录的类型。

完整选项列表请参阅[扩展的 Arguments 文档](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/API/Arguments.md)。传入 `devTools: false` 可完全关闭连接。

### RTK Query

如果使用 RTK Query，DevTools 面板会有一个“RTK Query”标签页，列出缓存中的每个 query 和 mutation，以及其参数、状态、缓存数据、提供的标签和订阅者数量。当组件显示过期数据，或请求频率高于预期时，可以在此查看缓存的实际内容，以及哪些组件订阅了各条目。

### 没有浏览器扩展时

对于 React Native、Node 或任何没有浏览器扩展的环境，可以使用 [`@redux-devtools/remote`](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-remote) 包，将 store 连接到其他位置运行的 DevTools 实例。Expo 项目也可以改用 [Redux DevTools Expo 开发插件](https://github.com/matt-oakes/redux-devtools-expo-dev-plugin)。

## 记录日志

DevTools 能满足大多数需求，但有时直接在控制台输出日志更快，尤其是想观察 action 如何与应用的其他输出交错出现时。下面是一个最精简的日志 middleware：

```ts
import type { Middleware } from '@reduxjs/toolkit'
import { isAction } from '@reduxjs/toolkit'

export const loggerMiddleware: Middleware = store => next => action => {
  const type = isAction(action) ? action.type : 'unknown action'
  console.group(type)
  console.log('dispatching', action)
  const result = next(action)
  console.log('next state', store.getState())
  console.groupEnd()
  return result
}
```

使用 `configureStore` 的 `middleware` 回调，仅在开发环境中添加它：

```ts
export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => {
    const middleware = getDefaultMiddleware()
    if (import.meta.env.DEV) {
      return middleware.concat(loggerMiddleware)
    }
    return middleware
  }
})
```

[`redux-logger`](https://github.com/LogRocket/redux-logger) 也能完成同样的工作，并提供更多格式选项和可折叠分组。

在浏览器控制台查看日志对象时，需注意两点：

- 控制台会在你_展开对象时_显示它的内容，而不是日志语句执行时的内容。如果状态此后被修改，日志就会误导你。`console.log(JSON.stringify(value))` 或 `structuredClone(value)` 可以冻结一个快照。
- 在 `createSlice` 或 `createReducer` 的 case reducer 中，`state` 是 Immer draft（一个 `Proxy`）。直接记录它会显示 proxy 的内部结构，而不是数据。使用 Redux Toolkit 从 Immer 重新导出的 `current` 函数获取普通快照：

```ts
import { createSlice, current } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [] as Todo[],
  reducers: {
    todoToggled(state, action: PayloadAction<string>) {
      console.log('before', current(state))
      const todo = state.find(todo => todo.id === action.payload)
      if (todo) {
        todo.completed = !todo.completed
      }
      console.log('after', current(state))
    }
  }
})
```

## 使用调试器

单步调试器可以让你在指定行暂停执行、检查作用域中的所有变量，并沿调用栈追踪执行路径。浏览器 DevTools 的“Sources”面板和 VS Code 的 JavaScript 调试器都适用于 Redux 应用，基本概念相同：

- **断点**：执行到某行时暂停。点击行号即可设置，也可以在代码中添加 `debugger` 语句。
- **条件断点**：只有表达式为真时才暂停。右键点击断点并添加类似 `action.type === 'todos/todoAdded'` 的条件，比每次 dispatch 都暂停快得多。
- **日志点**：执行到某行时记录值，但不会暂停。无需编辑代码并重新加载，就能临时添加 `console.log`。
- **单步跳过 / 单步进入 / 单步跳出**：逐行执行代码。**调用堆栈**面板显示到达当前行的函数调用链；点击某个栈帧可查看当时作用域中的变量。

在 Redux 应用中，以下位置通常值得设置断点：

- case reducer 内：查看传入的 state 和 action，并逐步检查更新逻辑。
- thunk 内：确认代码是否执行到 `dispatch` 调用，以及实际派发了什么。
- `useSelector` 回调内：检查组件实际收到的状态。

在 case reducer 中暂停时，记住 `state` 是 Immer draft。调试器的变量面板会显示 proxy；在控制台执行 `current(state)` 即可查看数据（需要在该模块中导入 `current`，或临时将其挂到 `window` 上）。

## 调试 React 渲染

Redux 状态正确后，还需要 React 将其渲染出来。如果 store 中的值正确，但 UI 显示错误或更新过于频繁，问题就出在 React 一侧，应使用 [React DevTools](https://react.dev/learn/react-developer-tools)：

- **Components** 标签页显示组件树；选中组件后，可以查看它的 props、hooks（包括 `useSelector` 返回值）以及渲染它的组件。在浏览器 Elements 面板中选中 DOM 元素，再切换到 Components，即可直接跳转到生成该元素的组件。
- **Profiler** 标签页会记录渲染，并显示哪些组件重新渲染及其原因。原因包括“Hooks changed”；对于使用 `useSelector` 的组件，这意味着选中值发生了变化。

每次都返回新引用的 `useSelector` 回调（例如返回 `filter` 结果或新对象字面量）会导致组件在每个 action 派发后重新渲染。React-Redux 会在开发环境警告此问题；解决方法是像 [React Redux 常见问题](../faq/ReactRedux.md#why-is-my-component-re-rendering-too-often)所述，使用 `createSelector` 对派生逻辑进行记忆化。关于 React 组件何时重新渲染的更多通用规则，请参阅[React 渲染行为（基本）完整指南](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)。

## 使用 Replay 录制会话

有些 bug 只会在一连串特定操作之后出现，或只在别人的机器上出现；手动复现往往最困难。[Replay](https://www.replay.io/) 可以录制一次浏览器会话，供你之后检查录制内容。录制会捕获 JavaScript 引擎接收的所有输入，因此可以精确回放并在任意位置暂停：你可以为已经执行过的代码添加控制台日志、检查任意时刻的变量，并单步检查 reducer 和 selector 调用，而无需再次复现 bug。你可以在 Replay DevTools 中手动检查录制，也可以通过 [Replay MCP](https://docs.replay.io/basics/replay-mcp/overview) 将其交给编程代理，让代理使用录制中的时间旅行调试工具。请参阅[如何录制应用](https://docs.replay.io/basics/getting-started/record-your-app)和[调试概览](https://docs.replay.io/basics/debugging/overview)了解入门方法。

## 更多信息

**通用调试**

- Mark Erikson：[调试 JavaScript：工具与技巧](https://blog.isquaredsoftware.com/presentations/2023-06-debugging-js/)（幻灯片；本页内容基于该演讲）
- Mark Erikson：[调试技巧与案例](https://blog.isquaredsoftware.com/2019/01/blogged-answers-debugging-tips/)
- Julia Evans：[为什么有些 bug 看起来“无法解决”](https://jvns.ca/blog/2021/06/08/reasons-why-bugs-might-feel-impossible/)
- [调试任何问题的 20 个步骤](https://debug.guide/)
- [Chrome DevTools：调试 JavaScript](https://developer.chrome.com/docs/devtools/javascript)

**Redux 和 React 工具**

- [Redux DevTools 扩展文档](https://github.com/reduxjs/redux-devtools/tree/main/extension/docs)
- [Redux DevTools：跟踪 Action](https://github.com/reduxjs/redux-devtools/blob/main/extension/docs/Features/Trace.md)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Immer：`current`](https://immerjs.github.io/immer/current/)
