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
 * A generic, custom-styled select input (dropdown) component.
 *
 * It is designed to be highly flexible, working with an array of objects and
 * allowing specification of which object keys to use for display and for unique
 * identification.
 *
 * @param props.className   Additional classes to apply to the wrapper.
 * @param props.value       The currently selected option object.
 * @param props.onChange    A callback that fires when a new option is selected.
 * @param props.displayKey  The key of the option object to display as text.
 * @param props.matchKey    The key of the option object to use for unique
 *                          matching.
 * @param props.options     The array of available option objects.
 * @param props.appearance  The visual style of the input, either "individual"
 *                          or "inset". Defaults to "individual".
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
              "flex w-full items-center !rounded-none bg-background",
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
            />
          </div>
        </SegmentedGroup>
      </div>

      {open && (
        <div
          className={cn(
            `
              absolute z-50 flex max-h-51 flex-col overflow-auto rounded-b-lg
              border border-outline bg-surface-container p-1 shadow-xl
            `,
            appearance === "inset"
              ? "top-10 -left-0.25 w-[calc(100%+0.125rem)]"
              : "top-[calc(2.5rem+1px)] w-full",
          )}
        >
          {options.map((option) => (
            <div
              className={cn(
                `
                  cursor-pointer rounded-sm bg-surface-container p-2
                  transition-colors
                  hover:bg-background
                `,
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
