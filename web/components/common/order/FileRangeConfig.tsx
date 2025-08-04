import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import MaterialIcon from "@/components/common/MaterialIcon";
import NumberInput from "@/components/common/NumberInput";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import SelectInput from "@/components/common/SelectInput";
import TextInput from "@/components/common/TextInput";
import cn from "@/utils/helpers/cn";
import { FileRangeCreate, PaperVariant } from "@/utils/types/backend";
import type { UploadedDraftFile, Uuid } from "@/utils/types/common";
import { AnimatePresence, motion } from "motion/react";
import { type Dispatch, type FC, SetStateAction, useCallback } from "react";

type FileRangeConfigProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  fileId: Uuid;
  rangeKey: Uuid;
  paperVariants: PaperVariant[];
  draftFiles: UploadedDraftFile[];
  setDraftFiles: Dispatch<SetStateAction<UploadedDraftFile[]>>;
};

/**
 * The file range detail data collector.
 *
 * @param fileIdx       The file index for this range. (Required)
 * @param collapsed     The default collapsed state of the box. (Default false)
 */
const FileRangeConfig: FC<FileRangeConfigProps> = ({
  open,
  setOpen,
  fileId,
  rangeKey,
  paperVariants,
  draftFiles,
  setDraftFiles,
}) => {
  const setRangeField = useCallback(
    (fields: Partial<FileRangeCreate>) =>
      setDraftFiles((draftFiles) =>
        (draftFiles as UploadedDraftFile[]).map((draftFile) =>
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

  const currentRange = draftFiles
    .find((draftFile) => draftFile.draft.id === fileId)!
    .draft.ranges.find((range) => range.key === rangeKey)!;

  return (
    <div className="flex flex-col border border-outline rounded-lg">
      <SegmentedGroup
        className={cn(
          "bg-surface-container border-none rounded-none rounded-t-lg",
          !open && "rounded-b-lg",
        )}
      >
        <div className="text-body-md grid place-items-center">Range</div>
        <TextInput
          value={currentRange.range ?? ""}
          onChange={(event) =>
            setRangeField({
              range: event.target.value === "" ? null : event.target.value,
            })
          }
          placeholder="e.g. 1-5, 8, 11-13"
          error={
            currentRange.range !== null
              ? !/^(\s*\d+\s*(-\s*\d+\s*)?)(,\s*\d+\s*(-\s*\d+\s*)?)*$/.test(
                  currentRange.range,
                )
              : false
          }
          showErrorIcon={true}
          className="w-full bg-background"
        />
        <div className="cursor-pointer" onClick={() => setOpen(!open)}>
          <MaterialIcon
            icon="arrow_drop_up"
            className={cn("transition-all duration-250", open && "rotate-180")}
          />
        </div>
      </SegmentedGroup>
      <div className="overflow-hidden">
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex flex-col gap-2 bg-surface-container p-3 border-t border-outline rounded-b-lg">
                <LabelGroup header="Paper Type">
                  <SelectInput
                    value={
                      paperVariants.find(
                        (variant) => variant.id === currentRange.paperVariantId,
                      )!
                    }
                    onChange={(value: PaperVariant) =>
                      setRangeField({ paperVariantId: value.id })
                    }
                    displayKey="name"
                    matchKey="id"
                    options={paperVariants}
                  />
                </LabelGroup>
                <LabelGroup header="Color">
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={!currentRange.isColour}
                      onClick={() => setRangeField({ isColour: false })}
                    >
                      Monochrome
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={currentRange.isColour}
                      onClick={() => setRangeField({ isColour: true })}
                    >
                      Colour
                    </Button>
                  </SegmentedGroup>
                </LabelGroup>
                <LabelGroup header="Orientation">
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={currentRange.paperOrientation === "portrait"}
                      onClick={() =>
                        setRangeField({ paperOrientation: "portrait" })
                      }
                    >
                      Portrait
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={currentRange.paperOrientation === "landscape"}
                      onClick={() =>
                        setRangeField({ paperOrientation: "landscape" })
                      }
                    >
                      Landscape
                    </Button>
                  </SegmentedGroup>
                </LabelGroup>
                <LabelGroup header="Copies">
                  <NumberInput
                    value={currentRange.copies}
                    onChange={(value) => setRangeField({ copies: value })}
                    min={0}
                    max={99}
                  />
                </LabelGroup>
                <LabelGroup header="Sides">
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={!currentRange.isDoubleSided}
                      onClick={() => setRangeField({ isDoubleSided: false })}
                    >
                      Single-sided
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={currentRange.isDoubleSided}
                      onClick={() => setRangeField({ isDoubleSided: true })}
                    >
                      Double-sided
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
