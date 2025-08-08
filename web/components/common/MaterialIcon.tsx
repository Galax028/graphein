import { cn } from "@/utils";
import type { FC } from "react";

type MaterialIconProps = {
  className?: string;
  icon: string;
  filled?: boolean;
};

/**
 * Renders a Google Material Symbols icon.
 *
 * This component acts as a simple wrapper around the `<i>` tag used for
 * Material Symbols, allowing for easy use of the icon set.
 *
 * @param props.className  Additional classes to apply to the icon element.
 * @param props.icon       The name of the Material Symbols icon to display.
 * @param props.filled     Determines if the icon should use the filled style.
 *                         Defaults to false.
 */
const MaterialIcon: FC<MaterialIconProps> = ({
  icon,
  filled = false,
  className,
}) => (
  <i
    className={cn(
      // eslint-disable-next-line better-tailwindcss/no-unregistered-classes
      "material-symbols-outlined select-none",
      // eslint-disable-next-line better-tailwindcss/no-unregistered-classes
      filled && "filled",
      className,
    )}
  >
    {icon}
  </i>
);

export default MaterialIcon;
