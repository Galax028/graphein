export type OrderCardProps = {
  status:
    | "review"
    | "printing"
    | "pickup"
    | "complete"
    | "reject"
    | "cancel"
    | "unknown";
  orderCode: string;
  filesCount: number;
  date: string;
};
