import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import cn from "@/utils/helpers/cn";
import { type FC, useState } from "react";

type NumberInputProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

/**
 * A number input that accepts numbers, negatives,
 * and remove invalid characters automatically.
 *
 * @param value     The initial count.
 * @param onChange  The react state variable to send values to parent.
 * @param min       The minimum value for this field.
 * @param max       The maximum value for this field.
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
          `p-2 h-10 w-full text-center !border-r z-10 text-body-md
            border border-outline [appearance:textfield] 
            [&::-webkit-outer-spin-button]:appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none bg-background
          `,
        )}
        type="text"
        onChange={(event) => setTempCount(event.target.value)}
        onBlur={() => validateUpdateCount(tempCount)}
        value={tempCount}
      />
      <Button
        className="!bg-surface-container !border-l-0"
        appearance="tonal"
        icon="add"
        disabled={max !== undefined && value >= max}
        onClick={() => updateCount(value + 1)}
      />
    </SegmentedGroup>
  );
};

export default NumberInput;
