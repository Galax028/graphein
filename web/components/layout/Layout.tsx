import Dialog from "@/components/common/Dialog";
import NavigationBar from "@/components/common/NavigationBar";
import MerchantLayout from "@/components/layout/MerchantLayout";
import PageLoadTransition from "@/components/layout/PageLoadTransition";
import { useDialogContext } from "@/hooks/useDialogContext";
import { AnimatePresence } from "motion/react";
import Head from "next/head";
import { useRouter } from "next/router";
import type { FC, ReactNode } from "react";

const ClientLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const dialog = useDialogContext();

  return (
    <div className="flex h-dvh flex-col overflow-y-hidden">
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
      </Head>
      <NavigationBar />
      <PageLoadTransition>{children}</PageLoadTransition>
      <AnimatePresence>
        {dialog.show && (
          <Dialog
            title={dialog.title}
            description={dialog.description}
            toggle={dialog.toggle}
          >
            {dialog.content}
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();

  if (!router.isFallback && router.pathname.includes("merchant"))
    return <MerchantLayout>{children}</MerchantLayout>;

  return <ClientLayout>{children}</ClientLayout>;
};

export default Layout;
