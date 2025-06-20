import cn from "@/utils/helpers/code/cn";
import { MaterialIconProps } from "@/utils/types/common";

const MaterialIcon = ({ icon, className }: MaterialIconProps) => {
  return (
    <i className={cn("material-symbols-outlined select-none", className)}>
      {icon}
    </i>
  );
};

export default MaterialIcon;
