import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import PageLoadTransition from "@/components/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import LoadingPage from "@/components/layout/LoadingPage";
import ConfigOrder from "@/components/orders/new/configOrder";
import Review from "@/components/orders/new/review";
import UploadFiles from "@/components/orders/new/upload";
import { prefetchPapers } from "@/query/fetchPapers";
import { prefetchUser } from "@/query/fetchUser";
import checkIsBuildingOrder from "@/utils/helpers/checkIsBuildingOrder";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { APIResponse, Service } from "@/utils/types/backend";
import type {
  DraftFile,
  OrderStage,
  PageProps,
  Uuid,
} from "@/utils/types/common";
import useUserContext from "@/hooks/useUserContext";
import { dehydrate, QueryClient, useMutation } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import { AnimatePresence } from "motion/react";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, type ReactElement, useEffect, useState } from "react";
import useToggle from "@/hooks/useToggle";

const BuildOrderPage: FC<PageProps> = () => {
  const router = useRouter();
  const user = useUserContext();

  const [orderStage, setOrderStage] = useState<OrderStage | null>(null);
  const [draftOrderId, setDraftOrderId] = useState<Uuid | null>(null);
  const [draftOrderExpiry, setDraftOrderExpiry] = useState<Dayjs | null>(null);
  const [draftOrderNotes, setDraftOrderNotes] = useState<
    string | null | undefined
  >(undefined);
  const [draftFiles, setDraftFiles] = useState<DraftFile[] | undefined>(
    undefined,
  );
  const [draftServices, setDraftServices] = useState<Service[] | undefined>(
    undefined,
  );
  const [readyForNextStage, toggleReadyForNextStage] = useToggle();
  const [showDiscardConfirmationDialog, toggleDiscardConfirmationDialog] =
    useToggle();

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_PATH}/orders`, {
        method: "POST",
        credentials: "include",
      });

      const body = (await res.json()) as APIResponse<Uuid>;
      if (body.success) {
        setDraftOrderId(body.data);
        setDraftOrderExpiry(dayjs(body.timestamp).add(15, "minutes"));
        setDraftOrderNotes(null);
        setDraftFiles([]);
        setDraftServices([]);
      } else {
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
      }
    },
  });

  const discardOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${draftOrderId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.status === 204) {
        localStorage.removeItem("draftOrderData");
        localStorage.removeItem("draftOrderExpiry");
        localStorage.removeItem("draftOrderId");
        localStorage.removeItem("orderStage");

        router.push("/glance");
      }
    },
  });

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    window.addEventListener("beforeunload", beforeUnload);

    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

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
        // case "configure-services":
        //   stage = "configServices";
        //   break;
        case "review":
          stage = "review";
          break;
        default:
          router.push("/glance");
          return;
      }

      if (checkIsBuildingOrder()) {
        setOrderStage(stage);
        setDraftOrderId(localStorage.getItem("draftOrderId"));
        setDraftOrderExpiry(dayjs(localStorage.getItem("draftOrderExpiry")));

        const draftOrderData = JSON.parse(
          localStorage.getItem("draftOrderData")!,
        ) as { notes: string | null; files: DraftFile[]; services: Service[] };
        setDraftOrderNotes(draftOrderData.notes);
        setDraftFiles(draftOrderData.files);
        setDraftServices(draftOrderData.services);
      } else {
        setOrderStage(stage);
        createOrderMutation.mutate();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.query.stage],
  );

  // To show that the 15 min order window has expired, and to start a new one then.
  // const expiryString = localStorage.getItem("draftOrderExpiry");
  // const expiryDateFromStorage = expiryString
  //   ? new Date(expiryString)
  //   : new Date();
  // const expirationCalc = (expiryDateFromStorage.getTime() - new Date().getTime() - 1000)
  // setTimeout(
  //   () => {
  //     window.confirm(
  //       "15 mins order limit expired lol, create a new one then...",
  //     );
  //   },
  //   expirationCalc,
  // );

  // console.error(expirationCalc / 1000 / 60, "mins");

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
      draftOrderNotes === undefined ||
      draftFiles === undefined ||
      draftServices === undefined
    )
      return;

    localStorage.setItem(
      "draftOrderData",
      JSON.stringify({
        notes: draftOrderNotes,
        // Do not save `draftFile`s that have not been successfully uploaded,
        // since it they would be impossible to recover after a page refresh.
        files: draftFiles.filter((draftFile) => draftFile.uploaded),
        services: draftServices,
      }),
    );
  }, [draftOrderNotes, draftFiles, draftServices]);

  if (
    orderStage === null ||
    draftOrderId === null ||
    draftOrderExpiry === null ||
    draftFiles === undefined
  )
    return <LoadingPage />;

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
          setReadyForNextStage={toggleReadyForNextStage}
        />
      ),
    },
    configOrder: {
      title: "Configure order",
      backContext: "/order/new/upload",
      href: "/order/new/review",
      component: (
        <ConfigOrder // @ts-expect-error ---
          draftFiles={draftFiles} // @ts-expect-error ---
          setDraftFiles={setDraftFiles}
          setReadyForNextStage={toggleReadyForNextStage}
        />
      ),
    },
    // configServices: {
    //   title: "Add services",
    //   backContext: "/order/new/configure-order",
    //   href: "/order/new/review",
    //   component: <ConfigServices />,
    // },
    review: {
      title: "Review order",
      backContext: "/order/new/configure-order",
      href: "/order/new/review",
      // @ts-expect-error ---
      component: <Review draftFiles={draftFiles} />,
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
        <div className="w-full pb-27" key={orderStage}>
          {stages[orderStage].component}
        </div>
        <div className="fixed px-3 max-w-lg mx-auto left-0 right-0 bottom-3 z-50">
          <div className="flex flex-col gap-2">
            {orderStage === "review" ? (
              <Button
                appearance="filled"
                icon="send"
                disabled={!readyForNextStage}
                onClick={() => alert("send order")}
              >
                Send Order
              </Button>
            ) : readyForNextStage ? (
              // ) : (readyForNextStage || (draftFiles.length != 0 && orderStage === "uploadFiles")) ? (
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
            <Button
              appearance="tonal"
              icon="contract_delete"
              onClick={() => toggleDiscardConfirmationDialog(true)}
            >
              Discard Order
            </Button>
          </div>
        </div>
      </PageLoadTransition>

      <AnimatePresence>
        {showDiscardConfirmationDialog && (
          <Dialog
            title="Discard Order"
            desc="When discarded, all progress made will be lost. Are you sure you want to discard this order? This action can’t be undone!"
            setClickOutside={() => toggleDiscardConfirmationDialog(false)}
          >
            <Button
              appearance="tonal"
              onClick={() => toggleDiscardConfirmationDialog(false)}
            >
              Nevermind
            </Button>
            <Button
              appearance="filled"
              onClick={() => discardOrderMutation.mutate()}
            >
              Discard
            </Button>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
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

    await prefetchPapers(queryClient, sessionToken);

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

export default BuildOrderPage;
