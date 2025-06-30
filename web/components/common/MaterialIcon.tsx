import cn from "@/utils/helpers/code/cn";
import { MaterialIconProps } from "@/utils/types/common";

/**
 * Material icon set, weight 300, size 24px.
 *
 * @param icon        The icon name.
 * @param className   Style extension to the base style.
 */

const MaterialIcon = ({ icon, className }: MaterialIconProps) => {
  return (
    <i className={cn("material-symbols-outlined select-none", className)}>
      {icon}
    </i>
  );
};

export default MaterialIcon;
