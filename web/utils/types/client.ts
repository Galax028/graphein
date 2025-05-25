export type OrderCardProps = {
  id: string;
  status:
    | "review"
    | "processing"
    | "ready"
    | "completed"
    | "rejected"
    | "cancelled"
    | "unknown";
  orderNumber: string;
  filesCount: number;
  createdAt: string;
};
