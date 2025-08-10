import DescriptionList from "@/components/common/DescriptionList";
import DropDownCard from "@/components/common/DropDownCard";
import LabelGroup from "@/components/common/LabelGroup";
import LoadingPage from "@/components/layout/LoadingPage";
import FileDetailHeader from "@/components/orders/FileDetailHeader";
import OrderCard from "@/components/orders/OrderCard";
import { useNavbar } from "@/hooks/useNavbarContext";
import {
  prefetchDetailedOrder,
  useDetailedOrderQuery,
} from "@/query/fetchDetailedOrder";
import { prefetchUser } from "@/query/fetchUser";
import { cn } from "@/utils";
import getFormattedDateTime from "@/utils/helpers/getFormattedDateTime";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { OrderStatus, PageProps, Uuid } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import type { GetServerSideProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { Fragment, useCallback, type FC } from "react";

const OrderDetailsPage: FC<{ orderId: Uuid } & PageProps> = ({ orderId }) => {
  const locale = useLocale();
  const tx = useTranslations("common");

  const { data: detailedOrder, status } = useDetailedOrderQuery(orderId);

  useNavbar(
    useCallback(
      () => ({
        title: tx("orderCard.title", {
          orderNumber: detailedOrder?.orderNumber ?? "",
        }),
        backEnabled: true,
      }),
      [tx, detailedOrder],
    ),
  );

  if (status === "pending" || status === "error") return <LoadingPage />;

  // Rename pls!!!!
  const createdTimestamp = new Date(detailedOrder.createdAt);
  const aboutOrderProps = [
    {
      title: "Created",
      content: getFormattedDateTime(locale, createdTimestamp),
    },
    {
      title: "Price",
      content: detailedOrder.price?.toString() ?? "--",
    },
    {
      title: "Order ID",
      content:
        createdTimestamp.getDate().toString().padStart(2, "0") +
        createdTimestamp.getMonth().toString().padStart(2, "0") +
        `${createdTimestamp.getFullYear()}-` +
        detailedOrder.orderNumber.replace(/-/g, ""),
    },
  ];

  const statusTranslation: Record<OrderStatus, string> = {
    reviewing: "Reviewing",
    processing: "Printing",
    ready: "Pickup",
    completed: "Completed",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  return (
    <>
      <LabelGroup header="Your Order">
        <OrderCard
          status={detailedOrder.status}
          orderNumber={detailedOrder.orderNumber}
          createdAt={detailedOrder.createdAt}
          filesCount={detailedOrder.files.length}
          options={{
            showProgressBar: true,
          }}
        />
        <DropDownCard header="About Order">
          <DescriptionList list={aboutOrderProps} />
        </DropDownCard>
        <DropDownCard header="Time Log">
          <div
            className={`
              grid grid-cols-[4.5rem_1fr] items-center gap-x-4 gap-y-2
            `}
          >
            {detailedOrder.statusHistory.map((item, idx) => (
              <Fragment key={idx}>
                <p className="text-body-sm opacity-50">
                  {statusTranslation[item.status]}
                </p>
                <p className="text-body-md">
                  {getFormattedDateTime(locale, new Date(item.timestamp))}
                </p>
              </Fragment>
            ))}
          </div>
        </DropDownCard>
      </LabelGroup>
      <LabelGroup header="Note to Shop">
        <div
          className={cn(
            `rounded-lg border border-outline bg-surface-container p-3`,
          )}
        >
          <p className="text-body-md">
            {detailedOrder.notes ?? (
              <span className="italic opacity-50">No notes provided.</span>
            )}
          </p>
        </div>
      </LabelGroup>
      <LabelGroup header="Files">
        {detailedOrder &&
          detailedOrder.files.map((file, idx) => (
            <FileDetailHeader
              filename={file.filename}
              filesize={file.filesize}
              filetype={file.filetype}
              orderId={detailedOrder.id}
              fileId={file.id}
              key={idx}
            />
          ))}
      </LabelGroup>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  // TODO: translations
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "index", // TODO
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

    const orderId = context.query.id;
    if (typeof orderId !== "string") return { notFound: true };
    await prefetchDetailedOrder(queryClient, orderId, sessionToken);

    return {
      props: {
        locale,
        translations,
        dehydratedState: dehydrate(queryClient),
        orderId,
      },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default OrderDetailsPage;
