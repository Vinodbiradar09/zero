import React from 'react';
import { NodeViewWrapper, NodeViewContent} from '@tiptap/react';
import type {NodeViewProps} from "@tiptap/react";

const CopilotNode: React.FC<NodeViewProps> = (props) => {
  return (
    <NodeViewWrapper as="div">
      <NodeViewContent
        className="text-gray-300 select-none !inline"
        as="div"
      >
        {props.node.attrs.content}
      </NodeViewContent>
    </NodeViewWrapper>
  );
};

export default CopilotNode;
