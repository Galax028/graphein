import { SegmentedGroupProps } from "@/utils/types/common";
import cn from "@/utils/helpers/cn";

const SegmentedGroup = ({ children, className, direction, }: SegmentedGroupProps) => {
  return (
    <div
      className={cn(
        `flex border border-outline rounded-lg
          [&>button,div,input]:rounded-none [&>div,input]:p-2 [&>input]:z-10
          [&>button,div,input]:border-0 [&>button,div,input]:not-first:border-l
          [&>button,div,input]:first:rounded-l-lg [&>button]:flex-[10%] 
          [&>button,div,input]:last:rounded-r-lg [&>button,div,input]:border-outline`,
          // [&>button,div,input]:last:rounded-r-lg [&>button]:bg-background`,
          direction == "horizontal"
            ? "flex-row"
            : "flex-col", 
        className
      )}
      
    >
      {children}

    </div>
  );
};

export default SegmentedGroup;
