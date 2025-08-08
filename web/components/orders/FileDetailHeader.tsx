import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import getFormattedFilesize from "@/utils/helpers/getFormattedFilesize";
import type { FileType } from "@/utils/types/common";
import { motion } from "motion/react";
import { type FC, useEffect, useState } from "react";

type FileDetailHeaderProps = {
  filename: string;
  filesize: number;
  filetype: FileType;
  orderId: string;
  fileId: string;
};

/**
 * File detail header, for use with range details.
 *
 * @param filename  The file name, in string.
 * @param filesize  The file size, in integer bytes.
 * @param filetype  The file type, in PDF, PNG, or JPG.
 * @param orderId   The order id, for fetching thumbnails.
 * @param fileId    The file id, for fetching thumbnails.
 * @param copies    The amount of copies for this file, range.
 */
const FileDetailHeader: FC<FileDetailHeaderProps> = ({
  filename,
  filesize,
  filetype,
  orderId,
  fileId,
}) => {
  const [thumbnailSrc, setThumbnailSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | null = null;

    const fetchFileThumbnail = async () => {
      if (cancelled) return;

      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH +
          `/orders/${orderId}/files/${fileId}/thumbnail`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      // If the image is still processing (202), set a wait for
      // half a second before trying again until returns ok (200).
      if (res.status === 202) {
        timeoutId = window.setTimeout(fetchFileThumbnail, 500);
        return;
      } else if (res.ok) {
        const body = await res.json();
        return setThumbnailSrc(body.data as string);
      }

      setThumbnailSrc(null);
    };

    fetchFileThumbnail();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };
  }, [orderId, fileId]);

  return (
    <div
      className={cn(
        `
          flex max-w-lg items-center justify-between gap-2 rounded-lg border
          border-outline bg-surface-container pr-3
        `,
        thumbnailSrc !== null ? "p-2" : "p-4",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {thumbnailSrc && (
          <motion.div
            initial={{ x: -8, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -8, opacity: 0 }}
            transition={{
              x: { type: "spring", bounce: 0 },
            }}
            className="aspect-square !h-16 !w-16 rounded-sm bg-outline p-1"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailSrc}
              width={56}
              height={56}
              alt={filename}
              className="h-14 w-14 object-contain"
            />
          </motion.div>
        )}
        <div className="flex min-w-0 grow flex-col gap-1">
          <p className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            {filename}.{filetype}
          </p>
          <p className="text-body-sm opacity-50">
            {filetype.toUpperCase()} • {getFormattedFilesize(filesize)}
          </p>
        </div>
      </div>
      <MaterialIcon icon="arrow_drop_down" />
    </div>
  );
};

export default FileDetailHeader;
