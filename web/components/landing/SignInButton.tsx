import Button from "@/components/common/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/router";
import { useState, type FC } from "react";

/**
 * The sign in button using the application's design language.
 *
 * This button is named "SignInButton" only because this application
 * is using Google as the definitive account system.
 *
 * @returns The 'Sign in with Google' button.
 */
const SignInButton: FC = () => {
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();

  const [isSigningIn, setIsSigningIn] = useState(false);

  const onSignInButtonClick = () => {
    setIsSigningIn(true);
    const signInWindow = window.open(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/google/init",
      "_blank",
      "popup, width=800, height=600",
    );
    const popupCloseCheckInterval = window.setInterval(() => {
      if (signInWindow?.closed) {
        clearTimeout(popupCloseCheckInterval);
        setIsSigningIn(false);
      }
    }, 500);

    window.addEventListener(
      "message",
      (event) => {
        if (event.data == "oauthSuccess") {
          signInWindow?.close();
          queryClient.invalidateQueries({ queryKey: ["user"], exact: true });
          router.push("/glance");
        }
      },
      { once: true },
    );
  };

  return (
    <Button
      appearance="tonal"
      onClick={onSignInButtonClick}
      busy={isSigningIn}
      busyWithText={false}
    >
      <Image
        src="/images/common/google-logo_light.svg"
        width={18}
        height={18}
        alt="Google Logo"
        className="aspect-square"
      />
        <span className="block w-full pr-3">{t("container.signInButton")}</span>
    </Button>
  );
};

export default SignInButton;
