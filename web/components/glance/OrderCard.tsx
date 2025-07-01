import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import getDateTimeString from "@/utils/helpers/common/getDateTimeString";
import type { OrderStatus } from "@/utils/types/common";
import { motion } from "motion/react";
import type { FC } from "react";

type OrderCardProps = {
  status: "building" | OrderStatus;
  orderNumber: string;
  filesCount: number;
  createdAt: string;
  options?: {
    showStatusText?: boolean;
    showProgressBar?: boolean;
    showNavigationIcon?: boolean;
  };
};

/**
 * The order information card, with status via progress bar view option
 *
 * @param status        The status. [OrderStatusProps]
 * @param orderNumber   Order number. (Integer)
 * @param filesCount    Files count. (Integer)
 * @param createdAt     Created at timestamp. (UTC)
 * @param options       A boolean value to show or hide views. {option: boolean}
 *                      [showStatusText | showProgressBar | showNavigationIcon]
 */
const OrderCard: FC<OrderCardProps> = ({
  status = "building",
  orderNumber,
  filesCount,
  createdAt,
  options,
}) => {
  const statusTranslation: Record<"building" | OrderStatus, string> = {
    building: "Building Order",
    reviewing: "Reviewing",
    processing: "Printing",
    ready: "Ready for Pickup",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
  } as const;

  const progressBarMap: Record<
    "building" | OrderStatus,
    { width: string; color: string }
  > = {
    building: { width: "", color: "" },
    reviewing: { width: "28.96px", color: "bg-warning" },
    processing: { width: "37.5%", color: "bg-warning" },
    ready: { width: "62.5%", color: "bg-success" },
    completed: { width: "100%", color: "bg-success" },
    rejected: { width: "28.96px", color: "bg-error" },
    cancelled: { width: "28.96px", color: "bg-error" },
  } as const;

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
                  "text-error opacity-100",
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
                progressBarMap[status].color,
              )}
            />
            <div
              className={cn(
                "h-full w-0.5 rounded-r-full",
                progressBarMap[status].color,
              )}
            />
          </div>
          <div
            className={cn(
              `flex w-full [&>p]:w-full [&>p]:text-body-sm [&>p]:opacity-50
            [&>p]:text-center`,
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
