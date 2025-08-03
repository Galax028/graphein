import DescriptionList from "./DescriptionList"

type FileDetailRangeProps = {
  label: "page" | "image" | "service";
  value: string;
  details: {
    title: string;
    content: string;
  }[];}

const FileDetailRange = ({label, value, details}: FileDetailRangeProps) => {
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