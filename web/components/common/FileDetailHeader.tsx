import { AcceptedFileTypes } from "@/utils/types/common";
import MaterialIcon from "@/components/common/MaterialIcon";
import Image from "next/image";
import { useState, useEffect } from "react";
import cn from "@/utils/helpers/cn";
import { getShortenedFileSizeString } from "@/utils/helpers/getShortenedFileSizeString";
import { AnimatePresence, motion } from "motion/react";

type FileDetailHeaderProps = {
  fileName: string;
  fileSize: number;
  fileType: AcceptedFileTypes;
  orderId: string;
  fileId: string;
  copies: number;
};

const FileDetailHeader = ({
  fileName,
  fileSize,
  fileType,
  orderId,
  fileId,
  copies,
}: FileDetailHeaderProps) => {
  const [thumbnailData, setThumbnailData] = useState<any>({});

  useEffect(() => {
    let cancelled = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const fetchFileThumbnail = async () => {
      if (cancelled) return;

      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH +
          `/orders/${orderId}/files/${fileId}/thumbnail`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      // If the image is still processing (202), set a wait for
      // half a second before trying again until returns ok (200).
      if (res.status === 202) {
        timeoutId = setTimeout(fetchFileThumbnail, 500);
        return;
      }

      if (res.ok) {
        const data = await res.json();
        return setThumbnailData(data);
      }
      setThumbnailData({});
    };

    fetchFileThumbnail();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [orderId, fileId]);

  return (
    <div className="flex items-start w-full">
      <div
        className={cn(
          `flex justify-between items-center gap-2 bg-surface-container 
          border border-outline rounded-lg w-full pr-3`,
          thumbnailData.data ? "p-2" : "p-3"
        )}
      >
        <div className="flex gap-3 items-center">
          {thumbnailData.data && (
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
                src={thumbnailData.data}
                width={56}
                height={56}
                alt={fileName}
                className="w-14 h-14 object-contain"
              />
            </motion.div>
          )}
          <div className="flex flex-col gap-1">
            <p>
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
