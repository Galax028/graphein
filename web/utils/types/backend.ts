import type { FileType, OrderStatus, UserRole, Uuid } from "./common";

export type SuccessAPIResponse<T extends object> = {
  success: true;
  timestamp: string;
  data: T;
  pagination: never;
};

export type PaginatedAPIResponse<T extends object> = {
  success: true;
  timestamp: string;
  data: T;
  pagination: {
    page: string | null;
    size: number;
    count: number;
    reverse: boolean;
  };
};

export type FailedAPIResponse = {
  success: false;
  timestamp: string;
  message: string;
  error: string;
};

export type APIResponse<T extends object> =
  | SuccessAPIResponse<T>
  | PaginatedAPIResponse<T>
  | FailedAPIResponse;

type BaseUser = {
  id: Uuid;
  role: UserRole;
  email: string;
  name: string;
  profileUrl: string;
};

export type UnonboardedUser = {
  tel: string | null;
  class: number | null;
  classNo: number | null;
  isOnboarded: false;
} & BaseUser;

type OnboardedUser = { isOnboarded: true } & BaseUser;

export type Student = {
  role: "student";
  tel: string;
  class: number;
  classNo: number;
} & OnboardedUser;

export type Teacher = { role: "teacher"; tel: string } & OnboardedUser;

export type Merchant = { role: "merchant" } & OnboardedUser;

export type User = Student | Teacher | Merchant | UnonboardedUser;

export type File = {
  id: Uuid;
  filename: string;
  filetype: FileType;
  filesize: number;
  copies: number;
  range: string | null;
  paperSizeId: number;
  paperOrientation: "portrait" | "landscape";
  isColour: boolean;
  scaling: number;
  isDoubleSided: boolean;
};

export type Service = {
  serviceType: "bookbinding" | "bookbindingWithCover" | "laminate";
  bookbindingTypeId: number | null;
  notes: string | null;
  fileIds: Uuid[];
};

export type OrderStatusUpdate = {
  timestamp: string;
  status: OrderStatus;
};

export type CompactOrder = {
  id: Uuid;
  createdAt: string;
  orderNumber: string;
  status: OrderStatus;
  filesCount: number;
};

export type DetailedOrder = {
  id: Uuid;
  createdAt: string;
  orderNumber: string;
  status: OrderStatus;
  price: number | null;
  notes: string | null;
  statusHistory: OrderStatusUpdate[];
  files: File[];
  services: Service[];
};

export type OrdersGlance = {
  ongoing: CompactOrder[];
  finished: CompactOrder[];
};
