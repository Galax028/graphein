// Interface
export type LangCode = "th" | "en";

// Navigation Bar
export type NavigationBarProps = {
  user?: any;
  title: string;
  desc?: string;
  backEnabled?: boolean;
  backContextURL?: string;
  className?: string;
  style?: string;
  children?: React.ReactNode;
};

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
  label: string;
  children: React.ReactNode;
};
