import NavigationBar from "@/components/common/NavigationBar";
import { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/components/common/Button";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import LabelGroup from "@/components/common/LabelGroup";

const NewOrderPage = () => {
  const router = useRouter();

  console.log(router.query.stage);

  const [orderStage, setOrderStage] = useState("review");

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
        <p>New order page contents here.</p>
        <p>{contextURL[orderStage]}</p>
        <LabelGroup header="state">
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
