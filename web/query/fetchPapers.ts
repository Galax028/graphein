import type { APIResponse, Paper } from "@/utils/types/backend";
import { type QueryClient, useQuery } from "@tanstack/react-query";

export const prefetchPapers = async (
  queryClient: QueryClient,
  sessionToken: string,
): Promise<void> =>
  await queryClient.prefetchQuery({
    queryKey: ["papers"],
    queryFn: () => fetchPapers({ headers: { Cookie: sessionToken } }),
  });

export const fetchPapers = async (
  options: Omit<RequestInit, "method">,
): Promise<Paper[]> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_API_PATH + "/opts/papers",
    options,
  );

  const body = (await response.json()) as APIResponse<Paper[]>;
  if (body.success) {
    return body.data;
  } else throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
};

export const usePapersQuery = () =>
  useQuery({
    queryKey: ["papers"],
    queryFn: () => fetchPapers({ credentials: "include" }),
  });
