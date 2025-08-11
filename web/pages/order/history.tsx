import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import LoadingPage from "@/components/layout/LoadingPage";
import EmptyOrderCard from "@/components/orders/EmptyOrderCard";
import OrderCard from "@/components/orders/OrderCard";
import { useNavbar } from "@/hooks/useNavbarContext";
import {
  prefetchOrderHistory,
  useOrderHistoryInfiniteQuery,
} from "@/query/fetchOrderHistory";
import { prefetchUser } from "@/query/fetchUser";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { PageProps } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, type FC } from "react";

const OrderHistoryPage: FC<PageProps> = () => {
  const t = useTranslations("history");

  const {
    data,
    isFetching,
    status,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useOrderHistoryInfiniteQuery();

  useNavbar(
    useCallback(
      () => ({
        title: t("navigationBar"),
        backEnabled: true,
        backContextURL: "/glance",
      }),
      [t],
    ),
  );

  if (status === "pending" || status === "error") return <LoadingPage />;

  return (
    <>
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
