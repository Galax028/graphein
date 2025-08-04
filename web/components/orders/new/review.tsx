import type { UploadedDraftFile } from "@/utils/types/common";
import type { FC } from "react";

type ReviewProps = {
  draftFiles: UploadedDraftFile[];
};

const Review: FC<ReviewProps> = ({ draftFiles }) => {
  return (
    <div className="border border-outline bg-surface-container rounded-lg overflow-x-scroll">
      <pre className="!font-mono">
        {JSON.stringify(draftFiles, undefined, 2)}
      </pre>
    </div>
  );
};

export default Review;
