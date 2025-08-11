import Layout from "@/components/layout/Layout";
import LoadingPage from "@/components/layout/LoadingPage";
import {
  DEFAULT_DIALOG_META,
  DialogContext,
  dialogReducer,
} from "@/hooks/useDialogContext";
import {
  DEFAULT_NAVBAR_META,
  NavbarContext,
  type NavbarMeta,
} from "@/hooks/useNavbarContext";
import { scan } from "react-scan";
import useToggle from "@/hooks/useToggle";
import { UserContext } from "@/hooks/useUserContext";
import { useUserQuery } from "@/query/fetchUser";
import type { PageProps } from "@/utils/types/common";
import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

import "@/styles/globals.css";
import "@material-symbols/font-300/outlined.css";
import { NextIntlClientProvider } from "next-intl";

const UserContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { data: user, status } = useUserQuery();

  if (status === "pending" || status === "error") return <LoadingPage />;

  return <UserContext value={user}>{children}</UserContext>;
};

const NavbarContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [meta, setMeta] = useState(DEFAULT_NAVBAR_META);
  const setNavbar = useCallback((args: NavbarMeta) => setMeta(args), []);

  return (
    <NavbarContext value={{ ...meta, setNavbar }}>{children}</NavbarContext>
  );
};

const DialogContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [showDialog, toggleDialog] = useToggle();
  const [dialogContext, dialogDispatch] = useReducer(
    dialogReducer,
    DEFAULT_DIALOG_META,
  );

  return (
    <DialogContext
      value={{
        ...dialogContext,
        show: showDialog,
        toggle: toggleDialog,
        dispatch: dialogDispatch,
      }}
    >
      {children}
    </DialogContext>
  );
};

const App: FC<AppProps<PageProps>> = ({ Component, pageProps }) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      }),
    [],
  );

  useEffect(() => {
    scan({ enabled: process.env.NODE_ENV === "development" });
  }, []);

  return (
    <NextIntlClientProvider
      locale={pageProps.locale}
      messages={pageProps.translations}
    >
      <QueryClientProvider client={queryClient}>
        <HydrationBoundary state={pageProps.dehydratedState}>
          <UserContextProvider>
            <NavbarContextProvider>
              <DialogContextProvider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </DialogContextProvider>
            </NavbarContextProvider>
          </UserContextProvider>
        </HydrationBoundary>
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
};

export default App;
