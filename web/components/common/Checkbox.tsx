import { Dispatch, FC, SetStateAction } from "react";
import MaterialIcon from "@/components/common/MaterialIcon";

type CheckboxProps = {
  checked?: boolean;
  setValue: Dispatch<SetStateAction<boolean>>;
  appearance?: "checked" | "indeterminate";
};

const Checkbox: FC<CheckboxProps> = ({
  checked = false,
  setValue,
  appearance = "checked",
}) => {
  return (
    <div
      className="cursor-pointer w-6 h-6 inline-flex"
      onClick={() => setValue(!checked)}
    >
      <input type="checkbox" checked={checked} className="hidden" />
      {checked ? (
        appearance == "checked" ? (
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
