import MaterialIcon from "@/components/common/MaterialIcon";
import PersonAvatar from "@/components/common/PersonAvatar";
import cn from "@/utils/helpers/cn";
import { NavigationBarProps } from "@/utils/types/landing";
import { useRouter } from "next/router";
import isSignedIn from "@/utils/helpers/isSignedIn";

const NavigationBar = ({
  title,
  backEnabled = false,
  backContextURL,
  className,
  style,
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
        `flex justify-between items-center gap-2 bg-surfaceContainer border-b border-outline`,
        className
      )}
    >
      <div onClick={handleBackButtonClicked} className="flex gap-3 p-3">
        {backEnabled && <MaterialIcon icon="arrow_back" />}
        {title}
      </div>
      <div className="flex gap-3 p-2">
        {
          // If the user is signed in, display the profile picture.
          isSignedIn() && (
            <PersonAvatar person_name="John Pork" />
          )
        }
      </div>
    </nav>
  );
};

export default NavigationBar;
