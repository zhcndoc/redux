import React from 'react';
import MDXContent from '@theme-original/MDXContent';
import type MDXContentType from '@theme/MDXContent';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof MDXContentType>;

export default function MDXContentWrapper(props: Props): JSX.Element {
  return (
    <>
      <MDXContent {...props} />
      <div
        className="wwads-cn wwads-horizontal"
        data-id="354"
        style={{
          width: "100%",
          marginBottom: "16px",
          marginTop: "16px",
        }}
      ></div>
    </>
  );
}
