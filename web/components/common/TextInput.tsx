import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import type { FC, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

type TextInputProps = {
  alignment?: "left" | "center" | "right";
  error?: FieldError | boolean;
  errorMessage?: string;
  showErrorIcon?: boolean;
  label?: string;
  prefixText?: string;
  prefixIcon?: string;
  suffixText?: string;
  suffixIcon?: string;
  showClearButton?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

const TextInput: FC<TextInputProps> = ({
  className,
  type = "text",
  alignment = "left",
  error,
  errorMessage,
  showErrorIcon = true,
  label,
  prefixText,
  prefixIcon,
  suffixText,
  suffixIcon,
  ...props
}) => (
  <div
    className={cn(
      `flex gap-2 items-center px-2 rounded-lg text-body-md border bg-background focus-within:border-accent`,
      error
        ? "border-error focus-within:border-error bg-error/20 z-10"
        : "border-outline",
      className,
    )}
  >
    {prefixIcon && (
      <div className="h-6">
        <MaterialIcon icon={prefixIcon} />
      </div>
    )}
    {label && <div>{label}</div>}
    <div className="flex items-center w-full gap-1">
      {prefixText && <div className="opacity-50 select-none">{prefixText}</div>}
      <input
        className={cn(
          `py-2 h-10 w-full text-body-md bg-background
              [&::-webkit-outer-spin-button]:appearance-none 
              [&::-webkit-inner-spin-button]:appearance-none
              outline-none
            `,
          alignment === "left"
            ? "text-left"
            : alignment === "right"
              ? "text-right"
              : "text-center",
        )}
        type={type}
        {...props}
      />
      {suffixText && <div className="opacity-50 select-none">{suffixText}</div>}
    </div>
    {/* {showClearButton && (
      <div className="h-6" onClick={() => setValue("")}>
        <MaterialIcon icon={"backspace"} />
      </div>
    )} */}
    {suffixIcon && (
      <div className="h-6">
        <MaterialIcon icon={suffixIcon} />
      </div>
    )}
    {error && showErrorIcon && (
      <div className="h-6">
        <MaterialIcon icon="error" className="text-error" />
      </div>
    )}
    {error && <div className="text-error">{errorMessage}</div>}
  </div>
);

export default TextInput;
