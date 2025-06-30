import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/glance/OrderCard";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import cn from "@/utils/helpers/cn";
import getGreetingMessage from "@/utils/helpers/glance/getGreetingMessage";
import { checkBuildingOrderExpired } from "@/utils/helpers/order/new/checkBuildingOrderExpired";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import { AnimatePresence, motion } from "motion/react";
import { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ClientDashboard = () => {
  const router = useRouter();
  const t = useTranslations();

  const [ordersState, setOrdersState] = useState<any>({});
  const [user, setUser] = useState<any>({});

  const [showNewOrderWarning, setShowNewOrderWarning] =
    useState<boolean>(false);

  const [isOrderExpired, setIsOrderExpired] = useState<boolean | undefined>(
    false,
  );

  useEffect(() => {
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

      setUser(data);
    };

    const fetchOrders = async () => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH + "/orders/glance",
        {
          credentials: "include",
        },
      );

      const data = await res.json();
      setOrdersState(data);
    };

    setIsOrderExpired(checkBuildingOrderExpired());

    fetchUser();
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        title={`${getGreetingMessage()}${
          user.data ? `, ${user.data?.name}` : ""
        }`}
      />
      <PageLoadTransition className="flex flex-col h-full overflow-auto gap-3 font-mono">
        <div
          className={cn(
            `flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16`,
          )}
        >
          {ordersState.data &&
            [
              {
                label: "Ongoing",
                data: ordersState.data.ongoing,
                fallback: "You have no active order in progress.",
              },
              {
                label: "Completed",
                data: ordersState.data.finished,
                fallback: "Orders completed will appear here.",
              },
            ].map((i: any) => {
              return (
                <LabelGroup header={i.label}>
                  {(i.data ?? []).length != 0 ? (
                    (i.data ?? []).map((i: any) => {
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            y: { type: "spring", bounce: 0 },
                            delay: i * 0.2,
                          }}
                        >
                          <Link key={i.id} href={`/order/detail/${i.id}`}>
                            <OrderCard
                              status={i.status}
                              orderNumber={i.orderNumber}
                              createdAt={i.createdAt}
                              filesCount={i.filesCount}
                              options={{
                                showNavigationIcon: true,
                              }}
                            />
                          </Link>
                        </motion.div>
                      );
                    })
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

          {/* DEV: Fetch logs */}
          {process.env.NODE_ENV === "development" && (
            <LabelGroup header="Developer Log">
              <div className="p-3 text-body-sm bg-surface-container border border-outline rounded-lg">
                <b>
                  <a
                    className="!font-mono break-all"
                    href={process.env.NEXT_PUBLIC_API_PATH + "/user"}
                    target="_blank"
                  >
                    {process.env.NEXT_PUBLIC_API_PATH + "/user"}
                  </a>
                </b>
                <br />
                <span className="!font-mono break-all">
                  {JSON.stringify(user)}
                </span>
                <br />
                <br />
                <b>
                  <a
                    className="!font-mono break-all"
                    href={process.env.NEXT_PUBLIC_API_PATH + "/orders/glance"}
                    target="_blank"
                  >
                    {process.env.NEXT_PUBLIC_API_PATH + "/orders/glance"}
                  </a>
                </b>
                <br />
                <span className="!font-mono break-all">
                  {JSON.stringify(ordersState)}
                </span>
              </div>
            </LabelGroup>
          )}
        </div>
        <div className="fixed p-3 bottom-0 w-full flex flex-col h-16 max-w-lg">
          <Button
            appearance={"filled"}
            icon={isOrderExpired ? "add" : "check"}
            className="w-full"
            onClick={() => {
              if (isOrderExpired) {
                setShowNewOrderWarning(true);
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
        {showNewOrderWarning && (
          <Dialog
            title={t("expiryWarning.title")}
            desc={t("expiryWarning.description")}
            onClickOutside={setShowNewOrderWarning}
          >
            <Button
              appearance="tonal"
              onClick={() => setShowNewOrderWarning(false)}
            >
              Cancel
            </Button>
            <Link href={"/order/new"} className="w-full">
              <Button appearance="filled" className="w-full">
                OK
              </Button>
            </Link>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [locale, translations] = await getServerSideTranslations(
    context.req,
    "glance",
  );

  return { props: { locale, translations } };
};

export default ClientDashboard;
