import cn from "@/utils/helpers/cn";
import type { FC, ReactNode } from "react";

type LabelGroupProps = {
  className?: string;
  header?: string;
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
const LabelGroup: FC<LabelGroupProps> = ({
  className,
  header,
  footer,
  children,
}) => (
  <div className={cn("flex flex-col gap-1", className)}>
    {header && <p className="text-body-sm opacity-50">{header}</p>}
    {children}
    {footer && <p className="text-body-sm opacity-50">{footer}</p>}
  </div>
);

export default LabelGroup;
