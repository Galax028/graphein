export type OrderCardProps = {
  id: string;
  status:
    | "review"
    | "printing"
    | "pickup"
    | "complete"
    | "reject"
    | "cancel"
    | "unknown";
  orderNumber: string;
  filesCount: number;
  createdAt: string;
};
