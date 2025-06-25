import Button from "@/components/common/Button";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import cn from "@/utils/helpers/code/cn";
import { checkBuildingOrderExpired } from "@/utils/helpers/order/new/checkBuildingOrderExpired";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const BuildOrderPage = () => {
  const router = useRouter();

  const [orderStage, setOrderStage] = useState("upload");
  const [orderId, setOrderId] = useState<string | null>("");
  const [orderCreated, setOrderCreated] = useState<string | null>("");
  const [timeDiff, setTimeDiff] = useState<number | null>(null);

  useEffect(() => {
    // Creates a request for new order, set returned UUID to 'orderId'
    const postOrders = async () => {
      console.warn("[SKPF] FETCH : POST /orders");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/orders`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();
      setOrderId(data.data);
      setOrderCreated(data.timestamp);

      if (res.ok && typeof window !== "undefined") {
        localStorage.setItem("skpf-buildingOrderId", data.data);
        localStorage.setItem("skpf-buildingOrderCreated", data.timestamp);
      } else {
        console.error(`[${res.status}] ${data.message}`);
        console.warn(`Continuing by getting OrderID from localStorage.`);
        setOrderId(localStorage.getItem("skpf-buildingOrderId"));
      }
    };

    if (typeof window !== "undefined") {
      const storedOrderId = localStorage.getItem("skpf-buildingOrderId");
      const storedOrderCreated = localStorage.getItem(
        "skpf-buildingOrderCreated"
      );
      const isOrderExpired = storedOrderCreated && checkBuildingOrderExpired();

      if (storedOrderId && !isOrderExpired) {
        setOrderId(storedOrderId);
        setOrderCreated(storedOrderCreated);
      } else {
        localStorage.removeItem("skpf-buildingOrderId");
        localStorage.removeItem("skpf-buildingOrderCreated");
        postOrders();
      }

      // Set timeDiff after orderCreated is set
      if (storedOrderCreated) {
        setTimeDiff(
          new Date().getTime() - new Date(storedOrderCreated).getTime()
        );
      } else {
        setTimeDiff(null);
      }
    }

    console.error(orderId, timeDiff);
  }, []);

  useEffect(() => {
    if (typeof router.query.stage === "string") {
      setOrderStage(router.query.stage);
    } else {
      setOrderStage("upload");
    }
  }, [router.query.stage]);

  const contextURL: Record<string, string> = {
    upload: "/glance",
    configure: "/order/new/upload",
    service: "/order/new/configure",
    review: "/order/new/service",
  };

  const futureURL: Record<string, string> = {
    upload: "/order/new/configure",
    configure: "/order/new/service",
    service: "/order/new/review",
    review: "/order/new/review",
  };

  const titleBar: Record<string, string> = {
    upload: "Upload files",
    configure: "Configure order",
    service: "Add services",
    review: "Review order",
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <NavigationBar
        title={titleBar[orderStage]}
        backEnabled={true}
        backContextURL={contextURL[orderStage]}
      />
      <PageLoadTransition className="flex flex-col w-full h-full overflow-auto gap-3 font-mono">
        <div
          className={cn(
            `flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16`
          )}
        >
          {{
            upload: (
              <>
                <Button appearance="tonal" icon="upload">
                  Upload Files
                </Button>
                <p className="text-body-sm opacity-50">
                  You can upload up to 6 files per order. To upload more, start
                  a new order.
                </p>
              </>
            ),
            configure: <>Configure Order</>,
            service: <>Add Services</>,
            review: <>Review Order</>,
          }[orderStage] || null}
        </div>
        <div className="fixed p-3 bottom-0 w-full flex flex-col h-16 max-w-lg">
          <Link href={futureURL[orderStage]}>
            <Button
              appearance="filled"
              icon={orderStage != "review" ? null : "shopping_bag_speed"}
              className="w-full"
            >
              {orderStage != "review" ? "Next" : "Send Order"}
            </Button>
          </Link>
        </div>
      </PageLoadTransition>
    </div>
  );
};

export default BuildOrderPage;
