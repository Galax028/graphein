import Button from "@/components/common/Button";
import Dialog from "@/components/common/Dialog";
import PageLoadTransition from "@/components/layout/PageLoadTransition";
import NavigationBar from "@/components/common/NavigationBar";
import SegmentedGroup from "@/components/common/SegmentedGroup";
import { AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/router";
import { type ReactNode, useState, type FC } from "react";

type MerchantLayoutProps = {
  page: "dashboard" | "management";
  translationNamespace: string;
  children: ReactNode;
};

const MerchantLayout: FC<MerchantLayoutProps> = ({
  page,
  translationNamespace,
  children,
}) => {
  const router = useRouter();
  const tx = useTranslations("common");
  const t = useTranslations(translationNamespace);

  const [showSignOutDialog, setShowSignOutDialog] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
      { method: "POST", credentials: "include" },
    );

    if (res.ok) {
      return router.push("/?asMerchant=true");
    }
  };

  return (
    <div className="flex flex-col items-center h-dvh overflow-hidden">
      <NavigationBar title={t("navigationBar")}>
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
          onClick={() => setShowSignOutDialog(true)}
        />
      </NavigationBar>
      <PageLoadTransition className="md:!w-full !max-w-full h-full !grid grid-cols-4 gap-2">
        {children}
      </PageLoadTransition>

      <AnimatePresence>
        {showSignOutDialog && (
          <Dialog
            title={t("signOut.title")}
            desc={t("signOut.description")}
            setClickOutside={setShowSignOutDialog}
          >
            <Button
              appearance="tonal"
              onClick={() => setShowSignOutDialog(false)}
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
