import { cn } from "@/utils";
import { type FC } from "react";

type ChipProps = {
  appearance?: "tonal" | "filled";
  text: string;
};

const Chip: FC<ChipProps> = ({ appearance = "tonal", text }) => {
  return (
    <div
      className={cn(
        `
          grid place-items-center rounded-full px-2 py-1 text-body-sm
          select-none
        `,
        appearance === "tonal"
          ? "border border-outline bg-surface-container"
          : "bg-primary text-onPrimary",
      )}
    >
      {text}
    </div>
  );
};

export default Chip;
