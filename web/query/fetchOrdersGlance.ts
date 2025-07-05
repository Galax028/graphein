import type { APIResponse, OrdersGlance } from "@/utils/types/backend";
import { type QueryClient, useQuery } from "@tanstack/react-query";

export const prefetchOrdersGlance = async (
  queryClient: QueryClient,
  sessionToken: string,
): Promise<void> => {
  await queryClient.prefetchQuery({
    queryKey: ["ordersGlance"],
    queryFn: () => fetchOrdersGlance({ headers: { Cookie: sessionToken } }),
  });
};

export const fetchOrdersGlance = async (
  options: Omit<RequestInit, "method">,
): Promise<OrdersGlance> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_API_PATH + "/orders/glance",
    options,
  );

  const body = (await response.json()) as APIResponse<OrdersGlance>;
  if (body.success) {
    return body.data;
  } else throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
};

export const useOrdersGlanceQuery = () => {
  return useQuery({
    queryKey: ["ordersGlance"],
    queryFn: () => fetchOrdersGlance({ credentials: "include" }),
  });
};
