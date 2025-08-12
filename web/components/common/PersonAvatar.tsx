import MaterialIcon from "@/components/common/MaterialIcon";
import { cn } from "@/utils";
import getInitialsOfName from "@/utils/helpers/getInitialsOfName";
import Image from "next/image";
import type { FC } from "react";

type PersonAvatarProps = {
  className?: string;
  profileUrl?: string;
  personName?: string;
  size?: number;
};

/**
 * Renders a user's avatar with a fallback system.
 *
 * It prioritizes displaying a profile image if a URL is provided. If no URL is
 * available, it falls back to showing the user's initials derived from their
 * name. If neither is present, it displays a generic avatar icon.
 *
 * @param props.profileUrl  The URL path to the user's profile image.
 * @param props.personName  The full name of the user, used for initials.
 * @param props.size        The size of the avatar in pixels. Defaults to 32.
 */
const PersonAvatar: FC<PersonAvatarProps> = ({
  className,
  profileUrl,
  personName,
  size = 32,
}) => (
  <div
    style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
    className={cn(
      `
        grid aspect-square place-content-center overflow-hidden rounded-full
        border border-outline
      `,
      className,
    )}
  >
    {profileUrl ? (
      <Image
        src={profileUrl}
        width={size}
        height={size}
        alt="Avatar"
        style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
        className="aspect-square h-full w-full object-cover"
      />
    ) : personName ? (
      <span className="text-body-sm">{getInitialsOfName(personName)}</span>
    ) : (
      <MaterialIcon icon="account_circle" />
    )}
  </div>
);

export default PersonAvatar;
