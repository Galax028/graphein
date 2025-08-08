import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import MaterialIcon from "@/components/common/MaterialIcon";
import useToggle from "@/hooks/useToggle";
import cn from "@/utils/helpers/cn";
import { mimeToExt } from "@/utils/helpers/mime";
import getFormattedFilesize from "@/utils/helpers/getFormattedFilesize";
import type {
  APIResponse,
  FileCreate,
  FileUploadResponse,
} from "@/utils/types/backend";
import {
  DraftFile,
  MAX_FILE_LIMIT,
  UnuploadedDraftFile,
  Uuid,
} from "@/utils/types/common";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, FC, SetStateAction } from "react";
import { useDropzone } from "react-dropzone";

type UploadFilesProps = {
  orderId: Uuid;
  draftFiles: DraftFile[];
  setDraftFiles: Dispatch<SetStateAction<DraftFile[] | undefined>>;
  setReadyForNextStage: Dispatch<SetStateAction<boolean>>;
};

const UploadFiles: FC<UploadFilesProps> = ({
  orderId,
  draftFiles,
  setDraftFiles,
  setReadyForNextStage,
}) => {
  const [fileLimitExceeded, toggleFileLimitExceeded] = useToggle();
  const [stageContinuable, toggleStageContinuable] = useToggle(true);

  // Enable back button when:
  //   1. There're files in the draft order.
  //   2. All files in the order are confirmed to be uploaded to cloud bucket.
  //
  // TODO: The uploaded check (2.) is still flawed. When refreshed, the file
  // isn't uploaded to cloud yet, but still appears in draftFiles list.
  // Which creates a "ghost file".
  setReadyForNextStage(draftFiles.length != 0 && stageContinuable);

  const fileUploadMutation = useMutation({
    mutationFn: async (draftFile: UnuploadedDraftFile) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${orderId}/files`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: draftFile.name,
            filetype: mimeToExt(draftFile.type),
            filesize: draftFile.size,
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
            return console.warn(
              `(upload) incomputable progress length for key: ${draftFile.key}`,
            );
          }

          const updatedProgress = Math.floor(
            (event.loaded / event.total) * 100,
          );
          setDraftFiles((draftFiles) =>
            draftFiles!.map((file) =>
              file.key === draftFile.key
                ? {
                    ...file,
                    uploaded: false,
                    progress: updatedProgress,
                    blob: draftFile.blob,
                    draft: undefined,
                  }
                : file,
            ),
          );
        });

        fileUploadXHR.addEventListener("loadend", () => {
          if (fileUploadXHR.readyState === 4 && fileUploadXHR.status === 200)
            resolve({
              id: body.data.id,
              filename: draftFile.name,
              ranges: [],
            });
          else reject(new Error("Failed to execute `fileUploadXHR`"));
        });

        fileUploadXHR.open("PUT", body.data.uploadUrl, true);
        fileUploadXHR.setRequestHeader("Content-Type", draftFile.type);
        fileUploadXHR.send(draftFile.blob);
      });
      setDraftFiles((draftFiles) =>
        draftFiles!.map((file) =>
          file.key === draftFile.key
            ? {
                ...file,
                uploaded: true,
                progress: undefined,
                blob: undefined,
                draft: uploadRes,
              }
            : file,
        ),
      );
    },
    onSuccess: () => toggleStageContinuable(true),
  });

  const fileDeleteMutation = useMutation({
    mutationFn: async (fileId: Uuid) => {
      toggleStageContinuable(false);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${orderId}/files/${fileId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.status === 204) {
        setDraftFiles((draftFiles) => {
          const newDraftFiles = draftFiles!.filter(
            (file) => file.draft?.id !== fileId,
          );
          toggleStageContinuable(newDraftFiles.length !== 0);

          return newDraftFiles;
        });
      }
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: MAX_FILE_LIMIT,
    maxSize: 50 * 1_000_000,
    onDropAccepted: (droppedRawFiles: File[]) => {
      if (draftFiles.length + droppedRawFiles.length > MAX_FILE_LIMIT)
        return toggleFileLimitExceeded(true);

      setReadyForNextStage(false);
      setDraftFiles((draftFiles) => [
        ...draftFiles!,
        ...droppedRawFiles.map((droppedFile) => {
          const newDraftFile = {
            key: window.crypto.randomUUID(),
            uploaded: false,
            progress: 0,
            name: droppedFile.name,
            size: droppedFile.size,
            type: droppedFile.type,
            blob: droppedFile,
            draft: undefined,
          } as UnuploadedDraftFile;
          fileUploadMutation.mutate(newDraftFile);

          return newDraftFile;
        }),
      ]);
    },
    onDropRejected: (rejections) => {
      if (
        rejections.some((rejection) =>
          rejection.errors.some((error) => error.code === "too-many-files"),
        )
      )
        toggleFileLimitExceeded(true);
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <AnimatePresence>
          {draftFiles.map((draftFile, idx) => {
            const isUploaded = draftFile.uploaded;

            return (
              <motion.div
                initial={{ opacity: 0, y: 64 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 64 }}
                transition={{
                  delay: idx * 0.1,
                  y: { type: "spring", bounce: 0 },
                }}
                className="flex gap-3 items-center border border-outline p-2 rounded-lg bg-surface-container"
                key={draftFile.key}
              >
                {/* TODO: Add thumbnail */}
                <div className="w-16 h-16 aspect-square bg-outline rounded-sm"></div>
                <div className="flex flex-col gap-1 w-full">
                  <p
                    className={cn(
                      "text-body-sm",
                      isUploaded ? "text-success" : "text-warning",
                    )}
                  >
                    {isUploaded
                      ? "Uploaded"
                      : `Uploading (${draftFile.progress}%)`}
                  </p>
                  <p>{draftFile.name}</p>
                  <p className="text-body-sm opacity-50">
                    {/* TODO: Implement other file types. */}
                    {draftFile.type.toUpperCase()} •{" "}
                    {getFormattedFilesize(draftFile.size)}
                  </p>
                </div>
                <button
                  className={cn(
                    "grid place-items-center",
                    isUploaded ? "cursor-pointer" : "cursor-not-allowed",
                  )}
                  disabled={!isUploaded}
                  onClick={() =>
                    isUploaded && fileDeleteMutation.mutate(draftFile.draft.id)
                  }
                >
                  <MaterialIcon className="block" icon="close_small" />
                </button>
              </motion.div>
            );
          })}
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
              Drop a file here, or click to browse files.
            </p>
            <p className="text-body-sm opacity-50 text-center">
              PDF • {MAX_FILE_LIMIT} files max • 50 MB limit
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {fileLimitExceeded && (
          <Dialog
            title={`You can only upload ${MAX_FILE_LIMIT} draftFiles per order.`}
            desc={`To minimize wait time for others, you can only upload a maximum of ${MAX_FILE_LIMIT} draftFiles per order. To upload more, visit the storefront, or start another order after this one.`}
          >
            <Button
              appearance="filled"
              onClick={() => toggleFileLimitExceeded(false)}
            >
              OK
            </Button>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadFiles;
