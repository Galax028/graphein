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

  // Buttons
  const updateCount = (newCount: number) => {
    const clampedValue = Math.min(
      Math.max(newCount, min ?? -Infinity),
      max ?? Infinity
    );
    setTempCount(String(clampedValue));
    setCount(clampedValue);
  };

  // Text Input
  const validateUpdateCount = (value: string) => {
    const tempNumber = Number(value.replace(/[^\d-]/g, ""));

    if (isNaN(tempNumber)) {
      setTempCount("0");
      setCount(0);
      return;
    }

    const clampedValue = Math.min(
      Math.max(tempNumber, min ?? -Infinity),
      max ?? Infinity
    );
    setTempCount(String(clampedValue));
    setCount(clampedValue);
  };

  return (
    <SegmentedGroup>
      <Button
        className="!bg-surfaceContainer"
        appearance="tonal"
        icon="remove"
        disabled={min != undefined && count <= min}
        onClick={() => {updateCount(count - 1)}}
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
        onClick={() => {updateCount(count + 1)}}
      />
    </SegmentedGroup>
  );
}
1;

export default NumberInput;
