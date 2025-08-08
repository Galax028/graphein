import MaterialIcon from "@/components/common/MaterialIcon";
import { cn } from "@/utils";
import type { ButtonHTMLAttributes, FC, ReactNode } from "react";

type BaseButtonProps = {
  appearance: "tonal" | "filled";
  selected?: boolean;
  busy?: boolean;
  busyWithText?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

type IconButtonProps = BaseButtonProps & {
  icon: string | null;
  children?: never;
};

type TextButtonProps = BaseButtonProps & {
  icon?: string | null;
  children: ReactNode;
};

type ButtonProps = IconButtonProps | TextButtonProps;

/**
 * A versatile button component for general interface use.
 *
 * This component can be rendered in different visual styles and states. It
 * supports being an icon-only button or a button with text and an optional
 * icon. It also handles busy, selected, and disabled states.
 *
 * @param props.className     Additional classes to apply to the button.
 * @param props.appearance    The visual style of the button.
 * @param props.icon          The name of the Material Icon to display.
 * @param props.selected      If true, displays a checkmark and applies a
 *                            selected style.
 * @param props.disabled      If true, disables the button and applies a
 *                            disabled style.
 * @param props.busy          If true, displays a spinning loader, indicating an
 *                            action is in progress.
 * @param props.busyWithText  If false while `busy` is true, the button's
 *                            text/children will be hidden.
 * @param props.children      The content to display inside the button, such as
 *                            text. Required for text buttons.
 */
const Button: FC<ButtonProps> = ({
  className,
  appearance,
  icon,
  selected = false,
  disabled = false,
  busy = false,
  busyWithText = true,
  children,
  ...props
}) => {
  return (
    <button
      className={cn(
        `
          flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg
          p-2 text-body-md transition select-none
        `,
        icon && children && !busy && "pr-3.5",
        (busy || disabled) &&
          "!cursor-not-allowed bg-background opacity-25 hover:!brightness-100",
        appearance === "tonal"
          ? `border border-outline bg-surface-container hover:bg-background`
          : `bg-primary text-onPrimary hover:brightness-80`,
        selected &&
          "!gap-1 !pr-4 hover:!brightness-100" +
            (appearance === "tonal" ? "!bg-surface-container" : "!bg-primary"),
        className,
      )}
      disabled={disabled}
      {...props}
    >
      {busy ? (
        <div className="grid place-items-center">
          <MaterialIcon icon="progress_activity" className="animate-spin" />
        </div>
      ) : selected ? (
        <MaterialIcon icon="check_small" />
      ) : (
        icon && <MaterialIcon icon={icon} />
      )}
      {!(busy && !busyWithText) && <>{children}</>}
    </button>
  );
};

export default Button;
