import Button from "@/components/common/Button";
import LabelGroup from "@/components/common/LabelGroup";
import MaterialIcon from "@/components/common/MaterialIcon";
import NumberInput from "@/components/common/NumberInput";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import TextInput from "@/components/common/TextInput";
import cn from "@/utils/helpers/cn";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import SelectInput from "@/components/common/SelectInput";

/**
 * The file range detail data collector.
 * 
 * @param index         The file index for this range. (Required)
 * @param collapsed     The default collapsed state of the box. (Default false)
 */

type OrderRangeProps = {
  // config: FileConfig;
  index: number;
  collapsed?: boolean;
};

const PaperTypesMock = {
  success: true,
  timestamp: "2025-08-03T13:33:31.447895358Z",
  message: null,
  data: [
    {
      id: 1,
      name: "A4",
      length: 297,
      width: 210,
      isDefault: true,
      variants: [
        {
          id: 1,
          name: "Standard Copy Paper (80 gsm.)",
          isDefault: true,
          isAvailable: true,
          isLaminatable: true,
        },
      ],
    },
    {
      id: 5,
      name: "A3",
      length: 420,
      width: 297,
      isDefault: false,
      variants: [
        {
          id: 6,
          name: "Standard Copy Paper (80 gsm.)",
          isDefault: true,
          isAvailable: true,
          isLaminatable: true,
        },
        {
          id: 7,
          name: "Drawing Paper (200 gsm.)",
          isDefault: false,
          isAvailable: true,
          isLaminatable: true,
        },
      ],
    },
  ],
  error: null,
  pagination: null,
};

const OrderRange = ({ collapsed = false }: OrderRangeProps) => {
  const [rangeCollapsed, setRangeCollapsed] = useState(collapsed);

  // TODO: These types aren't passed up to parent yet.
  //       Depends on how parent's data would like to be collected.
  const [textInput, setTextInput] = useState("");
  const [paperType, setPaperType] = useState<number>(0);
  const [colorized, setColorized] = useState<boolean>(false);
  const [portrait, setPortrait] = useState<boolean>(true);
  const [twoSided, setTwoSided] = useState<boolean>(false);
  const [copies, setCopies] = useState<number>(0);

  const paperTypeList = PaperTypesMock.data.flatMap((i) =>
    i.variants.map((j) => {
      return `${i.name} / ${j.name}`;
    }),
  );

  return (
    <div className="flex flex-col border border-outline rounded-lg">
      <div className="bg-red-500"></div>

      <SegmentedGroup
        className={cn(
          "bg-surface-container border-none rounded-none rounded-t-lg",
          rangeCollapsed && "rounded-b-lg",
        )}
      >
        <div className="text-body-md grid place-items-center">Range</div>
        <TextInput
          value={textInput}
          setValue={setTextInput}
          placeholder="e.g. 1-5, 8, 11-13"
          error={
            textInput
              ? !/^(\s*\d+\s*(-\s*\d+\s*)?)(,\s*\d+\s*(-\s*\d+\s*)?)*$/.test(
                  textInput,
                )
              : false
          }
          showErrorIcon={true}
          className="w-full bg-background"
        />
        <div
          className="cursor-pointer"
          onClick={() => setRangeCollapsed((open) => !open)}
        >
          <MaterialIcon
            icon={"arrow_drop_up"}
            className={cn(
              "transition-all duration-250",
              !rangeCollapsed ? "rotate-180" : "",
            )}
          />
        </div>
      </SegmentedGroup>
      <div className="overflow-hidden">
        <AnimatePresence initial={false}>
          {!rangeCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex flex-col gap-2 bg-surface-container p-3 border-t border-outline rounded-b-lg">
                <LabelGroup header={"Paper Type"}>
                  <SelectInput
                    options={paperTypeList}
                    value={paperType}
                    setValue={setPaperType}
                  />
                </LabelGroup>
                <LabelGroup header={"Color"}>
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={colorized == false}
                      onClick={() => setColorized(false)}
                    >
                      Black and White
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={colorized == true}
                      onClick={() => setColorized(true)}
                    >
                      Color
                    </Button>
                  </SegmentedGroup>
                </LabelGroup>
                <LabelGroup header={"Orientation"}>
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={portrait == true}
                      onClick={() => setPortrait(true)}
                    >
                      Portrait
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={portrait == false}
                      onClick={() => setPortrait(false)}
                    >
                      Landscape
                    </Button>
                  </SegmentedGroup>
                </LabelGroup>
                <LabelGroup header={"Copies"}>
                  <NumberInput
                    count={copies}
                    setCount={setCopies}
                    min={0}
                    max={99}
                  />
                </LabelGroup>
                <LabelGroup header={"Sides"}>
                  <SegmentedGroup>
                    <Button
                      appearance="tonal"
                      selected={twoSided == false}
                      onClick={() => setTwoSided(false)}
                    >
                      One-sided
                    </Button>
                    <Button
                      appearance="tonal"
                      selected={twoSided == true}
                      onClick={() => setTwoSided(true)}
                    >
                      Two-sided
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

export default OrderRange;
