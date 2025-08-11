import MaterialIcon from "@/components/common/MaterialIcon";
import { cn } from "@/utils";
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
 * A card component that displays a summary of an order's information.
 *
 * It can show various details like the order status, number, file count, and
 * creation date. It also has optional views for a status progress bar and a
 * navigation icon.
 *
 * @param props.status       The current status of the order. Defaults to
 *                           "building".
 * @param props.selected     If true, applies a selected style to the card.
 *                           Defaults to false.
 * @param props.orderNumber  The unique number identifying the order.
 * @param props.filesCount   The total number of files in the order.
 * @param props.createdAt    The ISO timestamp string for when the order was
 *                           created.
 * @param props.options      An object to configure optional UI elements.
 * @param props.onClick      An optional click handler for the card.
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
    { width: string; colour: string }
  > = {
    building: { width: "", colour: "" },
    reviewing: {
      // A check for language is necessary to align the progress indicator
      // with the middle of the localized text.
      width: locale === "en" ? "28.96px" : "27.47px",
      colour: "bg-warning",
    },
    processing: { width: "37.5%", colour: "bg-warning" },
    ready: { width: "62.5%", colour: "bg-success" },
    completed: { width: "100%", colour: "bg-success" },
    rejected: { width: "28.96px", colour: "bg-error" },
    cancelled: { width: "28.96px", colour: "bg-error" },
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
                "text-body-sm opacity-50 select-none",
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
          <p className="text-body-sm opacity-50 select-none">
            {getFormattedDateTime(locale, new Date(createdAt))} •{" "}
            {t("orderCard.filesCount", { count: filesCount })}
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
                progressBarMap[status].colour,
              )}
            />
            <div
              className={cn(
                "h-full w-0.5 rounded-r-full",
                progressBarMap[status].colour,
              )}
            />
          </div>
          <div
            className={cn(
              `
                flex w-full select-none
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
