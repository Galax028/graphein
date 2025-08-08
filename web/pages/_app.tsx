import LoadingPage from "@/components/layout/LoadingPage";
import { UserContext } from "@/hooks/useUserContext";
import { useUserQuery } from "@/query/fetchUser";
import type { PageProps } from "@/utils/types/common";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";
import { type FC, type ReactNode, useEffect, useState } from "react";
import { scan } from "react-scan";

import "@/styles/globals.css";
import "@material-symbols/font-300/outlined.css";

const UserContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { data: user, status } = useUserQuery();

  if (status === "pending" || status === "error") return <LoadingPage />;

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

const App: FC<AppProps<PageProps>> = ({ Component, pageProps }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      }),
  );

  useEffect(() => {
    scan({ enabled: process.env.NODE_ENV === "development" });
  }, []);

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
