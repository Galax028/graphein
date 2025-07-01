import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import OrderCard from "@/components/glance/OrderCard";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import cn from "@/utils/helpers/cn";
import { CompactOrder } from "@/utils/types/backend";
import type { PageProps } from "@/utils/types/common";
import { motion } from "motion/react";
import Link from "next/link";
import { type FC, useEffect, useState } from "react";

const OrderHistoryPage: FC<PageProps> = () => {
  const [orderHistory, setOrderHistory] = useState<CompactOrder[] | null>(null);
  // const [orderHistoryPage, setOrderHistoryPage] = useState(1);

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH +
          // Intended solution
          // `/orders/history?size=${15}&page=${orderHistoryPage}`,

          // Temp!!!!!! solutions (no pages yet coz im retarded)
          `/orders/history?size=${15}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          // body: JSON.stringify({
          //   size: 15,
          //   page: orderHistoryPage,
          // }),
        },
      );

      const body = await res.json();
      setOrderHistory(body.data as CompactOrder[]);
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        title="Order History"
        backEnabled={true}
        backContextURL={"/glance"}
      />
      <PageLoadTransition className="flex flex-col h-full w-full overflow-auto gap-3 font-mono">
        <div
          className={cn(
            `flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16`,
          )}
        >
          {orderHistory && (
            <LabelGroup header={"Previous 30 days"}>
              {orderHistory.length != 0 ? (
                orderHistory.map((order, idx) => {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        y: { type: "spring", bounce: 0 },
                        delay: idx * 0.2,
                      }}
                      key={idx}
                    >
                      <Link href={`/order/detail/${order.id}`}>
                        <OrderCard
                          status={order.status}
                          orderNumber={order.orderNumber}
                          createdAt={order.createdAt}
                          filesCount={order.filesCount}
                          options={{
                            showNavigationIcon: false,
                          }}
                        />
                      </Link>
                    </motion.div>
                  );
                })
              ) : (
                <OrderEmptyCard text={`Orders completed will appear here.`} />
              )}
            </LabelGroup>
          )}
        </div>
      </PageLoadTransition>
    </div>
  );
};

export default OrderHistoryPage;
