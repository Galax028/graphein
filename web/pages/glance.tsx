import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/glance/OrderCard";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import { prefetchUser } from "@/query/fetchUser";
import cn from "@/utils/helpers/cn";
import getGreetingMessage from "@/utils/helpers/glance/getGreetingMessage";
import checkBuildingOrderExpired from "@/utils/helpers/order/new/checkBuildingOrderExpired";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { CompactOrder, OrdersGlance } from "@/utils/types/backend";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import { QueryClient } from "@tanstack/react-query";
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

  const [ordersState, setOrdersState] = useState<OrdersGlance | null>(null);
  const [showNewOrderWarningDialog, setShowNewOrderWarningDialog] =
    useState(false);
  const [isOrderExpired, setIsOrderExpired] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH + "/orders/glance",
        { credentials: "include" },
      );

      const body = await res.json();
      setOrdersState(body.data);
    };

    setIsOrderExpired(checkBuildingOrderExpired());
    fetchOrders();
  }, []);

  if (!ordersState) return <></>;

  const sections = [
    {
      label: t("orders.ongoing.title"),
      orders: ordersState.ongoing,
      fallback: t("orders.ongoing.empty"),
    },
    {
      label: t("orders.finished.title"),
      orders: ordersState.finished,
      fallback: t("orders.finished.empty"),
    },
  ] as const;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        user={user}
        title={t(getGreetingMessage(), { username: user.name })}
      />
      <PageLoadTransition className="flex flex-col h-full overflow-auto gap-3 font-mono">
        <div
          className={cn(`flex flex-col p-3 gap-2 h-full overflow-auto pb-16`)}
        >
          {ordersState &&
            sections.map((section, idx) => (
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
        <div className="fixed p-3 bottom-0 w-full flex flex-col h-16 max-w-lg">
          <Button
            appearance={"filled"}
            icon={isOrderExpired ? "add" : "check"}
            className="w-full"
            onClick={() => {
              if (isOrderExpired) {
                setShowNewOrderWarningDialog(true);
              } else {
                router.push("/order/new");
              }
            }}
          >
            {t(isOrderExpired ? "orderButton.new" : "orderButton.finish")}
          </Button>
        </div>
      </PageLoadTransition>
      <AnimatePresence>
        {showNewOrderWarningDialog && (
          <Dialog
            title={t("expiryWarning.title")}
            desc={t("expiryWarning.description")}
            setClickOutside={setShowNewOrderWarningDialog}
          >
            <Button
              appearance="tonal"
              onClick={() => setShowNewOrderWarningDialog(false)}
            >
              {tx("action.nevermind")}
            </Button>
            <Link href={"/order/new"} className="w-full">
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
  const signedIn = await prefetchUser(queryClient, sessionToken);

  return signedIn
    ? { props: { locale, translations } }
    : { redirect: { destination: "/", permanent: false } };
};

export default GlancePage;
