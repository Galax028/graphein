export function getOrderStatusFromTimestamp(data: any, status: string) {
  return (
    data.data?.statusHistory?.find(
      (entry: any) => entry.status === status
    )?.timestamp ?? null
  );
};