import OrderCard from "@/components/glance/OrderCard";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import cn from "@/utils/helpers/code/cn";
import getGrettingMessage from "@/utils/helpers/glance/getGreetingMessage";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import { AnimatePresence, motion } from "motion/react";
import Dialog from "@/components/common/Dialog";
import { checkBuildingOrderExpired } from "@/utils/helpers/order/new/checkBuildingOrderExpired";

const ClientDashboard = () => {
  const router = useRouter();

  const [ordersState, setOrdersState] = useState<any>({});
  const [user, setUser] = useState<any>({});

  const [showNewOrderWarning, setShowNewOrderWarning] =
    useState<boolean>(false);

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
        }
      );

      const data = await res.json();
      setOrdersState(data);
    };

    fetchUser();
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        title={`${getGrettingMessage()}${
          user.data ? `, ${user.data?.name}` : ""
        }`}
      />
      <PageLoadTransition className="flex flex-col h-full overflow-auto gap-3 font-mono">
        <div
          className={cn(
            `flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16`
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
              Order History
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
          <Link href="/order/new/upload">
            <Button appearance={"filled"} icon={"add"} className="w-full">
              New Order
            </Button>
          </Link>
        </div>
      </PageLoadTransition>
      <AnimatePresence>
        {showNewOrderWarning && (
          <Dialog
            title={
              "You’ll have 15 minutes to complete your order."
            }
            desc={
              "If you don’t complete your order within the 15-minute window, it will be automatically discarded and you’ll need to start over."
            }
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

export default ClientDashboard;
