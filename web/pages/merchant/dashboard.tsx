import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import DropDownCard from "@/components/common/DropDownCard";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/glance/OrderCard";
import MerchantDetailedOrderView from "@/components/merchant/MerchantDetailedOrderView";
import {
  prefetchMerchantOrdersGlance,
  useMerchantOrdersGlanceQuery,
} from "@/query/fetchMerchantOrdersGlance";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps, Uuid } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useState, type FC } from "react";

const MerchantDashboardPage: FC<PageProps> = () => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations("merchantGlance");

  const { data: merchantOrdersGlance, status } = useMerchantOrdersGlanceQuery();

  const [currentOrderId, setCurrentOrderId] = useState<Uuid | null>(null);
  const [showSignOutDialog, setShowSignOutDialog] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
      { method: "POST", credentials: "include" },
    );

    if (res.ok) {
      return router.push("/?asMerchant=true");
    }
  };

  // TODO: This one should be self-descriptive
  if (status === "pending" || status === "error") return <></>;

  const sections = [
    {
      label: t("orders.incoming.title"),
      orders: merchantOrdersGlance.incoming,
      empty: t("orders.incoming.empty"),
      footer: t("orders.incoming.footer", {
        count: merchantOrdersGlance.incoming.length,
      }),
    },
    {
      label: t("orders.accepted.title"),
      orders: merchantOrdersGlance.accepted,
      empty: t("orders.accepted.empty"),
      footer: t("orders.accepted.footer", {
        count: merchantOrdersGlance.accepted.length,
      }),
    },
    {
      label: t("orders.waiting.title"),
      orders: merchantOrdersGlance.waiting,
      empty: t("orders.waiting.empty"),
      footer: t("orders.waiting.footer", {
        count: merchantOrdersGlance.waiting.length,
      }),
    },
    {
      label: t("orders.finished.title"),
      orders: merchantOrdersGlance.finished,
      empty: t("orders.finished.empty"),
      footer: t("orders.finished.footer", {
        count: merchantOrdersGlance.finished.length,
      }),
    },
  ] as const;

  return (
    <div className="flex flex-col items-center h-dvh">
      <NavigationBar title={t("navigationBar")}>
        <Button
          appearance="tonal"
          icon="logout"
          busy={isSigningOut}
          disabled={isSigningOut}
          onClick={() => setShowSignOutDialog(true)}
        />
      </NavigationBar>
      <PageLoadTransition className="md:!w-full !max-w-full h-full !grid grid-cols-4 gap-2 overflow-scroll">
        <div className="col-span-1 flex flex-col gap-2  w-full">
          {sections.map((section, idx) => (
            <DropDownCard
              className="flex flex-col gap-1"
              header={section.label}
              footer={[section.footer]}
              collapsed={idx === 3}
              key={section.label}
            >
              {section.orders.length !== 0 ? (
                section.orders.map((order) => (
                  <OrderCard
                    status={order.status}
                    selected={order.id === currentOrderId}
                    orderNumber={order.orderNumber}
                    createdAt={order.createdAt}
                    filesCount={order.filesCount}
                    options={{ showStatusText: false }}
                    onClick={() => setCurrentOrderId(order.id)}
                    key={order.id}
                  />
                ))
              ) : (
                <span className="opacity-50 text-body-md">{section.empty}</span>
              )}
            </DropDownCard>
          ))}
        </div>
        <MerchantDetailedOrderView
          orderId={currentOrderId}
          key={currentOrderId}
        />
      </PageLoadTransition>

      <AnimatePresence>
        {showSignOutDialog && (
          <Dialog
            title={t("signOut.title")}
            desc={t("signOut.description")}
            setClickOutside={setShowSignOutDialog}
          >
            <Button
              appearance="tonal"
              onClick={() => setShowSignOutDialog(false)}
              disabled={isSigningOut}
            >
              {tx("action.nevermind")}
            </Button>
            <Button
              appearance="filled"
              onClick={handleSignOut}
              busy={isSigningOut}
              busyWithText={false}
            >
              {t("signOut.title")}
            </Button>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "merchantGlance",
  ]);

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const user = await prefetchUser(queryClient, sessionToken, {
    returnUser: true,
  });
  if (user) {
    if (!user.isOnboarded)
      return { redirect: { destination: "/onboard", permanent: false } };
    if (user.role !== "merchant")
      return { redirect: { destination: "/", permanent: false } };

    await prefetchMerchantOrdersGlance(queryClient, sessionToken);
    return {
      props: { locale, translations, dehydratedState: dehydrate(queryClient) },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default MerchantDashboardPage;
