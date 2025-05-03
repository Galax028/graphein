import cn from "@/utils/helpers/cn";

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
        `flex justify-center gap-2 p-2.5 rounded-lg hover:brightness-80 
        cursor-pointer transition`,
        icon && children && "pr-3.5",
        appearance == "tonal"
          ? "border border-outline bg-surfaceContainer"
          : "bg-primary text-onPrimary",
        className
      )}
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
