import MaterialIcon from "@/components/common/MaterialIcon";
import useToggle from "@/hooks/useToggle";
import { cn } from "@/utils";
import { AnimatePresence, motion } from "motion/react";
import type { FC, ReactNode } from "react";

type DropDownCardProps = {
  className?: string;
  header: string;
  footer?: string[];
  collapsed?: boolean;
  isCollapsible?: boolean;
  children: ReactNode;
};

/**
 * A collapsible card component that displays a header and can reveal more
 * content and a footer when expanded.
 *
 * The card's initial state and collapsibility can be configured.
 *
 * @param props.className      Additional classes to apply to the content area.
 * @param props.header         The title string displayed on the card's header.
 * @param props.footer         An optional array of strings to display in the
 *                             footer.
 * @param props.collapsed      The default collapsed state of the card. Defaults
 *                             to true.
 * @param props.isCollapsible  Determines if the card can be expanded or
 *                             collapsed by the user. Defaults to true.
 * @param props.children       The content to display inside the card when
 *                             expanded.
 */
const DropDownCard: FC<DropDownCardProps> = ({
  className,
  header,
  footer,
  collapsed = true,
  isCollapsible = true,
  children,
}) => {
  const [open, toggleOpen] = useToggle(!collapsed);

  return (
    <div className="rounded-lg border border-outline bg-surface-container">
      <div
        className={cn(`
          flex cursor-pointer items-center justify-between gap-2 p-2 pl-3
          select-none
        `)}
        onClick={() => isCollapsible && toggleOpen()}
      >
        <p className="text-body-md">{header}</p>
        {isCollapsible && (
          <MaterialIcon
            icon="arrow_drop_up"
            className={cn("transition-all duration-250", open && "rotate-180")}
          />
        )}
      </div>
      <div className="overflow-hidden">
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className={cn("border-t border-outline p-3", className)}>
                {children}
              </div>
              {footer && (
                <div
                  className={`
                    flex justify-between gap-2 border-t border-outline p-2 pl-3
                  `}
                >
                  {footer.map((item) => (
                    <span key={item} className="text-body-sm opacity-50">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DropDownCard;
