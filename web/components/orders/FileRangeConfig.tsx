import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import LabelGroup from "@/components/common/LabelGroup";
import MaterialIcon from "@/components/common/MaterialIcon";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import NumberInput from "@/components/common/input/NumberInput";
import SelectInput from "@/components/common/input/SelectInput";
import TextInput from "@/components/common/input/TextInput";
import useToggle from "@/hooks/useToggle";
import { cn } from "@/utils";
import type { FileRangeCreate, PaperVariant } from "@/utils/types/backend";
import type { UploadedDraftFile, Uuid } from "@/utils/types/common";
import { AnimatePresence, motion } from "motion/react";
import {
  type Dispatch,
  type FC,
  type SetStateAction,
  useCallback,
  useState,
} from "react";

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
 * A configuration panel for a single print range within a file.
 *
 * This component allows users to define specific printing options for a
 * selected page range, such as paper type, color, orientation, and number of
 * copies. It's a controlled component that reads from and writes to a parent
 * state object (`draftFiles`).
 *
 * @param props.open           Controls the expanded/collapsed state of the
 *                             panel.
 * @param props.setOpen        The state setter function to toggle the `open`
 *                             state.
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
  open,
  setOpen,
  fileId,
  rangeKey,
  paperVariants,
  draftFiles,
  setDraftFiles,
}) => {
  const [pageRangeType, setPageRangeType] = useState("All Pages");
  const [showDeleteRangeConfirmation, toggleShowDeleteRangeConfirmation] =
    useToggle();

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
    <>
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-lg border border-outline",
        )}
      >
        <SegmentedGroup
          className={cn(
            "rounded-none rounded-t-lg border-none bg-surface-container",
            !open && "rounded-b-lg",
          )}
        >
          <SelectInput
            value={{ type: pageRangeType }}
            onChange={(value) => {
              setPageRangeType(value.type);
              if (value.type === "Range") {
                setRangeField({ range: null });
              }
            }}
            displayKey="type"
            matchKey="type"
            options={[{ type: "All Pages" }, { type: "Range" }]}
            className="w-72 !border-r !border-outline"
            appearance="inset"
          />
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
            errorMessage="Invalid"
            className={cn(
              "w-full border-none bg-background transition-opacity",
              pageRangeType !== "Range" && "opacity-0",
            )}
          />
          <div
            className="cursor-pointer"
            onClick={() => toggleShowDeleteRangeConfirmation(true)}
          >
            <MaterialIcon icon="delete" className="text-error" />
          </div>
          <div className="cursor-pointer" onClick={() => setOpen(!open)}>
            <MaterialIcon
              icon="arrow_drop_up"
              className={cn(
                "transition-all duration-250",
                open && "rotate-180",
              )}
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
                <div
                  className={`
                    flex flex-col gap-2 rounded-b-lg border-t border-outline
                    bg-surface-container p-3
                  `}
                >
                  <LabelGroup header="Paper Type">
                    <SelectInput
                      value={
                        paperVariants.find(
                          (variant) =>
                            variant.id === currentRange.paperVariantId,
                        )!
                      }
                      onChange={(value) =>
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
      <AnimatePresence>
        {showDeleteRangeConfirmation && (
          <Dialog
            title="Delete Range"
            desc="Are you sure you want to delete this range? This action can't be undone!"
            setClickOutside={() => toggleShowDeleteRangeConfirmation()}
            className="z-100"
          >
            <Button
              appearance="tonal"
              onClick={() => toggleShowDeleteRangeConfirmation(false)}
            >
              Nevermind
            </Button>
            <Button appearance="filled">Delete</Button>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
};

export default FileRangeConfig;
