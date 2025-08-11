import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import LoadingPage from "@/components/layout/LoadingPage";
import EmptyOrderCard from "@/components/orders/EmptyOrderCard";
import OrderCard from "@/components/orders/OrderCard";
import useDialog from "@/hooks/useDialogContext";
import { useNavbar } from "@/hooks/useNavbarContext";
import useToggle from "@/hooks/useToggle";
import useUserContext from "@/hooks/useUserContext";
import {
  prefetchOrdersGlance,
  useOrdersGlanceQuery,
} from "@/query/fetchOrdersGlance";
import { prefetchUser } from "@/query/fetchUser";
import checkIsBuildingOrder from "@/utils/helpers/checkIsBuildingOrder";
import getGreetingMessage from "@/utils/helpers/getGreetingMessage";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, type FC } from "react";

const GlancePage: FC<PageProps> = () => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations("glance");
  const user = useUserContext();
  const dialog = useDialog();

  const { data: ordersGlance, status } = useOrdersGlanceQuery();
  const [isBuildingOrder, toggleIsBuildingOrder] = useToggle();

  useNavbar(
    useCallback(
      () => ({ title: t(getGreetingMessage(), { name: user.name }) }),
      [t, user.name],
    ),
  );

  useEffect(
    () => toggleIsBuildingOrder(checkIsBuildingOrder()),
    [toggleIsBuildingOrder],
  );

  const onOrderButtonClick = () => {
    if (isBuildingOrder) router.push("/order/new/upload");
    else {
      dialog.setAndToggle({
        title: t("expiryWarning.title"),
        description: t("expiryWarning.description"),
        content: (
          <>
            <Button appearance="tonal" onClick={() => dialog.toggle(false)}>
              {tx("action.nevermind")}
            </Button>
            <Link href="/order/new/upload" className="w-full">
              <Button appearance="filled" className="w-full">
                {tx("action.start")}
              </Button>
            </Link>
          </>
        ),
        allowClickOutside: true,
      });
    }
  };

  if (status === "pending" || status === "error" || isBuildingOrder === null)
    return <LoadingPage />;

  const sections = [
    {
      label: t("orders.ongoing.title"),
      orders: ordersGlance.ongoing,
      empty: t("orders.ongoing.empty"),
    },
    {
      label: t("orders.finished.title"),
      orders: ordersGlance.finished,
      empty: t("orders.finished.empty"),
    },
  ] as const;

  return (
    <>
      <div className="mb-12 flex w-full flex-col gap-2">
        {sections.map((section) => (
          <LabelGroup header={section.label} key={section.label}>
            {section.orders.length !== 0 ? (
              section.orders.map((order, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    y: { type: "spring", bounce: 0 },
                    delay: idx * 0.2,
                  }}
                  key={order.id}
                >
                  <Link key={order.id} href={`/order/detail/${order.id}`}>
                    <OrderCard
                      status={order.status}
                      orderNumber={order.orderNumber}
                      createdAt={order.createdAt}
                      filesCount={order.filesCount}
                      options={{ showNavigationIcon: true }}
                    />
                  </Link>
                </motion.div>
              ))
            ) : (
              <EmptyOrderCard text={section.empty} />
            )}
          </LabelGroup>
        ))}
        <Link href="/order/history">
          <Button appearance="tonal" icon="history" className="w-full">
            {t("orderHistory")}
          </Button>
        </Link>
      </div>

      {/* Build Order Button */}
      <div className="fixed right-0 bottom-3 left-0 mx-auto max-w-lg px-3">
        <Button
          className="w-full"
          appearance="filled"
          icon={isBuildingOrder ? "check" : "add"}
          onClick={onOrderButtonClick}
        >
          {t(isBuildingOrder ? "orderButton.finish" : "orderButton.new")}
        </Button>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "glance",
  ]);

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const user = await prefetchUser(queryClient, sessionToken, {
    returnUser: true,
  });
  if (user) {
    if (!user.isOnboarded)
      return { redirect: { destination: "/onboard", permanent: false } };
    if (user.role === "merchant")
      return {
        redirect: { destination: "/merchant/dashboard", permanent: false },
      };

    await prefetchOrdersGlance(queryClient, sessionToken);
    return {
      props: { locale, translations, dehydratedState: dehydrate(queryClient) },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default GlancePage;
