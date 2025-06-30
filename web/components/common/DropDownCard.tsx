import cn from "@/utils/helpers/code/cn";
import MaterialIcon from "./MaterialIcon";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

type DropDownCardProps = {
  header: string;
  footer?: string[];
  collapsed?: boolean;
  collapsible?: boolean;
  children: React.ReactNode;
};

/**
 * The dropdown content box that contains information.
 *
 * @param header      The title string displayed on the title bar.
 * @param footer      rray of string to be mapped on the footer bar.
 * @param collapsed   The default collapsed state of the box. (Default true)
 * @param collapsible Should the box be collapsible or not? (Default true)
 * @param children    The content inside the main box.
 */

const DropDownCard = ({
  header,
  footer,
  collapsed = true,
  collapsible = true,
  children,
}: DropDownCardProps) => {
  const [open, setOpen] = useState<boolean>(!collapsed);

  return (
    <div className="border border-outline rounded-lg bg-surface-container">
      <div
        className={cn(`flex justify-between items-center gap-2 p-2 pl-3 
          cursor-pointer select-none`)}
        onClick={() => {
          if (collapsible == true) return setOpen(!open);
        }}
      >
        <p className="text-body-md">{header}</p>
        {collapsible && (
          <MaterialIcon
            icon={"arrow_drop_up"}
            className={cn(
              "transition-all duration-250",
              open ? "rotate-180" : ""
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
                  {footer.map((i) => (
                    <span key={i} className="opacity-50 text-body-sm">
                      {i}
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
