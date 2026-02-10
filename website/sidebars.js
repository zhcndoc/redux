module.exports = {
  docs: {
    '介绍': [
      'introduction/getting-started',
      'introduction/installation',
      'introduction/why-rtk-is-redux-today',
      'introduction/core-concepts',
      'introduction/learning-resources',
      'introduction/ecosystem',
      'introduction/examples'
    ],
    '教程': [
      'tutorials/tutorials-index',
      'tutorials/quick-start',
      'tutorials/typescript-quick-start',
      {
        type: 'category',
        label: 'Redux 入门',
        items: [
          'tutorials/essentials/part-1-overview-concepts',
          'tutorials/essentials/part-2-app-structure',
          'tutorials/essentials/part-3-data-flow',
          'tutorials/essentials/part-4-using-data',
          'tutorials/essentials/part-5-async-logic',
          'tutorials/essentials/part-6-performance-normalization',
          'tutorials/essentials/part-7-rtk-query-basics',
          'tutorials/essentials/part-8-rtk-query-advanced'
        ]
      },
      {
        type: 'category',
        label: 'Redux 基础',
        items: [
          'tutorials/fundamentals/part-1-overview',
          'tutorials/fundamentals/part-2-concepts-data-flow',
          'tutorials/fundamentals/part-3-state-actions-reducers',
          'tutorials/fundamentals/part-4-store',
          'tutorials/fundamentals/part-5-ui-react',
          'tutorials/fundamentals/part-6-async-logic',
          'tutorials/fundamentals/part-7-standard-patterns',
          'tutorials/fundamentals/part-8-modern-redux'
        ]
      },
      'tutorials/videos'
    ],
    '使用 Redux': [
      'usage/index',
      {
        type: 'category',
        label: '设置与组织',
        collapsed: false,
        items: [
          'usage/configuring-your-store',
          'usage/nextjs',
          'usage/code-splitting',
          'usage/server-rendering',
          'usage/isolating-redux-sub-apps'
        ]
      },
      {
        type: 'category',
        label: '迁移',
        collapsed: false,
        items: [
          'usage/migrating-to-modern-redux',
          'usage/migrations/migrating-rtk-2'
        ]
      },
      {
        type: 'category',
        label: '代码质量',
        collapsed: false,
        items: [
          'usage/usage-with-typescript',
          'usage/writing-tests',
          'usage/troubleshooting'
        ]
      },
      {
        type: 'category',
        label: 'Redux 逻辑与模式',
        collapsed: false,
        items: [
          {
            type: 'category',
            label: '结构化 Reducer',
            collapsed: true,
            items: [
              'usage/structuring-reducers/structuring-reducers',
              'usage/structuring-reducers/prerequisite-concepts',
              'usage/structuring-reducers/basic-reducer-structure',
              'usage/structuring-reducers/splitting-reducer-logic',
              'usage/structuring-reducers/refactoring-reducer-example',
              'usage/structuring-reducers/using-combinereducers',
              'usage/structuring-reducers/beyond-combinereducers',
              'usage/structuring-reducers/normalizing-state-shape',
              'usage/structuring-reducers/updating-normalized-data',
              'usage/structuring-reducers/reusing-reducer-logic',
              'usage/structuring-reducers/immutable-update-patterns',
              'usage/structuring-reducers/initializing-state'
            ]
          },
          'usage/reducing-boilerplate',
          'usage/deriving-data-selectors',
          'usage/writing-logic-thunks',
          'usage/side-effects-approaches',
          'usage/writing-custom-middleware',
          'usage/implementing-undo-history'
        ]
      }
    ],
    '理解 Redux': [
      {
        type: 'category',
        label: 'Redux 思维',
        items: [
          'understanding/thinking-in-redux/motivation',
          'understanding/thinking-in-redux/three-principles',
          'understanding/thinking-in-redux/glossary'
        ]
      },
      {
        type: 'category',
        label: '历史与设计',
        items: [
          'understanding/history-and-design/history-of-redux',
          'understanding/history-and-design/prior-art',
          'understanding/history-and-design/middleware'
        ]
      }
    ],
    '常问问题': [
      'faq',
      'faq/general',
      'faq/reducers',
      'faq/organizing-state',
      'faq/store-setup',
      'faq/actions',
      'faq/immutable-data',
      'faq/code-structure',
      'faq/performance',
      'faq/design-decisions',
      'faq/react-redux',
      'faq/miscellaneous'
    ],
    '风格指南': ['style-guide/style-guide'],
    'API 参考': [
      'api/api-reference',
      'api/createstore',
      'api/store',
      'api/combinereducers',
      'api/applymiddleware',
      'api/bindactioncreators',
      'api/compose',
      'api/utils',
      { type: 'link', label: '错误信息', href: '/errors' }
    ],
    'Redux 工具包': ['redux-toolkit/overview']
  }
}
