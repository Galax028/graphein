// Interface

export type LangCode = "th" | "en";

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

export type SegmentedButtonProps = {
  children: React.ReactNode;
  className?: string;
}

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
}

// Input Label

export type InputLabelProps ={
  label: string;
  children: React.ReactNode;
}