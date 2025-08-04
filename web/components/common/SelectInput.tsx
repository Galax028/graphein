import cn from "@/utils/helpers/cn";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";

type SelectInputProps<T extends object> = {
  value: T;
  onChange?: (value: T) => void;
  displayKey: keyof T;
  matchKey: keyof T;
  options: T[];
};

/**
 * The SelectInput element, sometimes also referred to as drop down element.
 *
 */
const SelectInput = <T extends { [K: string]: string | number | boolean }>({
  value,
  onChange,
  displayKey,
  matchKey,
  options,
}: SelectInputProps<T>) => {
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

  const onOptionChange = (value: T) => {
    setOpen(false);
    if (onChange) onChange(value);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        tabIndex={0}
        onClick={() => {
          setOpen(!open);
        }}
        onKeyDown={(event) =>
          (event.key === "Enter" || event.key === " ") && setOpen(!open)
        }
      >
        <SegmentedGroup
          className={cn(
            "cursor-pointer overflow-hidden",
            open && "rounded-b-none",
          )}
        >
          <div
            className={cn(
              "flex items-center bg-background w-full !rounded-none",
            )}
          >
            <p className="text-body-md select-none">{value[displayKey]}</p>
          </div>
          <Button
            className="!bg-surface-container"
            appearance="tonal"
            icon="arrow_drop_down"
            tabIndex={-1}
          />
        </SegmentedGroup>
      </div>

      {open && (
        <div
          className={cn(
            `absolute flex flex-col top-[calc(2.5rem+1px)] p-1 w-full max-h-51
              bg-surface-container border border-outline rounded-b-lg shadow-xl 
              overflow-auto z-50`,
          )}
        >
          {options.map((option) => (
            <div
              className={cn(
                `p-2 bg-surface-container hover:bg-background rounded-sm 
              cursor-pointer transition-color `,
              )}
              role="option"
              aria-selected={option[matchKey] === value[matchKey]}
              tabIndex={0}
              onClick={() => onOptionChange(option)}
              onKeyDown={(event) =>
                (event.key === "Enter" || event.key === " ") &&
                onOptionChange(option)
              }
              key={option[matchKey].toString()}
            >
              <p className="text-body-md select-none">{option[displayKey]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectInput;
