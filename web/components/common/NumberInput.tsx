import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import cn from "@/utils/helpers/cn";
import { useState } from "react";

type NumberInputProps = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  min?: number;
  max?: number;
};

function NumberInput({ count, setCount, min, max }: NumberInputProps) {
  const [tempCount, setTempCount] = useState(String(count));

  // Get the value within range.
  const clampedValue = (i: number) =>
    Math.min(Math.max(i, min ?? -Infinity), max ?? Infinity);

  // Buttons
  const updateCount = (i: number) => {
    setTempCount(String(clampedValue(i)));
    setCount(clampedValue(i));
  };

  // Text Input
  const validateUpdateCount = (i: string) => {
    let rawString = i.replace(/^0+/, "");

    // Remove non-numbers except "-"
    const tempNumber = Number(
      rawString
        ? rawString[0] === "-"
          ? "-" + rawString.slice(1).replace(/[^0-9]/g, "")
          : rawString.replace(/[^0-9]/g, "")
        : rawString
    );

    // If the number is not valid, set it to 0.
    // Note: If 0 is not in range, we set it to min or max afterwards.
    if (isNaN(tempNumber)) {
      setTempCount("0");
      setCount(0);
      return;
    }

    setTempCount(String(clampedValue(tempNumber)));
    setCount(clampedValue(tempNumber));
  };

  return (
    <SegmentedGroup>
      <Button
        className="!bg-surfaceContainer"
        appearance="tonal"
        icon="remove"
        disabled={min != undefined && count <= min}
        onClick={() => {
          updateCount(count - 1);
        }}
      />
      <input
        className={cn(
          `p-2 h-10 w-full text-center !border-r z-10 text-bodyMedium
            border border-outline [appearance:textfield] 
            [&::-webkit-outer-spin-button]:appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none
          `
        )}
        type="text"
        onChange={(e) => {
          setTempCount(e.target.value);
        }}
        onBlur={() => validateUpdateCount(tempCount)}
        value={tempCount}
      />
      <Button
        className="!bg-surfaceContainer !border-l-0"
        appearance="tonal"
        icon="add"
        disabled={max != undefined && count >= max}
        onClick={() => {
          updateCount(count + 1);
        }}
      />
    </SegmentedGroup>
  );
}
1;

export default NumberInput;
