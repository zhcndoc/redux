---
id: normalizing-state-shape
title: 标准化 State 结构
description: 'Structuring Reducers > 标准化 State 结构：为何及如何基于 ID 存储数据项以便查找'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# Normalizing State Shape

<HandWrittenReducersNote />

Many applications deal with data that is nested or relational in nature. For example, a blog editor could have many Posts, each Post could have many Comments, and both Posts and Comments would be written by a User. Data for this kind of application might look like:

```js
const blogPosts = [
  {
    id: 'post1',
    author: { username: 'user1', name: 'User 1' },
    body: '......',
    comments: [
      {
        id: 'comment1',
        author: { username: 'user2', name: 'User 2' },
        comment: '.....'
      },
      {
        id: 'comment2',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....'
      }
    ]
  },
  {
    id: 'post2',
    author: { username: 'user2', name: 'User 2' },
    body: '......',
    comments: [
      {
        id: 'comment3',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....'
      },
      {
        id: 'comment4',
        author: { username: 'user1', name: 'User 1' },
        comment: '.....'
      },
      {
        id: 'comment5',
        author: { username: 'user3', name: 'User 3' },
        comment: '.....'
      }
    ]
  }
  // 如此重复多次
]
```

注意数据结构稍显复杂，并且一些数据是重复的。这存在几个问题：

- When a piece of data is duplicated in several places, it becomes harder to make sure that it is updated appropriately.
- Nested data means that the corresponding reducer logic has to be more nested and therefore more complex. In particular, trying to update a deeply nested field can become very ugly very fast.
- Since immutable data updates require all ancestors in the state tree to be copied and updated as well, and new object references will cause components that read them with `useSelector` to re-render, an update to a deeply nested data object could force totally unrelated UI components to re-render even if the data they're displaying hasn't actually changed.

因此，管理 Redux store 中的关系型或嵌套数据时，推荐的做法是将部分 store 视为数据库，并将数据存储为_标准化_形式。

## 设计标准化的 State

标准化数据的基本概念是：

- 每种类型的数据在 state 中拥有自己的“表”。
- 每个“数据表”应将各个条目存储为一个对象，条目的 ID 作为键，条目本身作为值。
- 任何对单个条目的引用应通过存储条目 ID 来完成。
- 使用 ID 数组来表示顺序。

Redux Toolkit's [`createEntityAdapter`](/toolkit/api/createEntityAdapter) implements this shape for you as `{ ids: [], entities: {} }`, and generates the reducer functions and selectors for working with it. The examples on this page use the equivalent field names `allIds` and `byId` so that the structure is spelled out, but the idea is the same: one lookup object keyed by ID, plus one array of IDs for ordering.

An example of a normalized state structure for the blog example above might look like:

```js
{
    posts: {
        byId: {
            post1: {
                id: "post1",
                author: "user1",
                body: "......",
                comments: ["comment1", "comment2"]
            },
            post2: {
                id: "post2",
                author: "user2",
                body: "......",
                comments: ["comment3", "comment4", "comment5"]
            }
        },
        allIds: ["post1", "post2"]
    },
    comments: {
        byId: {
            comment1: {
                id: "comment1",
                author: "user2",
                comment: "....."
            },
            comment2: {
                id: "comment2",
                author: "user3",
                comment: "....."
            },
            comment3: {
                id: "comment3",
                author: "user3",
                comment: "....."
            },
            comment4: {
                id: "comment4",
                author: "user1",
                comment: "....."
            },
            comment5: {
                id: "comment5",
                author: "user3",
                comment: "....."
            }
        },
        allIds: ["comment1", "comment2", "comment3", "comment4", "comment5"]
    },
    users: {
        byId: {
            user1: {
                username: "user1",
                name: "User 1"
            },
            user2: {
                username: "user2",
                name: "User 2"
            },
            user3: {
                username: "user3",
                name: "User 3"
            }
        },
        allIds: ["user1", "user2", "user3"]
    }
}
```

该状态结构整体上更加扁平。相比原先的嵌套格式，其改进之处包括：

- 由于每个条目仅定义在一个地方，因此不必在多个地方进行变更。
- reducer 逻辑无需处理复杂的深层嵌套，使其更简洁。
- 读取或更新某条目逻辑变得简单且统一：给定条目的类型和 ID，能通过简单几步直接查找，无需翻遍其他对象。
- 由于数据类型被分离，类似修改评论文本的更新仅需要新复制 “comments > byId > 某评论” 这部分树。这样 UI 仅需更新少部分组件，从而提高性能。反观原先嵌套结构中修改一条评论，则需更新评论对象、父帖对象、所有帖子数组，且很可能导致所有 Post 和 Comment 组件都重新渲染。

Note that a normalized state structure generally implies that more components read from the store, and each component is responsible for looking up its own data with `useSelector`, as opposed to a few components selecting large amounts of data and passing all that data downwards. As it turns out, having parent components simply pass item IDs to children that select their own item is a good pattern for optimizing UI performance in a React Redux application, so keeping state normalized plays a key role in improving performance.

## 在 State 中组织标准化数据

一个典型应用很可能混合存有关系型数据和非关系型数据。虽然没有单一规则规定数据如何组织，但一个常见模式是将关系型“表”放在共同的父键下，比如放在 "entities" 下。例如，一个采用该方案的状态结构可能形如：

```js
{
    simpleDomainData1: {....},
    simpleDomainData2: {....},
    entities: {
        entityType1 : {....},
        entityType2 : {....}
    },
    ui: {
        uiSection1 : {....},
        uiSection2 : {....}
    }
}
```

该结构也可以有多种变体。比如，一个频繁编辑实体的应用可能希望在状态中保留两组“表”，一组为“当前”条目值，另一组为“编辑中”条目值。编辑时，条目值被拷贝到“编辑中”部分，更新操作作用于“编辑中”版本，使得编辑表单由这部分数据控制，而 UI 其他部分仍引用原版数据。“重置”编辑表单只需从“编辑中”区域移除该条目并重新从“当前”复制一份，而“应用”编辑则涉及从“编辑中”复制数据回“当前”。

## 关系和表

Because we're treating a portion of our Redux store as a "database", many of the principles of database design also apply here as well. There is no single required way to store relationships. Choose the shape that makes the reads and updates your application needs straightforward.

### Storing related IDs on an entity

If you usually navigate a relationship in one direction and the relationship has no data of its own, an array of related IDs on the entity is often the simplest option. For example, an author record can store the IDs of that author's books:

```js
{
    authors: {
        byId: {
            5: {
                id: 5,
                name: "Ada Lovelace",
                bookIds: [22, 15]
            }
        },
        allIds: [5]
    },
    books: {
        byId: {
            22: { id: 22, title: "Notes" },
            15: { id: 15, title: "Sketches" }
        },
        allIds: [22, 15]
    }
}
```

Looking up an author's books is then a direct mapping from `bookIds` to the corresponding records in `books.byId`. This is a good fit for one-to-many relationships or when one direction is the main query your UI needs.

### Using a join table

For many-to-many relationships, or when the relationship itself has data that must be stored, use an intermediate table that stores the IDs of the corresponding items. This is often known as a "join table" or an "associative table". For example, an `authorBook` record can also describe the author's role for that specific book:

```js
{
    entities: {
        authors: {
            byId: {},
            allIds: []
        },
        books: {
            byId: {},
            allIds: []
        },
        authorBook: {
            byId: {
                1: {
                    id: 1,
                    authorId: 5,
                    bookId: 22,
                    role: "author"
                },
                2: {
                    id: 2,
                    authorId: 5,
                    bookId: 15,
                    role: "editor"
                },
                3: {
                    id: 3,
                    authorId: 42,
                    bookId: 12,
                    role: "author"
                }
            },
            allIds: [1, 2, 3]
        }
    }
}
```

Operations like "look up all books by this author" can then be accomplished with a loop over the join table, filtering for the desired `authorId` and retrieving each matching `bookId`. Given the typical amounts of data in a client application and the speed of JavaScript engines, this is likely to be sufficiently fast for most use cases.

If profiling shows that a particular relationship lookup is a bottleneck, you can maintain an additional index such as `bookIdsByAuthorId`. Keep that index derived from the same actions that update the relationship records so it cannot become inconsistent. Start with the simpler shape that matches your use case, and add indexes only when a measured read pattern needs them.

## 标准化嵌套数据

Because APIs frequently send back data in a nested form, that data needs to be transformed into a normalized shape before it can be included in the state tree.

For most applications, [Redux Toolkit's `createEntityAdapter`](/toolkit/api/createEntityAdapter) is the recommended way to store and update normalized entity collections in your slices. It provides a standard `{ ids, entities }` state shape along with generated reducers and selectors. See [Performance and Normalizing Data](../../tutorials/essentials/part-6-performance-normalization.md) for a walkthrough.

If you need to transform deeply nested API responses with complex relational schemas into normalized data, the [Normalizr](https://github.com/paularmstrong/normalizr) library is still a common option. You can define schema types and relations, feed the schema and the response data to Normalizr, and it will output a normalized transformation of the response. That output can then be included in an action and used to update the store (including slices that use `createEntityAdapter`). Normalizr is stable and feature-rich for relational normalization, but it is [no longer actively maintained](https://github.com/paularmstrong/normalizr/discussions/493#discussioncomment-2395540).
