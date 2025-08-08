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
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { scan } from "react-scan";

import "@/styles/globals.css";
import "@material-symbols/font-300/outlined.css";
import { NavbarContext } from "@/hooks/useNavbarContext";

const UserContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { data: user, status } = useUserQuery();

  if (status === "pending" || status === "error") return <LoadingPage />;

  return <UserContext value={user}>{children}</UserContext>;
};

const App: FC<AppProps<PageProps>> = ({ Component, pageProps }) => {
  const queryClient = useMemo(() => {
    if (typeof window !== "undefined")
      console.log("created a new `QueryClient`");

    return new QueryClient({
      defaultOptions: { queries: { staleTime: 60 * 1000 } },
    });
  }, []);

  const [navbarTitle, setNavTitle] = useState<string | null>(null);
  const setNavbarTitle = useCallback((title: string) => setNavTitle(title), []);

  // useEffect(() => {
  //   scan({ enabled: process.env.NODE_ENV === "development" });
  // }, []);

  return (
    <NextIntlClientProvider
      locale={pageProps.locale}
      messages={pageProps.translations}
    >
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <UserContextProvider>
            <NavbarContext value={{ navbarTitle, setNavbarTitle }}>
              <Component {...pageProps} />
            </NavbarContext>
          </UserContextProvider>
        </HydrationBoundary>
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
};

export default App;
