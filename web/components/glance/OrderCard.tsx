import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import getDateTimeString from "@/utils/helpers/common/getDateTimeString";
import type { OrderStatus } from "@/utils/types/common";
import { motion } from "motion/react";
import type { FC } from "react";
import { useTranslations } from "next-intl";

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
  locale?: string;
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
 * @param locale        Locale is used to determine the progress bar's width in 
 *                      the 'reviewing' stage. If component is showing the 
 *                      progress bar and 'reviewing' order stage is possible, 
 *                      do include locale. (Optional, default: 'en')
 */
const OrderCard: FC<OrderCardProps> = ({
  status = "building",
  orderNumber,
  filesCount,
  createdAt,
  options,
  locale = "en",
}) => {
  const t = useTranslations("common");

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
    reviewing: {
      // A check for language is nescessary to align the progress indicator
      // with the middle of the localized text.
      width: locale == "en" ? "28.96px" : "27.47px",
      color: "bg-warning",
    },
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
              {t(`orderCard.status.${status}`)}
            </p>
          )}
          <p>{t("orderCard.title", { orderNumber: orderNumber ?? "" })}</p>
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
            <p className="!text-left">{t("orderCard.status.reviewing")}</p>
            <p>{t("orderCard.status.processing")}</p>
            <p>{t("orderCard.status.ready")}</p>
            <p className="!text-right">{t("orderCard.status.completed")}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
