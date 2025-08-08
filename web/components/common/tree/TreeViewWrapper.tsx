import { ReactNode } from "react";

type TreeViewWrapperProps = {
  index?: number;
  children: ReactNode;
};

/**
 * The parent element in a tree wrapper structure. (Wrapper + Side Line)
 *
 * @param index     The tree level of the wrapper, starts at 0.
 *                  (Optional, Default "0")
 * @param children  The contents within the wrapper. (Required)
 */
const TreeViewWrapper = ({ index = 0, children }: TreeViewWrapperProps) => {
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
