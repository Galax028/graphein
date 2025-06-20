import NavigationBar from "@/components/common/NavigationBar";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import cn from "@/utils/helpers/code/cn";
import LabelGroup from "@/components/common/LabelGroup";
import { motion } from "motion/react";
import OrderCard from "@/components/glance/OrderCard";
import Link from "next/link";
import { useState, useEffect } from "react";

const OrderHistoryPage = () => {
  const [orderHistoryData, setOrderHistoryData] = useState<any>({});
  const [orderHistoryPage, setOrderHistoryPage] = useState<number>(1);

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
        }
      );

      const data = await res.json();
      setOrderHistoryData(data);
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
            `flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16`
          )}
        >
          {orderHistoryData.data && (
            <LabelGroup header={"Previous 30 days"}>
              {orderHistoryData.data.length != 0 ? (
                orderHistoryData.data.map((i: any) => {
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        y: { type: "spring", bounce: 0 },
                        delay: i * 0.2,
                      }}
                      key={i.id}
                    >
                      <Link href={`/order/detail/${i.id}`}>
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
