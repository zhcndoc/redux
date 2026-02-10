import React from 'react';
import TOC from '@theme-original/TOC';
import type TOCType from '@theme/TOC';
import type {WrapperProps} from '@docusaurus/types';

type Props = WrapperProps<typeof TOCType>;

export default function TOCWrapper(props: Props): JSX.Element {
  return (
    <>
      <div
        className="wwads-cn wwads-vertical"
        data-id="354"
        style={{
          maxWidth: "200px",
          marginBottom: "16px",
          marginTop: "0",
        }}
      ></div>
      <TOC {...props} />
    </>
  );
}
