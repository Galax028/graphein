import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import MaterialIcon from "@/components/common/MaterialIcon";
import useToggle, { type ToggleDispatch } from "@/hooks/useToggle";
import { cn, mimeToExt } from "@/utils";
import getFormattedFilesize from "@/utils/helpers/getFormattedFilesize";
import type {
  APIResponse,
  FileCreate,
  FileUploadResponse,
} from "@/utils/types/backend";
import {
  MAX_FILE_LIMIT,
  type DraftFile,
  type UnuploadedDraftFile,
  type Uuid,
} from "@/utils/types/common";
import { useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, FC, SetStateAction } from "react";
import { useDropzone } from "react-dropzone";

type UploadFilesProps = {
  orderId: Uuid;
  draftFiles: DraftFile[];
  setDraftFiles: Dispatch<SetStateAction<DraftFile[] | undefined>>;
  setReadyForNextStage: ToggleDispatch;
};

/**
 * The primary interface for uploading files for an order.
 *
 * @param props.orderId               The UUID of the parent order.
 * @param props.draftFiles            The array of file objects being uploaded
 *                                    and managed.
 * @param props.setDraftFiles         The state setter function to update the
 *                                    `draftFiles` array.
 * @param props.setReadyForNextStage  A state setter to signal to the parent if
 *                                    the user can proceed.
 */
const UploadFiles: FC<UploadFilesProps> = ({
  orderId,
  draftFiles,
  setDraftFiles,
  setReadyForNextStage,
}) => {
  const [fileLimitExceeded, toggleFileLimitExceeded] = useToggle();

  // Enable back button when:
  //   1. There're files in the draft order.
  //   2. All files in the order are confirmed to be uploaded to cloud bucket.
  //
  // TODO: The uploaded check (2.) is still flawed. When refreshed, the file
  // isn't uploaded to cloud yet, but still appears in draftFiles list.
  // Which creates a "ghost file".

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
          setDraftFiles((prevDraftFiles) =>
            prevDraftFiles!.map((prevDraftFile) =>
              prevDraftFile.key === draftFile.key
                ? {
                    ...prevDraftFile,
                    uploaded: false,
                    progress: updatedProgress,
                    blob: draftFile.blob,
                    draft: undefined,
                  }
                : prevDraftFile,
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
      setDraftFiles((prevDraftFiles) =>
        prevDraftFiles!.map((prevDraftFile) =>
          prevDraftFile.key === draftFile.key
            ? {
                ...prevDraftFile,
                uploaded: true,
                progress: undefined,
                blob: undefined,
                draft: uploadRes,
              }
            : prevDraftFile,
        ),
      );
    },
    onSuccess: () => setReadyForNextStage(true),
  });

  const fileDeleteMutation = useMutation({
    mutationFn: async (fileId: Uuid) => {
      setReadyForNextStage(false);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${orderId}/files/${fileId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.status === 204) {
        setDraftFiles((prevDraftFiles) => {
          const nextDraftFiles = prevDraftFiles!.filter(
            (prevDraftFile) => prevDraftFile.draft?.id !== fileId,
          );
          setReadyForNextStage(nextDraftFiles.length !== 0);

          return nextDraftFiles;
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
      // setDraftFiles((draftFiles) => [
      //   ...draftFiles!,
      //   ...droppedRawFiles.map((droppedFile) => {
      //     const newDraftFile = {
      //       key: window.crypto.randomUUID(),
      //       uploaded: false,
      //       progress: 0,
      //       name: droppedFile.name,
      //       size: droppedFile.size,
      //       type: droppedFile.type,
      //       blob: droppedFile,
      //       draft: undefined,
      //     } as UnuploadedDraftFile;
      //     fileUploadMutation.mutate(newDraftFile);

      //     return newDraftFile;
      //   }),
      // ]);
      const nextDraftFiles = droppedRawFiles.map((droppedRawFile) => {
        const nextDraftFile = {
          key: window.crypto.randomUUID(),
          uploaded: false,
          progress: 0,
          name: droppedRawFile.name,
          size: droppedRawFile.size,
          type: droppedRawFile.type,
          blob: droppedRawFile,
          draft: undefined,
        } satisfies UnuploadedDraftFile;
        fileUploadMutation.mutate(nextDraftFile);

        return nextDraftFile;
      });
      setDraftFiles((prevDraftFiles) =>
        typeof prevDraftFiles === "undefined"
          ? nextDraftFiles
          : [...prevDraftFiles, ...nextDraftFiles],
      );
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
                className={`
                  flex items-center gap-3 rounded-lg border border-outline
                  bg-surface-container p-2
                `}
                key={draftFile.key}
              >
                {/* TODO: Add thumbnail */}
                <div className="aspect-square h-16 w-16 rounded-sm bg-outline"></div>
                <div className="flex w-full flex-col gap-1">
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
                    {mimeToExt(draftFile.type).toUpperCase()} •{" "}
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
            `
              flex h-96 cursor-pointer flex-col items-center justify-center
              gap-2 rounded-lg border border-outline p-3
            `,
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
            <p className="text-center text-body-md">
              Drop a file here, or click to browse files.
            </p>
            <p className="text-center text-body-sm opacity-50">
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
