import MaterialIcon from "@/components/common/MaterialIcon";
import { useUserQuery } from "@/query/fetchUser";
import "@/styles/globals.css";
import type { PageProps } from "@/utils/types/common";
import { UserContext } from "@/utils/useUserContext";
import "@material-symbols/font-300/outlined.css";
import {
  QueryClient,
  QueryClientProvider,
  HydrationBoundary,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";
import { type FC, type ReactNode, useState } from "react";

const UserContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { data: user, error, status } = useUserQuery();

  // TODO: loading page?
  if (status === "pending")
    return (
      <div className="w-max m-auto p-10">
        <MaterialIcon icon={"progress_activity"} className="animate-spin" />
      </div>
    );

  // TODO: proper error handling
  if (status === "error")
    return <h1>Error while fetching user: {error.message}</h1>;

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

const App: FC<AppProps<PageProps>> = ({ Component, pageProps }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      }),
  );

  return (
    <NextIntlClientProvider
      locale={
        pageProps.locale ?? process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en"
      }
      messages={pageProps.translations}
    >
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <UserContextProvider>
            <Component {...pageProps} />
          </UserContextProvider>
        </HydrationBoundary>
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
};

export default App;
