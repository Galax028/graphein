import cn from "@/utils/helpers/cn";
import { ReactNode } from "react";

type TreeViewContainerProps = {
  index?: number;
  isLast?: boolean;
  children: ReactNode;
};

/**
 * The child element in a tree wrapper structure. (Child + Connecting Line)
 *
 * @param isLast    Hides the side extending line from the wrapper element.
 *                  (Optional, Default "false")
 * @param children  The contents within the container. (Required)
 */
const TreeViewContainer = ({
  index = 0,
  isLast = false,
  children,
}: TreeViewContainerProps) => {
  return (
    <div
      className={cn(
        `relative`,
        index > 0 &&
          `mt-1 w-[calc(100%-0.5rem)]
            before:w-[calc(1rem+1px)] before:h-6.25 before:border-b 
            before:border-l before:border-outline before:absolute 
            before:left-[calc(-1rem-1px)] before:-top-1 
            before:rounded-bl-md before:z-50 before:overflow-visible`,
      )}
    >
      {isLast && <div className="absolute w-8 h-full bg-background -left-8" />}
      <div className="w-full">{children}</div>
    </div>
  );
};

export default TreeViewContainer;
