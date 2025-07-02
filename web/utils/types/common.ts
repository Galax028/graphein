import type { DehydratedState } from "@tanstack/react-query";

export type TranslationRecord = { [k: string]: string | TranslationRecord };

export type PageProps = {
  locale: string;
  translations: TranslationRecord;
  dehydratedState?: DehydratedState;
};

export const langCodes = ["en", "th"] as const;
export type LangCode = (typeof langCodes)[number];

export const userRoles = ["student", "teacher", "merchant"] as const;
export type UserRole = (typeof userRoles)[number];

export const fileTypes = ["pdf", "png", "jpg"] as const;
export type FileType = (typeof fileTypes)[number];

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
