import type { FC, ReactNode } from "react";

type TreeViewWrapperProps = {
  index?: number;
  children: ReactNode;
};

/**
 * The parent wrapper for a tree view structure.
 *
 * This component provides the initial indentation and the main vertical line
 * from which child nodes branch off.
 *
 * @param props.index     The indentation level of the tree, affecting its
 *                        horizontal offset. Defaults to 0.
 * @param props.children  The child `TreeViewContainer` elements to be rendered
 *                        within this tree level.
 */
const TreeViewWrapper: FC<TreeViewWrapperProps> = ({ index = 0, children }) => {
  return (
    <div
      className="ml-4 flex flex-col border-l border-outline pl-4"
      style={{ width: `calc(100% - ${index * 0.5}rem)` }}
    >
      {children}
    </div>
  );
};

export default TreeViewWrapper;
