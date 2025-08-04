import DescriptionList from "@/components/common/DescriptionList";

type FileDetailRangeProps = {
  label: "page" | "image" | "service";
  value: string;
  details: {
    title: string;
    content: string;
  }[];}

/**
 * The configuration options for each PDF, or image file.
 * @param label   Indicates the card's info type. ("page" | "image" | "service")
 * @param value   Range, or type of service. (string)
 * @param details The details within of a card. (title: str; content: str;)
 */

const FileDetailRange = ({label, value, details}: FileDetailRangeProps) => {
  // TODO: Add localization to these types
  const labelNames = {
    "page": "Page",
    "image": "Image",
    "service": "Service"
  }

  return (
    <div className="bg-surface-container border border-outline rounded-lg">
      <div className="flex">
        <div className="border-r border-outline text-body-md px-3 py-2">{labelNames[label]}</div>
        <div className="text-body-md px-3 py-2">{value}</div>
      </div>
      <div className="p-3 border-t border-outline">
        <DescriptionList 
          list={details}
          expand={true}
        />
      </div>
    </div>
  )
}

export default FileDetailRange;