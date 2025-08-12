import Button from "@/components/common/Button";
import TextInput from "@/components/common/input/TextInput";
import LabelGroup from "@/components/common/LabelGroup";
import LoadingPage from "@/components/layout/LoadingPage";
import ConfigOrder from "@/components/orders/new/ConfigOrder";
import Review from "@/components/orders/new/Review";
import UploadFiles from "@/components/orders/new/UploadFiles";
import useDialog from "@/hooks/useDialogContext";
import useLocalStorage, { deserializeAsString } from "@/hooks/useLocalStorage";
import { useNavbarContext } from "@/hooks/useNavbarContext";
import useToggle from "@/hooks/useToggle";
import { prefetchPapers } from "@/query/fetchPapers";
import { prefetchUser } from "@/query/fetchUser";
import { cn } from "@/utils";
import checkIsBuildingOrder from "@/utils/helpers/checkIsBuildingOrder";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type {
  APIResponse,
  DetailedOrder,
  Service,
} from "@/utils/types/backend";
import type {
  DraftFile,
  OrderStage,
  PageProps,
  UploadedDraftFile,
  Uuid,
} from "@/utils/types/common";
import {
  dehydrate,
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import type { GetServerSideProps } from "next";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  type Dispatch,
  type FC,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const BuildOrderPage: FC<PageProps> = () => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations("order");
  const { setNavbar } = useNavbarContext();
  const dialog = useDialog();
  const queryClient = useQueryClient();

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

  const sendOrderMutation = useMutation({
    mutationFn: async () => {
      if (
        draftOrderNotes === undefined ||
        draftFiles === undefined ||
        draftServices === undefined
      )
        throw new Error("Reached unreachable statement");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${draftOrderId}/build`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notes: draftOrderNotes,
            files: draftFiles.map((draftFile) => draftFile.draft),
            services: draftServices,
          }),
        },
      );

      const body = (await res.json()) as APIResponse<DetailedOrder>;
      if (body.success) return body.data;
      else
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
    },
    onSuccess: (detailedOrder: DetailedOrder) => {
      dialog.toggle(false);
      unsetOrderStage();
      unsetDraftOrderId();
      unsetDraftOrderExpiry();
      localStorage.removeItem("draftOrderData");
      queryClient.setQueryData(
        ["detailedOrder", detailedOrder.id],
        detailedOrder,
      );

      router.push("/glance");
      router.push(`/order/detail/${detailedOrder.id}`);
    },
  });

  const toggleSendOrderDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("common.sendOrder.title"),
        description: t("common.sendOrder.description"),
        content: (
          <>
            <Button
              appearance="tonal"
              disabled={sendOrderMutation.isPending}
              onClick={() => dialog.toggle(false)}
            >
              {tx("action.nevermind")}
            </Button>
            <Button
              appearance="filled"
              busy={sendOrderMutation.isPending}
              onClick={() => sendOrderMutation.mutate()}
            >
              {t("common.action.sendOrder")}
            </Button>
          </>
        ),
        allowClickOutside: false,
      }),
    [tx, t, dialog, sendOrderMutation],
  );

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
    onSuccess: () => dialog.toggle(false),
  });

  const toggleDiscardDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("common.discardOrder.title"),
        description: t("common.discardOrder.description"),
        content: (
          <>
            <Button
              appearance="tonal"
              disabled={discardOrderMutation.isPending}
              onClick={() => dialog.toggle(false)}
            >
              {tx("action.nevermind")}
            </Button>
            <Button
              appearance="filled"
              busy={discardOrderMutation.isPending}
              onClick={() => discardOrderMutation.mutate()}
            >
              {t("common.action.discardOrder")}
            </Button>
          </>
        ),
        allowClickOutside: false,
      }),
    [tx, t, dialog, discardOrderMutation],
  );

  const toggleTimeoutDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("common.timeout.title"),
        description: t("common.timeout.description"),
        content: (
          <>
            <Button
              appearance="tonal"
              onClick={() => {
                dialog.toggle(false);
                unsetOrderStage();
                unsetDraftOrderId();
                unsetDraftOrderExpiry();
                localStorage.removeItem("draftOrderData");

                router.push("/glance");
              }}
            >
              {t("common.action.backToGlance")}
            </Button>
            <Button
              appearance="filled"
              onClick={() => {
                dialog.toggle(false);
                unsetOrderStage();
                unsetDraftOrderId();
                unsetDraftOrderExpiry();
                localStorage.removeItem("draftOrderData");

                router.push("/glance");
                router.push("/order/new/upload");
              }}
            >
              {t("common.action.startOver")}
            </Button>
          </>
        ),
        allowClickOutside: false,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, dialog, unsetOrderStage, unsetDraftOrderId, unsetDraftOrderExpiry],
  );

  const stages: {
    [K in OrderStage]: {
      title: string;
      backContext: string;
      href: string;
      component: ReactNode;
    };
  } = useMemo(
    () => ({
      uploadFiles: {
        title: t("common.stage.uploadFiles"),
        backContext: "/glance",
        href: "/order/new/configure-order",
        component: (
          <UploadFiles
            draftOrderId={draftOrderId as Uuid}
            draftFiles={draftFiles as DraftFile[]}
            setDraftFiles={setDraftFiles}
            toggleReadyForNextStage={toggleReadyForNextStage}
          />
        ),
      },
      configOrder: {
        title: t("common.stage.configOrder"),
        backContext: "/order/new/upload",
        href: "/order/new/review",
        component: (
          <ConfigOrder
            draftOrderId={draftOrderId as Uuid}
            draftFiles={draftFiles as UploadedDraftFile[]}
            setDraftFiles={
              setDraftFiles as Dispatch<SetStateAction<UploadedDraftFile[]>>
            }
            toggleReadyForNextStage={toggleReadyForNextStage}
          />
        ),
      },
      // configServices: {
      //   title: t("common.stage.configService"),
      //   backContext: "/order/new/configure-order",
      //   href: "/order/new/review",
      //   component: <ConfigServices />,
      // },
      review: {
        title: t("common.stage.review"),
        backContext: "/order/new/configure-order",
        href: "/order/new/review",
        component: (
          <Review
            draftOrderId={draftOrderId as string}
            draftFiles={draftFiles as UploadedDraftFile[]}
          />
        ),
      },
    }),
    [t, draftOrderId, draftFiles, toggleReadyForNextStage],
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

  useEffect(() => {
    let timeoutId: number | undefined = undefined;
    if (timeoutId === undefined && draftOrderExpiry === null) return;
    if (timeoutId === undefined && draftOrderExpiry !== null) {
      timeoutId = window.setTimeout(
        toggleTimeoutDialog,
        draftOrderExpiry.subtract(10, "seconds").valueOf() - dayjs().valueOf(),
      );
    }

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [draftOrderExpiry, toggleTimeoutDialog]);

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
        showUser: true,
      });
      if (checkIsBuildingOrder()) {
        setOrderStage(stage);
        const draftOrderData = JSON.parse(
          localStorage.getItem("draftOrderData")!,
        ) as { notes: string | null; files: DraftFile[]; services: Service[] };
        setDraftOrderNotes(draftOrderData.notes);
        setDraftFiles(draftOrderData.files);
        setDraftServices(draftOrderData.services);
      } else if (stage === "uploadFiles") {
        setOrderStage(stage);
        createOrderMutation.mutate();
      } else {
        router.push("/glance");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [router.query.stage, setNavbar, setOrderStage],
  );

  useEffect(
    () => {
      if (
        draftOrderNotes === undefined ||
        draftFiles === undefined ||
        draftServices === undefined
      )
        return;

      // Do not save `draftFile`s that have not been successfully uploaded,
      // since it would be impossible to recover them after a page refresh.
      const nextDraftFiles = draftFiles.filter(
        (draftFile) => draftFile.uploaded,
      );
      if (
        orderStage === "uploadFiles" &&
        nextDraftFiles.length !== 0 &&
        draftFiles.length === nextDraftFiles.length
      )
        toggleReadyForNextStage(true);
      else if (orderStage === "configOrder")
        toggleReadyForNextStage(
          nextDraftFiles.every(
            (draftFile) =>
              draftFile.draft.ranges.length !== 0 &&
              draftFile.draft.ranges.every((range) => range.rangeIsValid),
          ),
        );

      localStorage.setItem(
        "draftOrderData",
        JSON.stringify({
          notes: draftOrderNotes,
          files: nextDraftFiles,
          services: draftServices,
        }),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draftOrderNotes, draftFiles, draftServices, toggleReadyForNextStage],
  );

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
      <div
        className={orderStage === "review" ? "pb-45" : "pb-24"}
        key={orderStage}
      >
        {stages[orderStage].component}
      </div>
      <div
        className={cn(
          `
            fixed right-0 bottom-0 left-0 z-50 mx-auto flex max-w-lg flex-col
            gap-2 p-3
          `,
          orderStage === "review" &&
            "border-t border-outline bg-surface-container",
        )}
      >
        {orderStage === "review" ? (
          <>
            <LabelGroup header={t("note.header")}>
              <TextInput
                placeholder={t("note.placeholder")}
                value={draftOrderNotes ?? ""}
                onChange={(event) =>
                  setDraftOrderNotes(
                    event.target.value !== "" ? event.target.value : null,
                  )
                }
              />
            </LabelGroup>
            <Button
              appearance="filled"
              icon="send"
              disabled={!readyForNextStage}
              busy={sendOrderMutation.isPending}
              onClick={toggleSendOrderDialog}
            >
              {t("common.action.sendOrder")}
            </Button>
          </>
        ) : readyForNextStage ? (
          <Link href={stages[orderStage].href}>
            <Button appearance="filled" className="w-full">
              {tx("action.next")}
            </Button>
          </Link>
        ) : (
          <Button appearance="filled" disabled={true}>
            {tx("action.next")}
          </Button>
        )}
        <Button
          appearance="tonal"
          icon="contract_delete"
          disabled={sendOrderMutation.isPending}
          onClick={toggleDiscardDialog}
        >
          {t("common.action.discardOrder")}
        </Button>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context,
) => {
  const [locale, translations] = await getServerSideTranslations(context.req, [
    "common",
    "order",
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
