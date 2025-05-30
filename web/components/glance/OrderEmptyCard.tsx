import cn from "@/utils/helpers/cn";

type OrderEmptyCardProps = {
  text: string;
};

const OrderEmptyCard = ({ text }: OrderEmptyCardProps) => {
  return (
    <div
      className={cn(`p-3 px-4 bg-surface-container border border-outline 
      rounded-lg`)}
    >
      <p className="text-body-sm opacity-50">{text}</p>
    </div>
  );
};

export default OrderEmptyCard;
