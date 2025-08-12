import TreeViewContainer from "@/components/common/tree/TreeViewContainer";
import TreeViewWrapper from "@/components/common/tree/TreeViewWrapper";
import LoadingPage from "@/components/layout/LoadingPage";
import FileDetailHeader from "@/components/orders/FileDetailHeader";
import FileDetailRange from "@/components/orders/FileDetailRange";
import { usePapersQuery } from "@/query/fetchPapers";
import { mimeToExt } from "@/utils";
import type { UploadedDraftFile, Uuid } from "@/utils/types/common";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { useEffect, useMemo, type FC } from "react";

type ReviewProps = {
  draftOrderId: Uuid;
  draftFiles: UploadedDraftFile[];
};

const Review: FC<ReviewProps> = ({ draftOrderId, draftFiles }) => {
  const router = useRouter();
  const t = useTranslations("order");

  const { data: papers, status } = usePapersQuery();
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

  useEffect(
    () => {
      if (!router.isReady) return;

      if (
        draftFiles.length === 0 ||
        draftFiles.some((draftFile) => !draftFile.uploaded)
      )
        router.push("/order/new/upload");

      if (draftFiles.some((draftFile) => draftFile.draft.ranges.length === 0))
        router.push("/order/new/configure-order");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draftFiles],
  );

  if (status === "pending" || status === "error" || paperVariants === undefined)
    return <LoadingPage />;

  return (
    <div className="flex flex-col gap-2">
      {draftFiles.map((draftFile) => (
        <section key={draftFile.key}>
          <TreeViewContainer>
            <FileDetailHeader
              appendExt={false}
              filename={draftFile.name}
              filesize={draftFile.size}
              filetype={mimeToExt(draftFile.type)}
              orderId={draftOrderId}
              fileId={draftFile.draft.id}
            />
          </TreeViewContainer>
          <TreeViewWrapper index={1}>
            {draftFile.draft.ranges.map((range, idx) => {
              const paperVariant = paperVariants.find(
                (variant) => variant.id === range.paperVariantId,
              )!;

              return (
                <TreeViewContainer
                  index={1}
                  isLast={idx === draftFile.draft.ranges.length - 1}
                  key={range.key}
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
    </div>
  );
};

export default Review;
