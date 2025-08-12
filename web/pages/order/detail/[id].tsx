import DescriptionList from "@/components/common/DescriptionList";
import DropDownCard from "@/components/common/DropDownCard";
import LabelGroup from "@/components/common/LabelGroup";
import TreeViewContainer from "@/components/common/tree/TreeViewContainer";
import TreeViewWrapper from "@/components/common/tree/TreeViewWrapper";
import LoadingPage from "@/components/layout/LoadingPage";
import FileDetailHeader from "@/components/orders/FileDetailHeader";
import FileDetailRange from "@/components/orders/FileDetailRange";
import OrderCard from "@/components/orders/OrderCard";
import { useNavbar } from "@/hooks/useNavbarContext";
import {
  prefetchDetailedOrder,
  useDetailedOrderQuery,
} from "@/query/fetchDetailedOrder";
import { usePapersQuery } from "@/query/fetchPapers";
import { prefetchThumbnail } from "@/query/fetchThumbnail";
import { prefetchUser } from "@/query/fetchUser";
import { cn } from "@/utils";
import getFormattedDateTime from "@/utils/helpers/getFormattedDateTime";
import getServerSideTranslations from "@/utils/helpers/serverSideTranslations";
import type { OrderStatus, PageProps, Uuid } from "@/utils/types/common";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { GetServerSideProps } from "next";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useMemo, type FC } from "react";

const OrderDetailsPage: FC<{ orderId: Uuid } & PageProps> = ({ orderId }) => {
  const locale = useLocale();
  const tx = useTranslations("common");
  const t = useTranslations("order");

  const { data: detailedOrder, status } = useDetailedOrderQuery(orderId);
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

  useNavbar(
    useCallback(
      () => ({
        title: tx("orderCard.title", {
          orderNumber: detailedOrder?.orderNumber ?? "",
        }),
        backEnabled: true,
      }),
      [tx, detailedOrder],
    ),
  );

  const aboutOrder = useMemo(() => {
    if (detailedOrder === undefined) return;

    const createdAt = dayjs(detailedOrder.createdAt);
    return [
      {
        title: tx("orderCard.created"),
        content: getFormattedDateTime(locale, createdAt.toDate()),
      },
      {
        title: tx("orderCard.price"),
        content: detailedOrder.price?.toString() ?? "--",
      },
      {
        title: tx("orderCard.orderId"),
        content:
          createdAt.format(`YYYYMMDD-`) +
          detailedOrder.orderNumber.replace(/-/g, ""),
      },
    ];
  }, [locale, tx, detailedOrder]);

  const statusTranslation: Record<OrderStatus, string> = useMemo(
    () => ({
      reviewing: tx("orderCard.status.reviewing"),
      processing: tx("orderCard.status.processing"),
      ready: tx("orderCard.status.ready"),
      completed: tx("orderCard.status.completed"),
      rejected: tx("orderCard.status.rejected"),
      cancelled: tx("orderCard.status.cancelled"),
    }),
    [tx],
  );

  if (
    status === "pending" ||
    status === "error" ||
    paperVariants === undefined ||
    aboutOrder === undefined
  )
    return <LoadingPage />;

  return (
    <>
      <LabelGroup header={t("details.yourOrder")}>
        <OrderCard
          status={detailedOrder.status}
          orderNumber={detailedOrder.orderNumber}
          createdAt={detailedOrder.createdAt}
          filesCount={detailedOrder.files.length}
          options={{
            showProgressBar: true,
          }}
        />
        <DropDownCard header={t("details.about")}>
          <DescriptionList list={aboutOrder} />
        </DropDownCard>
        <DropDownCard header={t("details.history")}>
          <DescriptionList
            list={detailedOrder.statusHistory.map((item) => ({
              title: statusTranslation[item.status],
              content: getFormattedDateTime(locale, new Date(item.timestamp)),
            }))}
          />
        </DropDownCard>
      </LabelGroup>
      <LabelGroup header={t("note.header")}>
        <div
          className={cn(
            `rounded-lg border border-outline bg-surface-container p-3`,
          )}
        >
          <p className="text-body-md">
            {detailedOrder.notes ?? (
              <span className="italic opacity-50 select-none">
                {t("note.empty")}
              </span>
            )}
          </p>
        </div>
      </LabelGroup>
      <LabelGroup header={t("details.files")}>
        {detailedOrder &&
          detailedOrder.files.map((file) => (
            <section key={file.id}>
              <TreeViewContainer>
                <FileDetailHeader
                  filename={file.filename}
                  filesize={file.filesize}
                  filetype={file.filetype}
                  orderId={detailedOrder.id}
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
                      key={range.id}
                    >
                      <FileDetailRange
                        label="page"
                        value={range.range ?? t("range.allPages")}
                        details={[
                          {
                            title: t("paperType"),
                            content: paperVariant.paperName,
                          },
                          {
                            title: t("paperVariant"),
                            content: paperVariant.name,
                          },
                          {
                            title: t("colour.header"),
                            content: range.isColour
                              ? t("colour.colour")
                              : t("colour.monochrome"),
                          },
                          {
                            title: t("orientation.header"),
                            content:
                              range.paperOrientation === "portrait"
                                ? t("orientation.portrait")
                                : t("orientation.landscape"),
                          },
                          {
                            title: t("sides.header"),
                            content: range.isDoubleSided
                              ? t("sides.double")
                              : t("sides.single"),
                          },
                          {
                            title: t("copies"),
                            content: range.copies.toString(),
                          },
                        ]}
                      />
                    </TreeViewContainer>
                  );
                })}
              </TreeViewWrapper>
            </section>
          ))}
      </LabelGroup>
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

    const orderId = context.query.id;
    if (typeof orderId !== "string") return { notFound: true };
    const detailedOrder = await prefetchDetailedOrder(
      queryClient,
      orderId,
      sessionToken,
    );
    await Promise.all(
      detailedOrder.files.map((file) =>
        prefetchThumbnail(queryClient, orderId, file.id, sessionToken),
      ),
    );

    return {
      props: {
        locale,
        translations,
        dehydratedState: dehydrate(queryClient),
        orderId,
      },
    };
  }

  return { redirect: { destination: "/", permanent: false } };
};

export default OrderDetailsPage;
