import { motion } from "motion/react";
import cn from "@/utils/helpers/code/cn";

type PageLoadTransitionProps = {
  className?: string;
  children: React.ReactNode;
};

const PageLoadTransition = ({
  className,
  children,
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
