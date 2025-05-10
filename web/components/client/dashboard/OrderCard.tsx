import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import { OrderCardProps } from "@/utils/types/client";
import Link from "next/link";

const OrderCard = ({
  id,
  status = "unknown",
  orderNumber,
  filesCount,
  createdAt,
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
    <Link
      className={cn(`bg-surfaceContainer border border-outline rounded-lg 
      p-3 pl-4`)}
      href={`/client/order/detail/${id}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-grow">
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
          <p>Order #{orderNumber}</p>
          <p className="text-bodySmall opacity-50">
            {createdAt} • {filesCount} File
            {filesCount != 1 && filesCount != -1 && "s"}
          </p>
        </div>
        <MaterialIcon icon={"chevron_forward"} />
      </div>
    </Link>
  );
};

export default OrderCard;
