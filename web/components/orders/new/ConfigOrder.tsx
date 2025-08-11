import Button from "@/components/common/Button";
import MaterialIcon from "@/components/common/MaterialIcon";
import LoadingPage from "@/components/layout/LoadingPage";
import FileDetailHeader from "@/components/orders/FileDetailHeader";
import FileRangeConfig from "@/components/orders/FileRangeConfig";
import type { ToggleDispatch } from "@/hooks/useToggle";
import { usePapersQuery } from "@/query/fetchPapers";
import { cn, mimeToExt } from "@/utils";
import type { UploadedDraftFile, Uuid } from "@/utils/types/common";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import {
  useCallback,
  useEffect,
  useMemo,
  type Dispatch,
  type FC,
  type SetStateAction,
} from "react";

type ConfigOrderProps = {
  draftOrderId: Uuid;
  draftFiles: UploadedDraftFile[];
  setDraftFiles: Dispatch<SetStateAction<UploadedDraftFile[]>>;
  toggleReadyForNextStage: ToggleDispatch;
};

/**
 * A component for configuring the details of all uploaded files.
 *
 * @param props.draftOrderId             The UUID of the parent order.
 * @param props.draftFiles               The array of files that have been
 *                                       uploaded and are being configured.
 * @param props.setDraftFiles            The state setter function to update the
 *                                       `draftFiles` array.
 * @param props.toggleReadyForNextStage  A state setter to indicate if the
 *                                       configuration is valid for the next
 *                                       stage.
 */
const ConfigOrder: FC<ConfigOrderProps> = ({
  draftOrderId,
  draftFiles,
  setDraftFiles,
  toggleReadyForNextStage,
}) => {
  const router = useRouter();
  const t = useTranslations("order");

  const { data: papers, status } = usePapersQuery();
  const paperVariants = useMemo(() => {
    if (papers === undefined) return;
    return papers.flatMap((paper) =>
      paper.variants.map((variant) => ({
        ...variant,
        paperId: paper.id,
        isDefaultSize: paper.isDefault,
        displayName: `${paper.name} - ${variant.name}`,
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
        toggleReadyForNextStage(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draftFiles],
  );

  const toggleDraftFileOpen = useCallback(
    (draftFileId: Uuid) =>
      setDraftFiles((draftFiles) =>
        draftFiles.map((draftFile) =>
          draftFile.draft.id === draftFileId
            ? { ...draftFile, open: !draftFile.open }
            : draftFile,
        ),
      ),
    [setDraftFiles],
  );

  const addRange = useCallback(
    (fileId: Uuid) => {
      if (papers === undefined || paperVariants === undefined) return;

      toggleReadyForNextStage(false);
      setDraftFiles((draftFiles) => {
        const newDraftFiles = draftFiles.map((draftFile) =>
          draftFile.draft.id === fileId
            ? {
                ...draftFile,
                draft: {
                  ...draftFile.draft,
                  ranges: [
                    ...draftFile.draft.ranges,
                    {
                      key: window.crypto.randomUUID(),
                      open: true,
                      range: draftFile.draft.ranges.length === 0 ? null : "",
                      rangeIsValid: draftFile.draft.ranges.length === 0,
                      copies: 1,
                      paperVariantId: paperVariants.find((variant) =>
                        draftFile.draft.ranges.length === 0
                          ? variant.isDefaultSize
                          : variant.id ===
                            draftFile.draft.ranges[0].paperVariantId,
                      )!.id,
                      paperOrientation: "portrait",
                      isColour: false,
                      isDoubleSided: false,
                    },
                  ],
                },
              }
            : draftFile,
        ) satisfies UploadedDraftFile[];
        toggleReadyForNextStage(true);

        return newDraftFiles;
      });
    },
    [setDraftFiles, toggleReadyForNextStage, papers, paperVariants],
  );

  if (status === "pending" || status === "error" || paperVariants === undefined)
    return <LoadingPage />;

  return (
    <div className="flex flex-col gap-2">
      {draftFiles.map((draftFile) => (
        <div
          key={draftFile.key}
          className={cn(
            `
              flex flex-col rounded-lg border border-outline
              bg-surface-container p-2
            `,
          )}
        >
          <FileDetailHeader
            slim={true}
            appendExt={false}
            filename={draftFile.name}
            filesize={draftFile.size}
            filetype={mimeToExt(draftFile.type)}
            button={
              <button className="grid place-items-center">
                <MaterialIcon
                  className={cn(
                    "transition-all duration-250",
                    draftFile.open && "rotate-180",
                  )}
                  icon="arrow_drop_down"
                />
              </button>
            }
            orderId={draftOrderId}
            fileId={draftFile.draft?.id}
            onClick={() => toggleDraftFileOpen(draftFile.draft.id)}
          />
          {/* File Detail Body */}
          <div className="overflow-hidden">
            <AnimatePresence initial={false}>
              {draftFile.open && (
                <motion.div
                  className="mt-2 flex flex-col gap-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {/* File Detail Ranges */}
                  {draftFile.draft.ranges.map((range) => (
                    <FileRangeConfig
                      fileId={draftFile.draft.id}
                      rangeKey={range.key}
                      paperVariants={paperVariants}
                      draftFiles={draftFiles as UploadedDraftFile[]}
                      setDraftFiles={setDraftFiles}
                      key={range.key}
                    />
                  ))}
                  <Button
                    appearance="tonal"
                    icon="add"
                    disabled={draftFile.draft.ranges.some(
                      (range) => range.range === null,
                    )}
                    onClick={() => addRange(draftFile.draft.id)}
                  >
                    {t("common.action.addRange")}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConfigOrder;
