import { InputLabelProps } from "@/utils/types/common";

/**
 * A stylized label text on top of childrens.
 *
 * @param label The label name to put on top of children.
 * @param children The contents within the wrapper.
 *
 * @returns A stylized DOM element.
 */

const InputLabel = ({ header, children, footer }: InputLabelProps) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-body-sm opacity-50">{header}</p>
      {children}
      <p className="text-body-sm opacity-50">{footer}</p>
    </div>
  );
};

export default InputLabel;
