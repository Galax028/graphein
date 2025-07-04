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
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import { dehydrate, QueryClient } from "@tanstack/react-query";
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
    <>
      <NavigationBar
        user={user}
        title={t("navigationBar")}
        backEnabled={true}
        backContextURL={"/glance"}
      />
      <PageLoadTransition>
        <LabelGroup header={t("withinLastMonth")}>
          {data.pages.length === 0 ? (
            <OrderEmptyCard text={t("empty")} />
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
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetching}
        >
          {isFetchingNextPage
            ? "Loading..."
            : hasNextPage
              ? "Load More"
              : "No more items"}
        </Button>
      </PageLoadTransition>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "history",
  ]);

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const signedIn = await prefetchUser(queryClient, sessionToken);
  if (signedIn) {
    await prefetchOrderHistory(queryClient, sessionToken);

    return {
      props: {
        locale,
        translations,
        dehydratedState: dehydrate(queryClient),
      },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default OrderHistoryPage;
