import DescriptionList from "@/components/common/DescriptionList";
import DropDownCard from "@/components/common/DropDownCard";
import FileDetailHeader from "@/components/common/FileDetailHeader";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/glance/OrderCard";
import {
  prefetchDetailedOrder,
  useDetailedOrderQuery,
} from "@/query/fetchDetailedOrder";
import { prefetchUser } from "@/query/fetchUser";
import cn from "@/utils/helpers/cn";
import getFormattedDateTime from "@/utils/helpers/getFormattedDateTime";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { OrderStatus, PageProps, Uuid } from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import { QueryClient } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import type { FC } from "react";

const OrderDetailsPage: FC<{ orderId: Uuid }> = ({ orderId }) => {
  const user = useUserContext();
  const locale = useLocale();
  const tx = useTranslations("common");

  const { data: detailedOrder, status } = useDetailedOrderQuery(orderId);

  // TODO: This one should be self-descriptive
  if (status === "pending" || status === "error") return <></>;

  // Rename pls!!!!
  const createdTimestamp = new Date(detailedOrder.createdAt);
  const aboutOrderProps = [
    {
      title: "Created",
      content: getFormattedDateTime(locale, createdTimestamp),
    },
    {
      title: "Price",
      content: (detailedOrder.price ?? NaN).toString(),
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

  // The CSS here is completely cooked, will need to cleanup this later.
  // - @pixelpxed, 06-06-2025
  return (
    <>
      <NavigationBar
        user={user}
        title={tx("orderCard.title", {
          orderNumber: detailedOrder.orderNumber,
        })}
        backEnabled={true}
      />
      <main className="p-3 flex flex-col gap-3">
        <PageLoadTransition className="flex flex-col gap-3">
          {detailedOrder && (
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
                  <DescriptionList data={aboutOrderProps} />
                </DropDownCard>
                <DropDownCard header="Time Log">
                  <div
                    className={`grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 items-center`}
                  >
                    {detailedOrder.statusHistory.map((item) => (
                      <>
                        <p className="text-body-sm opacity-50">
                          {statusTranslation[item.status]}
                        </p>
                        <p className="text-body-md">
                          {getFormattedDateTime(
                            locale,
                            new Date(item.timestamp),
                          )}
                        </p>
                      </>
                    ))}
                  </div>
                </DropDownCard>
              </LabelGroup>
              <LabelGroup header="Note to Shop">
                <div
                  className={cn(
                    `p-3 bg-surface-container border border-outline rounded-lg`,
                  )}
                >
                  <p className="text-body-md">
                    {detailedOrder.notes ?? (
                      <span className="opacity-50 italic">
                        No notes provided.
                      </span>
                    )}
                  </p>
                </div>
              </LabelGroup>
            </>
          )}
          <LabelGroup header="Files">
            {detailedOrder &&
              detailedOrder.files.map((file, idx) => (
                <FileDetailHeader
                  filename={file.filename}
                  filesize={file.filesize}
                  filetype={file.filetype}
                  orderId={detailedOrder.id}
                  fileId={file.id}
                  copies={file.copies}
                  key={idx}
                />
              ))}
          </LabelGroup>

          {process.env.NODE_ENV === "development" && (
            <LabelGroup header="Developer Log">
              <div
                className={cn(
                  `p-3 border border-outline bg-surface-container rounded-lg 
              text-body-sm`,
                )}
              >
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
                  {JSON.stringify(detailedOrder)}
                </span>
              </div>
            </LabelGroup>
          )}
        </PageLoadTransition>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  // TODO: translations
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
  ]);

  const queryClient = new QueryClient();
  const sessionToken = `session_token=${context.req.cookies["session_token"]}`;
  const signedIn = await prefetchUser(queryClient, sessionToken);
  if (signedIn) {
    const orderId = context.query.id;
    if (typeof orderId !== "string") return { notFound: true };
    await prefetchDetailedOrder(queryClient, orderId, sessionToken);

    return { props: { locale, translations, orderId } };
  } else return { redirect: { destination: "/", permanent: false } };
};

export default OrderDetailsPage;
