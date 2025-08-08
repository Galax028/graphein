import { Fragment, type FC } from "react";

type DescriptionListProps = {
  list: {
    title: string;
    content: string;
  }[];
  expand?: boolean;
};

/**
 * A component that renders a list of titles and their corresponding content.
 *
 * It can display the list in a single column or expand into two columns on
 * larger screens for better readability and space utilization.
 *
 * @param props.list     The array of title-content pairs to display.
 * @param props.expand   Whether the list should expand into two columns on
 *                       larger screens. Defaults to false.
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
            className={`
              grid grid-cols-[max-content_1fr] items-center gap-x-4 gap-y-2
            `}
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
      <div className="grid grid-cols-[4rem_1fr] items-center gap-2 gap-x-3">
        {list.map((item, idx) => (
          <Fragment key={idx}>
            <p className="text-body-sm opacity-50 select-none">{item.title}</p>
            <p className="text-body-md">{item.content}</p>
          </Fragment>
        ))}
      </div>
    );
  }
};

export default DescriptionList;
