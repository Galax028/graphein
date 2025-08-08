import type { User } from "@/utils/types/backend";
import { createContext, useContext, type Context } from "react";

/**
 * React Context for storing and providing user data throughout the application.
 */
export const UserContext: Context<User | null> = createContext<User | null>(
  null,
);

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
