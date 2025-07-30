import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import cn from "@/utils/helpers/cn";
import getFormattedFilesize from "@/utils/helpers/order/details/getFormattedFilesize";
import type {
  APIResponse,
  FileCreate,
  FileUploadResponse,
} from "@/utils/types/backend";
import { MAX_FILE_LIMIT, Uuid } from "@/utils/types/common";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useState, type Dispatch, type FC, type SetStateAction } from "react";
import { useDropzone } from "react-dropzone";

export type DraftFile = {
  key: number;
  progress: number;
  meta: FileCreate | null;
  raw: File;
};

type UploadFilesProps = {
  orderId: Uuid;
  draftFiles: DraftFile[];
  setDraftFiles: Dispatch<SetStateAction<DraftFile[]>>;
  setReadyForNextStage: Dispatch<SetStateAction<boolean>>;
};

const UploadFiles: FC<UploadFilesProps> = ({
  orderId,
  draftFiles,
  setDraftFiles,
  setReadyForNextStage,
}) => {
  const [fileLimitExceeded, setFileLimitExceeded] = useState(false);

  const fileUploadMutation = useMutation({
    mutationFn: async (variables: DraftFile) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${orderId}/files`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: variables.raw.name,
            filetype: "pdf",
            filesize: variables.raw.size,
          }),
        },
      );

      const body = (await res.json()) as APIResponse<FileUploadResponse>;
      if (!body.success)
        throw new Error(`Uncaught API Error (${body.error}): ${body.message}`);

      const fileUploadXHR = new XMLHttpRequest();
      const uploadRes: FileCreate = await new Promise((resolve, reject) => {
        fileUploadXHR.upload.addEventListener("progress", (event) => {
          if (!event.lengthComputable) {
            console.warn(`incomputable length for key \`${variables.key}\``);
            return;
          }

          const updatedProgress = Math.floor(
            (event.loaded / event.total) * 100,
          );
          console.log(
            `upload progress for key \`${variables.key}\`: ${updatedProgress}`,
          );
          setDraftFiles((draftFiles) =>
            draftFiles.map((file) =>
              file.key === variables.key
                ? { ...file, progress: updatedProgress }
                : file,
            ),
          );
        });

        fileUploadXHR.addEventListener("loadend", () => {
          if (fileUploadXHR.readyState === 4 && fileUploadXHR.status === 200)
            resolve({
              id: body.data.id,
              filename: variables.raw.name,
              ranges: [],
            });
          else reject(new Error("Failed to execute `fileUploadXHR`"));
        });

        fileUploadXHR.open("PUT", body.data.uploadUrl, true);
        fileUploadXHR.setRequestHeader("Content-Type", variables.raw.type);
        fileUploadXHR.send(variables.raw);
      });
      setDraftFiles((draftFiles) =>
        draftFiles.map((file) =>
          file.key === variables.key ? { ...file, meta: uploadRes } : file,
        ),
      );
    },
    onSuccess: () => setReadyForNextStage(true),
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      //   "image/png": [".png"],
      //   "image/jpeg": [".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxFiles: MAX_FILE_LIMIT,
    maxSize: 50 * 1_000_000,
    onDropAccepted: (droppedRawFiles) => {
      if (draftFiles.length + droppedRawFiles.length > MAX_FILE_LIMIT)
        return setFileLimitExceeded(true);

      setReadyForNextStage(false);
      const updatedDraftFiles = [
        ...draftFiles,
        ...droppedRawFiles.map((droppedFile) => {
          const newDraftFile = {
            key: Math.round(Math.random() * 100_000 ** 2),
            progress: 0,
            meta: null,
            raw: droppedFile,
          };
          fileUploadMutation.mutate(newDraftFile);

          return newDraftFile;
        }),
      ];
      setDraftFiles(updatedDraftFiles);
    },
    onDropRejected: (rejections) => {
      if (
        rejections.some((rejection) =>
          rejection.errors.some((error) => error.code === "too-many-files"),
        )
      )
        setFileLimitExceeded(true);
    },
  });

  return (
    <>
      <div className="flex flex-col gap-1">
        <AnimatePresence>
          {draftFiles.map((draftFile, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 64 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 64 }}
              transition={{
                delay: idx * 0.1,
                y: { type: "spring", bounce: 0 },
              }}
              className="flex flex-col gap-1 border border-outline p-3 rounded-lg bg-surface-container"
              key={draftFile.key}
            >
              <p
                className={cn(
                  "text-body-sm",
                  draftFile.progress === 100 ? "text-success" : "text-warning",
                )}
              >
                {draftFile.progress === 100
                  ? "Uploaded"
                  : `Uploading (${draftFile.progress}%)`}
              </p>
              <p>{draftFile.raw.name}</p>
              <p className="text-body-sm opacity-50">
                {draftFile.raw.type} •{" "}
                {getFormattedFilesize(draftFile.raw.size)}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <div
        className={cn(
          draftFiles.length === 0 &&
            "flex flex-col gap-2 justify-center items-center border border-outline p-3 h-96 rounded-lg cursor-pointer",
        )}
        {...getRootProps()}
      >
        <input className="hidden" {...getInputProps()} />
        <Button
          appearance="tonal"
          icon="upload"
          className={cn(draftFiles.length !== 0 && "w-full")}
        >
          {draftFiles.length === 0 ? "Upload" : "Upload more"}
        </Button>
        {draftFiles.length === 0 && (
          <div>
            <p className="text-body-md text-center">
              Drop a file here, or click to browse rawFiles.
            </p>
            <p className="text-body-sm opacity-50 text-center">
              PDF, PNG, JPEG • {MAX_FILE_LIMIT} draftFiles • 50 MB max
            </p>
          </div>
        )}
      </div>

      {fileLimitExceeded && (
        <Dialog
          title={`You can only upload ${MAX_FILE_LIMIT} draftFiles per order.`}
          desc={`To minimize wait time for others, you can only upload a maximum of ${MAX_FILE_LIMIT} draftFiles per order. To upload more, visit the storefront, or start another order after this one.`}
        >
          <Button
            appearance="filled"
            onClick={() => setFileLimitExceeded(false)}
          >
            OK
          </Button>
        </Dialog>
      )}
    </>
  );
};

export default UploadFiles;
