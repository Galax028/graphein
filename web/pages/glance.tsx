import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/glance/OrderCard";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import {
  prefetchOrdersGlance,
  useOrdersGlanceQuery,
} from "@/query/fetchOrdersGlance";
import { prefetchUser } from "@/query/fetchUser";
import getGreetingMessage from "@/utils/helpers/glance/getGreetingMessage";
import checkIsBuildingOrder from "@/utils/helpers/order/new/checkIsBuildingOrder";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { CompactOrder } from "@/utils/types/backend";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useEffect, useState } from "react";

const GlancePage: FC<PageProps> = () => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations("glance");
  const user = useUserContext();

  const { data: ordersGlance, status } = useOrdersGlanceQuery();

  const [isBuildingOrder, setIsBuildingOrder] = useState<boolean | null>(null);
  const [showNewOrderWarning, setShowNewOrderWarning] = useState(false);

  useEffect(() => setIsBuildingOrder(checkIsBuildingOrder()), []);

  // TODO: This one should be self-descriptive
  if (status === "pending" || status === "error" || isBuildingOrder === null)
    return <></>;

  const sections = [
    {
      label: t("orders.ongoing.title"),
      orders: ordersGlance.ongoing,
      fallback: t("orders.ongoing.empty"),
    },
    {
      label: t("orders.finished.title"),
      orders: ordersGlance.finished,
      fallback: t("orders.finished.empty"),
    },
  ] as const;

  return (
    <div className="flex flex-col items-center h-dvh">
      <NavigationBar
        user={user}
        title={t(getGreetingMessage(), { name: user.name })}
      />
      <PageLoadTransition className="w-full">
        <div className="flex flex-col w-full gap-2 mb-12">
          {sections.map((section, idx) => (
            <LabelGroup header={section.label} key={idx}>
              {section.orders.length !== 0 ? (
                section.orders.map((order: CompactOrder, idx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      y: { type: "spring", bounce: 0 },
                      delay: idx * 0.2,
                    }}
                    key={idx}
                  >
                    <Link key={order.id} href={`/order/detail/${order.id}`}>
                      <OrderCard
                        status={order.status}
                        orderNumber={order.orderNumber}
                        createdAt={order.createdAt}
                        filesCount={order.filesCount}
                        options={{
                          showNavigationIcon: true,
                        }}
                      />
                    </Link>
                  </motion.div>
                ))
              ) : (
                <OrderEmptyCard text={section.fallback} />
              )}
            </LabelGroup>
          ))}
          <Link href="/order/history">
            <Button appearance="tonal" icon="history" className="w-full">
              {t("orderHistory")}
            </Button>
          </Link>
        </div>
      </PageLoadTransition>

      <div className="fixed px-3 w-full max-w-lg md:w-[24rem] mx-auto left-0 right-0 bottom-3">
        <Button
          className="w-full"
          appearance="filled"
          icon={isBuildingOrder ? "check" : "add"}
          onClick={() => {
            if (isBuildingOrder) {
              router.push("/order/new/upload");
            } else {
              setShowNewOrderWarning(true);
            }
          }}
        >
          {t(isBuildingOrder ? "orderButton.finish" : "orderButton.new")}
        </Button>
      </div>

      <AnimatePresence>
        {showNewOrderWarning && (
          <Dialog
            title={t("expiryWarning.title")}
            desc={t("expiryWarning.description")}
            setClickOutside={setShowNewOrderWarning}
          >
            <Button
              appearance="tonal"
              onClick={() => setShowNewOrderWarning(false)}
            >
              {tx("action.nevermind")}
            </Button>
            <Link href="/order/new/upload" className="w-full">
              <Button appearance="filled" className="w-full">
                {tx("action.start")}
              </Button>
            </Link>
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

    await prefetchOrdersGlance(queryClient, sessionToken);
    return {
      props: { locale, translations, dehydratedState: dehydrate(queryClient) },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default GlancePage;
