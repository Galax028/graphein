import type { User } from "@/utils/types/backend";
import { createContext, useContext } from "react";

export const UserContext = createContext<User | null>(null);
const useUserContext = (): User => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error(
      "`useUserContext` called when `UserContext` is uninitialised",
    );

  return context;
};

export default useUserContext;
