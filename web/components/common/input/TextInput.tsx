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
  disabled?: boolean;
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
  disabled = false,
  ...props
  }) => (
  <div
    className={cn(
      `
        flex items-center gap-2 rounded-lg border bg-background px-2
        text-body-md
        focus-within:border-onPrimary
      `,
      error
        ? `z-10 border-error bg-error/20 focus-within:border-error`
        : "border-outline",
      className,
      disabled && "pointer-events-none bg-surface-container select-none",
    )}
  >
    {prefixIcon && (
      <div className="h-6">
        <MaterialIcon icon={prefixIcon} />
      </div>
    )}
    {label && <div>{label}</div>}
    <div className="flex w-full items-center gap-1">
      {prefixText && <div className="opacity-50 select-none">{prefixText}</div>}
      <input
        className={cn(
          `
            h-10 w-full py-2 text-body-md outline-none
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          `,
          alignment === "left"
            ? "text-left"
            : alignment === "right"
              ? "text-right"
              : "text-center",
        )}
        disabled={disabled}
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
    <div className="flex items-center gap-1">
      {error && showErrorIcon && (
        <div className="h-6">
          <MaterialIcon icon="error" className="text-error" />
        </div>
      )}
      {error && errorMessage && (
        <div className="text-error">{errorMessage}</div>
      )}
    </div>
  </div>
);

export default TextInput;
