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
import type { OrderStatus } from "@/utils/types/common";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type OrderDetailsPageProps = {
  user: any;
};

const OrderDetailsPage = ({ user }: OrderDetailsPageProps) => {
  const router = useRouter();

  const [detailedState, setDetailedState] = useState<any>({});
  useEffect(() => {
    const fetchDetailedOrder = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${router.query.id}`,
        {
          credentials: "include",
        },
      );

      const data = await res.json();
      setDetailedState(data);
    };

    fetchDetailedOrder();
  }, []);

  // Rename pls!!!!
  const createdTimestamp = new Date(detailedState.data?.createdAt);
  const aboutOrderProps = [
    {
      title: "Created",
      content: detailedState.data ? getDateTimeString(createdTimestamp) : "-",
    },
    {
      title: "Price",
      content: detailedState.data?.price ?? "-",
    },
    {
      title: "Order ID",
      content: detailedState.data
        ? `${String(createdTimestamp.getDate()).padStart(2, "0")}${String(
            createdTimestamp.getMonth(),
          ).padStart(
            2,
            "0",
          )}${createdTimestamp.getFullYear()}-${detailedState.data.orderNumber.replace(
            /-/g,
            "",
          )}`
        : "-",
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
        title={`Order ${
          detailedState.data ? `#${detailedState.data?.orderNumber}` : "Details"
        }`}
        backEnabled={true}
        user={user}
      />
      <main className="p-3 flex flex-col gap-3">
        <PageLoadTransition className="flex flex-col gap-3">
          {detailedState.data && (
            <>
              <LabelGroup header="Your Order">
                <OrderCard
                  status={detailedState.data?.status ?? "unknown"}
                  orderNumber={detailedState.data?.orderNumber}
                  createdAt={detailedState.data?.createdAt}
                  filesCount={detailedState.data?.files.length}
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
                    {detailedState.data.statusHistory.map(
                      (i: { timestamp: string; status: string }) => (
                        <>
                          <p className="text-body-sm opacity-50">
                            {statusTranslation[i.status as OrderStatus]}
                          </p>
                          <p className="text-body-md">
                            {getDateTimeString(new Date(i.timestamp))}
                          </p>
                        </>
                      ),
                    )}
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
                    {detailedState.data?.notes ?? (
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
            {detailedState.data &&
              detailedState.data.files.map((i: any) => (
                <FileDetailHeader
                  fileName={i.filename}
                  fileSize={i.filesize}
                  fileType={i.filetype}
                  orderId={detailedState.data.id}
                  fileId={i.id}
                  copies={i.copies}
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
                  {JSON.stringify(detailedState)}
                </span>
              </div>
            </LabelGroup>
          )}
        </PageLoadTransition>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (req) => {
  const user = await getLoggedInUser(req);

  return { props: { user } };
};

export default OrderDetailsPage;
