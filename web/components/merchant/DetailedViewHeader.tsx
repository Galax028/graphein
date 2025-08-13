import Button from "@/components/common/Button";
import NumberInput from "@/components/common/input/NumberInput";
import LabelGroup from "@/components/common/LabelGroup";
import useDialog from "@/hooks/useDialogContext";
import type {
  APIResponse,
  DetailedOrder,
  FailedAPIResponse,
  OrderStatusUpdate,
} from "@/utils/types/backend";
import type { OrderStatus } from "@/utils/types/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState, type FC, type ReactNode } from "react";

type DetailedViewHeaderProps = {
  order: DetailedOrder;
};

const DetailedViewHeader: FC<DetailedViewHeaderProps> = ({ order }) => {
  const tx = useTranslations("common");
  const t = useTranslations("merchantGlance");
  const dialog = useDialog();
  const queryClient = useQueryClient();

  const [price, setPrice] = useState<number | undefined>(undefined);

  const changeOrderStatusMutation = useMutation({
    mutationFn: async (price: number | undefined = undefined) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${order.id}/status`,
        {
          method: "POST",
          credentials: "include",
          ...(price !== undefined
            ? {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ price }),
              }
            : {}),
        },
      );

      const body = (await res.json()) as APIResponse<OrderStatusUpdate>;
      if (body.success) {
        dialog.toggle(false);
        setPrice(undefined);
        queryClient.invalidateQueries({ queryKey: ["merchantOrdersGlance"] });
        queryClient.invalidateQueries({
          queryKey: ["detailedOrder", order.id],
        });
        if (["completed", "rejected", "cancelled"].includes(body.data.status))
          queryClient.removeQueries({
            queryKey: ["fileDownloads", order.id],
          });
      } else
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
    },
  });

  const toggleAcceptOrderDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("acceptOrder.title"),
        description: t("acceptOrder.description"),
        content: (
          <div className="flex w-full flex-col gap-1">
            <LabelGroup header={t("acceptOrder.price")}>
              <NumberInput
                min={1}
                value={price?.toString()}
                onChange={(value) => setPrice(parseInt(value))}
              />
            </LabelGroup>
            <div className="flex w-full gap-1 [&>button]:w-full">
              <Button
                appearance="tonal"
                disabled={changeOrderStatusMutation.isPending}
                onClick={() => dialog.toggle(false)}
              >
                {tx("action.nevermind")}
              </Button>
              <Button
                appearance="filled"
                busy={changeOrderStatusMutation.isPending}
                onClick={() => changeOrderStatusMutation.mutate(price)}
              >
                {t("details.action.accept")}
              </Button>
            </div>
          </div>
        ),
        allowClickOutside: false,
      }),
    [t, tx, dialog, price, changeOrderStatusMutation],
  );

  const toggleChangeOrderStatusDialog = useCallback(
    (namespace: string) =>
      dialog.setAndToggle({
        title: t(`${namespace}.title`),
        description: t(`${namespace}.description`),
        content: (
          <>
            <Button
              appearance="tonal"
              disabled={changeOrderStatusMutation.isPending}
              onClick={() => dialog.toggle(false)}
            >
              {tx("action.nevermind")}
            </Button>
            <Button
              appearance="filled"
              busy={changeOrderStatusMutation.isPending}
              onClick={() => changeOrderStatusMutation.mutate(undefined)}
            >
              {t("details.action.accept")}
            </Button>
          </>
        ),
        allowClickOutside: false,
      }),
    [t, tx, dialog, changeOrderStatusMutation],
  );

  const rejectOrderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${order.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        const body = (await res.json()) as FailedAPIResponse;
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
      }

      dialog.toggle(false);
      queryClient.invalidateQueries({ queryKey: ["merchantOrdersGlance"] });
      queryClient.invalidateQueries({ queryKey: ["detailedOrder", order.id] });
      queryClient.removeQueries({
        queryKey: ["fileDownloads", order.id],
      });
    },
  });

  const toggleRejectOrderDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("rejectOrder.title"),
        description: t("rejectOrder.description"),
        content: (
          <>
            <Button
              appearance="tonal"
              disabled={rejectOrderMutation.isPending}
              onClick={() => dialog.toggle(false)}
            >
              {tx("action.nevermind")}
            </Button>
            <Button
              appearance="filled"
              busy={rejectOrderMutation.isPending}
              onClick={() => rejectOrderMutation.mutate()}
            >
              {t("details.action.reject")}
            </Button>
          </>
        ),
        allowClickOutside: false,
      }),
    [t, tx, dialog, rejectOrderMutation],
  );

  const states: { [K in OrderStatus]: ReactNode } = useMemo(
    () => ({
      reviewing: (
        <>
          <Button appearance="tonal" onClick={toggleAcceptOrderDialog}>
            {t("details.action.accept")}
          </Button>
          <Button
            className="!border-error text-error"
            appearance="tonal"
            onClick={toggleRejectOrderDialog}
          >
            {t("details.action.reject")}
          </Button>
        </>
      ),
      processing: (
        <>
          {order.price && (
            <span className="text-body-md opacity-50 select-none">
              {order.price} THB
            </span>
          )}
          <Button
            className="!border-success text-success"
            appearance="tonal"
            onClick={() => toggleChangeOrderStatusDialog("markAsReady")}
          >
            {t("details.action.markAsReady")}
          </Button>
        </>
      ),
      ready: (
        <>
          {order.price && (
            <span className="text-body-md opacity-50 select-none">
              {order.price} THB
            </span>
          )}
          <Button
            className="!border-success text-success"
            appearance="tonal"
            onClick={() => toggleChangeOrderStatusDialog("markAsDone")}
          >
            {t("details.action.markAsDone")}
          </Button>
        </>
      ),
      completed: order.price && (
        <span className="text-body-md opacity-50 select-none">
          {order.price} THB
        </span>
      ),
      rejected: order.price && (
        <span className="text-body-md opacity-50 select-none">
          {order.price} THB
        </span>
      ),
      cancelled: order.price && (
        <span className="text-body-md opacity-50 select-none">
          {order.price} THB
        </span>
      ),
    }),
    [
      order.price,
      t,
      toggleAcceptOrderDialog,
      toggleChangeOrderStatusDialog,
      toggleRejectOrderDialog,
    ],
  );

  return (
    <div
      className={`
        sticky top-0 z-100 flex items-center justify-between border-b
        border-outline bg-surface-container p-2 pl-3
      `}
    >
      <h1>{tx("orderCard.title", { orderNumber: order.orderNumber })}</h1>
      <div className="flex items-center gap-2">{states[order.status]}</div>
    </div>
  );
};

export default DetailedViewHeader;
