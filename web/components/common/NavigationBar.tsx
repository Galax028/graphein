import MaterialIcon from "@/components/common/MaterialIcon";
import PersonAvatar from "@/components/common/PersonAvatar";
import cn from "@/utils/helpers/cn";
import { NavigationBarProps } from "@/utils/types/landing";
import { useRouter } from "next/router";
import isSignedIn from "@/utils/helpers/isSignedIn";
import Link from "next/link";

const NavigationBar = ({
  title,
  description,
  backEnabled = false,
  backContextURL,
  className,
  style,
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
          <p className="text-xs opacity-50">{description}</p>
        </div>
      </div>
      <div className="p-2">
        {children}
        {
          // If the user is signed in, display the profile picture.
          isSignedIn() && (
            <Link href="/settings">
              <PersonAvatar person_name="John Pork" />
            </Link>
          )
        }
      </div>
    </nav>
  );
};

export default NavigationBar;
