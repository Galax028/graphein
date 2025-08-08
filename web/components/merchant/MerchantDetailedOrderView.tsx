import Button from "@/components/common/Button";
import FileDetailHeader from "@/components/orders/FileDetailHeader";
import FileDetailRange from "@/components/orders/FileDetailRange";
import PersonAvatar from "@/components/common/PersonAvatar";
import LoadingPage from "@/components/layout/LoadingPage";
import { useDetailedOrderQuery } from "@/query/fetchDetailedOrder";
import type { Uuid } from "@/utils/types/common";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { type FC } from "react";

type MerchantDetailedOrderViewProps = {
  orderId: Uuid | null;
};

/**
 * Displays a detailed, comprehensive view of a single order.
 *
 * This component is responsible for fetching and rendering all details of a
 * specific order, including customer information, order notes, attached files,
 * and their specific print settings. It handles states for when no order is
 * selected, when data is loading, or when an error occurs.
 *
 * @param props.orderId  The UUID of the order to display. If null, a
 *                       placeholder message is shown.
 */
const MerchantDetailedOrderView: FC<MerchantDetailedOrderViewProps> = ({
  orderId,
}) => {
  const tx = useTranslations("common");

  const { data: order, status } = useDetailedOrderQuery(
    // @ts-expect-error -- Too lazy to modify the function signature
    orderId,
    orderId !== null,
  );

  if (orderId === null)
    return (
      <div
        className={`
          col-span-3 grid place-items-center rounded-lg border border-outline
          bg-surface-container p-2
        `}
      >
        <h1 className="text-body-lg opacity-50 select-none">
          Click on any order from the sidebar to display it here.
        </h1>
      </div>
    );

  if (status === "pending" || status === "error") return <LoadingPage />;

  return (
    <motion.div
      className={`
        col-span-3 flex flex-col gap-px overflow-scroll rounded-lg border
        border-outline bg-outline
      `}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className={`
          flex items-center justify-between bg-surface-container p-2 pl-3
        `}
      >
        <h1>{tx("orderCard.title", { orderNumber: order.orderNumber })}</h1>
        <div className="flex gap-2">
          <Button appearance="tonal">Accept Order</Button>
          <Button className="!border-error text-error" appearance="tonal">
            Reject Order
          </Button>
        </div>
      </div>
      <div className="flex flex-grow gap-px">
        <div className="flex min-w-96 flex-col gap-px">
          <div className="flex flex-col gap-2 bg-surface-container p-3">
            <span className="text-body-sm opacity-50">
              Customer Information
            </span>
            <div className="flex gap-3">
              <PersonAvatar
                profileUrl={order.owner!.profileUrl}
                personName={order.owner!.name}
                size={64}
              />
              <div className="flex flex-col gap-2">chips?</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 bg-surface-container p-3">
            <span className="text-body-sm opacity-50">Order Notes</span>
            <p
              className={order.notes === null ? "italic opacity-50" : undefined}
            >
              {order.notes ?? "No notes."}
            </p>
          </div>
          <div className="flex h-full flex-col gap-2 bg-surface-container p-3">
            <span className="text-body-sm opacity-50">Attached Files</span>
            <div className="flex flex-col gap-1">
              {order.files.map((file) => (
                <FileDetailHeader
                  filename={file.filename}
                  filesize={file.filesize}
                  filetype={file.filetype}
                  orderId={orderId}
                  fileId={file.id}
                  key={file.id}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-grow flex-col gap-2 bg-surface-container p-3">
          <span className="text-body-sm opacity-50">Details</span>
          {order.files.map((file) => (
            <div className="flex flex-col gap-1" key={file.id}>
              <FileDetailHeader
                filename={file.filename}
                filesize={file.filesize}
                filetype={file.filetype}
                orderId={orderId}
                fileId={file.id}
              />
              {file.ranges.map((range) => (
                <FileDetailRange
                  label="page"
                  value={range.range ?? "All pages"}
                  details={[
                    { title: "Paper Size", content: "A4" },
                    { title: "Type", content: "Standard Copy Paper (80 gsm)" },
                    {
                      title: "Colorized",
                      content: range.isColour ? "Color" : "Monochrome",
                    },
                    { title: "Orientation", content: range.paperOrientation },
                    {
                      title: "Double-sided",
                      content: range.isDoubleSided ? "Yes" : "No",
                    },
                    { title: "Copies", content: `${range.copies}` },
                  ]}
                  key={range.range}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MerchantDetailedOrderView;
