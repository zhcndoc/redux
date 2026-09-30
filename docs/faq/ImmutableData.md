---
id: immutable-data
title: 不可变数据
sidebar_label: 不可变数据
---

## Redux 常见问题解答：不可变数据

## 不可变性有什么好处？ {#what-are-the-benefits-of-immutability}

不可变性可以提升应用性能，并简化编程和调试，因为永远不会变化的数据比在应用中任意改变的数据更容易理解。

特别是在 Web 应用中，不可变性使得实现复杂的变化检测技术变得简单且低成本，确保只有在绝对必要时才执行计算开销大的 DOM 更新操作（这是 React 相较于其他库性能提升的基石）。

#### 更多信息

**文档**

- [Redux Toolkit：使用 Immer 编写 reducer - 不可变性与 Redux](/toolkit/usage/immer-reducers#immutability-and-redux)
- [React 文档：更新 state 中的对象](https://react.dev/learn/updating-objects-in-state)

**相关文章**

- [Dave Ceddia：React 和 Redux 不可变性完整指南](https://daveceddia.com/react-redux-immutability-guide/)

## 为什么 Redux 要求不可变性？ {#why-is-immutability-required-by-redux}

- Redux 和 React-Redux 都使用[浅层相等检查](#how-do-shallow-and-deep-equality-checking-differ)。具体来说：
  - Redux 的 `combineReducers` 工具会[浅层检查](#how-does-redux-use-shallow-equality-checking)它调用的 reducer 所导致的引用变化。
  - React-Redux 的 `useSelector` hook 会[按引用比较 selector 返回值与上一次的值](#how-does-react-redux-use-shallow-equality-checking)，以判断组件是否需要重新渲染。要使这类[浅层检查正常工作，就必须遵循不可变性](#why-will-shallow-equality-checking-not-work-with-mutable-objects)。
- 不可变数据管理最终会让数据处理更安全。
- 时间旅行调试要求 reducer 是没有副作用的纯函数，这样才能正确跳转到不同状态。

#### 更多信息

**文档**

- [使用 Redux：先决条件 Reducer 概念](../usage/structuring-reducers/PrerequisiteConcepts.md)

**讨论**

- [Reddit：为什么 Redux 需要 Reducers 是纯函数](https://www.reddit.com/r/reactjs/comments/5ecqqv/why_redux_need_reducers_to_be_pure_functions/dacmmjh/?context=3)

## 为什么 Redux 使用浅层相等检查需要不可变性？

要让已订阅的组件正确更新，Redux 使用浅层相等检查时就要求遵循不可变性。要理解原因，先来看 JavaScript 中浅层相等检查和深度相等检查的区别。

### 浅层相等和深度相等检查有何不同？ {#how-do-shallow-and-deep-equality-checking-differ}

浅层相等检查（或称 _引用相等_）仅检查两个不同的 _变量_ 是否引用同一对象；而深度相等检查（或称 _值相等_）需递归检查两个对象的每个属性值。

浅层相等检查就像简单且快速的 `a === b`，而深度相等检查需要递归遍历两个对象的所有属性，逐一比较属性值。

正因为浅层相等检查的性能优势，Redux 采用了它。

#### 更多信息

**文章**

- [React.js 中使用不可变性的利弊](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### Redux 如何使用浅层相等检查？ {#how-does-redux-use-shallow-equality-checking}

Redux 在 `combineReducers` 中使用浅层相等检查，以决定返回一个新的修改过的根状态对象，还是如果没有修改就返回当前根状态对象。

#### 更多信息

**文档**

- [API：combineReducers](../api/combineReducers.md)

#### `combineReducers` 如何使用浅层相等检查？

Redux store 的[推荐结构](./Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)是按键将状态对象拆分为多个“切片”或“领域”，并为每个数据切片提供独立的 reducer 函数。

`combineReducers` 简化了这种结构的管理，它接受一个 `reducers` 参数，该参数是一个键值对哈希表，键是状态切片名，值是对应处理该切片的 reducer 函数。

例如，如果状态结构是 `{ todos, counter }`，调用 `combineReducers` 如下：

```js
combineReducers({ todos: myTodosReducer, counter: myCounterReducer })
```

其中：

- 键 `todos` 和 `counter` 分别表示单独的状态切片；
- 值 `myTodosReducer` 和 `myCounterReducer` 是处理各自状态切片的 reducer 函数。

`combineReducers` 遍历每对键值对，每一次：

- 引用当前状态切片；
- 调用对应的 reducer 处理该切片；
- 引用 reducer 返回的可能被修改过的状态切片。

遍历完成后，`combineReducers` 会用 reducers 返回的状态切片构造一个新的状态对象。这个新状态对象可能与当前状态相同，也可能不同。此时，`combineReducers` 使用浅层相等检查判断状态是否更改。

具体地，遍历中 `combineReducers` 对当前状态切片与 reducer 返回的状态切片做浅层相等检查。如果 reducer 返回新对象，浅层检查失败，`combineReducers` 会将 `hasChanged` 标志设置为 true。

遍历结束后，`combineReducers` 会检查 `hasChanged` 标志。若为 true，则返回新构建的状态对象；若为 false，则返回当前状态对象。

强调一点：_如果所有 reducers 都返回传入它们的同一个 `state` 对象，`combineReducers` 会返回*当前*根状态对象，而不是新对象。_

#### 更多信息

**文档**

- [API: combineReducers](../api/combineReducers.md)
- [Redux 常见问题：如何在两个 reducer 之间共享状态？我必须使用 `combineReducers` 吗？](./Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)

**视频**

- [Egghead.io：Redux：从头实现 combineReducers()](https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch)

### React-Redux 如何使用浅层相等检查？ {#how-does-react-redux-use-shallow-equality-checking}

每次派发 action 后，React-Redux 都会使用新的根状态重新运行传给 `useSelector` 的 selector，并通过 `===` 将结果与上一次的结果进行比较。如果两个值引用相同，组件就不会重新渲染；如果引用不同，则会重新渲染。

这一次比较正是不可变性对 React 侧很重要的原因。如果 reducer 修改现有对象并将其返回，selector 返回的引用就与之前相同，检查会判定为相等；即使数据已经改变，组件也不会更新。如果 selector 每次调用都会新建对象或数组（例如调用 `array.filter()`），每次 dispatch 后检查都会判定为不相等；即使相关数据没有变化，组件也会重新渲染。React Redux 常见问题介绍了这两类问题及其解决方法。

#### 更多信息

**文档**

- [Redux 常见问题：为什么我的组件没有重新渲染？](./ReactRedux.md#why-isnt-my-component-re-rendering)
- [Redux 常见问题：为什么我的组件重新渲染得太频繁？](./ReactRedux.md#why-is-my-component-re-rendering-too-often)
- [React Redux：`useSelector`](/react-redux/api/hooks#useselector)

### 为什么浅层相等检查无法用于可变对象？ {#why-will-shallow-equality-checking-not-work-with-mutable-objects}

浅层相等检查无法检测出函数是否变更了传入的可变对象。

因为两个引用同一对象的变量 _总是_ 相等，无论该对象的值是否改变。如下所示：

```js
function mutateObj(obj) {
  obj.key = 'newValue'
  return obj
}

const param = { key: 'originalValue' }
const returnVal = mutateObj(param)

param === returnVal
//> true
```

浅检查只是比较两个变量是否引用同一对象，它们确实引用同一对象。即使 `mutateObj()` 返回了修改后的对象，实际上也还是同一个传入的对象。它的值被修改与否对浅层检查无影响。

#### 更多信息

**文章**

- [React.js 中使用不可变性的利弊](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### Redux 中使用可变对象的浅层相等检查会有问题吗？

对可变对象进行浅层相等检查不会给 Redux 本身造成问题，但[会影响依赖 store 的库，例如 React-Redux](./ReactRedux.md#why-isnt-my-component-re-rendering)。

具体而言，如果传入 reducer 的状态切片是可变对象，reducer 可能会直接修改它并返回。

这样，`combineReducers` 的浅层检查总是通过，因为切片被修改了值，但对象本身没变 —— 它依然是传入的那个对象。

于是 `combineReducers` 不会把 `hasChanged` 标志置为 true，即使状态实际更改。如果没有其他 reducers 返回新的切片，`hasChanged` 永远为 false，导致 `combineReducers` 返回 _当前_ 根状态对象。

store 中的根状态仍会更新为新值，但根状态对象本身没有变化。React-Redux 等绑定到 Redux 的库因此无法察觉状态被修改，也就不会重新渲染已订阅的组件。

Redux Toolkit 的 `configureStore` 会添加仅用于开发环境的不可变性检查中间件；reducer 修改状态时会立即抛出错误，因此这类问题不会等到组件无法更新时才暴露出来。

#### 更多信息

**文档**

- [使用 Redux：不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [故障排查：reducer 修改了状态](../usage/Troubleshooting.md#the-reducer-mutated-the-state)
- [Redux Toolkit：不可变性中间件](/toolkit/api/immutabilityMiddleware)

### 不可变性如何使浅层检查能感知对象变更？

如果对象不可变，要修改其中的数据只能复制一份对象并修改这份副本。

这份被修改的副本是 _与传入对象不同_ 的新对象，返回时浅层检查会识别出它与传入对象不同，从而失败。

#### 更多信息

**文章**

- [React.js 中使用不可变性的利弊](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### 你 reducer 内的不可变性如何导致组件不必要的渲染？

你不能直接修改不可变对象，只能修改它的副本，保持原对象不变。

当你修改副本没问题，但在 reducer 里如果返回一个 _没有被修改的副本_，`combineReducers` 仍会认为状态需要更新，因为你返回了一个不同的对象。

`combineReducers` 随后会把这个新的根状态对象返回给 store。新对象的值虽然与当前根状态相同，但因为对象引用不同，store 仍会更新。应用中的每个 `useSelector` hook 都会重新运行 selector；任何读取了复制后切片并返回新引用的 selector，都会导致组件不必要地重新渲染。

为避免这种情况，reducer 未修改状态时，_必须始终返回传给该 reducer 的原状态切片对象_。`createSlice` 生成的 reducer 会自动做到这一点：如果 draft 没有变化，Immer 就会返回原对象。

selector 也可能出现类似问题：每次调用都返回新数组或对象的 selector 会导致每次 dispatch 都重新渲染。此类情况请参阅[为什么组件重新渲染得太频繁？](./ReactRedux.md#why-is-my-component-re-rendering-too-often)。

为避免此问题，**如果 reducer 没有修改状态，必须返回传入的原状态切片对象**。

#### 更多信息

- [React.js pure render performance anti-pattern](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.5hmnwygsy)

## 不同的不可变数据处理方法有哪些？必须用 Immer 吗？ {#what-approaches-are-there-for-handling-data-immutability-do-i-have-to-use-immer}

Redux 本身只要求 reducer 返回新值，而不是修改现有值。如何生成这些新值由你决定。

Redux Toolkit 的 `createSlice` 和 `createReducer` 内部使用 [Immer](https://immerjs.github.io/immer/)，因此用它们编写的 case reducer 可以使用“修改”语法，而 Immer 会生成不可变结果。这是我们推荐的方式，也是当前所有 Redux 教程采用的方式。Immer 是 Redux Toolkit 的内置部分；[使用 Immer 编写 reducer](/toolkit/usage/immer-reducers)介绍了它的工作原理、推荐模式、常见陷阱以及将其集成进来的原因。

如果不使用 Redux Toolkit 而是手动编写 reducer，就需要通过对象展开和非修改数组方法，复制每一层发生变化的嵌套结构。[不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)介绍了正确做法，并列出最容易导致意外修改的错误。你也可以在手写 reducer 中直接调用 Immer 的 `produce`。

修改不可变对象意味着必须对其做完整拷贝，拷贝大量属性开销大。

相对而言，像 Immer 这类不可变库支持结构共享，在复制对象时重用大量已有结构，因此性能更好。

- [Redux Toolkit：使用 Immer 编写 reducer](/toolkit/usage/immer-reducers)
- [使用 Redux：不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [Redux Toolkit：不可变性中间件](/toolkit/api/immutabilityMiddleware)

## 手动编写不可变更新有哪些问题？ {#what-are-the-issues-with-writing-immutable-updates-by-hand}

在纯 JavaScript 中手动编写不可变更新有两个问题，而 Immer 都能解决：

- **意外修改。** 更新嵌套属性时，很容易误用原引用而没有复制，或没意识到只复制了对象顶层。意外修改是 Redux bug 最常见的原因，通常会表现为组件没有重新渲染。Redux Toolkit 的 `configureStore` 包含仅用于开发环境的不可变性检查中间件，reducer 修改状态时会抛出错误。
- **代码冗长。** 正确更新嵌套数据时，需要为每一层都编写多行展开复制代码，这会掩盖更新意图，也增加了出错的机会。

手写更新模式及常见错误请参阅[不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)；Immer 如何处理相同更新，请参阅[使用 Immer 编写 reducer](/toolkit/usage/immer-reducers)。
