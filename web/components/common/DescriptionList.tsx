import cn from "@/utils/helpers/cn";
import { type FC } from "react";

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
}) => {
  if (expand) {
    const half = Math.ceil(list.length / 2);
    const col1 = list.slice(0, half);
    const col2 = list.slice(half);

    return (
      <div className="grid gap-2 md:grid-cols-2">
        {[col1, col2].map((list, idx) => (
          <div
            className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2"
            key={idx}
          >
            {list.map((item) => (
              <Fragment key={item.title}>
                <p className="text-body-sm opacity-50 select-none">
                  {item.title}
                </p>
                <p className="text-body-md">{item.content}</p>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className={cn("grid gap-2", expand && "md:grid-cols-2")}>
        {list.map((item, idx) => (
          <div className="grid grid-cols-[4.5rem_1fr] gap-x-4" key={idx}>
            <p className="text-body-sm opacity-50 select-none">{item.title}</p>
            <p className="text-body-md">{item.content}</p>
          </div>
        ))}
      </div>
    );
  }
};

export default DescriptionList;
