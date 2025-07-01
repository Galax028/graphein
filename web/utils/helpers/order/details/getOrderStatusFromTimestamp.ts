const getOrderStatusFromTimestamp = (data: any, status: string) => {
  return (
    data.data?.statusHistory?.find((entry: any) => entry.status === status)
      ?.timestamp ?? null
  );
};

export default getOrderStatusFromTimestamp;
