import Button from "@/components/common/Button";
import PageLoadTransition from "@/components/common/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import ConfigOrder from "@/components/orders/new/configOrder";
import ConfigServices from "@/components/orders/new/configServices";
import Review from "@/components/orders/new/review";
import UploadFiles, { type DraftFile } from "@/components/orders/new/upload";
import checkIsBuildingOrder from "@/utils/helpers/order/new/checkIsBuildingOrder";
import type { APIResponse, Service } from "@/utils/types/backend";
import {
  type OrderStage,
  type PageProps,
  type Uuid,
} from "@/utils/types/common";
import useUserContext from "@/utils/useUserContext";
import dayjs, { type Dayjs } from "dayjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, type ReactElement, useEffect, useState } from "react";

const BuildOrderPage: FC<PageProps> = () => {
  const router = useRouter();
  const user = useUserContext();

  const [orderStage, setOrderStage] = useState<OrderStage | null>(null);
  const [draftOrderId, setDraftOrderId] = useState<Uuid | null>(null);
  const [draftOrderExpiry, setDraftOrderExpiry] = useState<Dayjs | null>(null);
  const [draftOrderNotes, setDraftOrderNotes] = useState<string | null>(null);
  const [draftFiles, setDraftFiles] = useState<DraftFile[]>([]);
  const [draftServices, setDraftServices] = useState<Service[]>([]);
  const [readyForNextStage, setReadyForNextStage] = useState(false);

  useEffect(
    () => {
      if (!router.isReady) return;
      if (typeof router.query.stage !== "string") {
        router.push("/glance");
        return;
      }

      let stage: OrderStage;
      switch (router.query.stage) {
        case "upload":
          stage = "uploadFiles";
          break;
        case "configure-order":
          stage = "configOrder";
          break;
        case "configure-services":
          stage = "configServices";
          break;
        case "review":
          stage = "review";
          break;
        default:
          router.push("/glance");
          return;
      }

      const createDraftOrder = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/orders`, {
          method: "POST",
          credentials: "include",
        });

        const body = (await res.json()) as APIResponse<Uuid>;
        if (body.success) {
          setDraftOrderId(body.data);
          setDraftOrderExpiry(dayjs(body.timestamp).add(15, "minutes"));
          localStorage.setItem(
            "draftOrderData",
            JSON.stringify({ notes: null, files: [], services: [] }),
          );
        } else {
          throw new Error(
            `Uncaught API Error (${body.error}): ${body.message}`,
          );
        }
      };

      if (checkIsBuildingOrder()) {
        setOrderStage(localStorage.getItem("orderStage") as OrderStage);
        setDraftOrderId(localStorage.getItem("draftOrderId"));
        setDraftOrderExpiry(dayjs(localStorage.getItem("draftOrderExpiry")));

        const draftOrderData = JSON.parse(
          localStorage.getItem("draftOrderData")!,
        ) as { notes: string | null; files: DraftFile[]; services: Service[] };
        console.log("stored data: ", draftOrderData);
        setDraftOrderNotes(draftOrderData.notes);
        setDraftFiles(draftOrderData.files);
        setDraftServices(draftOrderData.services);
      } else {
        setOrderStage(stage);
        createDraftOrder();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.query.stage],
  );

  useEffect(() => {
    if (orderStage !== null) localStorage.setItem("orderStage", orderStage);
  }, [orderStage]);

  useEffect(() => {
    if (draftOrderId !== null)
      localStorage.setItem("draftOrderId", draftOrderId);
  }, [draftOrderId]);

  useEffect(() => {
    if (draftOrderExpiry !== null)
      localStorage.setItem("draftOrderExpiry", draftOrderExpiry.toISOString());
  }, [draftOrderExpiry]);

  useEffect(() => {
    if (
      draftOrderNotes === null &&
      draftFiles.length === 0 &&
      draftServices.length === 0
    )
      return;

    const updatedData = {
      ...JSON.parse(localStorage.getItem("draftOrderData")!),
      notes: draftOrderNotes,
      files: draftFiles,
      services: draftServices,
    };

    localStorage.setItem("draftOrderData", JSON.stringify(updatedData));
    console.log("set to localStorage: ", updatedData);
  }, [draftOrderNotes, draftFiles, draftServices]);

  // TODO: Loading again...
  if (orderStage === null || draftOrderId === null || draftOrderExpiry === null)
    return <></>;

  const stages: {
    [K in OrderStage]: {
      title: string;
      backContext: string;
      href: string;
      component: ReactElement;
    };
  } = {
    uploadFiles: {
      title: "Upload files",
      backContext: "/glance",
      href: "/order/new/configure-order",
      component: (
        <UploadFiles
          orderId={draftOrderId}
          draftFiles={draftFiles}
          setDraftFiles={setDraftFiles}
          setReadyForNextStage={setReadyForNextStage}
        />
      ),
    },
    configOrder: {
      title: "Configure order",
      backContext: "/order/new/upload",
      href: "/order/new/configure-services",
      component: <ConfigOrder />,
    },
    configServices: {
      title: "Add services",
      backContext: "/order/new/configure-order",
      href: "/order/new/review",
      component: <ConfigServices />,
    },
    review: {
      title: "Review order",
      backContext: "/order/new/configure-services",
      href: "/order/new/review",
      component: <Review />,
    },
  } as const;

  return (
    <div className="flex flex-col h-dvh">
      <NavigationBar
        user={user}
        title={stages[orderStage].title}
        backEnabled={true}
        backContextURL={stages[orderStage].backContext}
      />
      <PageLoadTransition className="flex flex-col w-full h-full gap-3 font-mono">
        <PageLoadTransition key={orderStage}>
          {stages[orderStage].component}
        </PageLoadTransition>

        <div className="fixed p-3 bottom-0 left-0 right-0 w-full flex flex-col h-16 max-w-lg z-10">
          {orderStage === "review" ? (
            <Button
              appearance="filled"
              icon="shopping_bag_speed"
              className="w-full"
              disabled={!readyForNextStage}
              onClick={() => alert("send order")}
            >
              Send Order
            </Button>
          ) : readyForNextStage ? (
            <Link href={stages[orderStage].href}>
              <Button appearance="filled" className="w-full">
                Next
              </Button>
            </Link>
          ) : (
            <Button appearance="filled" className="w-full" disabled={true}>
              Next
            </Button>
          )}
        </div>
      </PageLoadTransition>
    </div>
  );
};

export default BuildOrderPage;
