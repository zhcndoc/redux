---
id: organizing-state
title: 状态组织
sidebar_label: 状态组织
---

## Redux FAQ：状态组织

### 我必须把所有状态都放到 Redux 里吗？我是否应该使用 React 的 `useState` 或 `useReducer`？ {#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-usestate-or-usereducer}

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

### 我能把函数、Promise 或其他不可序列化的项放进 store 状态吗？ {#can-i-put-functions-promises-or-other-non-serializable-items-in-my-store-state}

强烈建议你只往 store 里放普通的可序列化对象、数组和基本类型。_技术上_可以往 store 中插入不可序列化的项，但这样做会破坏持久化和重载 store 内容的能力，还会影响时间旅行调试。

如果你可以接受持久化和时间旅行调试可能无法正常工作，那么完全可以将不可序列化的项放入 Redux store。毕竟，这是 _你的_ 应用，如何实现由你决定。和 Redux 相关的其他许多事情一样，只要你理解所涉及的权衡即可。

#### 更多信息

**讨论**

- [#1248：在 reducer 中存储 React 组件可以吗？](https://github.com/reduxjs/redux/issues/1248)
- [#1279：Flux 中放置 Map 组件的建议？](https://github.com/reduxjs/redux/issues/1279)
- [#1390：组件加载](https://github.com/reduxjs/redux/issues/1390)
- [#1407：分享一个很棒的基类](https://github.com/reduxjs/redux/issues/1407)
- [#1793：Redux 状态中的 React 元素](https://github.com/reduxjs/redux/issues/1793)

### 我如何组织状态中的嵌套或重复数据？ {#how-do-i-organize-nested-or-duplicate-data-in-my-state}

带 ID、嵌套结构或对象关系的数据通常应采用“归一化”方式存储：每个对象只保存一次，并以 ID 为键；引用该对象的其他对象只保存 ID，而不是复制整个对象。可以把 store 的一部分想象成数据库，每种条目各有一张“表”。

大多数应用可以使用 Redux Toolkit 的 [`createEntityAdapter`](/toolkit/api/createEntityAdapter) 在 slice 中管理归一化集合。它采用 `{ ids, entities }` 状态结构，并提供添加、更新和删除条目的 reducer 函数及读取条目的 selector。

该 adapter 不会自动把嵌套对象转换为独立实体，也不会把对象关系替换成 ID。如果 API 返回的是嵌套数据，应先将其转换为归一化结构，再加入 store。有关这一过程及 Normalizr 等工具，请参阅[归一化嵌套数据](../usage/structuring-reducers/NormalizingStateShape.md#normalizing-nested-data)。

#### 更多信息

**文档**

- [Redux Essentials：归一化数据](../tutorials/essentials/part-6-performance-normalization#normalizing-data)
- [Redux Toolkit：`createEntityAdapter`](/toolkit/api/createEntityAdapter)
- [Redux 基础：异步逻辑和数据流](../tutorials/fundamentals/part-6-async-logic.md)
- [Redux 基础：标准 Redux 模式](../tutorials/fundamentals/part-7-standard-patterns.md)
- [使用 Redux：结构化 Reducer - 先决概念](../usage/structuring-reducers/PrerequisiteConcepts.md#normalizing-data)
- [使用 Redux：结构化 Reducer - 归一化状态形状](../usage/structuring-reducers/NormalizingStateShape.md)

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

### 我应该把表单状态或其他 UI 状态放入 store 吗？ {#should-i-put-form-state-or-other-ui-state-in-my-store}

[决定什么状态放 Redux 的经验法则](#do-i-have-to-put-all-my-state-into-redux-should-i-ever-use-reacts-usestate-or-usereducer) 同样适用于此问题。

**基于这些经验法则，大多数表单状态无需放入 Redux**，因为它们大概率不会被多个组件共享。但具体情况依然取决于你和你的应用。你可能会把一些表单状态放入 Redux，因为你正在编辑最初来自 store 的数据，或者确实需要在应用其他组件中看到正在编辑的值。另一方面，保持表单状态在组件内部（本地状态）更简单，用户完成操作后再派发 action 把数据放到 store。

基于此，在大多数情况下，其实不需要基于 Redux 的表单管理库。我们建议按以下顺序尝试：

- 即使数据来自 Redux store，也可以先用 `useState` 手动编写表单逻辑；很可能这就足够了。有关 React 表单的优秀指导，请参阅 [**Gosha Arinich 关于 React 表单的文章**](https://goshacmd.com/on-forms-react/)。
- 如果觉得手动编写表单过于困难，可以试试 [React Hook Form](https://react-hook-form.com/) 或 [TanStack Form](https://tanstack.com/form/latest) 等 React 表单库。它们将表单状态保存在组件中，并提供验证和提交处理。用户提交时，再派发一个 action（或调用 RTK Query mutation）提交最终值。
- Redux-Form 和 React-Redux-Form 等基于 Redux 的表单库已不再积极维护，我们不建议新项目使用。如果确实需要在用户输入时将表单值保存在 store 中，可以为表单编写一个小型 slice，并在组件的 change handler 中更新它。

如果你决定把表单状态放到 Redux，需要考虑性能问题。每次文本输入的击键都派发 action 通常不值得，或许可以考虑[用缓冲击键的方式让更改保持本地，然后再派发](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-7-forms-editing-reducers/)。一如既往，花些时间分析你应用的整体性能需求。

其他类型的 UI 状态也遵循这些经验法则。典型例子是跟踪 `isDropdownOpen` 标志。在大多数情况下，应用其他部分不关心这个，所以应该保留在组件状态。但视你的应用情况，也可能合理通过 Redux 来[管理弹窗及其他弹出层](https://blog.isquaredsoftware.com/2017/07/practical-redux-part-10-managing-modals/)、标签页、展开面板等。

#### 更多信息

**文档**

- [风格指南：避免将表单状态放进 Redux](../style-guide/style-guide.md#avoid-putting-form-state-in-redux)
- [风格指南：评估每项状态应该放在哪里](../style-guide/style-guide.md#evaluate-where-each-piece-of-state-should-live)

**相关文章**

- [Gosha Arinich: Writings on Forms in React](https://goshacmd.com/on-forms-react/)
- [Practical Redux, Part 6: Connected Lists and Forms](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-6-connected-lists-forms-and-performance/) (2017, uses `connect`; the reasoning about where form state lives still applies)
- [Practical Redux, Part 7: Form Change Handling](https://blog.isquaredsoftware.com/2017/01/practical-redux-part-7-forms-editing-reducers/) (2017, uses `connect`)
- [Practical Redux, Part 10: Managing Modals and Context Menus](https://blog.isquaredsoftware.com/2017/07/practical-redux-part-10-managing-modals/)
- [React/Redux Links: Redux UI Management](https://github.com/markerikson/react-redux-links/blob/master/redux-ui-management.md)
