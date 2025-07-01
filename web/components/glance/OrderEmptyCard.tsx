import cn from "@/utils/helpers/cn";
import type { FC } from "react";

type OrderEmptyCardProps = {
  text: string;
};

/**
 * Order empty indicator container, with text defined in the component.
 *
 * @param text    The text content inside.
 */
const OrderEmptyCard: FC<OrderEmptyCardProps> = ({ text }) => (
  <div
    className={cn(`p-3 px-4 bg-surface-container border border-outline 
      rounded-lg`)}
  >
    <p className="text-body-sm opacity-50">{text}</p>
  </div>
);

export default OrderEmptyCard;
