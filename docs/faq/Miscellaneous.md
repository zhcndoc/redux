---
id: miscellaneous
title: 杂项
sidebar_label: 杂项
---

## Redux 常见问答：杂项

### 有没有规模较大、真正的 Redux 项目？

有，很多！举几个例子：

- [Twitter / X's web client](https://x.com/)
- [Wordpress's admin page](https://github.com/Automattic/wp-calypso)
- [Firefox's debugger](https://github.com/firefox-devtools/debugger)
- [The Hyper terminal application](https://github.com/vercel/hyper)

And many, many more!

#### 进一步信息

**文档**

- [介绍：示例](../introduction/Examples.md)

**讨论**

- [Reddit：大型开源 React/Redux 项目有哪些？](https://www.reddit.com/r/reactjs/comments/496db2/large_open_source_reactredux_projects/)
- [HN：有使用 Redux 构建的巨大 Web 应用吗？](https://news.ycombinator.com/item?id=10710240)

### 如何在 Redux 中实现身份认证？

身份认证对任何真实的应用都是必不可少的。实现身份认证时，你必须记住，这不会改变你组织应用的方式，应像实现其他功能一样实现身份认证。过程相对简单：

1. Create an `auth` slice with `createSlice` that holds the current user and token (or a flag indicating whether the user is logged in), plus loading and error fields for the login request.

2. Make the login request either with an [RTK Query mutation](/toolkit/rtk-query/usage/mutations) or with a [`createAsyncThunk`](/toolkit/api/createAsyncThunk) that takes the credentials and returns the token. Handle the pending, fulfilled, and rejected cases in the slice's `extraReducers` (or with `addMatcher` for the mutation's lifecycle actions) to save the token or the error message.

3. Read the token from the store when making other requests. With RTK Query, do this in `baseQuery`'s [`prepareHeaders`](/toolkit/rtk-query/api/fetchBaseQuery#setting-default-headers-on-requests) callback, which receives `getState`. For other code that needs the token outside a component, see [How can I use the Redux store in non-component files?](./CodeStructure.md#how-can-i-use-the-redux-store-in-non-component-files).

4. If you want the session to survive a page reload, persist the token from a [listener middleware](/toolkit/api/createListenerMiddleware) effect that runs when the login succeeds, and read it back into `preloadedState` when you create the store.

#### 进一步信息

**Documentation**

- [RTK Query: Authentication example](/toolkit/rtk-query/usage/examples#authentication)

**Articles**

- [Authentication with JWT by Auth0](https://auth0.com/blog/secure-your-react-and-redux-app-with-jwt-authentication/) (2016, uses `connect` and hand-written thunks; the overall flow still applies)
