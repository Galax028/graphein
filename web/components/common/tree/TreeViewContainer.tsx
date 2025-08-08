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
