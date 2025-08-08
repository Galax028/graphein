import DescriptionList from "@/components/common/DescriptionList";
import type { FC } from "react";

type FileDetailRangeProps = {
  label: "page" | "image" | "service";
  value: string;
  details: {
    title: string;
    content: string;
  }[];
  expand?: boolean;
};

/**
 * The configuration options for each PDF, or image file.
 * @param label   Indicates the card's info type. ("page" | "image" | "service")
 * @param value   Range, or type of service. (string)
 * @param details The details within of a card. (title: str; content: str;)
 */
const FileDetailRange: FC<FileDetailRangeProps> = ({
  label,
  value,
  details,
  expand = false,
}) => {
  // TODO: Add localization to these types
  const labelNames = {
    page: "Page",
    image: "Image",
    service: "Service",
  } as const;

  return (
    <div className="rounded-lg border border-outline bg-surface-container">
      <div className="flex">
        <div className="border-r border-outline px-3 py-2 text-body-md">
          {labelNames[label]}
        </div>
        <div className="px-3 py-2 text-body-md">{value}</div>
      </div>
      <div className="border-t border-outline p-3">
        <DescriptionList list={details} expand={expand} />
      </div>
    </div>
  );
};

export default FileDetailRange;
