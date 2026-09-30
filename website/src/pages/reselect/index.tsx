import React from 'react'
import LibraryLanding from '@site/src/components/LibraryLanding'

const features = [
  {
    title: '符合预期',
    content: (
      <p>
        与 Redux 一样，Reselect 为函数记忆化提供了一致的思维模型：提取输入值，并在任一输入变化时重新计算。
      </p>
    )
  },
  {
    title: '性能优化',
    content: (
      <p>
        Reselect 会尽量减少开销较大的计算次数；如果输入没有变化，就复用已有的结果引用，从而提升性能。
      </p>
    )
  },
  {
    title: '灵活定制',
    content: (
      <p>
        Reselect 默认配置快速高效，同时提供灵活的定制选项。你可以更换记忆化方法、调整相等性检查，并根据需要进行配置。
      </p>
    )
  },
  {
    title: '类型安全',
    content: (
      <p>
        Reselect 对 TypeScript 提供完善支持。生成的 selector 会从输入 selector 推断所有类型。
      </p>
    )
  }
]

export default function ReselectHome(): React.ReactNode {
  return (
    <LibraryLanding
      name="Reselect"
      tagline="Redux 的记忆化选择器库"
      description="Redux 的记忆化选择器库"
      getStartedPath="reselect/introduction/getting-started"
      features={features}
    />
  )
}
