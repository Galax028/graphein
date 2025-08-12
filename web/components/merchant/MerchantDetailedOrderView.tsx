import MaterialIcon from "@/components/common/MaterialIcon";
import PersonAvatar from "@/components/common/PersonAvatar";
import TreeViewContainer from "@/components/common/tree/TreeViewContainer";
import TreeViewWrapper from "@/components/common/tree/TreeViewWrapper";
import LoadingPage from "@/components/layout/LoadingPage";
import Chip from "@/components/merchant/Chip";
import DetailedViewHeader from "@/components/merchant/DetailedViewHeader";
import FileDetailHeader from "@/components/orders/FileDetailHeader";
import FileDetailRange from "@/components/orders/FileDetailRange";
import { useDetailedOrderQuery } from "@/query/fetchDetailedOrder";
import { usePapersQuery } from "@/query/fetchPapers";
import type { APIResponse, FileDownload } from "@/utils/types/backend";
import type { Uuid } from "@/utils/types/common";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo, type FC } from "react";

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
  const t = useTranslations("merchantGlance");
  const to = useTranslations("order");

  const { data: papers } = usePapersQuery();
  const paperVariants = useMemo(() => {
    if (papers === undefined) return;
    return papers.flatMap((paper) =>
      paper.variants.map((variant) => ({
        ...variant,
        paperId: paper.id,
        paperName: paper.name,
      })),
    );
  }, [papers]);

  const { data: order, status: detailedOrderStatus } = useDetailedOrderQuery(
    // @ts-expect-error -- Too lazy to modify the function signature
    orderId,
    orderId !== null,
  );

  const { data: fileDownloads } = useQuery({
    queryKey: ["fileDownloads", orderId],
    queryFn: async () => {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_PATH + `/orders/${orderId}/files`,
        { method: "GET", credentials: "include" },
      );

      const body = (await response.json()) as APIResponse<FileDownload[]>;
      if (body.success) {
        return body.data;
      } else
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);
    },
    enabled:
      orderId !== null &&
      detailedOrderStatus === "success" &&
      ["reviewing", "processing", "ready"].includes(order.status),
  });

  if (orderId === null)
    return (
      <div
        className={`
          col-span-3 grid place-items-center rounded-lg border border-outline
          bg-surface-container
        `}
      >
        <h1 className="text-body-lg opacity-50 select-none">
          {t("details.empty")}
        </h1>
      </div>
    );

  if (
    detailedOrderStatus === "pending" ||
    detailedOrderStatus === "error" ||
    paperVariants === undefined ||
    order.owner === undefined ||
    !order.owner.isOnboarded ||
    order.owner.role === "merchant"
  )
    return (
      <div
        className={`
          col-span-3 grid place-items-center rounded-lg border border-outline
          bg-surface-container
          *:!h-full
        `}
      >
        <LoadingPage />
      </div>
    );

  return (
    <motion.div
      className={`
        col-span-3 flex flex-col overflow-y-scroll rounded-lg border
        border-outline
      `}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Sticky Header */}
      <DetailedViewHeader order={order} />
      {/* Detailed View */}
      <div className="flex grow gap-px bg-outline">
        {/* Sidebar */}
        <div className="flex w-96 flex-col gap-px">
          {/* Customer Information */}
          <div className="flex flex-col gap-2 bg-surface-container p-3">
            <span className="text-body-sm opacity-50 select-none">
              {t("details.owner.header")}
            </span>
            <div className="flex gap-3">
              <PersonAvatar
                className="shrink-0"
                profileUrl={order.owner.profileUrl}
                personName={order.owner.name}
                size={64}
              />
              <div className="flex flex-col gap-2">
                <span>{order.owner.name}</span>
                <div className="flex grow flex-wrap gap-1">
                  <Chip
                    appearance="filled"
                    text={t(`details.owner.role.${order.owner.role}`)}
                  />
                  {order.owner.role === "student" && (
                    <Chip
                      text={
                        `${tx("userSettings.class")} ${order.owner.class} ` +
                        `/ ${tx("userSettings.no")} ${order.owner.classNo}`
                      }
                    />
                  )}
                  <Chip text={order.owner.tel.toString()} />
                  <Chip text={order.owner.email} />
                </div>
              </div>
            </div>
          </div>
          {/* Notes */}
          <div className="flex flex-col gap-2 bg-surface-container p-3">
            <span className="text-body-sm opacity-50 select-none">
              {t("details.note")}
            </span>
            <p
              className={
                order.notes === null
                  ? "italic opacity-50 select-none"
                  : undefined
              }
            >
              {order.notes ?? to("note.empty")}
            </p>
          </div>
          {/* Files Download */}
          <div className="flex h-full flex-col gap-2 bg-surface-container p-3">
            <span className="text-body-sm opacity-50">
              {to("details.files")}
            </span>
            <div className="flex flex-col gap-1">
              {order.files.map((file) => (
                <FileDetailHeader
                  filename={file.filename}
                  filesize={file.filesize}
                  filetype={file.filetype}
                  button={
                    fileDownloads !== undefined ? (
                      <a
                        className="grid cursor-pointer place-items-center"
                        href={
                          fileDownloads.find(
                            (download) => download.id === file.id,
                          )!.url
                        }
                        target="_blank"
                        rel="noopener"
                      >
                        <MaterialIcon icon="download" />
                      </a>
                    ) : undefined
                  }
                  orderId={orderId}
                  fileId={file.id}
                  key={file.id}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Order Details */}
        <div className="flex grow flex-col gap-2 bg-surface-container p-3">
          <span className="text-body-sm opacity-50">{t("details.header")}</span>
          {order.files.map((file) => (
            <section key={file.id}>
              <TreeViewContainer>
                <FileDetailHeader
                  filename={file.filename}
                  filesize={file.filesize}
                  filetype={file.filetype}
                  orderId={orderId}
                  fileId={file.id}
                />
              </TreeViewContainer>
              <TreeViewWrapper index={1}>
                {file.ranges.map((range, idx) => {
                  const paperVariant = paperVariants.find(
                    (variant) => variant.id === range.paperVariantId,
                  )!;

                  return (
                    <TreeViewContainer
                      index={1}
                      isLast={idx === file.ranges.length - 1}
                      onSurface={true}
                      key={range.id}
                    >
                      <FileDetailRange
                        label="page"
                        value={range.range ?? to("range.allPages")}
                        details={[
                          {
                            title: to("paperType"),
                            content: paperVariant.paperName,
                          },
                          {
                            title: to("paperVariant"),
                            content: paperVariant.name,
                          },
                          {
                            title: to("colour.header"),
                            content: range.isColour
                              ? to("colour.colour")
                              : to("colour.monochrome"),
                          },
                          {
                            title: to("orientation.header"),
                            content:
                              range.paperOrientation === "portrait"
                                ? to("orientation.portrait")
                                : to("orientation.landscape"),
                          },
                          {
                            title: to("sides.header"),
                            content: range.isDoubleSided
                              ? to("sides.double")
                              : to("sides.single"),
                          },
                          {
                            title: to("copies"),
                            content: range.copies.toString(),
                          },
                        ]}
                        expand={true}
                      />
                    </TreeViewContainer>
                  );
                })}
              </TreeViewWrapper>
            </section>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MerchantDetailedOrderView;
