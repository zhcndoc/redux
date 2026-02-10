---
id: immutable-data
title: 不可变数据
sidebar_label: 不可变数据
---

## Redux 常见问题解答：不可变数据

## 不可变性有什么好处？

不可变性可以提升应用性能，并简化编程和调试，因为永远不会变化的数据比在应用中任意改变的数据更容易理解。

特别是在 Web 应用中，不可变性使得实现复杂的变化检测技术变得简单且低成本，确保只有在绝对必要时才执行计算开销大的 DOM 更新操作（这是 React 相较于其他库性能提升的基石）。

#### 更多信息

**文章**

- [Immer 入门](https://immerjs.github.io/immer/)
- [JavaScript 不可变性演讲 (PDF - 见第 12 页有关好处)](https://www.jfokus.se/jfokus16/preso/JavaScript-Immutability--Dont-Go-Changing.pdf)
- [React：优化性能](https://facebook.github.io/react/docs/optimizing-performance.html)
- [2015 年的 JavaScript 应用架构](https://medium.com/google-developers/javascript-application-architecture-on-the-road-to-2015-d8125811101b#.djje0rfys)

## 为什么 Redux 要求不可变性？

- Redux 和 React-Redux 都采用了[浅层相等检查](#浅层检查和深度检查有何差异)。具体来说：
  - Redux 的 `combineReducers` 工具会[浅层检查由 reducer 导致的引用变化](#redux 如何使用浅层相等检查)。
  - React-Redux 的 `connect` 方法生成的组件会[浅层检查根状态的引用变化](#react-redux 如何使用浅层相等检查)及 `mapStateToProps` 函数的返回值，以判断包装组件是否需要重新渲染。这种[浅层检查要求不可变性](#为什么浅层相等检查不能用在可变对象)才能正确工作。
- 不可变数据管理最终使得数据处理更安全。
- 时间旅行调试要求 reducers 必须是纯函数、无副作用，以确保能够正确跳转不同状态。

#### 更多信息

**文档**

- [使用 Redux：先决条件 Reducer 概念](../usage/structuring-reducers/PrerequisiteConcepts.md)

**讨论**

- [Reddit：为什么 Redux 需要 Reducers 是纯函数](https://www.reddit.com/r/reactjs/comments/5ecqqv/why_redux_need_reducers_to_be_pure_functions/dacmmjh/?context=3)

## 为什么 Redux 使用浅层相等检查需要不可变性？

Redux 使用浅层相等检查，如果要正确更新任何连接组件，就必须保证不可变性。要理解原因，我们需要了解 JavaScript 中浅层和深度相等检查的区别。

### 浅层相等和深度相等检查有何不同？

浅层相等检查（或称 _引用相等_）仅检查两个不同的 _变量_ 是否引用同一对象；而深度相等检查（或称 _值相等_）需递归检查两个对象的每个属性值。

浅层相等检查就像简单且快速的 `a === b`，而深度相等检查需要递归遍历两个对象的所有属性，逐一比较属性值。

正因为浅层相等检查的性能优势，Redux 采用了它。

#### 更多信息

**文章**

- [React.js 中使用不可变性的利弊](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### Redux 如何使用浅层相等检查？

Redux 在 `combineReducers` 中使用浅层相等检查，以决定返回一个新的修改过的根状态对象，还是如果没有修改就返回当前根状态对象。

#### 更多信息

**文档**

- [API：combineReducers](../api/combineReducers.md)

#### `combineReducers` 如何使用浅层相等检查？

Redux 推荐的 store 结构是通过键将状态对象拆分成多个“切片”或“领域”，并为每个切片提供独立的 reducer 函数。

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

- [API：combineReducers](../api/combineReducers.md)
- [Redux FAQ - 如何在两个 reducers 之间共享 state？必须使用 `combineReducers` 吗？](./Reducers.md#reducers-share-state)

**视频**

- [Egghead.io：Redux：从头实现 combineReducers()](https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch)

### React-Redux 如何使用浅层相等检查？

React-Redux 使用浅层相等检查来判断被包装组件是否需要重新渲染。

它假定被包装组件是纯组件；即组件在相同的 props 和 state 下会产生相同的结果（[详情](https://react-redux.js.org/troubleshooting#my-views-aren-t-updating-when-something-changes-outside-of-redux)）。

因此，它只检查根状态对象或 `mapStateToProps` 函数返回值是否发生变化。如果未变化，则无需重新渲染组件。

它通过保存对根状态对象的引用，以及保存 props 对象中每个值（由 `mapStateToProps` 返回）引用进行浅层相等检测。

然后，它对存储的根状态引用与传入的根状态对象做浅层相等检查，并对每个 props 值的引用分别做浅层相等检查。

#### 更多信息

**文档**

- [React-Redux 绑定](https://react-redux.js.org)

**文章**

- [React-Redux 的 connect 函数和 `mapStateToProps` API](https://react-redux.js.org/using-react-redux/connect-mapstate)
- [Redux FAQ：为什么我的组件没有重新渲染，或者 `mapStateToProps` 不执行？](./ReactRedux.md#why-isnt-my-component-re-rendering-or-my-mapstatetoprops-running)

### 为什么 React-Redux 对 `mapStateToProps` 返回的 props 对象中的每个值进行浅层检查？

React-Redux 对 props 对象中的每个 _值_ 做浅层相等检测，而不是直接对 props 对象本身做检测。

这是因为 props 对象实际上是一个属性名与其值（或用于获取/生成值的选择器函数）的哈希，例如：

```js
function mapStateToProps(state) {
  return {
    todos: state.todos, // 属性值
    visibleTodos: getVisibleTodos(state) // 选择器
  }
}

export default connect(mapStateToProps)(TodoApp)
```

因此，每次调用 `mapStateToProps` 返回的 props 对象都是新对象，对 props 对象做浅层检查会总是失败。

React-Redux 会单独保存返回的 props 对象中每个 _值_ 的引用。

#### 更多信息

**文章**

- [React.js 纯渲染性能反模式](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.gh07cm24f)

### React-Redux 如何通过浅层相等检查判定组件是否需要重新渲染？

每当调用 React-Redux 的 `connect` 函数时，它会对保存的根状态对象引用和当前传入的根状态对象执行浅层相等检查。通过时，表示状态未更新，无需调用 `mapStateToProps` 或重新渲染组件。

未通过时，说明根状态对象更新了，`connect` 会调用 `mapStateToProps` 再判定包装组件的 props 是否更新。

它会对 props 中的每个值单独做浅层相等检查，仅当其中任一检查失败时才触发重新渲染。

以下例子中，如果 `state.todos` 和 `getVisibleTodos()` 返回值在后续调用中未变，组件不会重新渲染：

```js
function mapStateToProps(state) {
  return {
    todos: state.todos, // 属性值
    visibleTodos: getVisibleTodos(state) // 选择器
  }
}

export default connect(mapStateToProps)(TodoApp)
```

反之，若写法为：

```js
// 不推荐 - 总是触发重新渲染
function mapStateToProps(state) {
  return {
    // todos 总是引用新对象
    todos: {
      all: state.todos,
      visibleTodos: getVisibleTodos(state)
    }
  }
}

export default connect(mapStateToProps)(TodoApp)
```

组件会总是重新渲染，因为 `todos` 总是新对象，无论值是否变化。

当新旧 `mapStateToProps` 返回值的浅层检查失败时，组件才重新渲染。

#### 更多信息

**文章**

- [Practical Redux, Part 6: Connected Lists, Forms, and Performance](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-6-connected-lists-forms-and-performance/)
- [React.js 纯渲染性能反模式](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.sb708slq6)
- [高性能 Redux 应用](https://somebody32.github.io/high-performance-redux/)

**讨论**

- [#1816: 用 `mapStateToProps` 连接状态的组件](https://github.com/reduxjs/redux/issues/1816)
- [#300: connect() 的潜在优化](https://github.com/reduxjs/react-redux/issues/300)

### 为什么浅层相等检查无法用于可变对象？

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

Redux 中使用可变对象的浅层相等检查不会引发问题，但[依赖 Redux store 的库（比如 React-Redux）会有问题](#shallow-checking-problems-with-react-redux)。

具体而言，如果传入 reducer 的状态切片是可变对象，reducer 可能会直接修改它并返回。

这样，`combineReducers` 的浅层检查总是通过，因为切片被修改了值，但对象本身没变 —— 它依然是传入的那个对象。

于是 `combineReducers` 不会把 `hasChanged` 标志置为 true，即使状态实际更改。如果没有其他 reducers 返回新的切片，`hasChanged` 永远为 false，导致 `combineReducers` 返回 _当前_ 根状态对象。

虽然状态切片内部值变了，Redux store 已包含新值，但根状态对象仍是同一对象，React-Redux 等绑定库无法感知状态变更，无法触发包裹组件重新渲染。

#### 更多信息

**文档**

- [使用 Redux：不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [疑难解答：切勿修改 reducer 参数](../usage/Troubleshooting.md#never-mutate-reducer-arguments)

### 为什么 reducer 修改了 state 会阻止 React-Redux 重新渲染包裹的组件？

如果 reducer 直接修改并返回传入的 state 对象，根状态对象的值会改变，但对象本身未变。

而 React-Redux 通过浅层检查根状态对象判断组件是否需要重新渲染，无法检测该状态变更，因而不会触发重新渲染。

#### 更多信息

**文档**

- [疑难解答：Redux 外部状态变化时视图未更新](https://react-redux.js.org/troubleshooting#my-views-aren-t-updating-when-something-changes-outside-of-redux)

### 为什么 selector 修改并返回传递给 `mapStateToProps` 的持久对象会阻止 React-Redux 重新渲染包裹组件？

如果 `mapStateToProps` 返回的 props 对象的其中一个值是一个跨 `connect` 调用持久存在的对象（例如可能是根状态对象），但该对象被 selector 直接修改并返回，React-Redux 无法检测到对象已被变更，因此不会触发组件重新渲染。

如前所述，selector 返回的可变对象中值可能变了，但对象本身没变，浅层相等检查只比较对象引用。

例如，下面的 `mapStateToProps` 函数永远不会触发重新渲染：

```js
// Redux store 中的状态对象
const state = {
  user: {
    accessCount: 0,
    name: 'keith'
  }
}

// selector 函数
const getUser = state => {
  ++state.user.accessCount // 修改 state 对象
  return state
}

// mapStateToProps
const mapStateToProps = state => ({
  // getUser() 总是返回相同的对象，
  // 即使被修改，组件也不会重新渲染
  userRecord: getUser(state)
})

const a = mapStateToProps(state)
const b = mapStateToProps(state)

a.userRecord === b.userRecord
//> true
```

注意，相反使用_不可变_对象时，[组件可能会重新渲染，即使不应该如此](#immutability-issues-with-react-redux)。

#### 更多信息

**文章**

- [Practical Redux, Part 6: Connected Lists, Forms, and Performance](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-6-connected-lists-forms-and-performance/)

**讨论**

- [#1948：mapStateToProps 中 getMappedItems 是反模式吗？](https://github.com/reduxjs/redux/issues/1948)

### 不可变性如何使浅层检查能感知对象变更？

如果对象不可变，要修改其中的数据只能复制一份对象并修改这份副本。

这份被修改的副本是 _与传入对象不同_ 的新对象，返回时浅层检查会识别出它与传入对象不同，从而失败。

#### 更多信息

**文章**

- [React.js 中使用不可变性的利弊](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### 你 reducer 内的不可变性如何导致组件不必要的渲染？

你不能直接修改不可变对象，只能修改它的副本，保持原对象不变。

当你修改副本没问题，但在 reducer 里如果返回一个 _没有被修改的副本_，`combineReducers` 仍会认为状态需要更新，因为你返回了一个不同的对象。

此时 `combineReducers` 返回这个新根状态对象，它的值与当前根状态相同，但对象不同。

这会触发 store 更新，最终导致所有连接组件被不必要地重新渲染。

为避免此问题，**如果 reducer 没有修改状态，必须返回传入的原状态切片对象**。

#### 更多信息

**文章**

- [React.js 纯渲染性能反模式](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.5hmnwygsy)
- [用 React 和 Redux 构建高效 UI](https://www.toptal.com/react/react-redux-and-immutablejs)

### 你 `mapStateToProps` 内的不可变性如何导致组件不必要的渲染？

某些不可变操作，如数组的 filter，**即使内容没变，也总是返回新数组**。

如果在 `mapStateToProps` 的选择器中使用这类操作，React-Redux 对 props 中每个值进行的浅层相等检查必然失败，因为选择器每次都返回新对象。

因此，尽管其中的值没变，包裹组件仍会频繁重新渲染。

例如，下方代码会总是触发重新渲染：

```js
// JavaScript 数组的 filter 方法会返回新数组，且视数组为不可变
const getVisibleTodos = todos => todos.filter(t => !t.completed)

const state = {
  todos: [
    {
      text: 'do todo 1',
      completed: false
    },
    {
      text: 'do todo 2',
      completed: true
    }
  ]
}

const mapStateToProps = state => ({
  // getVisibleTodos() 总是返回新数组，
  // 'visibleToDos' 属性总是引用不同数组，
  // 即使数组值没变，组件仍会重新渲染
  visibleToDos: getVisibleTodos(state.todos)
})

const a = mapStateToProps(state)
// 再次用相同参数调用 mapStateToProps(state)
const b = mapStateToProps(state)

a.visibleToDos
//> { "completed": false, "text": "do todo 1" }

b.visibleToDos
//> { "completed": false, "text": "do todo 1" }

a.visibleToDos === b.visibleToDos
//> false
```

注意，相反如果 props 值引用 mutable 对象，[组件可能不会渲染，而实际上应该渲染](#浅层检查阻止组件重新渲染)。

#### 更多信息

**文章**

- [React.js 纯渲染性能反模式](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.b8bpx1ncj)
- [用 React 和 Redux 构建高效 UI](https://www.toptal.com/react/react-redux-and-immutablejs)
- [ImmutableJS：物有所值吗？](https://medium.com/@AlexFaunt/immutablejs-worth-the-price-66391b8742d4#.a3alci2g8)

## 不同的不可变数据处理方法有哪些？必须用 Immer 吗？

Redux 不强制要求必须使用 Immer。只要正确使用，纯 JavaScript 完全可以实现不可变性，无需依赖专门的不可变库。

不过，保证不可变性比较难，稍不注意就可能意外修改对象，导致难以定位的 bug。因此，使用像 Immer 这样的不可变更新工具库，可以极大提升代码可靠性和开发效率。

#### 更多信息

**讨论**

- [#1185：是否应该使用不可变数据结构？](https://github.com/reduxjs/redux/issues/1422)
- [Immer 入门](https://immerjs.github.io/immer/)

## 使用纯 JavaScript 实现不可变操作有哪些问题？

JavaScript 并非设计为保证不可变操作，因此使用它时需要注意若干问题。

### 意外修改对象

在 JavaScript 中，很容易无意间修改对象（比如 Redux 状态树），例如：

- 修改深层嵌套属性
- 创建了新引用而非新对象
- 只做浅拷贝而非深拷贝

这都会导致无意的对象更改，即使经验丰富的开发者也会犯错。

要规避这类问题，请遵循推荐的[不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)。

### 代码冗长

更新复杂嵌套的状态树往往导致代码繁杂，难写且难调试。

### 性能低下

纯 JavaScript 对大对象和数组做不可变操作可能非常慢。

修改不可变对象意味着必须对其做完整拷贝，拷贝大量属性开销大。

相对而言，像 Immer 这类不可变库支持结构共享，在复制对象时重用大量已有结构，因此性能更好。

#### 更多信息

**文档**

- [不可变更新模式](../usage/structuring-reducers/ImmutableUpdatePatterns.md)

**文章**

- [深入了解 Clojure 的数据结构](https://www.slideshare.net/mohitthatte/a-deep-dive-into-clojures-data-structures-euroclojure-2015)
- [使用 ES6 及以后实现不可变 JavaScript](https://wecodetheweb.com/2016/02/12/immutable-javascript-using-es6-and-beyond/)
- [React.js 中使用不可变性的利弊 - React Kung Fu](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)