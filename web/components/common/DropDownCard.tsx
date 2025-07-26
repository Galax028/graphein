import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import { AnimatePresence, motion } from "motion/react";
import { type FC, ReactNode, useState } from "react";

type DropDownCardProps = {
  header: string;
  footer?: string[];
  collapsed?: boolean;
  isCollapsible?: boolean;
  children: ReactNode;
};

/**
 * The dropdown content box that contains information.
 *
 * @param header        The title string displayed on the title bar.
 * @param footer        Array of string to be mapped on the footer bar.
 * @param collapsed     The default collapsed state of the box. (Default true)
 * @param isCollapsible Should the box be isCollapsible or not? (Default true)
 * @param children      The content inside the main box.
 */
const DropDownCard: FC<DropDownCardProps> = ({
  header,
  footer,
  collapsed = true,
  isCollapsible = true,
  children,
}) => {
  const [open, setOpen] = useState(!collapsed);

  return (
    <div className="border border-outline rounded-lg bg-surface-container">
      <div
        className={cn(`flex justify-between items-center gap-2 p-2 pl-3 
          cursor-pointer select-none`)}
        onClick={() => isCollapsible && setOpen((open) => !open)}
      >
        <p className="text-body-md">{header}</p>
        {isCollapsible && (
          <MaterialIcon
            icon={"arrow_drop_up"}
            className={cn(
              "transition-all duration-250",
              open ? "rotate-180" : "",
            )}
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
              <div className="p-3 border-t border-outline">{children}</div>
              {footer && (
                <div
                  className={cn(`flex justify-between gap-2 p-2 pl-3 border-t 
            border-outline`)}
                >
                  {footer.map((item, idx) => (
                    <span key={idx} className="opacity-50 text-body-sm">
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
