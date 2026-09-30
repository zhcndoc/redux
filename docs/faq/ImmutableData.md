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

**Documentation**

- [Redux Toolkit: Writing Reducers with Immer - Immutability and Redux](/toolkit/usage/immer-reducers#immutability-and-redux)
- [React docs: Updating Objects in State](https://react.dev/learn/updating-objects-in-state)

**Articles**

- [Dave Ceddia: The Complete Guide to Immutability in React and Redux](https://daveceddia.com/react-redux-immutability-guide/)

## 为什么 Redux 要求不可变性？

- Both Redux and React-Redux employ [shallow equality checking](#how-do-shallow-and-deep-equality-checking-differ). In particular:
  - Redux's `combineReducers` utility [shallowly checks for reference changes](#how-does-redux-use-shallow-equality-checking) caused by the reducers that it calls.
  - React-Redux's `useSelector` hook [compares the value returned by your selector against the previous value by reference](#how-does-react-redux-use-shallow-equality-checking) to decide whether the component needs to re-render. Such [shallow checking requires immutability](#why-will-shallow-equality-checking-not-work-with-mutable-objects) to function correctly.
- Immutable data management ultimately makes data handling safer.
- Time-travel debugging requires that reducers be pure functions with no side effects, so that you can correctly jump between different states.

#### 更多信息

**文档**

- [使用 Redux：先决条件 Reducer 概念](../usage/structuring-reducers/PrerequisiteConcepts.md)

**讨论**

- [Reddit：为什么 Redux 需要 Reducers 是纯函数](https://www.reddit.com/r/reactjs/comments/5ecqqv/why_redux_need_reducers_to_be_pure_functions/dacmmjh/?context=3)

## 为什么 Redux 使用浅层相等检查需要不可变性？

Redux's use of shallow equality checking requires immutability if any subscribed components are to be updated correctly. To see why, we need to understand the difference between shallow and deep equality checking in JavaScript.

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

The [suggested structure](./Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers) for a Redux store is to split the state object into multiple "slices" or "domains" by key, and provide a separate reducer function to manage each individual data slice.

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
- [Redux FAQ - How do I share state between two reducers? do I have to use `combineReducers`?](./Reducers.md#how-do-i-share-state-between-two-reducers-do-i-have-to-use-combinereducers)

**视频**

- [Egghead.io：Redux：从头实现 combineReducers()](https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch)

### React-Redux 如何使用浅层相等检查？

After every dispatched action, React-Redux runs the selector you passed to `useSelector` against the new root state, and compares the result to the previous result with `===`. If the two values are the same reference, the component does not re-render. If they are different, it does.

That single comparison is why immutability matters on the React side. If a reducer mutates an existing object and returns it, the selector returns the same reference as before, the check passes, and the component does not update even though the data changed. If a selector builds a new object or array on every call (for example, with `array.filter()`), the check fails on every dispatch and the component re-renders even when nothing relevant changed. Both failure modes, and how to fix them, are covered in the React Redux FAQ.

#### 更多信息

**文档**

- [Redux FAQ: Why isn't my component re-rendering?](./ReactRedux.md#why-isnt-my-component-re-rendering)
- [Redux FAQ: Why is my component re-rendering too often?](./ReactRedux.md#why-is-my-component-re-rendering-too-often)
- [React Redux: `useSelector`](/react-redux/api/hooks#useselector)

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

Shallow equality checking with a mutable object will not cause problems with Redux, but [it will cause problems with libraries that depend on the store, such as React-Redux](./ReactRedux.md#why-isnt-my-component-re-rendering).

具体而言，如果传入 reducer 的状态切片是可变对象，reducer 可能会直接修改它并返回。

这样，`combineReducers` 的浅层检查总是通过，因为切片被修改了值，但对象本身没变 —— 它依然是传入的那个对象。

于是 `combineReducers` 不会把 `hasChanged` 标志置为 true，即使状态实际更改。如果没有其他 reducers 返回新的切片，`hasChanged` 永远为 false，导致 `combineReducers` 返回 _当前_ 根状态对象。

The store will still be updated with the new values for the root state, but because the root state object itself is still the same object, libraries that bind to Redux, such as React-Redux, will not be aware of the state’s mutation, and so will not re-render the subscribed components.

Redux Toolkit's `configureStore` adds a development-only immutability check middleware that throws an error when a reducer mutates state, so this class of bug is caught immediately rather than showing up as a component that does not update.

#### 更多信息

**文档**

- [Using Redux: Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [Troubleshooting: The reducer mutated the state](../usage/Troubleshooting.md#the-reducer-mutated-the-state)
- [Redux Toolkit: Immutability Middleware](/toolkit/api/immutabilityMiddleware)

### 不可变性如何使浅层检查能感知对象变更？

如果对象不可变，要修改其中的数据只能复制一份对象并修改这份副本。

这份被修改的副本是 _与传入对象不同_ 的新对象，返回时浅层检查会识别出它与传入对象不同，从而失败。

#### 更多信息

**文章**

- [React.js 中使用不可变性的利弊](https://reactkungfu.com/2015/08/pros-and-cons-of-using-immutability-with-react-js/)

### 你 reducer 内的不可变性如何导致组件不必要的渲染？

你不能直接修改不可变对象，只能修改它的副本，保持原对象不变。

当你修改副本没问题，但在 reducer 里如果返回一个 _没有被修改的副本_，`combineReducers` 仍会认为状态需要更新，因为你返回了一个不同的对象。

`combineReducers` will then return this new root state object to the store. The new object will have the same values as the current root state object, but because it's a different object, it will cause the store to be updated. Every `useSelector` hook in the app will re-run its selector, and any selector that reads from the copied slice and returns a new reference will re-render its component unnecessarily.

To prevent this from happening, you must _always return the state slice object that’s passed into a reducer if the reducer does not mutate the state._ Reducers generated by `createSlice` do this automatically: Immer returns the original object when no changes were made to the draft.

The same problem applies on the selector side, where a selector that returns a new array or object on every call causes a re-render on every dispatch. See [Why is my component re-rendering too often?](./ReactRedux.md#why-is-my-component-re-rendering-too-often) for that case.

为避免此问题，**如果 reducer 没有修改状态，必须返回传入的原状态切片对象**。

#### 更多信息

- [React.js pure render performance anti-pattern](https://medium.com/@esamatti/react-js-pure-render-performance-anti-pattern-fb88c101332f#.5hmnwygsy)

## 不同的不可变数据处理方法有哪些？必须用 Immer 吗？

Redux itself only requires that reducers return new values instead of mutating the existing ones. How you produce those values is up to you.

Redux Toolkit's `createSlice` and `createReducer` use [Immer](https://immerjs.github.io/immer/) internally, so case reducers written with them can use "mutating" syntax and Immer produces the immutable result. This is the approach we recommend, and it is what all of the current Redux tutorials use. Immer is not optional in Redux Toolkit; [Writing Reducers with Immer](/toolkit/usage/immer-reducers) explains how it works, the patterns to follow, the gotchas to avoid, and why it is built in.

If you write reducers by hand without Redux Toolkit, you need to copy every level of nesting that changes using object spreads and non-mutating array methods. [Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md) shows how to do that correctly and lists the mistakes that most often cause accidental mutations. You can also call Immer's `produce` directly inside a hand-written reducer.

修改不可变对象意味着必须对其做完整拷贝，拷贝大量属性开销大。

相对而言，像 Immer 这类不可变库支持结构共享，在复制对象时重用大量已有结构，因此性能更好。

- [Redux Toolkit: Writing Reducers with Immer](/toolkit/usage/immer-reducers)
- [Using Redux: Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md)
- [Redux Toolkit: Immutability Middleware](/toolkit/api/immutabilityMiddleware)

## What are the issues with writing immutable updates by hand?

Writing immutable updates by hand in plain JavaScript has two problems, both of which Immer removes:

- **Accidental mutation.** It is easy to update a nested property, reuse a reference instead of copying, or copy only the top level of an object without realizing it. Accidental mutation is the most common cause of Redux bugs, and it usually shows up as a component that does not re-render. Redux Toolkit's `configureStore` includes a development-only immutability check middleware that throws when a reducer mutates state.
- **Verbose code.** Correctly copying every level of a nested update takes several lines of spreads per level, which hides the intent of the update and gives more places to make a mistake.

See [Immutable Update Patterns](../usage/structuring-reducers/ImmutableUpdatePatterns.md) for the hand-written patterns and the common mistakes, and [Writing Reducers with Immer](/toolkit/usage/immer-reducers) for how Immer handles the same updates.
