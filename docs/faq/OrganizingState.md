---
id: organizing-state
title: 状态组织
sidebar_label: 状态组织
---

## Redux FAQ：状态组织

### 我必须把所有状态都放到 Redux 里吗？我是否应该使用 React 的 `useState` 或 `useReducer`？

对此没有“正确”的答案。有些用户喜欢将每一条数据都放入 Redux，以始终维护一个完全序列化且可控的应用状态。另一些人则倾向于将非关键性或 UI 状态（如“这个下拉菜单当前是否打开”）保存在组件的内部状态中。

**_使用本地组件状态是可以的_**。作为开发者，确定应用由哪些状态组成，以及每条状态应该放在哪里，是 _你的_ 工作。找到适合你的平衡点，然后坚持下去。

判断何种数据应放入 Redux 的一些常见经验法则：

- 应用的其他部分是否关心这些数据？
- 是否需要基于该原始数据创建进一步的派生数据？
- 这些相同数据是否驱动多个组件？
- 是否希望能够将该状态恢复到某个时间点（即时间旅行调试）？
- 是否希望缓存数据（即，如果状态中已有数据，则不重新请求）？
- 是否希望在热重载 UI 组件时保持数据一致（热重载可能会丢失组件内部状态）？

#### 更多信息

**相关文章**

- [什么时候（以及什么时候不）使用 Redux](https://changelog.com/posts/when-and-when-not-to-reach-for-redux)

**讨论**

- [Reddit：“什么时候应该把东西放到 Redux store？”](https://www.reddit.com/r/reactjs/comments/4w04to/when_using_redux_should_all_asynchronous_actions/d63u4o8)
- [Stack Overflow：所有组件状态都应该放到 Redux store 吗？](https://stackoverflow.com/questions/35328056/react-redux-should-all-component-states-be-kept-in-redux-store)

### 我能把函数、Promise 或其他不可序列化的项放进 store 状态吗？

强烈建议你只往 store 里放普通的可序列化对象、数组和基本类型。_技术上_可以往 store 中插入不可序列化的项，但这样做会破坏持久化和重载 store 内容的能力，还会影响时间旅行调试。

如果你可以接受持久化和时间旅行调试可能无法正常工作，那么完全可以将不可序列化的项放入 Redux store。毕竟，这是 _你的_ 应用，如何实现由你决定。和 Redux 相关的其他许多事情一样，只要你理解所涉及的权衡即可。

#### 更多信息

**讨论**

- [#1248：在 reducer 中存储 React 组件可以吗？](https://github.com/reduxjs/redux/issues/1248)
- [#1279：Flux 中放置 Map 组件的建议？](https://github.com/reduxjs/redux/issues/1279)
- [#1390：组件加载](https://github.com/reduxjs/redux/issues/1390)
- [#1407：分享一个很棒的基类](https://github.com/reduxjs/redux/issues/1407)
- [#1793：Redux 状态中的 React 元素](https://github.com/reduxjs/redux/issues/1793)

### 我如何组织状态中的嵌套或重复数据？

Data with IDs, nesting, or relationships should generally be stored in a “normalized” fashion: each object should be stored once, keyed by ID, and other objects that reference it should only store the ID rather than a copy of the entire object. It may help to think of parts of your store as a database, with individual “tables” per item type.

For most applications, use Redux Toolkit's [`createEntityAdapter`](/toolkit/api/createEntityAdapter) to manage normalized collections in your slices. It uses an `{ ids, entities }` state structure and provides reducer functions to add, update, and remove items, along with selectors to read them.

The adapter does not turn nested objects into separate entities or replace relationships with IDs. If your API returns nested data, transform it into the normalized shape before adding it to the store. See [Normalizing Nested Data](../usage/structuring-reducers/NormalizingStateShape.md#normalizing-nested-data) for more on this step and tools such as Normalizr.

#### 更多信息

**文档**

- [Redux Essentials: Normalizing Data](../tutorials/essentials/part-6-performance-normalization#normalizing-data)
- [Redux Toolkit: `createEntityAdapter`](/toolkit/api/createEntityAdapter)
- [Redux Fundamentals: Async Logic and Data Flow](../tutorials/fundamentals/part-6-async-logic.md)
- [Redux Fundamentals: Standard Redux Patterns](../tutorials/fundamentals/part-7-standard-patterns.md)
- [Using Redux: Structuring Reducers - Prerequisite Concepts](../usage/structuring-reducers/PrerequisiteConcepts.md#normalizing-data)
- [Using Redux: Structuring Reducers - Normalizing State Shape](../usage/structuring-reducers/NormalizingStateShape.md)

**相关文章**

- [查询 Redux Store](https://medium.com/@adamrackis/querying-a-redux-store-37db8c7f3b0f)

**讨论**

- [#316：如何创建嵌套 reducers？](https://github.com/reduxjs/redux/issues/316)
- [#815：处理数据结构](https://github.com/reduxjs/redux/issues/815)
- [#946：拆分 reducers 时如何更新相关状态字段？](https://github.com/reduxjs/redux/issues/946)
- [#994：更新嵌套实体时如何减少样板代码？](https://github.com/reduxjs/redux/issues/994)
- [#1255：React/Redux 中使用 Normalizr 处理嵌套对象](https://github.com/reduxjs/redux/issues/1255)
- [#1824：规范化状态与垃圾回收](https://github.com/reduxjs/redux/issues/1824#issuecomment-228585904)
- [Twitter：状态结构应规范化](https://twitter.com/dan_abramov/status/715507260244496384)
- [Stack Overflow：Redux reducers 中如何处理树形实体？](https://stackoverflow.com/questions/32798193/how-to-handle-tree-shaped-entities-in-redux-reducers)

### 我应该把表单状态或其他 UI 状态放入 store 吗？

[决定什么状态放 Redux 的经验法则](#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-usestate-or-usereducer) 同样适用于此问题。

**基于这些经验法则，大多数表单状态无需放入 Redux**，因为它们大概率不会被多个组件共享。但具体情况依然取决于你和你的应用。你可能会把一些表单状态放入 Redux，因为你正在编辑最初来自 store 的数据，或者确实需要在应用其他组件中看到正在编辑的值。另一方面，保持表单状态在组件内部（本地状态）更简单，用户完成操作后再派发 action 把数据放到 store。

基于此，在大多数情况下，其实不需要基于 Redux 的表单管理库。我们建议按以下顺序尝试：

- Even if the data is coming from the Redux store, start by writing your form logic by hand with `useState`. It's likely this is all you'll need. (See [**Gosha Arinich's posts on working with forms in React**](https://goshacmd.com/on-forms-react/) for some excellent guidance on this.)
- If you decide that writing forms "manually" is too difficult, try a React-based form library like [React Hook Form](https://react-hook-form.com/) or [TanStack Form](https://tanstack.com/form/latest). These keep the form state in the component and give you validation and submission handling. When the user submits, dispatch one action (or call an RTK Query mutation) with the final values.
- Redux-based form libraries such as Redux-Form and React-Redux-Form are no longer actively maintained, and we don't recommend starting new projects with them. If you truly need form values in the store while the user is typing, write a small slice for that form and update it from the component's change handlers.

如果你决定把表单状态放到 Redux，需要考虑性能问题。每次文本输入的击键都派发 action 通常不值得，或许可以考虑[用缓冲击键的方式让更改保持本地，然后再派发](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-7-forms-editing-reducers/)。一如既往，花些时间分析你应用的整体性能需求。

其他类型的 UI 状态也遵循这些经验法则。典型例子是跟踪 `isDropdownOpen` 标志。在大多数情况下，应用其他部分不关心这个，所以应该保留在组件状态。但视你的应用情况，也可能合理通过 Redux 来[管理弹窗及其他弹出层](https://blog.isquaredsoftware.com/2017/07/practical-redux-part-10-managing-modals/)、标签页、展开面板等。

#### 更多信息

**Documentation**

- [Style Guide: Avoid Putting Form State In Redux](../style-guide/style-guide.md#avoid-putting-form-state-in-redux)
- [Style Guide: Evaluate Where Each Piece of State Should Live](../style-guide/style-guide.md#evaluate-where-each-piece-of-state-should-live)

**Articles**

- [Gosha Arinich: Writings on Forms in React](https://goshacmd.com/on-forms-react/)
- [Practical Redux, Part 6: Connected Lists and Forms](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-6-connected-lists-forms-and-performance/) (2017, uses `connect`; the reasoning about where form state lives still applies)
- [Practical Redux, Part 7: Form Change Handling](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-7-forms-editing-reducers/) (2017, uses `connect`)
- [Practical Redux, Part 10: Managing Modals and Context Menus](https://blog.isquaredsoftware.com/2017/07/practical-redux-part-10-managing-modals/)
- [React/Redux Links: Redux UI Management](https://github.com/markerikson/react-redux-links/blob/master/redux-ui-management.md)
