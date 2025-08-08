import MaterialIcon from "@/components/common/MaterialIcon";
import type { FC } from "react";

const LoadingPage: FC = () => (
  <div className="grid h-dvh place-items-center">
    <MaterialIcon icon="progress_activity" className="animate-spin !text-5xl" />
  </div>
);

export default LoadingPage;
