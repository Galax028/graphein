import cn from "@/utils/helpers/code/cn";
import React, { Dispatch, SetStateAction } from "react";
import { motion } from "motion/react";

/**
 * A dialog with actions that accepts DOM elements at the bottom.
 *
 * @param title           The title to put on the dialog (string)
 * @param desc            The description to put on the dialog (string)
 * @param children        The title to put on the dialog (string)
 * @param onClickOutside  The useState function name to trigger when 
 *                        clicked outside. (Always set to false)
 */

type DialogProps = {
  title: string;
  desc?: string;
  onClickOutside?: Dispatch<SetStateAction<boolean>>;
  children?: React.ReactNode;
  className?: string;
};

const Dialog = ({
  title,
  desc,
  onClickOutside,
  className,
  children,
}: DialogProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 0.1 }}
      className={cn(
        `fixed top-0 left-0 grid place-items-center w-dvw h-dvh p-3 z-50
          backdrop-filter backdrop-brightness-50 dark:backdrop-brightness-25`,
        className
      )}
      // If there's onIgnore value, set value to false.
      onClick={() => {
        onClickOutside && onClickOutside(false);
      }}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        transition={{
          duration: 0.1,
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

export default Dialog;
