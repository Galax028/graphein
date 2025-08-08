import cn from "@/utils/helpers/cn";
import { motion } from "motion/react";
import type { FC, ReactNode } from "react";

type PageLoadTransitionProps = {
  className?: string;
  children: ReactNode;
};

/**
 * A simple wrapper component that applies a fade-in and slide-up animation to
 * its children on page load.
 *
 * @param props.className  Additional classes to apply to the wrapper.
 * @param props.children   The content to be rendered inside the animated
 *                         container.
 */
const PageLoadTransition: FC<PageLoadTransitionProps> = ({
  className,
  children,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 48 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{
      y: { type: "spring", bounce: 0 },
    }}
    className={cn(`mx-auto flex w-full max-w-lg flex-col gap-3 p-3`, className)}
  >
    {children}
  </motion.div>
);

export default PageLoadTransition;
