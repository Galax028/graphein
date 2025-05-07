import cn from "@/utils/helpers/cn";
import getInitialsOfString from "@/utils/helpers/getInitialsOfString";
import { PersonAvatarProps } from "@/utils/types/common";
import Image from "next/image";
import MaterialIcon from "./MaterialIcon";

/**
 * The avatar of the person. Image will be displayed if `profile_url` is
 * given, followed by `person_name`, before falling back to an avatar icon.
 *
 * @param profile_url Path to the profile image.
 * @param person_name The person's full name. Will be initialized.
 * @param size The size of the avatar, in pixels. (Will be converted to rem).
 *
 * @returns Avatar circle consisting of image,
 * or text styled according to parameters.
 */

const PersonAvatar = ({
  person_name,
  profile_url,
  size = 32,
}: PersonAvatarProps) => {
  return (
    <div
      style={{ width: `${size / 16}rem`, height: `${size / 16}rem` }}
      className={cn(
        `grid place-content-center rounded-full aspect-square 
        overflow-hidden border border-outline bg-primary text-onPrimary`
      )}
    >
      {profile_url ? (
        <Image
          src={profile_url}
          width={size}
          height={size}
          alt="Avatar"
          className="aspect-square w-full h-full object-cover"
        />
      ) : person_name ? (
        <span className="text-bodySmall">
          {getInitialsOfString(person_name)}
        </span>
      ) : (
        <MaterialIcon icon="account_circle" />
      )}
    </div>
  );
};

export default PersonAvatar;
