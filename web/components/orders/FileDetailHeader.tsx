import MaterialIcon from "@/components/common/MaterialIcon";
import { useThumbnailQuery } from "@/query/fetchThumbnail";
import { cn } from "@/utils";
import getFormattedFilesize from "@/utils/helpers/getFormattedFilesize";
import type { FileType } from "@/utils/types/common";
import {
  type FC,
  type MouseEventHandler,
  type ReactNode,
  useMemo,
} from "react";

type FileDetailHeaderProps = {
  slim?: boolean;
  appendExt?: boolean;
  filename: string;
  filesize: number;
  filetype: FileType;
  header?: ReactNode;
  button?: ReactNode;
  orderId: string;
  fileId?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

/**
 * A header component for displaying individual file details within an order.
 *
 * It shows the file's name, type, and size, and asynchronously fetches and
 * displays a thumbnail for the file. It includes a polling mechanism to handle
 * cases where the thumbnail is still being processed on the server.
 *
 * @param props.filename  The name of the file, without the extension.
 * @param props.filesize  The size of the file in bytes.
 * @param props.filetype  The file's type extension (e.g., "pdf").
 * @param props.button    A custom button, if any, located on the right side.
 * @param props.orderId   The UUID of the parent order, used for fetching the
 *                        thumbnail.
 * @param props.fileId    The UUID of the file, used for fetching the thumbnail.
 */
const FileDetailHeader: FC<FileDetailHeaderProps> = ({
  slim = false,
  appendExt = true,
  filename,
  filesize,
  filetype,
  header,
  button,
  orderId,
  fileId,
  onClick,
}) => {
  const filenameWithExt = useMemo(
    () => (appendExt ? `${filename}.${filetype}` : filename),
    [appendExt, filename, filetype],
  );

  const { data: thumbnailSrc } = useThumbnailQuery(
    orderId,
    // @ts-expect-error -- Too lazy to modify the function signature
    fileId,
    fileId !== undefined,
  );

  return (
    <div
      className={cn(
        "grid items-center gap-3",
        !slim && "rounded-lg border border-outline bg-surface-container p-2",
        button !== undefined
          ? "grid-cols-[4rem_1fr_1.5rem]"
          : "grid-cols-[4rem_1fr]",
        onClick && "cursor-pointer *:cursor-pointer",
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "grid h-16 w-16 place-items-center rounded-sm bg-outline",
          thumbnailSrc !== undefined ? "aspect-square p-1" : "animate-pulse",
        )}
      >
        {thumbnailSrc !== undefined &&
          (thumbnailSrc !== null ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="h-14 w-14 object-contain"
              src={thumbnailSrc}
              alt={filenameWithExt}
            />
          ) : (
            <MaterialIcon
              className="h-14 w-14 !text-[3.5rem]"
              icon="unknown_document"
              filled
            />
          ))}
      </div>
      <div className="flex flex-col gap-1 wrap-anywhere">
        {header}
        <p>{filenameWithExt}</p>
        <p className="text-body-sm opacity-50 select-none">
          {filetype.toUpperCase()} • {getFormattedFilesize(filesize)}
        </p>
      </div>
      {button}
    </div>
  );
};

export default FileDetailHeader;
