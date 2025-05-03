import cn from "@/utils/helpers/cn";
import { MaterialIconProps } from "@/utils/types/common";

const MaterialIcon = ({ icon, className }:MaterialIconProps) => {
  return (
    <i className={cn(
      "material-symbols-outlined",
      className
    )}>{icon}</i>
  )
}

export default MaterialIcon;