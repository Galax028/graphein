import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import MaterialIcon from "@/components/common/MaterialIcon";
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
import {
  useEffect,
  useState,
  type Dispatch,
  type FC,
  type SetStateAction,
} from "react";
import { useDropzone } from "react-dropzone";
import { v4 as uuidv4 } from "uuid";

type DraftFile = {
  key: number;
  progress: number;
  meta: FileCreate | null;
  raw: {
    name: string;
    size: number;
    type: string;
    path?: string;
    relativePath?: string;
  };
  file?: File;
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
  const [stageContinuable, setStageContinuable] = useState(true);

  // TODO: KEEP SERVER FILE ID, GET SERVER FILE ID
  const deleteDraftFile = async (id: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_PATH}/orders/${orderId}/files/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    if (res.status == 204) {
      // Add logic to remove from localStorage
      window.alert(`Successfully deleted file ${id}, from order ${orderId}.`);
    } else {
      window.alert(`Unable to delete file ${id}, from order ${orderId}.`);
    }
  };

  // Enable back button when:
  //   1. There're files in the draft order.
  //   2. All files in the order are confirmed to be uploaded to cloud bucket.
  //
  // TODO: The uploaded check (2.) is still flawed. When refreshed, the file
  // isn't uploaded to cloud yet, but still appears in draftFiles list.
  // Which creates a "ghost file".
  setReadyForNextStage(draftFiles.length != 0 && stageContinuable);

  const fileUploadMutation = useMutation({
    mutationFn: async (variables: DraftFile) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/orders/${orderId}/files`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: variables.file?.name,
            filetype: "pdf",
            filesize: variables.file?.size,
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
              filename: variables.file?.name ?? "",
              ranges: [],
            });
          else reject(new Error("Failed to execute `fileUploadXHR`"));
        });

        fileUploadXHR.open("PUT", body.data.uploadUrl, true);
        fileUploadXHR.setRequestHeader("Content-Type", variables.file?.type);
        fileUploadXHR.send(variables.file);
      });
      setDraftFiles((draftFiles) =>
        draftFiles.map((file) =>
          file.key === variables.key ? { ...file, meta: uploadRes } : file,
        ),
      );
    },
    onSuccess: () => setStageContinuable(true),
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

      setStageContinuable(false);
      const updatedDraftFiles = [
        ...draftFiles,
        ...droppedRawFiles.map((droppedFile) => {
          // Normalize the file object
          const normalizedRaw = {
            name: droppedFile.name,
            size: droppedFile.size,
            type: droppedFile.type,
            path: (droppedFile as any).path,
            relativePath: (droppedFile as any).relativePath,
          };
          const newDraftFile = {
            key: uuidv4(),
            progress: 0,
            meta: null,
            raw: normalizedRaw,
            file: droppedFile,
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
    <div className="flex flex-col gap-2">
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
              className="flex gap-2 items-center border border-outline p-3 rounded-lg bg-surface-container"
              key={draftFile.key}
            >
              <div className="flex flex-col gap-1 w-full">
                <p
                  className={cn(
                    "text-body-sm",
                    draftFile.progress === 100
                      ? "text-success"
                      : "text-warning",
                  )}
                >
                  {draftFile.progress === 100
                    ? "Uploaded"
                    : `Uploading (${draftFile.progress}%)`}
                </p>
                <p>{draftFile.meta?.filename ?? draftFile.raw.name}</p>
                <p className="text-body-sm opacity-50">
                  {/* TODO: Implement other file types. */}
                  {/* {draftFile.raw.type} •{" "} */}
                  PDF • {getFormattedFilesize(draftFile.raw.size)}
                </p>
              </div>
              <div>
                <MaterialIcon icon="close_small" />
              </div>
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
              onClick={() => setFileLimitExceeded(false)}
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
