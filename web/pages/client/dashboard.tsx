import OrderCard from "@/components/client/dashboard/OrderCard";
import OrderEmptyCard from "@/components/client/dashboard/OrderEmptyCard";
import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ClientDashboard = () => {
  const router = useRouter();

  const [ordersState, setOrdersState] = useState<any>({});
  const [detailedState, setDetailedState] = useState<any>({});
  const [user, setUser] = useState<any>({});

  useEffect(() => {
    // Onboard the logged in user. (DANGER!!!)
    const postOnboard = async () => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH + "/user/onboard",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tel: "0929264489",
            class: 605,
            classNo: 5,
          }),
        }
      );

      const data = await res.json();
      setOrdersState(data);
    };

    const getUser = async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
        method: "GET",
        credentials: "include",
      });

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

      if (res.status == 403) {
        console.warn(
          `Response: [403] Forbidden\n[1.] The user must be authenticated before accessing this page.\n[2.] Redirecting to '/client/onboarding'`
        );
        return;
        // return router.push("/client/onboarding");
      }

      const data = await res.json();
      setOrdersState(data);
    };

    const getDetailedOrder = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/844d2794-e378-4c77-b1bc-d5ff9685c744`,
        {
          credentials: "include",
        }
      );
      if (res.status == 403) {
        // return router.push("/client/onboarding");
      }
      const data = await res.json();
      setDetailedState(data);
    };

    // postOnboard();
    getUser();
    fetchOrders();
    getDetailedOrder();
  }, []);

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar title={`Good morning, ${user.data?.name ?? ""}`} />
      <main className="flex flex-col h-full overflow-auto gap-3 font-mono">
        <div className="flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16">
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
