import NavigationBar from "@/components/common/NavigationBar";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import LabelGroup from "@/components/common/LabelGroup";
import { checkBuildingOrderExpired } from "@/utils/helpers/order/new/checkBuildingOrderExpired";

const NewOrderPage = () => {
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
      const isOrderExpired =
        storedOrderCreated && checkBuildingOrderExpired();

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
  }, []);

  console.log(router.query.stage);

  const contextURL: Record<string, string> = {
    upload: "/glance",
    config: "/order/new/upload",
    service: "/order/new/config",
    review: "/order/new/service",
  };

  return (
    <>
      <NavigationBar
        title="New Order"
        backEnabled={true}
        backContextURL={contextURL[orderStage]}
      />
      <main className="flex flex-col gap-2 p-3">
        <p>{JSON.stringify(orderId)}</p>
        <p>{timeDiff} </p>
        <LabelGroup
          header={"Stages / Current Back URL: " + contextURL[orderStage]}
        >
          <SegmentedGroup className="max-w-128">
            <Button
              appearance="tonal"
              onClick={() => {
                setOrderStage("upload");
              }}
            >
              upload
            </Button>
            <Button
              appearance="tonal"
              onClick={() => {
                setOrderStage("config");
              }}
            >
              config
            </Button>
            <Button
              appearance="tonal"
              onClick={() => {
                setOrderStage("service");
              }}
            >
              service
            </Button>
            <Button
              appearance="tonal"
              onClick={() => {
                setOrderStage("review");
              }}
            >
              review
            </Button>
          </SegmentedGroup>
        </LabelGroup>
      </main>
    </>
  );
};

export default NewOrderPage;
