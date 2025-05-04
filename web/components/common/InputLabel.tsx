import { InputLabelProps } from "@/utils/types/common";

/**
 * A stylized label text on top of childrens.
 * 
 * @param label The label name to put on top of children.
 * @param children The contents within the wrapper. 
 * 
 * @returns A stylized DOM element.
 */

const InputLabel = ({ label, children }: InputLabelProps) => {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs opacity-50">{label}</p>
      {children}
    </div>
  );
};

export default InputLabel;
