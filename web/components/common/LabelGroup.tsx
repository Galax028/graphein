import type { FC, ReactNode } from "react";

type LabelGroupProps = {
  header: string;
  footer?: string;
  // key?: number;
  children: ReactNode;
};

/**
 * A stylized label text on top of children.
 *
 * @param children  The contents within the wrapper.
 *
 * @returns A stylized DOM element.
 */
const LabelGroup: FC<LabelGroupProps> = ({ header, footer, children }) => (
  <div className="flex flex-col gap-1">
    <p className="text-body-sm opacity-50">{header}</p>
    {children}
    {footer && <p className="text-body-sm opacity-50">{footer}</p>}
  </div>
);

export default LabelGroup;
