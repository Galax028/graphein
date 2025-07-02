import MaterialIcon from "@/components/common/MaterialIcon";
import cn from "@/utils/helpers/cn";
import getShortenedFileSizeString from "@/utils/helpers/order/details/getShortenedFileSizeString";
import type { FileType } from "@/utils/types/common";
import { motion } from "motion/react";
import Image from "next/image";
import { type FC, useEffect, useState } from "react";

type FileDetailHeaderProps = {
  fileName: string;
  fileSize: number;
  fileType: FileType;
  orderId: string;
  fileId: string;
  copies: number;
};

/**
 * File detail header, for use with range details.
 *
 * @param fileName  The file name, in string.
 * @param fileSize  The file size, in integer bytes.
 * @param fileType  The file type, in PDF, PNG, or JPG.
 * @param orderId   The order id, for fetching thumbnails.
 * @param fileId    The file id, for fetching thumbnails.
 * @param copies    The amount of copies for this file, range.
 */
const FileDetailHeader: FC<FileDetailHeaderProps> = ({
  fileName,
  fileSize,
  fileType,
  orderId,
  fileId,
  copies,
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
      }

      if (res.ok) {
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
    <div className="flex items-start w-full">
      <div
        className={cn(
          `flex justify-between items-center gap-2 bg-surface-container 
          border border-outline rounded-lg w-[calc(100vw-1.5rem)] max-w-lg pr-3`,
          thumbnailSrc !== null ? "p-2" : "p-4",
        )}
      >
        <div className="flex gap-3 items-center min-w-0">
          {thumbnailSrc && (
            <motion.div
              initial={{ x: -8, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -8, opacity: 0 }}
              transition={{
                x: { type: "spring", bounce: 0 },
              }}
              className="p-1 bg-outline !w-16 !h-16 aspect-square rounded-sm"
            >
              <Image
                src={thumbnailSrc}
                width={56}
                height={56}
                alt={fileName}
                className="w-14 h-14 object-contain"
              />
            </motion.div>
          )}
          <div className="flex flex-col grow gap-1 min-w-0">
            <p className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
              {fileName}.{fileType}
            </p>
            <p className="text-body-sm opacity-50">
              {copies} {copies != 1 ? "copies" : "copy"} •{" "}
              {fileType.toUpperCase()} • {getShortenedFileSizeString(fileSize)}
            </p>
          </div>
        </div>
        <MaterialIcon icon="arrow_drop_down" />
      </div>
    </div>
  );
};

export default FileDetailHeader;
