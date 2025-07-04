import cn from "@/utils/helpers/cn";
import type { FC } from "react";

type MaterialIconProps = {
  icon: string;
  filled?: boolean;
  className?: string;
};

/**
 * Material icon set, weight 300, size 24px.
 *
 * @param icon        The icon name.
 * @param filled      The icon's filled state. (Default false)
 * @param className   Style extension to the base style.
 */
const MaterialIcon: FC<MaterialIconProps> = ({
  icon,
  filled = false,
  className,
}) => (
  <i
    className={cn(
      "material-symbols-outlined select-none",
      filled ? "filled" : "",
      className,
    )}
  >
    {icon}
  </i>
);

export default MaterialIcon;
