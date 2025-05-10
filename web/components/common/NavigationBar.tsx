import MaterialIcon from "@/components/common/MaterialIcon";
import PersonAvatar from "@/components/common/PersonAvatar";
import cn from "@/utils/helpers/cn";
import getUserFullName from "@/utils/helpers/getUserFullName";
import getUserProfileURL from "@/utils/helpers/getUserProfileURL";
import isSignedIn from "@/utils/helpers/isSignedIn";
import { NavigationBarProps } from "@/utils/types/common";
import Link from "next/link";
import { useRouter } from "next/router";

/**
 * The navigation bar for all types of users including guest.
 *
 * @param title           The main text appeared on the navigation bar.
 * @param desc            The description text appeared below title.
 * @param backEnabled     Show back button (defaults to false)
 * @param backContextURL  The URL to redirect when user press back. If not
 *                        provided, the button will redirects to the previous
 *                        page in history instead.
 * @param children        The element extension for the right side of the bar.
 *
 * @returns The navigation bar element.
 */

const NavigationBar = ({
  title,
  desc,
  backEnabled = false,
  backContextURL,
  className,
  children,
}: NavigationBarProps) => {
  const router = useRouter();

  const handleBackButtonClicked = () => {
    if (backContextURL) {
      return router.push(backContextURL);
    }
    return router.back();
  };

  return (
    <nav
      className={cn(
        `sticky top-0 flex justify-between items-center gap-2 border-b 
          border-outline bg-surfaceContainer [&>div]:flex [&>div]:items-center 
          [&>div]:gap-3 [&>div]:h-full`,
        className
      )}
    >
      <div className="p-3">
        {backEnabled && (
          <div
            className="cursor-pointer w-6 h-6"
            onClick={handleBackButtonClicked}
          >
            <MaterialIcon icon="arrow_back" />
          </div>
        )}
        <div className="flex flex-col gap-0">
          <p>{title}</p>
          <p className="text-bodySmall opacity-50">{desc}</p>
        </div>
      </div>
      <div className="p-2">
        {children}
        {
          // If the user is signed in, display the profile picture.
          !isSignedIn() && (
            <Link href="/settings">
              <PersonAvatar
                profile_url={getUserProfileURL()}
                person_name={getUserFullName()}
              />
            </Link>
          )
        }
      </div>
    </nav>
  );
};

export default NavigationBar;
