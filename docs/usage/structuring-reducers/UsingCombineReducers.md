---
id: using-combinereducers
title: 使用 combineReducers
description: '结构化 Reducers > 使用 combineReducers：combineReducers 在实际应用中的工作原理说明'
hide_title: true
---

&nbsp;

# 使用 `combineReducers`

## 核心概念

Redux 应用中最常见的状态结构是一个包含各领域特定数据“切片”的普通 Javascript 对象，每个顶级键对应一个切片。类似地，为该状态结构编写 reducer 逻辑的最常用方法是编写多个“切片 reducer”函数，这些函数都具有相同的 `(state, action)` 签名，并负责管理该特定状态切片的所有更新。多个切片 reducer 可以响应同一动作，独立地根据需要更新各自的切片，最终将更新后的切片组合成新的状态对象。

因为这种模式非常普遍，Redux 提供了 `combineReducers` 工具来实现该行为。它是一个 _高阶 reducer_ 的示例，接收一个装满切片 reducer 函数的对象，返回一个新的 reducer 函数。

使用 `combineReducers` 时需要注意以下几个重要概念：

- 首先且最重要的是，`combineReducers` 仅仅是**一个用于简化编写 Redux reducer 最常见用例的实用函数**。你**不必**在自己的应用中强制使用它，它也**无法**处理所有可能的场景。完全可以编写不使用它的 reducer 逻辑，并且在 `combineReducers` 无法覆盖的场景下编写自定义 reducer 逻辑是相当常见的。（请参阅[超越 `combineReducers`](./BeyondCombineReducers.md)获取示例和建议。）
- 虽然 Redux 本身并不对你的状态组织方式提出意见，但 `combineReducers` 强制执行一些规则，帮助用户避免常见错误。（详细信息请参见[`combineReducers`](../../api/combineReducers.md)文档。）
- 另一个常见问题是 Redux 在派发动作时是否“调用所有 reducers”。由于实际上只有一个根 reducer 函数，默认答案是“不，不会”。不过，`combineReducers` 的行为_确实_是如此。为了组装新的状态树，`combineReducers` 会调用每个切片 reducer，传入它当前对应的状态切片和当前动作，这给切片 reducer 机会响应并在需要时更新其状态切片。因此，从这个意义上讲，使用 `combineReducers` _确实_ “调用了所有 reducers”，或至少调用了所有它所包装的切片 reducers。
- 你可以在 reducer 结构的任意层级使用它，而不仅仅是用来创建根 reducer。非常常见的是在不同位置使用多个合并的 reducers，然后组合起来形成根 reducer。

## 定义状态结构

有两种方式来定义存储的初始状态形状和内容。第一，`createStore` 函数可以接受第二个参数 `preloadedState`，主要用来初始化之前持久化在别处（例如浏览器的 localStorage）中的状态。另一种方式是根 reducer 在接收到 `undefined` 状态时返回初始状态值。这两种方法在[初始化状态](./InitializingState.md)中有更详细的描述，但在使用 `combineReducers` 时还需注意一些额外事项。

`combineReducers` 接收一个由切片 reducer 函数组成的对象，并创建一个输出对应状态对象的函数，输出对象的键名与输入对象相同。这意味着如果没有向 `createStore` 提供预加载状态，则传入的切片 reducer 对象的键名决定了输出状态对象的键名。当使用诸如默认模块导出和对象字面量简写等特性时，这些名称之间的对应关系并不总是显而易见。

下面是一个示例，展示了使用对象字面量简写与 `combineReducers` 如何定义状态结构：

```js
// reducers.js
export default theDefaultReducer = (state = 0, action) => state

export const firstNamedReducer = (state = 1, action) => state

export const secondNamedReducer = (state = 2, action) => state

// rootReducer.js
import { combineReducers, createStore } from 'redux'

import theDefaultReducer, {
  firstNamedReducer,
  secondNamedReducer
} from './reducers'

// 使用对象字面量简写语法定义对象结构
const rootReducer = combineReducers({
  theDefaultReducer,
  firstNamedReducer,
  secondNamedReducer
})

const store = createStore(rootReducer)
console.log(store.getState())
// {theDefaultReducer : 0, firstNamedReducer : 1, secondNamedReducer : 2}
```

注意，因为我们使用了定义对象字面量的简写，结果状态中的键名与导入变量名相同。这并不总是符合预期，且对于不太熟悉现代 JS 语法的人而言，常常会引起困惑。

此外，生成的键名有些奇怪。通常不建议在状态的键名中包含“reducer”等词 —— 键名应仅反映其存储的数据域或类型。这意味着我们应该明确指定切片 reducer 对象中的键名来定义输出状态对象的键，或者在使用简写对象字面量语法时，仔细重命名导入的切片 reducer 变量以设置键名。

更好的写法可能如下：

```js
import { combineReducers, createStore } from 'redux'

// 将默认导入重命名为我们想要的名称，也可以重命名命名导入
import defaultState, {
  firstNamedReducer,
  secondNamedReducer as secondState
} from './reducers'

const rootReducer = combineReducers({
  defaultState, // 键名与我们精心重命名的默认导出相同
  firstState: firstNamedReducer, // 用特定键名代替变量名
  secondState // 键名与我们精心重命名的命名导出相同
})

const reducerInitializedStore = createStore(rootReducer)
console.log(reducerInitializedStore.getState())
// {defaultState : 0, firstState : 1, secondState : 2}
```

这种状态结构更好地体现了所涉及的数据，因为我们细心设置了传给 `combineReducers` 的键名。