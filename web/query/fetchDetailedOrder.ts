import type { APIResponse, DetailedOrder } from "@/utils/types/backend";
import type { Uuid } from "@/utils/types/common";
import { type QueryClient, useQuery } from "@tanstack/react-query";

export const prefetchDetailedOrder = async (
  queryClient: QueryClient,
  orderId: Uuid,
  sessionToken: string,
): Promise<void> => {
  await queryClient.prefetchQuery({
    queryKey: ["detailedOrder", orderId],
    queryFn: () =>
      fetchDetailedOrder(orderId, { headers: { Cookie: sessionToken } }),
  });
};

export const fetchDetailedOrder = async (
  orderId: Uuid,
  options: Omit<RequestInit, "method">,
): Promise<DetailedOrder> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_API_PATH + `/orders/${orderId}`,
    options,
  );

  const body = (await response.json()) as APIResponse<DetailedOrder>;
  if (body.success) {
    return body.data;
  } else throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
};

export const useDetailedOrderQuery = (
  orderId: Uuid,
  enabled: boolean = false,
) => {
  return useQuery({
    queryKey: ["detailedOrder", orderId],
    queryFn: () => fetchDetailedOrder(orderId, { credentials: "include" }),
    enabled,
  });
};
