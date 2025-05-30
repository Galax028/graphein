import { motion } from "motion/react";

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
      className="flex flex-col gap-3"
    >
      {children}
    </motion.div>
  );
};

export default PageLoadTransition;
