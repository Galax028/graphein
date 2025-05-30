import { SegmentedGroupProps } from "@/utils/types/common";
import cn from "@/utils/helpers/cn";

/**
 * SegmentedGroup is a component that groups buttons, inputs, or divs
 * into a segmented control style layout.
 *
 * @param direction The direction of the segmented group, either "horizontal" or "vertical".
 */

const SegmentedGroup = ({
  children,
  className,
  direction = "horizontal",
}: SegmentedGroupProps) => {
  return (
    <div
      className={cn(
        `flex border border-outline rounded-lg
          [&>button,div,input]:rounded-none [&>div,input]:p-2 [&>input]:z-10
          [&>button,div,input]:border-0 [&>button,div,input]:not-first:border-l
          [&>button,div,input]:first:rounded-l-lg [&>button]:flex-[10%] 
          [&>button,div,input]:last:rounded-r-lg [&>button,div,input]:border-outline`,
        // [&>button,div,input]:last:rounded-r-lg [&>button]:bg-background`,
        direction == "horizontal" ? "flex-row" : "flex-col",
        className
      )}
    >
      {children}
    </div>
  );
};

export default SegmentedGroup;
