---
id: updating-normalized-data
title: 更新归一化数据
sidebar_label: 更新归一化数据
description: '结构化 Reducers > 更新归一化数据：更新归一化数据的模式'
---

# 管理归一化数据

如 [归一化状态形状](./NormalizingStateShape.md) 所述，Normalizr 库常用于将嵌套的响应数据转换为适合集成到 store 中的归一化结构。然而，这无法解决在应用其他地方使用归一化数据时对其进行进一步更新的问题。你可以根据自己的喜好使用多种不同的方法。我们将以处理帖子（Post）评论（Comments）的变更为例。

## 标准方法

### 简单合并

一种方法是将 action 的内容合并到现有状态中。在这种情况下，我们可以使用深度递归合并，而不仅是浅复制，以允许带有部分项目的 action 更新存储的项目。Lodash 的 `merge` 函数可以帮我们处理：

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

这对 reducer 来说工作量最小，但需要 action 创建者在派发 action 之前对数据进行相当多的整理工作，使其符合正确的形状。该方法也不涉及删除项目的处理。

### Slice Reducer 组合方式

如果我们有一个嵌套的 slice reducer 树，每个 slice reducer 需要知道如何正确响应此 action。我们需要在 action 中包含所有相关数据。需要使用评论的 ID 更新正确的 Post 对象，用该 ID 作为键创建一个新的 Comment 对象，并将 Comment 的 ID 添加到所有 Comment ID 的列表中。以下示例展示了这些部分如何组合：

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

## 其他方法

### 基于任务的更新

由于 reducers 本质上是函数，拆分逻辑的方式无限多。虽然 slice reducers 是最常见的，但也可以以更面向任务的结构组织行为。由于这通常涉及较多嵌套更新，你可能想用像 [dot-prop-immutable](https://github.com/debitoor/dot-prop-immutable) 或 [object-path-immutable](https://github.com/mariocasciaro/object-path-immutable) 这样的不可变更新工具库简化更新语句。示例如下：

```js
import posts from "./postsReducer";
import comments from "./commentsReducer";
import dotProp from "dot-prop-immutable";
import {combineReducers} from "redux";
import reduceReducers from "reduce-reducers";

const combinedReducer = combineReducers({
    posts,
    comments
});


function addComment(state, action) {
    const {payload} = action;
    const {postId, commentId, commentText} = payload;

    // 这里的 state 是整个组合后的状态
    const updatedWithPostState = dotProp.set(
        state,
        `posts.byId.${postId}.comments`,
        comments => comments.concat(commentId)
    );

    const updatedWithCommentsTable = dotProp.set(
        updatedWithPostState,
        `comments.byId.${commentId}`,
        {id : commentId, text : commentText}
    );

    const updatedWithCommentsList = dotProp.set(
        updatedWithCommentsTable,
        `comments.allIds`,
        allIds => allIds.concat(commentId);
    );

    return updatedWithCommentsList;
}

const featureReducers = createReducer({}, {
    ADD_COMMENT : addComment,
});

const rootReducer = reduceReducers(
    combinedReducer,
    featureReducers
);
```

该方法对 `"ADD_COMMENTS"` 情况的处理很明确，但需要嵌套更新逻辑和对状态树形状的具体了解。是否采用，取决于你想如何组织 reducer 逻辑。

### Redux-ORM

[Redux-ORM](https://github.com/redux-orm/redux-orm) 库为 Redux store 中管理归一化数据提供了非常有用的抽象层。它允许你声明 Model 类并定义它们之间的关系。然后它可以为你的数据类型生成空的“表”，作为专用选择器工具查找数据，并对数据执行不可变更新。

Redux-ORM 有几种执行更新的方式。首先，官方文档推荐在每个 Model 子类上定义 reducer 函数，然后将自动生成的组合 reducer 函数包含到 store 中：

```js
// models.js
import { Model, fk, attr, ORM } from 'redux-orm'

export class Post extends Model {
  static get fields() {
    return {
      id: attr(),
      name: attr()
    }
  }

  static reducer(action, Post, session) {
    switch (action.type) {
      case 'CREATE_POST': {
        Post.create(action.payload)
        break
      }
    }
  }
}
Post.modelName = 'Post'

export class Comment extends Model {
  static get fields() {
    return {
      id: attr(),
      text: attr(),
      // 定义外键关系 - 一个 Post 有多个 Comment
      postId: fk({
        to: 'Post', // 必须和 Post.modelName 相同
        as: 'post', // 访问器名称（comment.post）
        relatedName: 'comments' // 反向访问器名称（post.comments）
      })
    }
  }

  static reducer(action, Comment, session) {
    switch (action.type) {
      case 'ADD_COMMENT': {
        Comment.create(action.payload)
        break
      }
    }
  }
}
Comment.modelName = 'Comment'

// 创建 ORM 实例并注册 Post 和 Comment 模型
export const orm = new ORM()
orm.register(Post, Comment)

// main.js
import { createStore, combineReducers } from 'redux'
import { createReducer } from 'redux-orm'
import { orm } from './models'

const rootReducer = combineReducers({
  // 插入自动生成的 Redux-ORM reducer。它会
  // 初始化模型“表”，并连接我们在 Model 子类中定义的 reducer 逻辑
  entities: createReducer(orm)
})

// 派发 action 创建 Post 实例
store.dispatch({
  type: 'CREATE_POST',
  payload: {
    id: 1,
    name: 'Test Post Please Ignore'
  }
})

// 派发 action 创建该 Post 下的 Comment 实例
store.dispatch({
  type: 'ADD_COMMENT',
  payload: {
    id: 123,
    text: 'This is a comment',
    postId: 1
  }
})
```

Redux-ORM 库会帮你维护模型之间的关系。默认情况下，更新是以不可变的方式应用的，大大简化了更新过程。

另一种变体是在单个 case reducer 中使用 Redux-ORM 作为抽象层：

```js
import { orm } from './models'

// 假设此 case reducer 用于我们的 "entities" slice reducer，
// 并且我们没有在 Redux-ORM Model 子类上定义 reducer
function addComment(entitiesState, action) {
  // 开启不可变会话
  const session = orm.session(entitiesState)

  session.Comment.create(action.payload)

  // 内部状态引用已经改变
  return session.state
}
```

使用 session 接口后，你可以直接使用关系访问器访问关联的模型：

```js
const session = orm.session(store.getState().entities)
const comment = session.Comment.first() // Comment 实例
const { post } = comment // Post 实例
post.comments.filter(c => c.text === 'This is a comment').count() // 1
```

总的来说，Redux-ORM 为定义数据类型关系、在状态中创建“表”、检索及反归一化关系数据、以及对关系数据应用不可变更新提供了一套非常有用的抽象。