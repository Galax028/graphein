import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import PageLoadTransition from "@/components/layout/PageLoadTransition";
import useDialog, { useDialogContext } from "@/hooks/useDialogContext";
import { useNavbar } from "@/hooks/useNavbarContext";
import useToggle from "@/hooks/useToggle";
import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { type FC, type ReactNode, useCallback } from "react";

const MerchantNavbar: FC = () => {
  const router = useRouter();
  const page = router.pathname.includes("dashboard")
    ? "dashboard"
    : "management";
  const tx = useTranslations("common");
  const t = useTranslations(
    page === "dashboard" ? "dashboard" : "merchantGlance",
  );
  const dialog = useDialog();

  const [isSigningOut, toggleSigningOut] = useToggle();

  useNavbar(useCallback(() => ({ title: t("navigationBar") }), [t]));

  const handleSignOut = useCallback(
    async () => {
      toggleSigningOut(true);

      const res = await fetch(
        process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
        { method: "POST", credentials: "include" },
      );

      if (res.ok) {
        dialog.toggle(false);
        return router.push("/?asMerchant=true");
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toggleSigningOut],
  );

  const toggleSignOutDialog = useCallback(
    () =>
      dialog.setAndToggle({
        title: t("signOut.title"),
        description: t("signOut.description"),
        content: (
          <>
            <Button
              appearance="tonal"
              onClick={() => dialog.toggle(false)}
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
          </>
        ),
        allowClickOutside: true,
      }),
    [tx, t, dialog, isSigningOut, handleSignOut],
  );

  return (
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
        onClick={toggleSignOutDialog}
      />
    </NavigationBar>
  );
};

const MerchantLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const dialog = useDialogContext();

  return (
    <div className="flex h-dvh flex-col overflow-y-hidden">
      <MerchantNavbar />
      <PageLoadTransition className="!grid !max-w-full grid-cols-4 gap-2">
        {children}
      </PageLoadTransition>
      <AnimatePresence>
        {dialog.show && (
          <Dialog
            title={dialog.title}
            description={dialog.description}
            toggle={dialog.toggle}
          >
            {dialog.content}
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MerchantLayout;
