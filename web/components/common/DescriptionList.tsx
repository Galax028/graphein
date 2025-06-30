import cn from "@/utils/helpers/code/cn";

type DescriptionListProps = {
  data: {
    title: string;
    content: string;
  }[];
  expand?: boolean;
};

/**
 * The title, description row styled in a list.
 *
 * @param data The data to show in a list. [{title: str, content: str}, ...]
 * @param expand Expanded into 2 columns in big screens or not. (Default false)
 */

const DescriptionList = ({ data, expand = false }: DescriptionListProps) => {
  return (
    <div
      className={cn(
        `grid grid-cols-[4.5rem_1fr] gap-x-4 gap-y-2 items-center`,
        // Expand is true, and the dataset has more than 1 value, use 2 columns.
        expand && data.length > 1 && `md:grid-cols-[4.5rem_1fr_4.5rem_1fr]`
      )}
    >
      {data.map((i) => (
        <>
          <p className="text-body-sm opacity-50">{i.title}</p>
          <p className="text-body-md">{i.content}</p>
        </>
      ))}
    </div>
  );
};

export default DescriptionList;
