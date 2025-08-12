import DescriptionList from "@/components/common/DescriptionList";
import { useTranslations } from "next-intl";
import { useMemo, type FC } from "react";

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
 * Displays a card with the specific configuration options for a given file or a
 * range within a file.
 *
 * This component is used to show detailed settings like paper size,
 * colourisation, and number of copies for a specific page range or service.
 *
 * @param props.label    Indicates the type of item the card describes.
 * @param props.value    The specific value for the label, like a page range or
 *                       service type.
 * @param props.details  An array of title-content objects detailing the
 *                       configuration.
 * @param props.expand   Expands the details list into two columns on larger
 *                       screens. Defaults to false.
 */
const FileDetailRange: FC<FileDetailRangeProps> = ({
  label,
  value,
  details,
  expand = false,
}) => {
  const t = useTranslations("order");

  const labelNames = useMemo(
    () => ({
      page: t("common.page"),
      image: t("common.image"),
      service: t("common.service"),
    }),
    [t],
  );

  return (
    <div className="rounded-lg border border-outline bg-surface-container">
      <div className="flex">
        <div
          className={`
            border-r border-outline px-3 py-2 text-body-md select-none
          `}
        >
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
