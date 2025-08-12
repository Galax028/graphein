import type { User } from "@/utils/types/backend";
import { createContext, useContext, type Context } from "react";

export const UserContext: Context<User | null> = createContext<User | null>(
  null,
);

/**
 * A hook to access the UserContext directly, bypassing the non-null assertion.
 *
 * **Warning:** This hook should be used with extreme caution, as it can return
 * `null` if the user context has not been initialized or if the user is not
 * authenticated. It is intended for specific use cases where the possibility of
 * a null user is explicitly handled.
 *
 * @returns  The user object from the context, or `null` if it is not available.
 */
export const useUserContextDangerously = (): User | null =>
  useContext(UserContext);

/**
 * A custom hook to access the UserContext. This hook ensures that the context
 * is not accessed when it's uninitialised.
 *
 * @returns  The user object from the context.
 * @throws   Throws an error if the hook is used outside of a
 *           UserContext.Provider.
 */
const useUserContext = (): User => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error(
      "`useUserContext` called when `UserContext` is uninitialised",
    );

  return context;
};

export default useUserContext;
