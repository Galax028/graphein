import OrderCard from "@/components/client/dashboard/OrderCard";
import OrderEmptyCard from "@/components/client/dashboard/OrderEmptyCard";
import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import cn from "@/utils/helpers/cn";
import getGrettingMessage from "@/utils/helpers/getGreetingMessage";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ClientDashboard = () => {
  const router = useRouter();

  const [ordersState, setOrdersState] = useState<any>({});
  const [detailedState, setDetailedState] = useState<any>({});
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        router.push("/");
      }

      const data = await res.json();
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
        title={`${getGrettingMessage()}, ${user.data?.name ?? ""}`}
      />
      <main className="flex flex-col h-full overflow-auto gap-3 font-mono">
        <div
          className={cn(
            `flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16`
          )}
        >
          <LabelGroup header="Ongoing">
            {(ordersState.data?.ongoing ?? []).length != 0 ? (
              (ordersState.data?.ongoing ?? []).map((order: any) => {
                return (
                  <OrderCard
                    key={order.id}
                    id={order.id}
                    status={order.status}
                    orderNumber={order.orderNumber}
                    createdAt={order.createdAt}
                    filesCount={order.filesCount}
                  />
                );
              })
            ) : (
              <OrderEmptyCard text={"You have no active order in progress."} />
            )}
          </LabelGroup>
          <LabelGroup header="Completed">
            {(ordersState.data?.finished ?? []).length != 0 ? (
              (ordersState.data?.finished ?? []).map((order: any) => {
                return (
                  <OrderCard
                    key={order.id}
                    id={order.id}
                    status={order.status}
                    orderNumber={order.orderNumber}
                    createdAt={order.createdAt}
                    filesCount={order.filesCount}
                  />
                );
              })
            ) : (
              <OrderEmptyCard text={"Orders completed will appear here."} />
            )}
          </LabelGroup>
          <Link href="/client/order/history">
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
                <br />
                <br />

                <b>
                  <a
                    className="!font-mono break-all"
                    href={
                      process.env.NEXT_PUBLIC_API_PATH +
                      "/orders/844d2794-e378-4c77-b1bc-d5ff9685c744"
                    }
                    target="_blank"
                  >
                    {process.env.NEXT_PUBLIC_API_PATH +
                      "/orders/844d2794-e378-4c77-b1bc-d5ff9685c744"}
                  </a>
                </b>
                <br />
                <span className="!font-mono break-all">
                  {JSON.stringify(detailedState)}
                </span>
              </div>
            </LabelGroup>
          )}
        </div>
        <div className="fixed p-3 left-0 bottom-0 w-full flex flex-col h-16">
          <Link href="/client/order/new/upload">
            <Button appearance={"filled"} icon={"add"} className="w-full">
              New Order
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
