import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import getFormattedDateTime from "@/utils/helpers/getFormattedDateTime";
import type { OrderStatus } from "@/utils/types/common";
import { motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import type { FC, MouseEventHandler } from "react";

type OrderCardProps = {
  status: "building" | OrderStatus;
  selected?: boolean;
  orderNumber: string;
  filesCount: number;
  createdAt: string;
  options?: {
    showStatusText?: boolean;
    showProgressBar?: boolean;
    showNavigationIcon?: boolean;
  };
  onClick?: MouseEventHandler<HTMLDivElement>;
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
  selected = false,
  orderNumber,
  filesCount,
  createdAt,
  options: {
    showStatusText = true,
    showProgressBar = false,
    showNavigationIcon = false,
  } = {},
  onClick,
}) => {
  const locale = useLocale();
  const t = useTranslations("common");

  const progressBarMap: Record<
    "building" | OrderStatus,
    { width: string; color: string }
  > = {
    building: { width: "", color: "" },
    reviewing: {
      // A check for language is necessary to align the progress indicator
      // with the middle of the localized text.
      width: locale === "en" ? "28.96px" : "27.47px",
      color: "bg-warning",
    },
    processing: { width: "37.5%", color: "bg-warning" },
    ready: { width: "62.5%", color: "bg-success" },
    completed: { width: "100%", color: "bg-success" },
    rejected: { width: "28.96px", color: "bg-error" },
    cancelled: { width: "28.96px", color: "bg-error" },
  } as const;

  return (
    <div
      className={cn(
        "rounded-lg transition-colors",
        !showProgressBar &&
          (selected
            ? `cursor-pointer hover:brightness-80`
            : `cursor-pointer hover:bg-background`),
        selected
          ? "bg-primary text-onPrimary"
          : "border border-outline bg-surface-container",
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 p-3 pl-4">
        <div className="flex-grow">
          {showStatusText && (
            <p
              className={cn(
                "text-body-sm opacity-50",
                (status === "reviewing" || status === "processing") &&
                  "text-warning opacity-100",
                (status === "ready" || status === "completed") &&
                  "text-success opacity-100",
                (status === "rejected" || status === "cancelled") &&
                  "text-error opacity-100",
              )}
            >
              {t(`orderCard.status.${status}`)}
            </p>
          )}
          <p>{t("orderCard.title", { orderNumber: orderNumber ?? "" })}</p>
          <p className="text-body-sm opacity-50">
            {getFormattedDateTime(locale, new Date(createdAt))} • {filesCount}{" "}
            File
            {filesCount != 1 && filesCount != -1 && "s"}
          </p>
        </div>
        {showNavigationIcon && <MaterialIcon icon="chevron_forward" />}
      </div>
      {showProgressBar && (
        <div className="flex flex-col gap-1 border-t border-outline p-3">
          <div className="flex h-1 overflow-hidden rounded-full bg-outline">
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
              `
                flex w-full
                [&>p]:w-full [&>p]:text-center [&>p]:text-body-sm
                [&>p]:opacity-50
              `,
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
