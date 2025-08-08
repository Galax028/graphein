import cn from "@/utils/helpers/cn";
import { motion } from "motion/react";
import type { FC, ReactNode } from "react";

type PageLoadTransitionProps = {
  className?: string;
  children: ReactNode;
};

/**
 * The enter animation for the content inside to fade in + slide up.
 *
 * @param className   Style extension to the base style.
 * @param children    The content inside the <div> container.
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
    className={cn(`flex flex-col gap-3 p-3 w-full max-w-lg mx-auto`, className)}
  >
    {children}
  </motion.div>
);

export default PageLoadTransition;
