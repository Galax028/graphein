import MaterialIcon from "@/components/common/MaterialIcon";
import { cn } from "@/utils";
import type { FC, InputHTMLAttributes } from "react";
import type { FieldError } from "react-hook-form";

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

/**
 * A highly customizable text input component.
 *
 * It supports various features like prefixes/suffixes (both text and icons),
 * different text alignments, and detailed error states.
 *
 * @param props.className      Additional classes to apply to the wrapper.
 * @param props.type           The type of the input element. Defaults to
 *                             "text".
 * @param props.alignment      The text alignment within the input. Defaults to
 *                             "left".
 * @param props.error          Indicates an error state. Can be a boolean or a
 *                             `FieldError` object.
 * @param props.errorMessage   The error message to display when in an error
 *                             state.
 * @param props.showErrorIcon  Determines if an error icon is shown when in an
 *                             error state. Defaults to true.
 * @param props.label          An optional label to display inside the input's
 *                             border.
 * @param props.prefixText     Optional text to display before the input value.
 * @param props.prefixIcon     Optional icon to display before the input value.
 * @param props.suffixText     Optional text to display after the input value.
 * @param props.suffixIcon     Optional icon to display after the input value.
 * @param props.disabled       If true, the input will be disabled. Defaults to
 *                             false.
 */
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
        text-body-md transition-colors duration-100
        focus-within:border-primary
      `,
      error
        ? `border-error bg-error/20 focus-within:border-error`
        : "border-outline",
      className,
      disabled && "cursor-not-allowed",
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
          disabled &&
            "pointer-events-none cursor-not-allowed text-on-background-disabled",
        )}
        disabled={disabled}
        type={type}
        {...props}
      />
      {suffixText && <div className="opacity-50 select-none">{suffixText}</div>}
    </div>
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
