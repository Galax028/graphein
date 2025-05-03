import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import { ButtonProps } from "@/utils/types/common";

/**
 * The button for general interface use.
 *
 * @param appearance    The button appearance. (tonal | filled)
 * @param icon          The icon name string to appear in front of the button. 
 *                      (optional)
 * @param busy          Is the state busy? Show spinning circle or not. 
 *                      (defaults to false)
 * @param busyShowText  Should the button show text or not when it's busy 
 *                      (defaults to true)
 * @param children      The contents inside the button.
 *
 * @returns A button styled according to parameters.
 */

const Button = ({
  appearance,
  icon,
  disabled = false,
  busy = false,
  busyWithText = true,
  children,
  className,
}: ButtonProps) => {
  return (
    <button
      className={cn(
        `flex justify-center items-center gap-2 p-2.5 rounded-lg cursor-pointer transition
           text-sm`,
        icon && children && !busy && "pr-3.5",
        busy && "brightness-50 select-none pointer-events-none",
        appearance == "tonal"
          ? "border border-outline bg-surfaceContainer hover:bg-background"
          : "bg-primary text-onPrimary hover:brightness-80",
        disabled && "!brightness-50 !select-none !pointer-events-none",
        className
      )}
    >
      {busy ? (
        <MaterialIcon icon={"progress_activity"} className="animate-spin" />
      ) : (
        icon && <MaterialIcon icon={icon} />
      )}
      {busyWithText && <>{children}</>}
    </button>
  );
};

export default Button;
