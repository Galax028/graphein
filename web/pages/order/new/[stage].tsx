import Button from "@/components/common/Button";
import LoadingPage from "@/components/layout/LoadingPage";
import ConfigOrder from "@/components/orders/new/configOrder";
import Review from "@/components/orders/new/review";
import UploadFiles from "@/components/orders/new/upload";
import useDialog from "@/hooks/useDialogContext";
import useLocalStorage, { deserializeAsString } from "@/hooks/useLocalStorage";
import { useNavbarContext } from "@/hooks/useNavbarContext";
import useToggle from "@/hooks/useToggle";
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
import { dehydrate, QueryClient, useMutation } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  type FC,
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const BuildOrderPage: FC<PageProps> = () => {
  const router = useRouter();
  const { setNavbar } = useNavbarContext();
  const dialog = useDialog();

  const [orderStage, setOrderStage, unsetOrderStage] =
    useLocalStorage<OrderStage>("orderStage", deserializeAsString);
  const [draftOrderId, setDraftOrderId, unsetDraftOrderId] =
    useLocalStorage<Uuid>("draftOrderId", deserializeAsString);
  const [draftOrderExpiry, setDraftOrderExpiry, unsetDraftOrderExpiry] =
    useLocalStorage(
      "draftOrderExpiry",
      useCallback((value: string) => dayjs(value), []),
      useCallback((value: Dayjs) => value.toISOString(), []),
    );
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
        unsetOrderStage();
        unsetDraftOrderId();
        unsetDraftOrderExpiry();
        localStorage.removeItem("draftOrderData");

        router.push("/glance");
      }
    },
  });

  const toggleDiscardDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: "Discard Order",
        description:
          "When discarded, all progress made will be lost. Are you sure you want to discard this order? This action can’t be undone!",
        content: (
          <>
            <Button appearance="tonal" onClick={() => dialog.toggle(false)}>
              Nevermind
            </Button>
            <Button
              appearance="filled"
              onClick={() => discardOrderMutation.mutate()}
            >
              Discard
            </Button>
          </>
        ),
        allowClickOutside: false,
      }),
    [dialog, discardOrderMutation],
  );

  const stages: {
    [K in OrderStage]: {
      title: string;
      backContext: string;
      href: string;
      component: ReactElement;
    };
  } = useMemo(
    () => ({
      uploadFiles: {
        title: "Upload files",
        backContext: "/glance",
        href: "/order/new/configure-order",
        component: (
          <UploadFiles // @ts-expect-error ---
            orderId={draftOrderId} // @ts-expect-error ---
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
    }),
    [draftOrderId, draftFiles, toggleReadyForNextStage],
  );

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

      setNavbar({
        title: stages[stage].title,
        backEnabled: true,
        backContextURL: stages[stage].backContext,
      });
      if (checkIsBuildingOrder()) {
        setOrderStage(stage);
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
    [router.query.stage, setNavbar, setOrderStage],
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
    if (
      draftOrderNotes === undefined ||
      draftFiles === undefined ||
      draftServices === undefined
    )
      return;

    // Do not save `draftFile`s that have not been successfully uploaded, since
    // it would be impossible to recover them after a page refresh.
    const nextDraftFiles = draftFiles.filter((draftFile) => draftFile.uploaded);
    if (nextDraftFiles.length !== 0) toggleReadyForNextStage(true);

    localStorage.setItem(
      "draftOrderData",
      JSON.stringify({
        notes: draftOrderNotes,

        files: nextDraftFiles,
        services: draftServices,
      }),
    );
  }, [draftOrderNotes, draftFiles, draftServices, toggleReadyForNextStage]);

  if (
    orderStage === null ||
    draftOrderId === null ||
    draftOrderExpiry === null ||
    draftOrderNotes === undefined ||
    draftFiles === undefined ||
    draftServices === undefined
  )
    return <LoadingPage />;

  return (
    <>
      <div className="w-full pb-27" key={orderStage}>
        {stages[orderStage].component}
      </div>
      <div className="fixed right-0 bottom-3 left-0 z-50 mx-auto max-w-lg">
        <div className="flex flex-col gap-2 px-3">
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
            <Link href={stages[orderStage].href}>
              <Button appearance="filled" className="w-full">
                Next
              </Button>
            </Link>
          ) : (
            <Button appearance="filled" disabled={true}>
              Next
            </Button>
          )}
          <Button
            appearance="tonal"
            icon="contract_delete"
            onClick={toggleDiscardDialog}
          >
            Discard Order
          </Button>
        </div>
      </div>
    </>
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
