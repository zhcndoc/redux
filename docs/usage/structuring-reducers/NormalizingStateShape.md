---
id: normalizing-state-shape
title: 标准化 State 结构
description: 'Structuring Reducers > 标准化 State 结构：为何及如何基于 ID 存储数据项以便查找'
---

<!-- prettier-ignore -->
import HandWrittenReducersNote from "../../components/_HandWrittenReducersNote.mdx";

# 标准化 State 结构

<HandWrittenReducersNote />

许多应用会处理嵌套数据或关系型数据。例如，博客编辑器可能有多篇帖子，每篇帖子有多条评论，而帖子和评论都由用户撰写。这类应用的数据可能如下所示：

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

- 当某条数据在多处重复时，就更难确保它们都被正确更新。
- 嵌套数据会使对应的 reducer 逻辑也更深、更复杂。尤其是更新深层嵌套字段时，代码很快就会变得难以维护。
- 不可变更新要求同时复制并更新状态树中的所有祖先对象；而新对象引用会导致使用 `useSelector` 读取它们的组件重新渲染。因此，更新一个深层嵌套数据对象，可能会迫使完全不相关的 UI 组件重新渲染，即使它们显示的数据实际上没有变化。

因此，管理 Redux store 中的关系型或嵌套数据时，推荐的做法是将部分 store 视为数据库，并将数据存储为_标准化_形式。

## 设计标准化的 State {#designing-a-normalized-state}

标准化数据的基本概念是：

- 每种类型的数据在 state 中拥有自己的“表”。
- 每个“数据表”应将各个条目存储为一个对象，条目的 ID 作为键，条目本身作为值。
- 任何对单个条目的引用应通过存储条目 ID 来完成。
- 使用 ID 数组来表示顺序。

Redux Toolkit 的 [`createEntityAdapter`](/toolkit/api/createEntityAdapter) 会替你实现 `{ ids: [], entities: {} }` 这种结构，并生成用于处理该结构的 reducer 函数和 selector。本页示例使用等价的字段名 `allIds` 和 `byId`，以便清楚展示其结构，但基本思路相同：使用一个以 ID 为键的查找对象，以及一个用于排序的 ID 数组。

上面博客示例的标准化状态结构可能如下所示：

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

需要注意，标准化状态结构通常意味着会有更多组件从 store 读取数据，由每个组件使用 `useSelector` 查询自己的数据，而不是让少数组件选取大量数据再层层传递。让父组件只向子组件传递条目 ID，再由子组件自行选择对应条目，是优化 React Redux 应用 UI 性能的良好模式，因此保持状态标准化对提升性能很重要。

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

由于我们将 Redux store 的一部分视作“数据库”，许多数据库设计原则也适用于此。存储关系并没有唯一固定的方式，应选择便于应用读取和更新所需数据的结构。

### 在实体上存储相关 ID {#storing-related-ids-on-an-entity}

如果通常只沿一个方向查询关系，而且关系本身没有需要存储的数据，那么在实体上保存相关 ID 数组通常是最简单的做法。例如，作者记录可以保存其书籍的 ID：

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

这样查找作者的书籍时，只需根据 `bookIds` 到 `books.byId` 中直接读取对应记录。这适用于一对多关系，或 UI 主要沿一个方向查询的场景。

### 使用联结表 {#using-a-join-table}

对于多对多关系，或关系本身包含需要存储的数据时，可以使用中间表保存相关条目的 ID。这通常称为“联结表”或“关联表”。例如，`authorBook` 记录还可以描述作者在特定书籍中的角色：

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

此时，“查找某个作者的所有书籍”等操作可以遍历联结表，筛选所需的 `authorId` 并读取每个匹配的 `bookId`。考虑到客户端应用通常处理的数据规模以及 JavaScript 引擎的速度，这对大多数用例来说已经足够快。

如果性能分析表明某种关系查询已成为瓶颈，可以维护额外的索引，例如 `bookIdsByAuthorId`。应使用与更新关系记录相同的 action 派生该索引，避免数据不一致。先采用符合用例的简单结构，只有在测量确认读取模式确实需要时才添加索引。

## 标准化嵌套数据 {#normalizing-nested-data}

由于 API 经常以嵌套形式返回数据，因此在将其放入状态树之前，需要先转换为标准化结构。

对于大多数应用，推荐使用 [Redux Toolkit 的 `createEntityAdapter`](/toolkit/api/createEntityAdapter) 在 slice 中存储和更新标准化的实体集合。它提供标准的 `{ ids, entities }` 状态结构，并生成相应的 reducer 和 selector。完整示例请参阅[性能与数据标准化](../../tutorials/essentials/part-6-performance-normalization.md)。

如果需要将具有复杂关系结构的深层嵌套 API 响应转换为标准化数据，[Normalizr](https://github.com/paularmstrong/normalizr) 仍是常用选择。你可以定义 schema 类型和关系，将 schema 与响应数据交给 Normalizr，它会输出标准化后的响应数据。随后可以将结果放入 action 并用于更新 store（包括使用 `createEntityAdapter` 的 slice）。Normalizr 稳定且功能丰富，但它[已不再积极维护](https://github.com/paularmstrong/normalizr/discussions/493#discussioncomment-2395540)。
