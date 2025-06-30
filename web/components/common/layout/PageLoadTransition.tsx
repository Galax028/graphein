import { motion } from "motion/react";
import cn from "@/utils/helpers/cn";

type PageLoadTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * The enter animation for the content inside to fade in + slide up.
 *
 * @param children    The content inside the <div> container.
 * @param className   Style extension to the base style.
 */

const PageLoadTransition = ({
  children,
  className,
}: PageLoadTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        y: { type: "spring", bounce: 0 },
      }}
      className={cn(`flex flex-col gap-3 max-w-lg m-auto`, className)}
    >
      {children}
    </motion.div>
  );
};

export default PageLoadTransition;
