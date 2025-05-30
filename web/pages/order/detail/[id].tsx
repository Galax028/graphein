import OrderCard from "@/components/glance/OrderCard";
import DropDownCard from "@/components/common/DropDownCard";
import LabelGroup from "@/components/common/LabelGroup";
import NavigationBar from "@/components/common/NavigationBar";
import cn from "@/utils/helpers/cn";
import getDateTimeString from "@/utils/helpers/getDateTimeString";
import getLoggedInUser from "@/utils/helpers/getLoggedInUser";
import { getOrderStatusFromTimestamp } from "@/utils/helpers/getOrderStatusFromTimestamp";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import DescriptionList from "@/components/common/DescriptionList";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";

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
        }
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
            createdTimestamp.getMonth()
          ).padStart(
            2,
            "0"
          )}${createdTimestamp.getFullYear()}-${detailedState.data.orderNumber.replace(
            /\-/g,
            ""
          )}`
        : "-",
    },
  ];
  const timeLogProps = [
    {
      title: "Reviewing",
      content: detailedState.data
        ? getDateTimeString(
            new Date(getOrderStatusFromTimestamp(detailedState, "reviewing"))
          )
        : "-",
    },
    {
      title: "Printing",
      content: detailedState.data
        ? getDateTimeString(
            new Date(getOrderStatusFromTimestamp(detailedState, "processing"))
          )
        : "-",
    },
    {
      title: "Pickup",
      content: detailedState.data
        ? getDateTimeString(
            new Date(getOrderStatusFromTimestamp(detailedState, "ready"))
          )
        : "-",
    },
    {
      title: detailedState.data
        ? getOrderStatusFromTimestamp(detailedState, "rejected")
          ? "Rejected"
          : getOrderStatusFromTimestamp(detailedState, "cancelled")
          ? "Cancelled"
          : "Completed"
        : "Completed",
      content: detailedState.data
        ? detailedState.data.statusHistory?.rejected
          ? getDateTimeString(
              new Date(getOrderStatusFromTimestamp(detailedState, "rejected"))
            )
          : detailedState.data.statusHistory?.cancelled
          ? getDateTimeString(
              new Date(getOrderStatusFromTimestamp(detailedState, "cancelled"))
            )
          : getDateTimeString(
              new Date(getOrderStatusFromTimestamp(detailedState, "completed"))
            )
        : "-",
    },
  ];

  return (
    <>
      <NavigationBar
        title={`Order #${detailedState.data?.orderNumber ?? ""}`}
        backEnabled={true}
        user={user}
      />
      <main className="p-3 flex flex-col gap-3">
        {detailedState.data && (
          <PageLoadTransition className="flex flex-col gap-3">
            {" "}
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
                <DescriptionList data={timeLogProps} />
              </DropDownCard>
            </LabelGroup>
            <LabelGroup header="Note to Shop">
              <div
                className={cn(
                  `p-3 bg-surface-container border border-outline rounded-lg`
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
          </PageLoadTransition>
        )}

        {process.env.NODE_ENV === "development" && (
          <LabelGroup header="Developer Log">
            <div
              className={cn(
                `p-3 border border-outline bg-surface-container rounded-lg 
              text-body-sm`
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
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (req) => {
  const user = await getLoggedInUser(req);

  return { props: { user } };
};

export default OrderDetailsPage;
