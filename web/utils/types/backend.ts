import type {
  FileType,
  OrderStatus,
  UserRole,
  Uuid,
} from "@/utils/types/common";

export type SuccessAPIResponse<T> = {
  success: true;
  timestamp: string;
  data: T;
  pagination: never;
};

export type PaginatedAPIResponse<T> = {
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

export type APIResponse<T> =
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
  ranges: FileRange[];
};

export type FileRange = {
  id: Uuid;
  range: string | null;
  copies: number;
  paperVariantId: number;
  paperOrientation: "portrait" | "landscape";
  isColour: boolean;
  isDoubleSided: boolean;
};

export type FileCreate = {
  id: Uuid;
  filename: string;
  ranges: FileRangeCreate[];
};

export type FileRangeCreate = {
  key: Uuid;
  open: boolean;
  range: string | null;
  rangeIsValid: boolean;
  copies: number;
  paperVariantId: number;
  paperOrientation: "portrait" | "landscape";
  isColour: boolean;
  isDoubleSided: boolean;
};

export type FileUploadResponse = {
  id: Uuid;
  objectKey: string;
  uploadUrl: string;
};

export type Paper = {
  id: number;
  name: string;
  length: number;
  width: number;
  isDefault: boolean;
  variants: PaperVariant[];
};

export type PaperVariant = {
  id: number;
  name: string;
  isDefault: boolean;
  isAvailable: boolean;
  isLaminatable: boolean;
};

type BaseService = { notes: string | null; fileIds: Uuid[] };

export type BookbindingService = {
  serviceType: "bookbinding" | "bookbindingWithCover";
  bookbindingTypeId: number;
} & BaseService;

export type LaminateService = {
  serviceType: "laminate";
  bookbindingTypeId: null;
} & BaseService;

export type Service = BookbindingService | LaminateService;

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
  owner?: User | undefined;
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

export type MerchantOrdersGlance = {
  incoming: CompactOrder[];
  accepted: CompactOrder[];
  waiting: CompactOrder[];
  finished: CompactOrder[];
};

export type FileDownload = {
  id: Uuid;
  url: string;
};
