import cn from "@/utils/helpers/cn";
import { Fragment, type FC } from "react";

type DescriptionListProps = {
  list: {
    title: string;
    content: string;
  }[];
  expand?: boolean;
};

/**
 * The title, description row styled in a list.
 *
 * @param list The list to show.
 * @param expand Expanded into 2 columns in big screens or not. (Default false)
 */
const DescriptionList: FC<DescriptionListProps> = ({
  list,
  expand = false,
}) => (
  <div
    className={cn(
      `grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 items-center`,
      // Expand is true, and the dataset has more than 1 value, use 2 columns.
      expand && list.length > 1 && `md:grid-cols-[4.5rem_1fr_4.5rem_1fr]`,
    )}
  >
    {list.map((item, idx) => (
      <Fragment key={idx}>
        <p className="text-body-sm opacity-50">{item.title}</p>
        <p className="text-body-md">{item.content}</p>
      </Fragment>
    ))}
  </div>
);

export default DescriptionList;
