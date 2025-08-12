import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import MaterialIcon from "@/components/common/MaterialIcon";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import NumberInput from "@/components/common/input/NumberInput";
import SelectInput from "@/components/common/input/SelectInput";
import TextInput from "@/components/common/input/TextInput";
import useDialog from "@/hooks/useDialogContext";
import { cn } from "@/utils";
import isValidRange from "@/utils/helpers/isValidRange";
import type { FileRangeCreate } from "@/utils/types/backend";
import type {
  PaperVariantWithPaperId,
  UploadedDraftFile,
  Uuid,
} from "@/utils/types/common";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useCallback,
  useMemo,
} from "react";

type FileRangeConfigProps = {
  fileId: Uuid;
  rangeKey: Uuid;
  paperVariants: PaperVariantWithPaperId[];
  draftFiles: UploadedDraftFile[];
  setDraftFiles: Dispatch<SetStateAction<UploadedDraftFile[]>>;
};

/**
 * A configuration panel for a single print range within a file.
 *
 * This component allows users to define specific printing options for a
 * selected page range, such as paper type, colour, orientation, and number of
 * copies. It's a controlled component that reads from and writes to a parent
 * state object (`draftFiles`).
 *
 * @param props.fileId         The UUID of the parent file this range belongs
 *                             to.
 * @param props.rangeKey       A unique key identifying this specific range
 *                             config.
 * @param props.paperVariants  An array of available paper variant options.
 * @param props.draftFiles     The main array of all draft file data being
 *                             configured.
 * @param props.setDraftFiles  The state setter to update the `draftFiles`
 *                             array.
 */
const FileRangeConfig: FC<FileRangeConfigProps> = ({
  fileId,
  rangeKey,
  paperVariants,
  draftFiles,
  setDraftFiles,
}) => {
  const tx = useTranslations("common");
  const t = useTranslations("order");
  const dialog = useDialog();

  const setRangeField = useCallback(
    (fields: Partial<FileRangeCreate>) =>
      setDraftFiles((draftFiles) =>
        draftFiles.map((draftFile) =>
          draftFile.draft.id === fileId
            ? {
                ...draftFile,
                draft: {
                  ...draftFile.draft,
                  ranges: draftFile.draft.ranges.map((range) =>
                    range.key === rangeKey ? { ...range, ...fields } : range,
                  ),
                },
              }
            : draftFile,
        ),
      ),
    [fileId, rangeKey, setDraftFiles],
  );

  const deleteRange = useCallback(() => {
    setDraftFiles((draftFiles) =>
      draftFiles.map((draftFile) =>
        draftFile.draft.id === fileId
          ? {
              ...draftFile,
              draft: {
                ...draftFile.draft,
                ranges: draftFile.draft.ranges.filter(
                  (range) => range.key !== rangeKey,
                ),
              },
            }
          : draftFile,
      ),
    );
    dialog.toggle(false);
  }, [dialog, fileId, rangeKey, setDraftFiles]);

  const toggleDeleteDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("common.deleteRange.title"),
        description: t("common.deleteRange.description"),
        content: (
          <>
            <Button appearance="tonal" onClick={() => dialog.toggle(false)}>
              {tx("action.nevermind")}
            </Button>
            <Button appearance="filled" onClick={deleteRange}>
              {t("common.action.deleteRange")}
            </Button>
          </>
        ),
        allowClickOutside: false,
      }),
    [tx, t, dialog, deleteRange],
  );

  const currentFile = useMemo(
    () => draftFiles.find((draftFile) => draftFile.draft.id === fileId)!.draft,
    [draftFiles, fileId],
  );

  const currentRange = useMemo(
    () => currentFile.ranges.find((range) => range.key === rangeKey)!,
    [currentFile.ranges, rangeKey],
  );

  const allPages = useMemo(
    () => currentRange.range === null,
    [currentRange.range],
  );

  const allowedPaperVariants = useMemo(() => {
    if (allPages || currentFile.ranges.length === 1) return paperVariants;

    return paperVariants.filter(
      (variant) =>
        variant.paperId ===
        paperVariants.find(
          (firstRangeVariant) =>
            firstRangeVariant.id === currentFile.ranges[0].paperVariantId,
        )!.paperId,
    );
  }, [paperVariants, currentFile.ranges, allPages]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border border-outline",
      )}
    >
      {/* Range Input Group */}
      <SegmentedGroup
        className={cn(
          "rounded-none rounded-t-lg border-none bg-surface-container",
          !open && "rounded-b-lg",
        )}
      >
        {/* Range Type Selector */}
        <SelectInput
          className="min-w-32 !border-r !border-outline"
          appearance="inset"
          value={{
            allPages,
            text: allPages ? t("range.allPages") : t("range.range"),
          }}
          onChange={(value) =>
            setRangeField({
              range: value.allPages ? null : "",
              rangeIsValid: value.allPages,
            })
          }
          displayKey="text"
          matchKey="allPages"
          options={[
            ...(allPages ||
            (currentFile.ranges.length === 1 && currentRange.range === "")
              ? [{ allPages: true, text: t("range.allPages") }]
              : []),
            { allPages: false, text: t("range.range") },
          ]}
        />
        {/* Range Input */}
        <TextInput
          className={cn(
            "w-full border-none bg-background transition-opacity",
            allPages && "opacity-0",
          )}
          placeholder={t("range.placeholder")}
          value={currentRange.range ?? ""}
          onChange={(event) =>
            setRangeField({
              range: event.target.value,
              rangeIsValid: isValidRange(event.target.value),
            })
          }
          error={!currentRange.rangeIsValid}
          showErrorIcon={true}
          disabled={allPages}
        />
        <div className="cursor-pointer" onClick={toggleDeleteDialog}>
          <MaterialIcon className="text-error" icon="delete" />
        </div>
        <div
          className="cursor-pointer"
          onClick={() => setRangeField({ open: !currentRange.open })}
        >
          <MaterialIcon
            className={cn(
              "transition-all duration-250",
              currentRange.open && "rotate-180",
            )}
            icon="arrow_drop_up"
          />
        </div>
      </SegmentedGroup>
      <div className="overflow-hidden">
        <AnimatePresence initial={false}>
          {currentRange.open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div
                className={`
                  flex flex-col gap-2 rounded-b-lg border-t border-outline
                  bg-surface-container p-3
                `}
              >
                {/* Paper Type */}
                <LabelGroup header={t("paperType")}>
                  <SelectInput
                    value={
                      allowedPaperVariants.find(
                        (variant) => variant.id === currentRange.paperVariantId,
                      )!
                    }
                    onChange={(value) =>
                      setRangeField({ paperVariantId: value.id })
                    }
                    displayKey="displayName"
                    matchKey="id"
                    options={allowedPaperVariants}
                  />
                </LabelGroup>
                {/* Colour Mode */}
                <LabelGroup header={t("colour.header")}>
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={!currentRange.isColour}
                      onClick={() => setRangeField({ isColour: false })}
                    >
                      {t("colour.monochrome")}
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={currentRange.isColour}
                      onClick={() => setRangeField({ isColour: true })}
                    >
                      {t("colour.colour")}
                    </Button>
                  </SegmentedGroup>
                </LabelGroup>
                {/* Paper Orientation */}
                <LabelGroup header={t("orientation.header")}>
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={currentRange.paperOrientation === "portrait"}
                      onClick={() =>
                        setRangeField({ paperOrientation: "portrait" })
                      }
                    >
                      {t("orientation.portrait")}
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={currentRange.paperOrientation === "landscape"}
                      onClick={() =>
                        setRangeField({ paperOrientation: "landscape" })
                      }
                    >
                      {t("orientation.landscape")}
                    </Button>
                  </SegmentedGroup>
                </LabelGroup>
                {/* Number of Copies */}
                <LabelGroup header={t("copies")}>
                  <NumberInput
                    value={currentRange.copies.toString()}
                    onChange={(value) =>
                      setRangeField({ copies: parseInt(value) })
                    }
                    min={1}
                    max={99}
                  />
                </LabelGroup>
                {/* Sides */}
                <LabelGroup header={t("sides.header")}>
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={!currentRange.isDoubleSided}
                      onClick={() => setRangeField({ isDoubleSided: false })}
                    >
                      {t("sides.single")}
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={currentRange.isDoubleSided}
                      onClick={() => setRangeField({ isDoubleSided: true })}
                    >
                      {t("sides.double")}
                    </Button>
                  </SegmentedGroup>
                </LabelGroup>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FileRangeConfig;
