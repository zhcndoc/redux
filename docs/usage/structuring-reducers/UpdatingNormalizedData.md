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

## Updating with `createSlice` and `createEntityAdapter`

Redux Toolkit's [`createEntityAdapter`](/toolkit/api/createEntityAdapter) generates a set of reducer functions for a normalized `{ ids, entities }` table: `addOne`, `updateOne`, `removeOne`, `upsertMany`, and so on. Combined with [`createSlice`](/toolkit/api/createSlice), which uses Immer so you can write "mutating" update logic, most of the code on this page disappears.

Adding a comment needs two things to happen: the Comment object goes into the comments table, and the Comment's ID gets appended to the parent Post's `comments` array. Each slice handles its own half of that work in response to the same action:

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

The comments slice owns the `commentAdded` action. Its `prepare` callback generates the ID, and `commentsAdapter.addOne` inserts the new object into `entities` and its ID into `ids`. The posts slice listens for that same action in `extraReducers` and appends the comment ID to the right post. Neither slice knows anything about the other's state shape.

The rest of this page shows the same update written without Redux Toolkit, so you can see what these utilities are doing.

## Hand-Written Approaches

### Slice Reducer 组合方式

Without `createEntityAdapter` and Immer, each slice reducer still needs to respond to the same action, and each update has to copy every level of nesting it touches. The action must carry everything the reducers need: the post ID, the new comment's ID, and the comment text. Here's how the pieces fit together with the `byId` / `allIds` shape used elsewhere in this section:

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

Compare this with the `createSlice` version above: `commentsAdapter.addOne` replaces `addCommentEntry` and `addCommentId` together, and Immer replaces the nested spreads in `addComment`.

### Simple Merging

Another approach is to merge the contents of the action into the existing state. In this case, we can use deep recursive merge, not just a shallow copy, to allow for actions with partial items to update stored items. The Lodash `merge` function can handle this for us:

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

This requires the least amount of work on the reducer side, but does require that the action creator potentially do a fair amount of work to organize the data into the correct shape before the action is dispatched. It also doesn't handle trying to delete an item. `createEntityAdapter`'s `upsertMany` covers the same use case: it inserts new items and shallowly merges fields into existing ones.

### Other Approaches

Since reducers are just functions, the update logic can be split up other ways. One option is a task-oriented reducer that handles the whole `ADD_COMMENT` case at the root level and updates both tables itself, usually with a path-based update helper. This makes the single case easy to follow, but the reducer then has to know the entire state tree's shape. Another option is an ORM-style layer such as [Redux-ORM](https://github.com/redux-orm/redux-orm), which declares Model classes with relations and generates the tables and update logic for you. Redux-ORM has not had a release since 2020, so we don't recommend it for new code. For most apps, `createEntityAdapter` plus `extraReducers` covers the same ground with less machinery.
