import cn from "@/utils/helpers/cn";
import { motion } from "motion/react";
import type { Dispatch, FC, ReactNode, SetStateAction } from "react";

type DialogProps = {
  className?: string;
  title: string;
  desc?: string;
  setClickOutside?: Dispatch<SetStateAction<boolean>>;
  children?: ReactNode;
};

/**
 * A dialog with actions that accepts DOM elements at the bottom.
 *
 * @param title            The title to put on the dialog (string)
 * @param desc             The description to put on the dialog (string)
 * @param children         The title to put on the dialog (string)
 * @param setClickOutside  The useState function name to trigger when
 *                         clicked outside. (Always set to false)
 */
const Dialog: FC<DialogProps> = ({
  className,
  title,
  desc,
  setClickOutside,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, pointerEvents: "none" }}
    transition={{ duration: 0.1 }}
    className={cn(
      `fixed top-0 left-0 grid place-items-center w-dvw h-dvh p-3 z-50
          backdrop-filter backdrop-brightness-50 dark:backdrop-brightness-25`,
      className,
    )}
    // If there's onIgnore value, set value to false.
    onClick={() => setClickOutside && setClickOutside(false)}
  >
    <motion.div
      initial={{ scale: 1.05 }}
      animate={{ scale: 1 }}
      exit={{ scale: 1.05 }}
      transition={{
        duration: 0.1,
        scale: { type: "spring", bounce: 0 },
      }}
      onClick={(e) => e.stopPropagation()}
      className={cn(`flex flex-col gap-4 w-full max-w-96 p-4
            bg-surface-container border border-outline rounded-lg`)}
    >
      <div className={cn(`flex flex-col gap-1`)}>
        <p className="text-title-sm">{title}</p>
        <p className="min-h-12 text-body-md">{desc}</p>
      </div>
      <div className="flex gap-1 w-full [&>button]:w-full">{children}</div>
    </motion.div>
  </motion.div>
);

export default Dialog;
