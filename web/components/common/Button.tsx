import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import { ButtonProps } from "@/utils/types/common";

/**
 * The button for general interface use.
 * 
 * @param appearance The button appearance. (tonal | filled)
 * @param icon The icon name string to appear in front of the button. (Optional)
 * @param children The contents inside the button.
 * 
 * @returns A button styled according to parameters.
 */

const Button = ({ appearance, icon, children, className }: ButtonProps) => {
  return (
    <button
      className={cn(
        `flex justify-center items-center gap-2 p-2.5 rounded-lg cursor-pointer transition
          hover:brightness-80 focus:brightness-80 text-sm`,
        icon && children && "pr-3.5",
        appearance == "tonal"
          ? "border border-outline bg-surfaceContainer"
          : "bg-primary text-onPrimary",
        className
      )}
    >
      {icon && <MaterialIcon icon={icon} />}
      {children}
    </button>
  );
};

export default Button;
