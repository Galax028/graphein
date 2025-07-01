import cn from "@/utils/helpers/cn";
import getInitialsOfString from "@/utils/helpers/common/getInitialsOfString";
import Image from "next/image";
import type { FC } from "react";
import MaterialIcon from "./MaterialIcon";

type PersonAvatarProps = {
  profileUrl?: string;
  personName?: string;
  size?: number;
};

/**
 * The avatar of the person. Image will be displayed if `profileUrl` is
 * given, followed by `personName`, before falling back to an avatar icon.
 *
 * @param profileUrl   Path to the profile image.
 * @param personName   The person's full name. Will be initialized.
 * @param size         The size of the avatar, in pixels.
 *                     (Will be converted to rem).
 */
const PersonAvatar: FC<PersonAvatarProps> = ({
  profileUrl,
  personName,
  size = 32,
}) => (
  <div
    style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
    className={cn(
      `grid place-content-center rounded-full aspect-square 
        overflow-hidden border border-outline bg-primary text-onPrimary`,
    )}
  >
    {profileUrl ? (
      <Image
        src={profileUrl}
        width={size}
        height={size}
        alt="Avatar"
        style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
        className="aspect-square w-full h-full object-cover"
      />
    ) : personName ? (
      <span className="text-body-sm">{getInitialsOfString(personName)}</span>
    ) : (
      <MaterialIcon icon="account_circle" />
    )}
  </div>
);

export default PersonAvatar;
