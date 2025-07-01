import type { FileType, OrderStatus, UserRole, Uuid } from "./common";

type BaseUser = {
  id: Uuid;
  role: UserRole;
  email: string;
  name: string;
  profileUrl: string;
};

export type UnonboardedUser = {
  tel?: string;
  class?: number;
  classNo?: number;
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
  range?: string;
  paperSizeId: number;
  paperOrientation: "portrait" | "landscape";
  isColour: boolean;
  scaling: number;
  isDoubleSided: boolean;
};

export type Service = {
  serviceType: "bookbinding" | "bookbindingWithCover" | "laminate";
  bookbindingTypeId?: number;
  notes?: string;
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
  price?: number;
  notes?: string;
  statusHistory: OrderStatusUpdate[];
  files: File[];
  services: Service[];
};

export type OrdersGlance = {
  ongoing: CompactOrder[];
  finished: CompactOrder[];
};
