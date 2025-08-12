import type { APIResponse } from "@/utils/types/backend";
import type { Uuid } from "@/utils/types/common";
import { type QueryClient, useQuery } from "@tanstack/react-query";

export const prefetchThumbnail = async (
  queryClient: QueryClient,
  orderId: Uuid,
  fileId: Uuid,
  sessionToken: string,
): Promise<void> =>
  await queryClient.prefetchQuery({
    queryKey: ["thumbnail", orderId, fileId],
    queryFn: () =>
      fetchThumbnail(orderId, fileId, { headers: { Cookie: sessionToken } }),
  });

export const fetchThumbnail = async (
  orderId: Uuid,
  fileId: Uuid,
  options: Omit<RequestInit, "method">,
) => {
  const res = await fetch(
    process.env.NEXT_PUBLIC_API_PATH +
      `/orders/${orderId}/files/${fileId}/thumbnail`,
    options,
  );

  // If the image is still processing (202), set a wait for
  // half a second before trying again until returns ok (200).
  if (res.status === 202) {
    throw new Error("Thumbnail is still processing");
  }

  const body = (await res.json()) as APIResponse<string>;
  if (body.success) {
    return body.data;
  } else {
    const errorCode = body.message.match(/\[(\d+)\]/)?.at(1);
    switch (errorCode) {
      case "4042":
        return null;
      default:
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
    }
  }
};

export const useThumbnailQuery = (
  orderId: Uuid,
  fileId: Uuid,
  enabled: boolean = false,
) =>
  useQuery({
    queryKey: ["thumbnail", orderId, fileId],
    queryFn: () => fetchThumbnail(orderId, fileId, { credentials: "include" }),
    enabled,
    staleTime: 60 * 60 * 1000, // 1 Hour
  });
