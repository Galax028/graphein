import cn from "@/utils/helpers/cn";
import type { FC, ReactNode } from "react";

type SegmentedGroupProps = {
  className?: string;
  direction?: "horizontal" | "vertical";
  children: ReactNode;
};

/**
 * SegmentedGroup is a component that groups buttons, inputs, or divs
 * into a segmented control style layout.
 *
 * @param direction   The direction of the segmented group,
 *                    either "horizontal" or "vertical".
 */
const SegmentedGroup: FC<SegmentedGroupProps> = ({
  children,
  className,
  direction = "horizontal",
}) => {
  return (
    <div
      className={cn(
        `flex border border-outline rounded-lg [&>button,&>div,&>input]:border-0
          [&>button,&>div,&>input]:rounded-none [&>button]:bg-background
          [&>div,&>input]:p-2 [&>input]:z-10 [&>button]:flex-[10%] [&>div]:h-10
 
          [&>button,&>div,&>input]:border-outline
          [&>div.border-error]:outline [&>div.border-error]:outline-error 
          [&>div.border-error]:border-none [&>div.border-error]:py-0,
        `,
        direction == "horizontal"
          ? `flex-row [&>button,&>div,&>input]:first:rounded-l-lg 
            [&>button,&>div,&>input]:last:rounded-r-lg 
            [&>button,&>div,&>input]:not-first:border-l`
          : `flex-col [&>button,&>div,&>input]:first:rounded-t-lg 
            [&>button,&>div,&>input]:last:rounded-b-lg
            [&>button,&>div,&>input]:not-first:border-t`,
        className,
      )}
    >
      {children}
    </div>
  );
};

export default SegmentedGroup;
