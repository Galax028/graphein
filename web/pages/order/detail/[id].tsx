import DescriptionList from "@/components/common/DescriptionList";
import DropDownCard from "@/components/common/DropDownCard";
import FileDetailHeader from "@/components/common/FileDetailHeader";
import LabelGroup from "@/components/common/LabelGroup";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/glance/OrderCard";
import cn from "@/utils/helpers/cn";
import getDateTimeString from "@/utils/helpers/common/getDateTimeString";
import getLoggedInUser from "@/utils/helpers/common/getLoggedInUser";
import type { DetailedOrder, User } from "@/utils/types/backend";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { OrderStatus } from "@/utils/types/common";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { type FC, useEffect, useState } from "react";

type OrderDetailsPageProps = {
  user: User;
};

const OrderDetailsPage: FC<OrderDetailsPageProps> = ({ user }) => {
  const router = useRouter();
  const tx = useTranslations("common")

  const [detailedOrder, setDetailedOrder] = useState<DetailedOrder | null>(
    null,
  );

  useEffect(() => {
    if (!router.isReady) return;

    const fetchDetailedOrder = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${router.query.id}`,
        {
          credentials: "include",
        },
      );

      const body = await res.json();
      setDetailedOrder(body.data);
    };

    fetchDetailedOrder();
  }, [router]);

  if (!detailedOrder) return <></>;

  // Rename pls!!!!
  const createdTimestamp = new Date(detailedOrder.createdAt);
  const aboutOrderProps = [
    {
      title: "Created",
      content: getDateTimeString(createdTimestamp),
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
        title={tx("orderCard.title", { orderNumber: detailedOrder.orderNumber ?? "" })}
        backEnabled={true}
        user={user}
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
                          {getDateTimeString(new Date(item.timestamp))}
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
                  fileName={file.filename}
                  fileSize={file.filesize}
                  fileType={file.filetype}
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
  ]);

  return { props: { locale, translations } };
};

export default OrderDetailsPage;
