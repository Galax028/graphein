import { cn } from "@/utils";
import type { FC, ReactNode } from "react";

type SegmentedGroupProps = {
  className?: string;
  direction?: "horizontal" | "vertical";
  children: ReactNode;
};

/**
 * A layout component that groups its children into a segmented control style.
 *
 * It visually merges buttons, inputs, or other elements into a single connected
 * unit, either horizontally or vertically.
 *
 * @param props.className  Additional CSS classes to apply to the group
 *                         wrapper.
 * @param props.direction  The layout direction of the group, either
 *                         "horizontal" or "vertical". Defaults to "horizontal".
 * @param props.children   The elements to be grouped together.
 */
const SegmentedGroup: FC<SegmentedGroupProps> = ({
  children,
  className,
  direction = "horizontal",
}) => {
  return (
    <div
      className={cn(
        `
          flex rounded-lg border border-outline
          [&>button]:flex-[10%] [&>button]:bg-background
          [&>button,&>div,&>input]:rounded-none
          [&>button,&>div,&>input]:border-0
          [&>button,&>div,&>input]:border-outline
          [&>div]:h-10
          [&>div,&>input]:p-2
          [&>div.border-error]:border-none [&>div.border-error]:py-0
          [&>div.border-error]:outline [&>div.border-error]:outline-error
          [&>input]:z-10
        `,
        direction === "horizontal"
          ? `
            flex-row
            [&>button,&>div,&>input]:not-first:border-l
            [&>button,&>div,&>input]:first:rounded-l-lg
            [&>button,&>div,&>input]:last:rounded-r-lg
          `
          : `
            flex-col
            [&>button,&>div,&>input]:not-first:border-t
            [&>button,&>div,&>input]:first:rounded-t-lg
            [&>button,&>div,&>input]:last:rounded-b-lg
          `,
        className,
      )}
    >
      {children}
    </div>
  );
};

export default SegmentedGroup;
