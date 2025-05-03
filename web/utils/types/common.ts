// Base Button
interface BaseButtonProps {
  appearance: "tonal" | "filled";
  className?: string;
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

// Material Icon
export type MaterialIconProps = {
  icon: string;
};

// Person Avatar
export type PersonAvatarProps = {
  profile_url?: string;
  person_name?: string;
  size?: number;
}
