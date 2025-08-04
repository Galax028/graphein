import Button from "@/components/common/Button";
import MaterialIcon from "@/components/common/MaterialIcon";
import OrderRange from "@/components/common/order/OrderRange";
import { ConfigItem, DraftFile } from "@/pages/order/new/[stage]";
import cn from "@/utils/helpers/cn";
import getFormattedFilesize from "@/utils/helpers/order/details/getFormattedFilesize";
import { useRouter } from "next/router";
import { useState, type Dispatch, type FC, type SetStateAction } from "react";

type ConfigOrderProps = {
  draftFiles: DraftFile[];
  setDraftFiles: Dispatch<SetStateAction<DraftFile[]>>;
  setReadyForNextStage: Dispatch<SetStateAction<boolean>>;
};

const ConfigOrder: FC<ConfigOrderProps> = ({
  draftFiles,
  setDraftFiles,
  setReadyForNextStage,
}) => {
  const router = useRouter();

  // The stage is always ready for continuing
  setReadyForNextStage(true);

  const addRange = () => {
    return window.alert("range added");
  };

  // When there's no files, redirect to the upload page.
  if (draftFiles.length == 0) {
    router.push("/order/new/upload");
  }

  const [draftConfig, setDraftConfig] = useState<ConfigItem[]>(
    (draftFiles ?? []).map((i: DraftFile) => {
      return {
        paperSize: "A4",
        paperType: "plain",
        colorized: false,
        twoSided: false,
        copies: 0,
      };
    }),
  );

  console.warn(draftFiles);
  console.warn(draftConfig);

  return (
    <div className="flex flex-col gap-2">
      {draftFiles.map((i) => (
        <div
          key={i.key}
          className={cn(
            `flex flex-col gap-2 bg-surface-container 
              border border-outline p-2 rounded-lg`,
          )}
        >
          <div className="flex gap-3 items-center pr-1">
            {/* TODO: Add thumbnail */}
            <div className="w-16 h-16 bg-outline rounded-sm animate-pulse"></div>
            <div className="flex flex-col gap-1 grow">
              <p>{i.raw.name}</p>
              <p className="opacity-50 text-body-sm">
                PDF • {getFormattedFilesize(i.raw.size)}
              </p>
            </div>
            <MaterialIcon icon={"arrow_drop_down"} />
          </div>
          <div className="flex flex-col gap-2">
            {[...Array(3)].map((i, idx) => (
              <OrderRange index={i} key={idx} />
            ))}
          </div>
          <Button appearance="tonal" icon={"add"} onClick={addRange}>
            Add range
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ConfigOrder;
