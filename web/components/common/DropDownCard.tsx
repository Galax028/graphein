import cn from "@/utils/helpers/cn";
import MaterialIcon from "./MaterialIcon";
import { useState } from "react";

type DropDownCardProps = {
  header: string;
  footer?: string[];
  collapsible?: boolean;
  children: React.ReactNode;
};

/**
 * The dropdown content box that contains information.
 *
 * @param header The title string displayed on the title bar.
 * @param footer Array of string to be mapped on the footer bar.
 * @param collapsible Should the box be collapsible or not? (Default true)
 * @param children The content inside the main box.
 *
 * @returns The stylized element with functinoalities.
 */

const DropDownCard = ({
  header,
  footer,
  collapsible = true,
  children,
}: DropDownCardProps) => {
  const [open, setOpen] = useState<boolean>(true);

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
          <MaterialIcon icon={open ? "arrow_drop_down" : "arrow_drop_up"} />
        )}
      </div>
      {open && (
        <>
          <div className="p-3 border-t border-outline">{children}</div>
          {footer && (
            <div
              className={cn(`flex justify-between gap-2 p-2 pl-3 border-t 
            border-outline`)}
            >
              {footer.map((i) => (
                <span key={i} className="opacity-50 text-body-sm">{i}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DropDownCard;
