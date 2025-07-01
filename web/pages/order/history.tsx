import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import OrderCard from "@/components/glance/OrderCard";
import OrderEmptyCard from "@/components/glance/OrderEmptyCard";
import {
  prefetchOrderHistory,
  useOrderHistoryInfiniteQuery,
} from "@/query/fetchOrderHistory";
import { prefetchUser } from "@/query/fetchUser";
import cn from "@/utils/helpers/cn";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import { QueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import type { FC } from "react";

const OrderHistoryPage: FC<PageProps> = () => {
  const user = useUserContext();

  const {
    data,
    isFetching,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrderHistoryInfiniteQuery();

  // TODO: This one should be self-descriptive
  if (status === "pending" || status === "error") return <></>;

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        user={user}
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
          <LabelGroup header={"Previous 30 days"}>
            {data.pages.length === 0 ? (
              <OrderEmptyCard text={`Orders completed will appear here.`} />
            ) : (
              data.pages
                .flatMap((page) => page.orders)
                .map((order, idx) => (
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
                ))
            )}
          </LabelGroup>
          <Button
            appearance="tonal"
            className="w-full"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetching}
          >
            {isFetchingNextPage
              ? "Loading..."
              : hasNextPage
                ? "Load More"
                : "No more items"}
          </Button>
        </div>
      </PageLoadTransition>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  // TODO: translations
  const [locale, translations] = await getServerSideTranslations(
    context.req,
    "glance",
  );

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const signedIn = await prefetchUser(queryClient, sessionToken);
  if (signedIn) await prefetchOrderHistory(queryClient, sessionToken);

  return signedIn
    ? { props: { locale, translations } }
    : { redirect: { destination: "/", permanent: false } };
};

export default OrderHistoryPage;
