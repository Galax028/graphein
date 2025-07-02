import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/glance/OrderCard";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import cn from "@/utils/helpers/cn";
import getGreetingMessage from "@/utils/helpers/glance/getGreetingMessage";
import checkBuildingOrderExpired from "@/utils/helpers/order/new/checkBuildingOrderExpired";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { CompactOrder, OrdersGlance, User } from "@/utils/types/backend";
import type { PageProps } from "@/utils/types/common";
import { AnimatePresence, motion } from "motion/react";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useEffect, useState } from "react";

const GlancePage: FC<PageProps> = (props: { locale: string }) => {
  const router = useRouter();

  const tx = useTranslations("common");
  const t = useTranslations("glance");

  const [user, setUser] = useState<User | null>(null);
  const [ordersState, setOrdersState] = useState<OrdersGlance | null>(null);
  const [showNewOrderWarningDialog, setShowNewOrderWarningDialog] = useState(false);
  const [isOrderExpired, setIsOrderExpired] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;

    const fetchUser = async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
        method: "GET",
        credentials: "include",
      });

      // If the user is not logged in, redirect to landing page.
      if (!res.ok) {
        return router.push("/");
      }

      const data = await res.json();

      // If the user role is merchant, redirect to merchant page.
      if (data.data.role == "merchant") {
        return router.push("/merchant");
      }

      setUser(data.data as User);
    };

    const fetchOrders = async () => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH + "/orders/glance",
        {
          credentials: "include",
        },
      );

      const body = await res.json();
      setOrdersState(body.data);
    };

    setIsOrderExpired(checkBuildingOrderExpired());
    Promise.all([fetchUser(), fetchOrders()]);
  }, [router]);

  if (!user || !ordersState) return <></>;

  const sections = [
    {
      label: "Ongoing",
      orders: ordersState.ongoing,
      fallback: "You have no active order in progress.",
    },
    {
      label: "Completed",
      orders: ordersState.finished,
      fallback: "Orders completed will appear here.",
    },
  ] as const;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        title={`${getGreetingMessage(t)}${
          user
            ? `${props.locale == "en" ? "," : ""} ${user.name}`
            : ""
        }`}
      />
      <PageLoadTransition className="flex flex-col w-full h-full overflow-auto gap-3 font-mono">
        <div
          className={cn(`flex flex-col p-3 gap-2 h-full overflow-auto pb-16`)}
        >
          {ordersState &&
            [
              {
                label: t("orders.ongoing.title"),
                data: ordersState.ongoing,
                fallback: t("orders.ongoing.empty"),
              },
              {
                label: t("orders.finished.title"),
                data: ordersState.finished,
                fallback: t("orders.finished.empty"),
              },
             ].map((i: any) => {
              return (
                <LabelGroup header={i.label} key={i.label}>
                  {(i.data ?? []).length !== 0 ? (
                    (i.data ?? []).map((order: any, idx: number) => (
                      <Link href={`/order/detail/${order.id}`} key={order.id}>
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            y: { type: "spring", bounce: 0 },
                            delay: idx * 0.2,
                          }}
                        >
                          <OrderCard
                            status={order.status}
                            orderNumber={order.orderNumber}
                            filesCount={order.filesCount}
                            createdAt={order.createdAt}
                            options={{
                              showStatusText: true,
                              showProgressBar: true,
                              showNavigationIcon: true,
                            }}
                          />
                        </motion.div>
                      </Link>
                    ))
                  ) : (
                    <OrderEmptyCard text={i.fallback} />
                  )}
                </LabelGroup>
              );
            })}
          <Link href="/order/history">
            <Button appearance={"tonal"} icon={"history"} className="w-full">
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "glance",
  ]);

  return { props: { locale, translations } };
};

export default GlancePage;
