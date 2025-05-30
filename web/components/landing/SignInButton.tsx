import Image from "next/image";
import { useRouter } from "next/router";
import Button from "../common/Button";
import { useEffect } from "react";

/**
 * The sign in button using the application's design language.
 *
 * This button is name "SignInButton" only because this application
 * is using Google as the definitive account system.
 *
 * @returns The 'Sign in with Google' button.
 */

const SignInButton = () => {
  const router = useRouter();

  const onSignInButtonClick = () => {
    const signInWindow = window.open(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/google/init",
      "_blank",
      "popup, width=800, height=600"
    );

    window.addEventListener("message", (event) => {
      if (event.data == "oauthSuccess") {
        signInWindow?.close();
        router.push("/glance");
      }
    });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
        method: "GET",
        credentials: "include",
      });

      // If the user is logged in, redirect the to /glance
      if (res.ok) return router.push("/glance");
      return;
    };

    fetchUser();
  });

  return (
    <Button appearance={"tonal"} onClick={onSignInButtonClick}>
      <Image
        src={"/images/common/google-logo_light.svg"}
        width={18}
        height={18}
        alt="Google Logo"
        className="aspect-square"
      />
      <span className="block w-full pr-3">Sign in with Google</span>
    </Button>
  );
};

export default SignInButton;
