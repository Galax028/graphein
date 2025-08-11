import { cn } from "@/utils";
import type { FC, ReactNode } from "react";

type TreeViewContainerProps = {
  index?: number;
  isLast?: boolean;
  children: ReactNode;
};

/**
 * A container for a child element within a tree view structure, responsible for
 * rendering the connecting lines.
 *
 * This component uses CSS pseudo-elements to draw the lines that connect a node
 * to its parent and siblings, forming the visual tree.
 *
 * @param props.index     The zero-based index of the node in its list.
 * @param props.isLast    Indicates if this is the last node in the list, which
 *                        affects how the connecting line is drawn.
 * @param props.children  The content of the tree node to be rendered.
 */
const TreeViewContainer: FC<TreeViewContainerProps> = ({
  index = 0,
  isLast = false,
  children,
}) => {
  return (
    <div
      className={cn(
        "relative",
        index > 0 &&
          `
            mt-1 w-[calc(100%-0.5rem)]
            before:absolute before:-top-1 before:left-[calc(-1rem-1px)]
            before:z-50 before:h-6.25 before:w-[calc(1rem+1px)]
            before:overflow-visible before:rounded-bl-md before:border-b
            before:border-l before:border-outline
          `,
      )}
    >
      {isLast && <div className="absolute -left-8 h-full w-8 bg-background" />}
      <div className="w-full">{children}</div>
    </div>
  );
};

export default TreeViewContainer;
