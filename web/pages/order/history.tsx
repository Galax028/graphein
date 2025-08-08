import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import PageLoadTransition from "@/components/layout/PageLoadTransition";
import OrderCard from "@/components/orders/OrderCard";
import EmptyOrderCard from "@/components/orders/EmptyOrderCard";
import LoadingPage from "@/components/layout/LoadingPage";
import {
  prefetchOrderHistory,
  useOrderHistoryInfiniteQuery,
} from "@/query/fetchOrderHistory";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import useUserContext from "@/hooks/useUserContext";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import type { FC } from "react";

const OrderHistoryPage: FC<PageProps> = () => {
  const t = useTranslations("history");
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
  if (status === "pending" || status === "error") return <LoadingPage />;

  return (
    <>
      <NavigationBar
        user={user}
        title={t("navigationBar")}
        backEnabled={true}
        backContextURL="/glance"
      />
      <PageLoadTransition>
        <LabelGroup header={t("withinLastMonth")}>
          {data.pages.length === 0 ? (
            <EmptyOrderCard text={t("empty")} />
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
  const user = await prefetchUser(queryClient, sessionToken, {
    returnUser: true,
  });
  if (user) {
    if (user.role === "merchant")
      return {
        redirect: { destination: "/merchant/dashboard", permanent: false },
      };

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
