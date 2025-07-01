import type { FC, ReactNode } from "react";

type InputLabelProps = {
  header: string;
  footer?: string;
  children: ReactNode;
};

/**
 * A stylized label text on top of children.
 *
 * @param children  The contents within the wrapper.
 *
 * @returns A stylized DOM element.
 */
const LabelGroup: FC<InputLabelProps> = ({ header, footer, children }) => (
  <div className="flex flex-col gap-1">
    <p className="text-body-sm opacity-50">{header}</p>
    {children}
    {footer && <p className="text-body-sm opacity-50">{footer}</p>}
  </div>
);

export default LabelGroup;
