import MaterialIcon from "@/components/common/MaterialIcon";
import type { Dispatch, FC, SetStateAction } from "react";

type CheckboxProps = {
  checked?: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
  appearance?: "checked" | "indeterminate";
};

/**
 * A custom checkbox component that supports checked and indeterminate states.
 *
 * It is fully accessible via keyboard and provides visual feedback for its
 * state. It relies on a parent component to manage its state via the `setValue`
 * prop.
 *
 * @param props.checked     The controlled checked state of the checkbox.
 * Defaults to false.
 * @param props.setValue    The state setter function to call when the checkbox
 *                          value changes.
 * @param props.appearance  The visual appearance when checked. Can be 'checked'
 * or 'indeterminate'. Defaults to 'checked'.
 */
const Checkbox: FC<CheckboxProps> = ({
  checked = false,
  setValue,
  appearance = "checked",
}) => {
  return (
    <div
      className="inline-flex h-6 w-6 cursor-pointer"
      tabIndex={0}
      role="checkbox"
      aria-checked={checked}
      onClick={() => setValue(!checked)}
      onKeyDown={(event) =>
        (event.key === "Enter" || event.key === " ") && setValue(!checked)
      }
    >
      <input type="checkbox" checked={checked} readOnly className="hidden" />
      {checked ? (
        appearance === "checked" ? (
          <MaterialIcon icon="check_box" filled={true} />
        ) : (
          <MaterialIcon icon="indeterminate_check_box" filled={true} />
        )
      ) : (
        <MaterialIcon icon="check_box_outline_blank" />
      )}
    </div>
  );
};

export default Checkbox;
