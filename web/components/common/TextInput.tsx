import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import type {
  Dispatch,
  FC,
  HTMLInputTypeAttribute,
  SetStateAction,
} from "react";

type TextInputProps = {
  className?: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  alignment?: "left" | "center" | "right";
  error?: boolean;
  errorText?: string;
  showErrorIcon?: boolean;
  placeholder?: string;
  label?: string;
  prefixText?: string;
  prefixIcon?: string;
  suffixText?: string;
  suffixIcon?: string;
  showClearButton?: boolean;
};

const TextInput: FC<TextInputProps> = ({
  className,
  type = "text",
  value,
  setValue,
  alignment = "left",
  error = false,
  errorText,
  showErrorIcon = true,
  placeholder,
  label,
  prefixText,
  prefixIcon,
  suffixText,
  suffixIcon,
  showClearButton,
}) => (
  <div
    className={cn(
      `flex gap-2 items-center px-2 rounded-lg text-body-md border focus-within:border-accent`,
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
      {prefixText && <div className="opacity-50">{prefixText}</div>}
      <input
        className={cn(
          `py-2 h-10 w-full text-body-md
              [&::-webkit-outer-spin-button]:appearance-none 
              [&::-webkit-inner-spin-button]:appearance-none
              outline-none
            `,
          alignment == "left"
            ? "text-left"
            : alignment == "right"
              ? "text-right"
              : "text-center",
        )}
        type={type}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        value={value}
      />
      {suffixText && <div className="opacity-50">{suffixText}</div>}
    </div>
    {showClearButton && (
      <div className="h-6" onClick={() => setValue("")}>
        <MaterialIcon icon={"backspace"} />
      </div>
    )}
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
    {error && errorText && <div className="text-error">{errorText}</div>}
  </div>
);

export default TextInput;
