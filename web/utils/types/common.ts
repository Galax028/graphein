import { FileCreate } from "@/utils/types/backend";
import type { DehydratedState } from "@tanstack/react-query";
import type { Locale } from "next-intl";

export type TranslationRecord = { [k: string]: string | TranslationRecord };

export type PageProps = {
  locale: Locale;
  translations: TranslationRecord;
  dehydratedState?: DehydratedState;
};

export const langCodes = ["en", "th"] as const;
export type LangCode = (typeof langCodes)[number];

export const userRoles = ["student", "teacher", "merchant"] as const;
export type UserRole = (typeof userRoles)[number];

export const fileTypes = ["pdf", "png", "jpg"] as const;
export type FileType = (typeof fileTypes)[number];

export const orderStages = [
  "uploadFiles",
  "configOrder",
  "configServices",
  "review",
] as const;
export type OrderStage = (typeof orderStages)[number];

export const orderStatuses = [
  "reviewing",
  "processing",
  "ready",
  "completed",
  "rejected",
  "cancelled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export type Uuid = string;

export const MAX_FILE_LIMIT = 10;
export const MAX_FILE_RANGES = 5;

type BaseDraftFile = {
  key: Uuid;
  name: string;
  size: number;
  type: string;
};

export type UnuploadedDraftFile = {
  uploaded: false;
  progress: number;
  blob: Blob | null;
  draft: undefined;
} & BaseDraftFile;

export type UploadedDraftFile = {
  uploaded: true;
  progress: undefined;
  blob: undefined;
  draft: FileCreate;
} & BaseDraftFile;

export type DraftFile = UnuploadedDraftFile | UploadedDraftFile;
