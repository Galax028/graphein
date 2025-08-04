import cn from "@/utils/helpers/cn";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Button from "./Button";
import SegmentedGroup from "./SegmentedGroup";

type SelectInputProps = {
  value: number;
  setValue: Dispatch<SetStateAction<number>>;
  options: string[];
};

/**
 * The SelectInput element, sometimes also referred to as drop down element.
 *
 * @param value       useState constant to get value    (useState const)
 * @param setValue    useState function to set value    (useState func.)
 * @param options     The array list of the options     (string[])
 */

const SelectInput = ({ value, setValue, options }: SelectInputProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Closes the options window pop-up when element is clicked outside.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (value: any) => {
    setOpen(false);
    setValue(value);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        onClick={() => {
          setOpen(!open);
        }}
      >
        <SegmentedGroup
          className={cn("cursor-pointer", open && "rounded-b-none")}
        >
          <div className="flex items-center bg-background w-full">
            <p className="text-body-md select-none">{options[value]}</p>
          </div>
          <Button
            appearance="tonal"
            icon={"arrow_drop_down"}
            className="!bg-surface-container"
          />
        </SegmentedGroup>
      </div>

      {open && (
        <div
          className={cn(
            `absolute flex flex-col top-[calc(2.5rem+1px)] p-1 w-full max-h-51
              bg-surface-container border border-outline rounded-b-lg shadow-lg 
              overflow-auto z-50`,
          )}
        >
          {options.map((i, idx) => (
            <div
              key={idx}
              className={cn(
                `p-2 bg-surface-container hover:bg-outline rounded-sm 
                  cursor-pointer transition-color `
              )}
              onClick={() => handleOptionClick(idx)}
            >
              <p className="text-body-md select-none">{i}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectInput;
