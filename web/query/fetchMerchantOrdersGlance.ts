import type { APIResponse, MerchantOrdersGlance } from "@/utils/types/backend";
import { type QueryClient, useQuery } from "@tanstack/react-query";

export const prefetchMerchantOrdersGlance = async (
  queryClient: QueryClient,
  sessionToken: string,
): Promise<void> =>
  await queryClient.prefetchQuery({
    queryKey: ["merchantOrdersGlance"],
    queryFn: () =>
      fetchMerchantOrdersGlance({ headers: { Cookie: sessionToken } }),
  });

export const fetchMerchantOrdersGlance = async (
  options: Omit<RequestInit, "method">,
): Promise<MerchantOrdersGlance> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_API_PATH + "/merchant/orders/glance",
    options,
  );

  const body = (await response.json()) as APIResponse<MerchantOrdersGlance>;
  if (body.success) {
    return body.data;
  } else throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
};

export const useMerchantOrdersGlanceQuery = () =>
  useQuery({
    queryKey: ["merchantOrdersGlance"],
    queryFn: () => fetchMerchantOrdersGlance({ credentials: "include" }),
    refetchInterval: 10 * 1000, // 10 Seconds
    refetchIntervalInBackground: true,
  });
