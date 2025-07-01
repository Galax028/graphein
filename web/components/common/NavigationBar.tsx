import MaterialIcon from "@/components/common/MaterialIcon";
import PersonAvatar from "@/components/common/PersonAvatar";
import cn from "@/utils/helpers/cn";
import type { User } from "@/utils/types/backend";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, type ReactNode, useEffect, useState } from "react";

export type NavigationBarProps = {
  user?: User;
  title: ReactNode;
  desc?: ReactNode;
  backEnabled: boolean;
  backContextURL?: string;
  className?: string;
  style?: string;
  children?: ReactNode;
};

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
const NavigationBar: FC<NavigationBarProps> = ({
  title,
  desc,
  backEnabled = false,
  backContextURL,
  className,
  children,
}) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
        method: "GET",
        credentials: "include",
      });

      const body = await res.json();

      if (res.ok) setUser(body.data as User);
    };

    if (!user) getUser();
  }, [user]);

  const onBackButtonClick = () => {
    if (backContextURL) {
      return router.push(backContextURL);
    }
    return router.back();
  };

  return (
    <nav
      className={cn(
        // `sticky top-0 flex justify-between items-center gap-2 border-b
        //   border-outline bg-surface-container [&>div]:flex [&>div]:items-center
        //   [&>div]:gap-3 [&>div]:h-full z-50`,
        `sticky top-0 flex justify-between items-center gap-2 
          bg-background [&>div]:flex [&>div]:items-center 
          [&>div]:gap-3 [&>div]:h-full z-40 p-2`,
        className,
      )}
    >
      {backEnabled && (
        <div className="p-1">
          <div className="cursor-pointer w-6 h-6" onClick={onBackButtonClick}>
            <MaterialIcon icon="arrow_back" />
          </div>
        </div>
      )}
      <div className={cn(`p-1 w-full flex`, backEnabled && "justify-center")}>
        <AnimatePresence>
          <motion.div
            initial={{ x: !backEnabled ? -24 : 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: !backEnabled ? -24 : 0, opacity: 0 }}
            transition={{
              x: { type: "spring", bounce: 0 },
            }}
            className={`flex flex-col gap-0`}
          >
            <div className={cn(backEnabled && "text-center")}>{title}</div>
            <div
              className={cn(
                `text-body-sm opacity-50`,
                backEnabled && `text-center`,
              )}
            >
              {desc}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div>
        {children}
        {
          // If the user is signed in, display the profile picture.
          user && (
            <Link href="/settings">
              <PersonAvatar
                profileUrl={user.profileUrl}
                personName={user.name}
              />
            </Link>
          )
        }
      </div>
    </nav>
  );
};

export default NavigationBar;
