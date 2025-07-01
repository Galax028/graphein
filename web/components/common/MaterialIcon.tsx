import cn from "@/utils/helpers/cn";
import type { FC } from "react";

type MaterialIconProps = {
  className?: string;
  icon: string;
};

/**
 * Material icon set, weight 300, size 24px.
 *
 * @param icon        The icon name.
 * @param className   Style extension to the base style.
 */
const MaterialIcon: FC<MaterialIconProps> = ({ icon, className }) => (
  <i className={cn("material-symbols-outlined select-none", className)}>
    {icon}
  </i>
);

export default MaterialIcon;
