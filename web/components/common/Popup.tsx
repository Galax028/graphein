import cn from "@/utils/helpers/cn";
import React, { Dispatch, SetStateAction } from "react";
import { motion } from "motion/react";

/**
 * A popup with actions that accepts DOM elements at the bottom.
 * 
 * @param title The title to put on the popup (string)
 * @param desc The description to put on the popup (string)
 * @param children The title to put on the popup (string)
 */

type PopupProps = {
  title: string;
  desc?: string;
  onClickOutside?: Dispatch<SetStateAction<boolean>>;
  children?: React.ReactNode;
};

const Popup = ({ title, desc, onClickOutside, children }: PopupProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className={cn(
        `fixed top-0 left-0 grid place-items-center w-dvw h-dvh p-3
          backdrop-filter backdrop-brightness-50 dark:backdrop-brightness-25`
      )}
      // If there's onIgnore value, set value to false.
      onClick={() => onClickOutside && onClickOutside(false)}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{
          duration: 0.05,
          scale: { type: "spring", bounce: 0 },
        }}
        onClick={(e) => e.stopPropagation()}
        className={cn(`flex flex-col gap-4 w-full max-w-96 p-4
            bg-surface-container border border-outline rounded-lg`)}
      >
        <div className={cn(`flex flex-col gap-1`)}>
          <p>{title}</p>
          <p className="min-h-12 opacity-50 text-body-sm">{desc}</p>
        </div>
        <div className="flex gap-1 w-full [&>button]:w-full">{children}</div>
      </motion.div>
    </motion.div>
  );
};

export default Popup;
