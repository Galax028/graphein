import type { ToggleDispatch } from "@/hooks/useToggle";
import { cn } from "@/utils";
import { motion } from "motion/react";
import type { FC, ReactNode } from "react";

type DialogProps = {
  className?: string;
  title: string;
  desc?: string;
  setClickOutside?: ToggleDispatch;
  children?: ReactNode;
};

/**
 * A modal dialog component with an overlay and support for actions.
 *
 * It renders a title, a description, and a container for child elements,
 * typically buttons. The dialog can be configured to close when the user
 * clicks on the backdrop overlay. It features animations for appearing and
 * disappearing.
 *
 * @param props.className        Additional classes to apply to the backdrop.
 * @param props.title            The title to display at the top of the dialog.
 * @param props.desc             An optional description to display below the
 *                               title.
 * @param props.children         React elements, typically action buttons, to
 *                               render at the bottom of the dialog.
 * @param props.setClickOutside  A state setter function that is called with
 *                               `false` when the backdrop is clicked.
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
      `
        fixed top-0 left-0 z-50 grid h-dvh w-dvw place-items-center p-3
        backdrop-brightness-50 backdrop-filter
        dark:backdrop-brightness-25
      `,
      className,
    )}
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
      className={cn(`
        flex w-full max-w-96 flex-col gap-4 rounded-lg border border-outline
        bg-surface-container p-4
      `)}
    >
      <div className={cn(`flex flex-col gap-1`)}>
        <p className="text-title-sm">{title}</p>
        <p className="min-h-12 text-body-md">{desc}</p>
      </div>
      <div className="flex w-full gap-1 [&>button]:w-full">{children}</div>
    </motion.div>
  </motion.div>
);

export default Dialog;
