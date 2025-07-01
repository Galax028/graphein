import type { APIResponse, User } from "@/utils/types/backend";
import { type QueryClient, useQuery } from "@tanstack/react-query";

export const prefetchUser = async (
  queryClient: QueryClient,
  sessionToken: string,
): Promise<boolean> => {
  const user = await queryClient.fetchQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser({ headers: { Cookie: sessionToken } }),
  });

  return user !== null;
};

export const fetchUser = async (
  options: Omit<RequestInit, "method">,
): Promise<User | null> => {
  const response = await fetch(
    process.env.NEXT_PUBLIC_API_PATH + "/user",
    options,
  );

  const body = (await response.json()) as APIResponse<User>;
  if (body.success) {
    return body.data;
  } else {
    const errorCode = body.message.match(/\[(\d+)\]/)?.at(1);
    switch (errorCode) {
      case "4010":
      case "4011":
      case "4012":
      case "4013":
      case "4014":
        return null;
      default:
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
    }
  }
};

export const useUserQuery = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => fetchUser({ credentials: "include" }),
  });
};
