import cn from "@/utils/helpers/cn";
import { useEffect, useRef } from "react";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import useToggle from "@/hooks/useToggle";
import MaterialIcon from "@/components/common/MaterialIcon";

type SelectInputProps<T extends object> = {
  value: T;
  onChange?: (value: T) => void;
  displayKey: keyof T;
  matchKey: keyof T;
  options: T[];
  className?: string;
  appearance?: "individual" | "inset";
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
  appearance = "individual",
  className,
}: SelectInputProps<T>) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, toggleOpen] = useToggle();

  // Closes the options window pop-up when element is clicked outside.
  useEffect(
    () => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          wrapperRef.current &&
          !wrapperRef.current.contains(event.target as Node)
        ) {
          toggleOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onOptionChange = (value: T) => {
    toggleOpen();
    if (onChange) onChange(value);
  };

  return (
    <div className={cn("relative !p-0", className)} ref={wrapperRef}>
      <div
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={(event) =>
          (event.key === "Enter" || event.key === " ") && toggleOpen()
        }
      >
        <SegmentedGroup
          className={cn(
            "cursor-pointer overflow-hidden",
            open && "rounded-b-none",
            appearance === "inset" && "rounded-none border-none",
          )}
        >
          <div
            className={cn(
              "flex items-center bg-background w-full !rounded-none",
            )}
          >
            <p className="text-body-md select-none">{value[displayKey]}</p>
          </div>
          <div className="!bg-surface-container" tabIndex={-1}>
            <MaterialIcon
              icon="arrow_drop_up"
              className={cn(
                "transition-transform duration-250",
                open && "rotate-180",
              )}
            />{" "}
          </div>
        </SegmentedGroup>
      </div>

      {open && (
        <div
          className={cn(
            `absolute flex flex-col p-1 max-h-51
              bg-surface-container border border-outline rounded-b-lg shadow-xl 
              overflow-auto z-50`,
            appearance === "inset"
              ? "top-10 -left-0.25 w-[calc(100%+0.125rem)]"
              : "w-full top-[calc(2.5rem+1px)]",
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
