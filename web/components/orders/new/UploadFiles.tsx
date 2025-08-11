import Button from "@/components/common/Button";
import MaterialIcon from "@/components/common/MaterialIcon";
import useDialog from "@/hooks/useDialogContext";
import type { ToggleDispatch } from "@/hooks/useToggle";
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
import { useTranslations } from "next-intl";
import {
  useCallback,
  type Dispatch,
  type FC,
  type SetStateAction,
} from "react";
import { useDropzone } from "react-dropzone";

type UploadFilesProps = {
  orderId: Uuid;
  draftFiles: DraftFile[];
  setDraftFiles: Dispatch<SetStateAction<DraftFile[] | undefined>>;
  toggleReadyForNextStage: ToggleDispatch;
};

/**
 * The primary interface for uploading files for an order.
 *
 * @param props.orderId                  The UUID of the parent order.
 * @param props.draftFiles               The array of file objects being
 *                                       uploaded and managed.
 * @param props.setDraftFiles            The state setter function to update the
 *                                       `draftFiles` array.
 * @param props.toggleReadyForNextStage  A state setter to signal to the parent
 *                                       if the user can proceed.
 */
const UploadFiles: FC<UploadFilesProps> = ({
  orderId,
  draftFiles,
  setDraftFiles,
  toggleReadyForNextStage,
}) => {
  const t = useTranslations("order");
  const dialog = useDialog();

  const toggleFileLimitDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("upload.fileLimitExceeded.title", {
          maxFileLimit: MAX_FILE_LIMIT,
        }),
        description: t("upload.fileLimitExceeded.description", {
          maxFileLimit: MAX_FILE_LIMIT,
        }),
        allowClickOutside: true,
      }),
    [t, dialog],
  );

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
                open: true,
                uploaded: true,
                progress: undefined,
                blob: undefined,
                draft: uploadRes,
              }
            : prevDraftFile,
        ),
      );
    },
    onSuccess: () => toggleReadyForNextStage(true),
  });

  const fileDeleteMutation = useMutation({
    mutationFn: async (fileId: Uuid) => {
      toggleReadyForNextStage(false);
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
          toggleReadyForNextStage(nextDraftFiles.length !== 0);

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
        return toggleFileLimitDialog();

      toggleReadyForNextStage(false);
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
        toggleFileLimitDialog();
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <AnimatePresence>
          {draftFiles.map((draftFile) => {
            const isUploaded = draftFile.uploaded;

            return (
              <motion.div
                initial={{ opacity: 0, x: -64 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -64, z: -10 }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                className={`
                  grid grid-cols-[4rem_1fr_1.5rem] items-center gap-3 rounded-lg
                  border border-outline bg-surface-container p-2
                `}
                key={draftFile.key}
              >
                {/* TODO: Add thumbnail */}
                <div
                  className={`
                    aspect-square h-16 w-16 animate-pulse rounded-sm bg-outline
                  `}
                ></div>
                <div className="flex flex-col gap-1 wrap-anywhere">
                  <p
                    className={cn(
                      "text-body-sm",
                      isUploaded ? "text-success" : "text-warning",
                    )}
                  >
                    {isUploaded
                      ? t("upload.fileUploadProgress.completed")
                      : t("upload.fileUploadProgress.inProgress", {
                          progress: draftFile.progress,
                        })}
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
          {draftFiles.length === 0
            ? t("upload.input.upload")
            : t("upload.input.uploadMore")}
        </Button>
        {draftFiles.length === 0 && (
          <div>
            <p className="text-center text-body-md">
              {t("upload.input.title")}
            </p>
            <p className="text-center text-body-sm opacity-50">
              {t("upload.input.requirements", {
                maxFileLimit: MAX_FILE_LIMIT,
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadFiles;
