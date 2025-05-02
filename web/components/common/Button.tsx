interface BaseButtonProps {
  appearance: "outlined" | "filled";
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

const Button = ({ appearance, icon, children }: ButtonProps) => {
  return (
    <button
      className={
        `flex justify-center gap-2 p-2.5 rounded-lg hover:brightness-75 
        cursor-pointer transition ` +
        (icon && children && "pr-3.5") +
        (appearance == "outlined"
          ? " border border-outline"
          : " bg-primary text-onPrimary")
      }
    >
      {icon && <span className="material-symbols-outlined">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
