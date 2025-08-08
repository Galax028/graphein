import MaterialIcon from "@/components/common/MaterialIcon";
import PersonAvatar from "@/components/common/PersonAvatar";
import { cn } from "@/utils";
import type { User } from "@/utils/types/backend";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { FC, ReactNode } from "react";

export type NavigationBarProps = {
  className?: string;
  user?: User;
  title: ReactNode;
  desc?: ReactNode;
  backEnabled?: boolean;
  backContextURL?: string;
  style?: string;
  children?: ReactNode;
};

/**
 * A responsive and animated navigation bar component.
 *
 * This component serves as a sticky header, displaying a title, an optional
 * description, and a back button. It handles navigation contextually, either by
 * using the browser's history or a specified URL. It also provides a slot for
 * children and can display a user avatar that links to the settings page.
 *
 * @param props.className       Additional classes to apply to the main nav
 *                              element.
 * @param props.user            An object containing the current user's data.
 *                              Displays an avatar if provided.
 * @param props.title           The main title to be displayed in the navigation
 *                              bar.
 * @param props.desc            A short description or subtitle that appears
 *                              below the main title.
 * @param props.backEnabled     If true, displays a back arrow icon for
 *                              navigation.
 * @param props.backContextURL  A specific URL for the back button to navigate
 *                              to. Overrides default back behavior.
 * @param props.children        Elements to be rendered on the right side of the
 *                              navigation bar.
 */
const NavigationBar: FC<NavigationBarProps> = ({
  user,
  title,
  desc,
  backEnabled = false,
  backContextURL,
  className,
  children,
}) => {
  const router = useRouter();

  const onBackButtonClick = () => {
    if (backContextURL) {
      router.push(backContextURL);
    } else {
      router.back();
    }
  };

  return (
    <nav
      className={cn(
        `
          sticky top-0 z-40 flex w-full items-center justify-between gap-2
          bg-background p-2 select-none
          [&>div]:flex [&>div]:h-full [&>div]:items-center [&>div]:gap-3
        `,
        className,
      )}
    >
      {backEnabled && (
        <div className="p-1">
          <div className="h-6 w-6 cursor-pointer" onClick={onBackButtonClick}>
            <MaterialIcon icon="arrow_back" />
          </div>
        </div>
      )}
      <div className={cn(`flex w-full p-1`, backEnabled && "justify-center")}>
        <AnimatePresence>
          <motion.div
            initial={{ x: !backEnabled ? -24 : 0, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: !backEnabled ? -24 : 0, opacity: 0 }}
            transition={{
              x: { type: "spring", bounce: 0 },
            }}
            className="flex flex-col gap-0"
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
        {user && user.role !== "merchant" && (
          <Link href="/settings">
            <PersonAvatar profileUrl={user.profileUrl} personName={user.name} />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
