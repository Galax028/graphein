import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/code/cn";
import getDateTimeString from "@/utils/helpers/common/getDateTimeString";
import { motion } from "motion/react";

type OrderStatusProps =
  | "building"
  | "reviewing"
  | "processing"
  | "ready"
  | "completed"
  | "rejected"
  | "cancelled"
  | "unknown";

type OrderCardProps = {
  status: OrderStatusProps;
  orderNumber: string;
  filesCount: number;
  createdAt: string;
  options?: Partial<{
    showStatusText?: boolean;
    showProgressBar?: boolean;
    showNavigationIcon?: boolean;
  }>;
};

const OrderCard = ({
  status = "unknown",
  orderNumber,
  filesCount,
  createdAt,
  options,
}: OrderCardProps) => {
  const statusTranslation = {
    building: "Building Order",
    reviewing: "Reviewing",
    processing: "Printing",
    ready: "Ready for Pickup",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
    unknown: "Unknown Status",
  };

  const progressBarMap: Record<
    OrderCardProps["status"],
    { width: string; color: string }
  > = {
    building: { width: "", color: "" },
    reviewing: { width: "28.96px", color: "bg-warning" },
    processing: { width: "37.5%", color: "bg-warning" },
    ready: { width: "62.5%", color: "bg-success" },
    completed: { width: "100%", color: "bg-success" },
    rejected: { width: "28.96px", color: "bg-error" },
    cancelled: { width: "28.96px", color: "bg-error" },
    unknown: { width: "", color: "" },
  };

  return (
    <div className="bg-surface-container border border-outline rounded-lg">
      <div className="flex items-center gap-4 p-3 pl-4">
        <div className="flex-grow">
          {(options?.showStatusText ?? true) && (
            <p
              className={cn(
                "text-body-sm opacity-50",
                ["review", "processing"].includes(status) &&
                  "text-warning opacity-100",
                ["ready", "completed"].includes(status) &&
                  "text-success opacity-100",
                ["rejected", "cancelled"].includes(status) &&
                  "text-error opacity-100"
              )}
            >
              {statusTranslation[status]}
            </p>
          )}
          <p>Order #{orderNumber}</p>
          <p className="text-body-sm opacity-50">
            {getDateTimeString(new Date(createdAt))} • {filesCount} File
            {filesCount != 1 && filesCount != -1 && "s"}
          </p>
        </div>
        {(options?.showNavigationIcon ?? false) && (
          <MaterialIcon icon={"chevron_forward"} />
        )}
      </div>
      {(options?.showProgressBar ?? false) && (
        <div className="flex flex-col gap-1 border-t border-outline p-3">
          <div className="flex h-1 bg-outline rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: progressBarMap[status].width }}
              style={{ width: progressBarMap[status].width }}
              className={cn(
                "h-full rounded-l-full",
                progressBarMap[status].color
              )}
            />
            <div
              className={cn(
                "h-full w-0.5 rounded-r-full",
                progressBarMap[status].color
              )}
            />
          </div>
          <div
            className={cn(
              `flex w-full [&>p]:w-full [&>p]:text-body-sm [&>p]:opacity-50
            [&>p]:text-center`
            )}
          >
            <p className="!text-left">Reviewing</p>
            <p>Printing</p>
            <p>Pickup</p>
            <p className="!text-right">Completed</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
