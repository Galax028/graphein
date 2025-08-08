import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import { cn } from "@/utils";
import { type FC, useState } from "react";

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

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
const NumberInput: FC<NumberInputProps> = ({ value, onChange, min, max }) => {
  const [tempCount, setTempCount] = useState<string>(value.toString());

  // Get the value within range.
  const clampedValue = (i: number) =>
    Math.min(Math.max(i, min ?? -Infinity), max ?? Infinity);

  // Buttons
  const updateCount = (value: number) => {
    const clamped = clampedValue(value);
    setTempCount(clamped.toString());
    onChange(clamped);
  };

  // Text Input
  const validateUpdateCount = (i: string) => {
    const rawString = i.replace(/^0+/, "");

    // Remove non-numbers except "-"
    const tempNumber = Number(
      rawString
        ? rawString[0] === "-"
          ? "-" + rawString.slice(1).replace(/[^0-9]/g, "")
          : rawString.replace(/[^0-9]/g, "")
        : rawString,
    );

    // If the number is not valid, set it to 0.
    // Note: If 0 is not in range, we set it to min or max afterwards.
    if (isNaN(tempNumber)) {
      setTempCount("0");
      onChange(0);
      return;
    }

    setTempCount(clampedValue(tempNumber).toString());
    onChange(clampedValue(tempNumber));
  };

  return (
    <SegmentedGroup>
      <Button
        className="!bg-surface-container"
        appearance="tonal"
        icon="remove"
        disabled={min !== undefined && value <= min}
        onClick={() => updateCount(value - 1)}
      />
      <input
        className={cn(
          `
            z-10 h-10 w-full
            [appearance:textfield]
            border !border-r border-outline bg-background p-2 text-center
            text-body-md
            [&::-webkit-inner-spin-button]:appearance-none
            [&::-webkit-outer-spin-button]:appearance-none
          `,
        )}
        type="text"
        onChange={(event) => setTempCount(event.target.value)}
        onBlur={() => validateUpdateCount(tempCount)}
        value={tempCount}
      />
      <Button
        className="!border-l-0 !bg-surface-container"
        appearance="tonal"
        icon="add"
        disabled={max !== undefined && value >= max}
        onClick={() => updateCount(value + 1)}
      />
    </SegmentedGroup>
  );
};

export default NumberInput;
