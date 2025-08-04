import cn from "@/utils/helpers/cn";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";

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

  const handleOptionClick = (value: number) => {
    setOpen(false);
    setValue(value);
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
            <p className="text-body-md select-none">{options[value]}</p>
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
          {options.map((i, idx) => (
            <div
              key={idx}
              className={cn(
                `p-2 bg-surface-container hover:bg-background rounded-sm 
                  cursor-pointer transition-color `,
              )}
              role="option"
              aria-selected={value === idx}
              tabIndex={0}
              onClick={() => handleOptionClick(idx)}
              onKeyDown={(event) =>
                (event.key === "Enter" || event.key === " ") &&
                handleOptionClick(idx)
              }
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
