import Button from "@/components/common/Button";
import type { User } from "@/utils/types/backend";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/router";
import type { Dispatch, FC, SetStateAction } from "react";

type SignInButtonProps = {
  isSigningIn: boolean;
  setIsSigningIn: Dispatch<SetStateAction<boolean>>;
  asMerchant: boolean | null;
};

/**
 * The sign in button using the application's design language.
 *
 * This button is named "SignInButton" only because this application
 * is using Google as the definitive account system.
 *
 * @returns The 'Sign in with Google' button.
 */
const SignInButton: FC<SignInButtonProps> = ({
  isSigningIn,
  setIsSigningIn,
  asMerchant,
}) => {
  const router = useRouter();
  const t = useTranslations();
  const queryClient = useQueryClient();

  const onSignInButtonClick = () => {
    setIsSigningIn(true);
    const signInWindow = window.open(
      process.env.NEXT_PUBLIC_API_PATH +
        "/auth/google/init" +
        (asMerchant ? "?asMerchant=true" : ""),
      "_blank",
      "popup, width=800, height=600",
    );
    const popupCloseCheckInterval = window.setInterval(() => {
      if (signInWindow?.closed) {
        clearTimeout(popupCloseCheckInterval);
        setIsSigningIn(false);
      }
    }, 500);

    const handleOAuthMessage = (event: MessageEvent<string>) => {
      if (event.data === "oauthSuccess") {
        signInWindow?.close();
        queryClient
          .refetchQueries({ queryKey: ["user"], exact: true })
          .then(() => {
            const user = queryClient.getQueryData(["user"]) as User;
            router.push(
              user.role === "merchant" ? "/merchant/dashboard" : "/glance",
            );
          });
      }
    };

    window.addEventListener("message", handleOAuthMessage, { once: true });

    return () => {
      window.removeEventListener("message", handleOAuthMessage);
    };
  };

  return (
    <Button
      appearance="tonal"
      onClick={onSignInButtonClick}
      busy={asMerchant === null || isSigningIn}
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
