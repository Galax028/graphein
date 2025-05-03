import cn from "@/utils/helpers/cn";
import MaterialIcon from "@/components/common/MaterialIcon";

interface BaseButtonProps {
  appearance: "tonal" | "filled";
  className?: string;
}

interface IconButtonProps extends BaseButtonProps {
  icon: string;
  children?: never;
}

interface TextButtonProps extends BaseButtonProps {
  icon?: string | null | undefined;
  children: React.ReactNode;
}

type ButtonProps = IconButtonProps | TextButtonProps;

const Button = ({ appearance, icon, children, className }: ButtonProps) => {
  return (
    <button
      className={cn(
        `flex justify-center items-center gap-2 p-2.5 rounded-lg cursor-pointer transition
          hover:brightness-80 focus:brightness-80`,
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
