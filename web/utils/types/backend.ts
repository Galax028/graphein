import type { UserRole, Uuid } from "./common";

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

export type OnboardedUser = { isOnboarded: true } & BaseUser;

export type Student = {
  role: "student";
  tel: string;
  class: number;
  classNo: number;
} & OnboardedUser;

export type Teacher = { role: "teacher"; tel: string } & OnboardedUser;

export type Merchant = { role: "merchant" } & OnboardedUser;

export type User = Student | Teacher | Merchant | UnonboardedUser;
