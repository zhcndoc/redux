---
id: normalizing-state-shape
title: 标准化 State 结构
description: 'Structuring Reducers > 标准化 State 结构：为何及如何基于 ID 存储数据项以便查找'
---

# 标准化 State 结构

许多应用都会处理嵌套或关系型的数据。例如，一个博客编辑器可能有许多帖子（Posts），每个帖子可能有许多评论（Comments），而帖子和评论都由用户（User）撰写。此类应用的数据可能如下所示：

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

- 当某条数据在多个地方重复时，保证其被正确更新会变得更加困难。
- 嵌套数据意味着对应的 reducer 逻辑也必须更为嵌套，因此更复杂。尤其是在尝试更新深层嵌套字段时，代码会变得非常难看且难以维护。
- 由于不可变数据的更新需要复制并更新状态树中的所有祖先节点，并且新的对象引用会导致关联的 UI 组件重新渲染，更新一个深层嵌套的数据对象可能会导致完全无关的 UI 组件也重新渲染，即便它们显示的数据实际上并未改变。

因此，管理 Redux store 中的关系型或嵌套数据时，推荐的做法是将部分 store 视为数据库，并将数据存储为_标准化_形式。

## 设计标准化的 State

标准化数据的基本概念是：

- 每种类型的数据在 state 中拥有自己的“表”。
- 每个“数据表”应将各个条目存储为一个对象，条目的 ID 作为键，条目本身作为值。
- 任何对单个条目的引用应通过存储条目 ID 来完成。
- 使用 ID 数组来表示顺序。

对于上面博客示例的一个标准化状态结构可能如下：

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

需要注意的是，标准化的 State 结构通常意味着更多组件处于连接状态（connected），并且各组件负责自行查找要用的数据。相较于少数连接组件获取大量数据再向下传递，事实证明连接父组件只传递条目 ID 给子连接组件是 React Redux 应用优化性能的良好模式，因此保持状态标准化对性能提升至关重要。

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

因为将部分 Redux store 视作“数据库”，数据库设计的很多原则也适用。举例来说，如果存在多对多关系，我们可用一个中间表来存储对应条目的 ID（通常称为“连接表”或“联结表”）。为保持一致，我们一般会用跟实际条目表相同的 `byId` 和 `allIds` 形式，如下：

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
                    bookId: 22
                },
                2: {
                    id: 2,
                    authorId: 5,
                    bookId: 15
                },
                3: {
                    id: 3,
                    authorId: 42,
                    bookId: 12
                }
            },
            allIds: [1, 2, 3]
        }
    }
}
```

诸如“查找某作者的所有图书”操作，则可通过遍历连接表轻松实现。鉴于客户端应用中通常的数据量及 JavaScript 引擎的速率，这类操作速度足以满足大多数场景需求。

## 标准化嵌套数据

因为接口（API）数据经常以嵌套形式返回，我们需要将其转换为标准化形态后再存入状态树。通常使用 [Normalizr](https://github.com/paularmstrong/normalizr) 库来完成此任务。你可以定义 schema 类型和关联关系，将响应数据和 schema 一起传给 Normalizr，它会输出标准化后的变换结构。然后该输出可作为 action 的部分载荷，用于更新 store。详见 Normalizr 文档了解具体用法。