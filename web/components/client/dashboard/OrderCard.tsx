import cn from "@/utils/helpers/cn";
import { OrderCardProps } from "@/utils/types/client";

const OrderCard = ({
  status = "unknown",
  orderCode,
  filesCount,
  date,
}: OrderCardProps) => {
  const statusTranslation = {
    review: "Reviewing",
    printing: "Printing",
    pickup: "Ready for Pickup",
    complete: "Completed",
    reject: "Rejected",
    cancel: "Cancelled",
    unknown: "Unknown Status",
  };

  return (
    <div
      className={cn(`bg-surfaceContainer border border-outline rounded-lg 
      p-3 pl-4`)}
    >
      <div>
        <p
          className={cn(
            "text-bodySmall",
            ["review", "printing"].includes(status) && "text-actionWarning",
            ["pickup", "complete"].includes(status) && "text-actionSuccess",
            ["reject", "cancel"].includes(status) && "text-actionError",
            status == "unknown" && "opacity-50"
          )}
        >
          {statusTranslation[status]}
        </p>
        <p>Order #{orderCode}</p>
        <p className="text-bodySmall opacity-50">
          {date} • {filesCount} File{filesCount != 1 && filesCount != -1 && "s"}
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
