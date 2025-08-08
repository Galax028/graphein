import Button from "@/components/common/Button";
import MaterialIcon from "@/components/common/MaterialIcon";
import FileRangeConfig from "@/components/orders/FileRangeConfig";
import LoadingPage from "@/components/layout/LoadingPage";
import useToggle from "@/hooks/useToggle";
import { usePapersQuery } from "@/query/fetchPapers";
import cn from "@/utils/helpers/cn";
import getFormattedFilesize from "@/utils/helpers/getFormattedFilesize";
import type { UploadedDraftFile, Uuid } from "@/utils/types/common";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/router";
import { useEffect, type Dispatch, type FC, type SetStateAction } from "react";

type ConfigOrderProps = {
  draftFiles: UploadedDraftFile[];
  setDraftFiles: Dispatch<SetStateAction<UploadedDraftFile[]>>;
  setReadyForNextStage: Dispatch<SetStateAction<boolean>>;
};

const ConfigOrder: FC<ConfigOrderProps> = ({
  draftFiles,
  setDraftFiles,
  setReadyForNextStage,
}) => {
  const router = useRouter();

  const { data: papers, status } = usePapersQuery();

  const [open, toggleOpen] = useToggle(true);

  useEffect(
    () => {
      if (!router.isReady) return;

      if (
        draftFiles.length === 0 ||
        draftFiles.some((draftFile) => !draftFile.uploaded)
      )
        router.push("/order/new/upload");
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draftFiles],
  );

  if (status === "pending" || status === "error") return <LoadingPage />;

  const paperVariants = papers.flatMap((paper) =>
    paper.variants.map((variant) => ({
      ...variant,
      name: `${paper.name} - ${variant.name}`,
    })),
  );

  const addRange = (fileId: Uuid) => {
    setReadyForNextStage(false);
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
                    range: null,
                    copies: 1,
                    paperVariantId: papers
                      .find((paper) => paper.isDefault)!
                      .variants.find((variant) => variant.isDefault)!.id,
                    paperOrientation: "portrait",
                    isColour: false,
                    isDoubleSided: false,
                  },
                ],
              },
            }
          : draftFile,
      ) as UploadedDraftFile[];
      setReadyForNextStage(true);

      return newDraftFiles;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {draftFiles.map((draftFile) => (
        <div
          key={draftFile.key}
          className={cn(
            `flex flex-col bg-surface-container border border-outline p-2 rounded-lg`,
          )}
        >
          <div
            className="flex gap-3 items-center pr-1 cursor-pointer"
            onClick={toggleOpen}
          >
            {/* TODO: Add thumbnail */}
            <div className="w-16 h-16 bg-outline rounded-sm animate-pulse"></div>
            <div className="flex flex-col gap-1 grow">
              <p>{draftFile.name}</p>
              <p className="opacity-50 text-body-sm">
                PDF • {getFormattedFilesize(draftFile.size)}
              </p>
            </div>
            <button className="grid place-items-center">
              <MaterialIcon
                icon="arrow_drop_down"
                className={cn(
                  "transition-all duration-250",
                  open && "rotate-180",
                )}
              />
            </button>
          </div>
          <div className="overflow-hidden">
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  className="flex flex-col gap-2 mt-2"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {draftFile.draft.ranges.map((range) => (
                    <FileRangeConfig
                      open={true}
                      setOpen={() => {}}
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
                    onClick={() => addRange(draftFile.draft.id)}
                  >
                    Add range
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
