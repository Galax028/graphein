import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import { cn } from "@/utils";
import { type FC, type InputHTMLAttributes, useState } from "react";

type NumberInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  min?: number;
  max?: number;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "min" | "max"
>;

/**
 * A controlled number input component with increment/decrement buttons.
 *
 * It automatically handles invalid character removal, and clamps the value
 * within a specified min/max range upon losing focus.
 *
 * @param props.value     The controlled numerical value of the input.
 * @param props.onChange  The callback function to update the parent's state.
 * @param props.min       The optional minimum value for the input.
 * @param props.max       The optional maximum value for the input.
 */
const NumberInput: FC<NumberInputProps> = ({
  value,
  onChange,
  className,
  min,
  max,
  ...props
}) => {
  const [internalValue, setInternalValue] = useState("0");

  return (
    <SegmentedGroup
      className={`
        group transition-colors duration-100
        focus-within:border-primary
      `}
    >
      <Button
        className="!bg-surface-container"
        appearance="tonal"
        icon="remove"
        disabled={min !== undefined && parseInt(value ?? internalValue) <= min}
        onClick={() => {
          const nextValue = (parseInt(value ?? internalValue) - 1).toString();
          setInternalValue(nextValue);
          if (onChange) onChange(nextValue);
        }}
      />
      <input
        className={cn(
          `
            h-10 w-full
            [appearance:textfield]
            border !border-r border-outline bg-background p-2 text-center
            text-body-md outline-none
            group-focus-within:border-primary
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          `,
          className,
        )}
        type="number"
        value={value ?? internalValue}
        onChange={(event) => {
          let value = parseInt(event.target.value);
          if (min !== undefined && (isNaN(value) || value < min)) value = min;
          else if (max !== undefined && value > max) value = max;
          else if (isNaN(value)) value = 0;

          const nextValue = value.toString();
          if (value === undefined) setInternalValue(nextValue);
          if (onChange) onChange(nextValue);
        }}
        {...props}
      />
      <Button
        className="!border-l-0 !bg-surface-container"
        appearance="tonal"
        icon="add"
        disabled={max !== undefined && parseInt(value ?? internalValue) >= max}
        onClick={() => {
          const nextValue = (parseInt(value ?? internalValue) + 1).toString();
          setInternalValue(nextValue);
          if (onChange) onChange(nextValue);
        }}
      />
    </SegmentedGroup>
  );
};

export default NumberInput;
