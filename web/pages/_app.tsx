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
import { NextIntlClientProvider } from "next-intl";
import type { AppProps } from "next/app";
import {
  type FC,
  type ReactNode,
  useCallback,
  useMemo,
  useReducer,
  useState,
} from "react";
// import { scan } from "react-scan";

import "@/styles/globals.css";
import "@material-symbols/font-300/outlined.css";

const UserContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { data: user, status } = useUserQuery();

  if (status === "pending" || status === "error") return <LoadingPage />;

  return <UserContext value={user}>{children}</UserContext>;
};

const NavbarContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [navbarMeta, setNavbarMeta] = useState(DEFAULT_NAVBAR_META);
  const setNavbar = useCallback((args: NavbarMeta) => setNavbarMeta(args), []);
  const value = useMemo(
    () => ({ ...navbarMeta, setNavbar }),
    [navbarMeta, setNavbar],
  );

  return <NavbarContext value={value}>{children}</NavbarContext>;
};

const DialogContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [showDialog, toggleDialog] = useToggle();
  const [dialogContext, dialogDispatch] = useReducer(
    dialogReducer,
    DEFAULT_DIALOG_META,
  );
  const value = useMemo(
    () => ({
      ...dialogContext,
      show: showDialog,
      toggle: toggleDialog,
      dispatch: dialogDispatch,
    }),
    [dialogContext, showDialog, toggleDialog],
  );

  return <DialogContext value={value}>{children}</DialogContext>;
};

const App: FC<AppProps<PageProps>> = ({ Component, pageProps }) => {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      }),
    [],
  );

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
