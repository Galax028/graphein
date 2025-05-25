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
    building: "Building Order",
    review: "Reviewing",
    processing: "Printing",
    ready: "Ready for Pickup",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
    unknown: "Unknown Status",
  };

  const date = new Date(createdAt);
  const formattedDate = `${
    date.getDay()
  } ${
    [
      "January",
      "Febuary",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][date.getMonth()]
  } ${date.getFullYear()}`;

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
              ["review", "processing"].includes(status) && "text-actionWarning",
              ["ready", "completed"].includes(status) && "text-actionSuccess",
              ["rejected", "cancelled"].includes(status) && "text-actionError",
              status == "unknown" && "opacity-50"
            )}
          >
            {statusTranslation[status]}
          </p>
          <p>Order #{orderNumber}</p>
          <p className="text-bodySmall opacity-50">
            {formattedDate} • {filesCount} File
            {filesCount != 1 && filesCount != -1 && "s"}
          </p>
        </div>
        <MaterialIcon icon={"chevron_forward"} />
      </div>
    </Link>
  );
};

export default OrderCard;
