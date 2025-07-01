import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Button from "../common/Button";

/**
 * The sign in button using the application's design language.
 *
 * This button is named "SignInButton" only because this application
 * is using Google as the definitive account system.
 *
 * @returns The 'Sign in with Google' button.
 */
const SignInButton = () => {
  const router = useRouter();
  const t = useTranslations();

  const onSignInButtonClick = () => {
    const signInWindow = window.open(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/google/init",
      "_blank",
      "popup, width=800, height=600",
    );

    window.addEventListener(
      "message",
      (event) => {
        if (event.data == "oauthSuccess") {
          signInWindow?.close();
          router.push("/glance");
        }
      },
      { once: true },
    );
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
        method: "GET",
        credentials: "include",
      });

      // If the user is logged in, redirect the to /glance
      if (res.ok) return router.push("/glance");
    };

    if (router.isReady) fetchUser();
  }, [router]);

  return (
    <Button appearance={"tonal"} onClick={onSignInButtonClick}>
      <Image
        src={"/images/common/google-logo_light.svg"}
        width={18}
        height={18}
        alt="Google Logo"
        className="aspect-square"
      />
      <span className="block w-full pr-3">{t("signInWithGoogle")}</span>
    </Button>
  );
};

export default SignInButton;
