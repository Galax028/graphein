import type {
  APIResponse,
  CompactOrder,
  PaginatedAPIResponse,
} from "@/utils/types/backend";
import { type QueryClient, useInfiniteQuery } from "@tanstack/react-query";

export const prefetchOrderHistory = async (
  queryClient: QueryClient,
  sessionToken: string,
): Promise<void> =>
  await queryClient.prefetchInfiniteQuery({
    queryKey: ["orderHistory"],
    queryFn: ({ pageParam }) =>
      fetchOrderHistory(pageParam, { headers: { Cookie: sessionToken } }),
    initialPageParam: "<initial>",
  });

export const fetchOrderHistory = async (
  pageParam: string,
  options: Omit<RequestInit, "method">,
): Promise<
  { orders: CompactOrder[] } & Pick<
    PaginatedAPIResponse<CompactOrder[]>,
    "pagination"
  >
> => {
  const page = pageParam === "<initial>" ? "" : `&page=${pageParam}`;
  const response = await fetch(
    process.env.NEXT_PUBLIC_API_PATH + `/orders/history?size=${5}${page}`,
    options,
  );

  const body = (await response.json()) as APIResponse<CompactOrder[]>;
  if (body.success) {
    return { orders: body.data, pagination: body.pagination };
  } else throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
};

export const useOrderHistoryInfiniteQuery = () =>
  useInfiniteQuery({
    queryKey: ["orderHistory"],
    queryFn: ({ pageParam }) =>
      fetchOrderHistory(pageParam, { credentials: "include" }),
    initialPageParam: "<initial>",
    getNextPageParam: (previousPage) => previousPage.pagination.page,
  });
