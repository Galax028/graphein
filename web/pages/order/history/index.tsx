import NavigationBar from "@/components/common/NavigationBar";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import cn from "@/utils/helpers/cn";
import LabelGroup from "@/components/common/LabelGroup";
import { motion } from "motion/react";
import OrderCard from "@/components/glance/OrderCard";
import Link from "next/link";
import { useState, useEffect } from "react";


const OrderHistoryPage = () => {

  const [ordersState, setOrdersState] = useState<any>({});

  useEffect(() => {
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
    
    fetchOrders();
  }, []);

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        title="Order History"
        backEnabled={true}
        backContextURL={"/glance"}
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
                label: "Completed",
                data: ordersState.data.finished,
                fallback: "You have no completed order.",
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
                                showNavigationIcon: false,
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
        </div>
      </PageLoadTransition>
    </div>
  );
};

export default OrderHistoryPage;
