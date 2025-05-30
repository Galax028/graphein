// Interface
export type LangCode = "th" | "en";
export type UserTypes = "student" | "teacher" | "merchant";

// Base Button
interface BaseButtonProps {
  appearance: "tonal" | "filled";
  selected?: boolean;
  disabled?: boolean;
  busy?: boolean;
  busyWithText?: boolean;
  className?: string;
  onClick?: any;
}
interface IconButtonProps extends BaseButtonProps {
  icon: string;
  children?: never;
}
interface TextButtonProps extends BaseButtonProps {
  icon?: string | null | undefined;
  children: React.ReactNode;
}

export type ButtonProps = IconButtonProps | TextButtonProps;

// Segmented Button

export type SegmentedGroupProps = {
  children: React.ReactNode;
  className?: string;
  direction?: "horizontal" | "vertical";
};

// Material Icon
export type MaterialIconProps = {
  icon: string;
  className?: string;
};

// Person Avatar
export type PersonAvatarProps = {
  profile_url?: string;
  person_name?: string;
  size?: number;
};

// Input Label

export type InputLabelProps = {
  header: string;
  footer?: string;
  children: React.ReactNode;
};
