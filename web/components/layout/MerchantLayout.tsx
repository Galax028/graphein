import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import PageLoadTransition from "@/components/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { type ReactNode, type FC, useEffect } from "react";
import useToggle from "@/hooks/useToggle";
import useNavbarContext from "@/hooks/useNavbarContext";

type MerchantLayoutProps = {
  page: "dashboard" | "management";
  translationNamespace: string;
  children: ReactNode;
};

/**
 * Provides a consistent layout structure for all merchant-facing pages.
 *
 * This component includes the main navigation bar with links to the dashboard
 * and management pages, a sign-out button with a confirmation dialog.
 *
 * @param props.page                   Identifies the currently active page to
 *                                     highlight the correct navigation button.
 * @param props.translationNamespace   The namespace for `next-intl` to load the
 *                                     correct page-specific translations.
 * @param props.children               The main page content to be rendered
 *                                     within the layout.
 */
const MerchantLayout: FC<MerchantLayoutProps> = ({
  page,
  translationNamespace,
  children,
}) => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations(translationNamespace);
  const { setNavbarTitle } = useNavbarContext();

  const [showSignOutDialog, toggleShowSignOutDialog] = useToggle(false);
  const [isSigningOut, toggleIsSigningOut] = useToggle();

  useEffect(() => setNavbarTitle(t("navigationBar")), [t, setNavbarTitle]);

  const handleSignOut = async () => {
    toggleIsSigningOut(true);

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
      { method: "POST", credentials: "include" },
    );

    if (res.ok) {
      return router.push("/?asMerchant=true");
    }
  };

  return (
    <div className="flex h-dvh flex-col items-center overflow-hidden">
      {/* title={t("navigationBar")} */}
      <NavigationBar>
        <SegmentedGroup>
          <Button
            appearance="tonal"
            className={page === "dashboard" ? "font-bold" : undefined}
            onClick={() => router.push("/merchant/dashboard")}
          >
            Dashboard
          </Button>
          <Button
            appearance="tonal"
            className={page === "management" ? "font-bold" : undefined}
            onClick={() => router.push("/merchant/management")}
          >
            Management
          </Button>
        </SegmentedGroup>
        <Button
          appearance="tonal"
          icon="logout"
          busy={isSigningOut}
          disabled={isSigningOut}
          onClick={() => toggleShowSignOutDialog(true)}
        />
      </NavigationBar>
      <PageLoadTransition className="!grid h-full !max-w-full grid-cols-4 gap-2">
        {children}
      </PageLoadTransition>

      <AnimatePresence>
        {showSignOutDialog && (
          <Dialog
            title={t("signOut.title")}
            desc={t("signOut.description")}
            setClickOutside={toggleShowSignOutDialog}
          >
            <Button
              appearance="tonal"
              onClick={() => toggleShowSignOutDialog(false)}
              disabled={isSigningOut}
            >
              {tx("action.nevermind")}
            </Button>
            <Button
              appearance="filled"
              onClick={handleSignOut}
              busy={isSigningOut}
              busyWithText={false}
            >
              {t("signOut.title")}
            </Button>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MerchantLayout;
