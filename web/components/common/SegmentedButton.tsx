import { SegmentedButtonProps } from "@/utils/types/common";
import cn from "@/utils/helpers/cn";

const SegmentedButton = ({ children, className }:SegmentedButtonProps) => {
  return (
    <div className={cn(
      `flex [&>button]:w-full [&>button]:rounded-none
      [&>button]:bg-background [&>button]:not-first:border-l-0
      [&>button]:first:rounded-l-lg [&>button]:last:rounded-r-lg`,
      className
    )}>
      {children}
    </div>
  )
}

export default SegmentedButton;