---
id: updating-normalized-data
title: 更新归一化数据
sidebar_label: 更新归一化数据
description: '结构化 Reducers > 更新归一化数据：更新归一化数据的模式'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# Managing Normalized Data

<HandWrittenReducersNote />

[Normalizing State Shape](./NormalizingStateShape.md) describes how to store relational data as lookup tables keyed by ID. That page covers how the data gets into that shape. This page covers what happens afterwards: how to update normalized data as the app runs. We'll use the example of adding a Comment to a Post, which has to touch both the Posts table and the Comments table.

## 使用 `createSlice` 和 `createEntityAdapter` 更新

Redux Toolkit 的 [`createEntityAdapter`](/toolkit/api/createEntityAdapter) 会为 `{ ids, entities }` 归一化表生成一组 reducer 函数，例如 `addOne`、`updateOne`、`removeOne` 和 `upsertMany`。结合使用基于 Immer、允许编写“修改式”更新逻辑的 [`createSlice`](/toolkit/api/createSlice)，本页中的大部分代码都可以省去。

添加评论需要完成两件事：将 Comment 对象放入 comments 表，并将该 Comment 的 ID 追加到所属 Post 的 `comments` 数组中。两个 slice 响应同一个 action，各自处理其中一部分：

```ts
// features/comments/commentsSlice.ts
import { createEntityAdapter, createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface Comment {
  id: string
  postId: string
  text: string
}

const commentsAdapter = createEntityAdapter<Comment>()

const commentsSlice = createSlice({
  name: 'comments',
  initialState: commentsAdapter.getInitialState(),
  reducers: {
    commentAdded: {
      reducer: commentsAdapter.addOne,
      // Generate the comment's ID once, in the action creator,
      // so every reducer that handles this action sees the same ID
      prepare(postId: string, text: string) {
        return { payload: { id: nanoid(), postId, text } }
      }
    }
  }
})

export const { commentAdded } = commentsSlice.actions
export default commentsSlice.reducer

// features/posts/postsSlice.ts
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { commentAdded } from '../comments/commentsSlice'

export interface Post {
  id: string
  title: string
  comments: string[]
}

const postsAdapter = createEntityAdapter<Post>()

const postsSlice = createSlice({
  name: 'posts',
  initialState: postsAdapter.getInitialState(),
  reducers: {
    postAdded: postsAdapter.addOne
  },
  extraReducers: builder => {
    builder.addCase(commentAdded, (state, action) => {
      const { postId, id: commentId } = action.payload
      // Immer lets us "push" onto the draft; the actual state is copied
      state.entities[postId]?.comments.push(commentId)
    })
  }
})

export const { postAdded } = postsSlice.actions
export default postsSlice.reducer
```

comments slice 负责 `commentAdded` action。它的 `prepare` 回调会生成 ID，而 `commentsAdapter.addOne` 会将新对象插入 `entities`，并将 ID 加入 `ids`。posts slice 则在 `extraReducers` 中监听同一个 action，并将评论 ID 追加到对应的帖子中。两个 slice 都不需要了解对方的状态结构。

本页其余部分会展示不使用 Redux Toolkit 时相同更新的写法，以便了解这些工具具体完成了什么。

## 手写方式 {#hand-written-approaches}

### Slice Reducer 组合方式

不使用 `createEntityAdapter` 和 Immer 时，每个 slice reducer 仍需要响应同一个 action，而且每次更新都必须复制涉及的每一层嵌套数据。Action 必须携带 reducer 所需的全部信息：帖子 ID、新评论 ID 和评论文本。下面展示如何使用本节其他部分采用的 `byId` / `allIds` 结构将这些部分组合起来：

```js
// actions.js
function addComment(postId, commentText) {
  // 为该评论生成唯一 ID
  const commentId = generateId('comment')

  return {
    type: 'ADD_COMMENT',
    payload: {
      postId,
      commentId,
      commentText
    }
  }
}

// reducers/posts.js
function addComment(state, action) {
  const { payload } = action
  const { postId, commentId } = payload

  // 查找对应的帖子，简化后续代码
  const post = state[postId]

  return {
    ...state,
    // 更新 Post 对象，添加新的 “comments” 数组
    [postId]: {
      ...post,
      comments: post.comments.concat(commentId)
    }
  }
}

function postsById(state = {}, action) {
  switch (action.type) {
    case 'ADD_COMMENT':
      return addComment(state, action)
    default:
      return state
  }
}

function allPosts(state = [], action) {
  // 此例中省略 - 无需操作
}

const postsReducer = combineReducers({
  byId: postsById,
  allIds: allPosts
})

// reducers/comments.js
function addCommentEntry(state, action) {
  const { payload } = action
  const { commentId, commentText } = payload

  // 创建新的 Comment 对象
  const comment = { id: commentId, text: commentText }

  // 将新的 Comment 对象插入到查找表中
  return {
    ...state,
    [commentId]: comment
  }
}

function commentsById(state = {}, action) {
  switch (action.type) {
    case 'ADD_COMMENT':
      return addCommentEntry(state, action)
    default:
      return state
  }
}

function addCommentId(state, action) {
  const { payload } = action
  const { commentId } = payload
  // 直接将新的 Comment ID 添加到所有 ID 列表中
  return state.concat(commentId)
}

function allComments(state = [], action) {
  switch (action.type) {
    case 'ADD_COMMENT':
      return addCommentId(state, action)
    default:
      return state
  }
}

const commentsReducer = combineReducers({
  byId: commentsById,
  allIds: allComments
})
```

示例较长，因为它展示了所有不同 slice reducer 及其 case reducer 如何组合。注意其中的委派关系。`postsById` slice reducer 将该情况的处理委派给 `addComment`，后者将新的 Comment ID 插入到正确的 Post 项中。与此同时，`commentsById` 和 `allComments` slice reducer 分别有自己的 case reducer，适当更新 Comments 查找表和所有 Comment ID 列表。

将它与上面的 `createSlice` 版本比较：`commentsAdapter.addOne` 同时替代了 `addCommentEntry` 和 `addCommentId`，而 Immer 则替代了 `addComment` 中的嵌套展开复制。

### 简单合并

另一种做法是将 action 内容合并到现有状态中。这里可以使用深度递归合并，而不只是浅拷贝，从而允许 action 仅携带部分条目并更新已存储的条目。Lodash 的 `merge` 函数可以完成这项工作：

```js
import merge from 'lodash/merge'

function commentsById(state = {}, action) {
  switch (action.type) {
    default: {
      if (action.entities && action.entities.comments) {
        return merge({}, state, action.entities.comments.byId)
      }
      return state
    }
  }
}
```

这种方式对 reducer 的要求最低，但 action creator 可能需要在派发 action 前花不少精力将数据整理成正确结构。此外，它不处理删除条目的情况。`createEntityAdapter` 的 `upsertMany` 可以满足同样的用例：插入新条目，并将字段浅合并到现有条目中。

### 其他方式

由于 reducer 只是函数，更新逻辑也可以采用其他拆分方式。一种选择是在根层编写面向任务的 reducer，完整处理 `ADD_COMMENT` case 并自行更新两个表，通常会配合基于路径的更新辅助函数。这样单个 case 容易理解，但 reducer 必须了解整棵状态树的结构。另一种选择是使用 [Redux-ORM](https://github.com/redux-orm/redux-orm) 这样的 ORM 层，它通过定义带关联关系的 Model 类，为你生成表和更新逻辑。Redux-ORM 自 2020 年以来没有发布新版本，因此我们不建议在新代码中使用。对大多数应用来说，`createEntityAdapter` 加 `extraReducers` 就能以更少的复杂性完成同样的工作。
