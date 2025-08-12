import { cn } from "@/utils";
import type { FC, ReactNode } from "react";

type LabelGroupProps = {
  className?: string;
  header?: string;
  footer?: string;
  children: ReactNode;
};

/**
 * A simple wrapper component that groups content with an optional header and
 * footer label.
 *
 * This component is useful for associating a label with form inputs or other
 * elements, providing context through a header or footer text.
 *
 * @param props.className  Additional classes to apply to the main wrapper.
 * @param props.header     An optional text label to display above the children.
 * @param props.footer     An optional text label to display below the children.
 * @param props.children   The main content to be rendered inside the wrapper.
 */
const LabelGroup: FC<LabelGroupProps> = ({
  className,
  header,
  footer,
  children,
}) => (
  <div className={cn("flex flex-col gap-1", className)}>
    {header && <p className="text-body-sm opacity-50 select-none">{header}</p>}
    {children}
    {footer && <p className="text-body-sm opacity-50 select-none">{footer}</p>}
  </div>
);

export default LabelGroup;
