import MaterialIcon from "@/components/common/MaterialIcon";
import PersonAvatar from "@/components/common/PersonAvatar";
import { useNavbarContext } from "@/hooks/useNavbarContext";
import { useUserContextDangerously } from "@/hooks/useUserContext";
import { cn } from "@/utils";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, type FC, type ReactNode } from "react";

export type NavigationBarProps = {
  className?: string;
  description?: ReactNode;
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
 * @param props.description     A short description or subtitle that appears
 *                              below the main title.
 * @param props.backContextURL  A specific URL for the back button to navigate
 *                              to. Overrides default back behavior.
 * @param props.children        Elements to be rendered on the right side of the
 *                              navigation bar.
 */
const NavigationBar: FC<NavigationBarProps> = ({
  className,
  description,
  children,
}) => {
  const router = useRouter();
  const { title, backEnabled, backContextURL, showUser } = useNavbarContext();
  const user = useUserContextDangerously();

  const onBackButtonClick = useCallback(
    () => {
      if (backContextURL) {
        router.push(backContextURL);
      } else {
        router.back();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [backContextURL],
  );

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
        <div className="cursor-pointer p-1" onClick={onBackButtonClick}>
          <MaterialIcon icon="arrow_back" />
        </div>
      )}
      <div className="p-1">
        <AnimatePresence>
          <motion.div
            initial={{ x: backEnabled ? 0 : -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: backEnabled ? 0 : -24, opacity: 0 }}
            transition={{
              x: { type: "spring", bounce: 0 },
            }}
          >
            <div className="w-full">
              {title !== undefined ? (
                title
              ) : (
                <div className="h-4 w-32 animate-pulse rounded-sm bg-outline" />
              )}
            </div>
            <div
              className={cn(
                `text-body-sm opacity-50`,
                backEnabled && "text-center",
              )}
            >
              {description}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div>
        {children}
        {showUser && user && user.role !== "merchant" && (
          <Link href="/settings">
            <PersonAvatar profileUrl={user.profileUrl} personName={user.name} />
          </Link>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
