import { SegmentedGroupProps } from "@/utils/types/common";
import cn from "@/utils/helpers/cn";

const SegmentedGroup = ({ children, className }: SegmentedGroupProps) => {
  return (
    <div
      className={cn(
        `flex border border-outline rounded-lg
          [&>button,div,input]:rounded-none 
          [&>button,div,input]:border-0 [&>button,div,input]:not-first:border-l
          [&>button,div,input]:first:rounded-l-lg [&>button]:flex-[10%] 
          [&>button,div,input]:last:rounded-r-lg`,
          // [&>button,div,input]:last:rounded-r-lg [&>button]:bg-background`,
        className
      )}
    >
      {children}
    </div>
  );
};

export default SegmentedGroup;
