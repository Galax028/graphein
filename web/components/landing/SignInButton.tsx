import Button from "../common/Button";
import Image from "next/image";

/**
 * The sign in button using the application's design language.
 *
 * This button is name "SignInButton" only because this application
 * is using Google as the definitive account system.
 *
 * @returns The 'Sign in with Google' button.
 */

const SignInButton = () => {
  return (
    <Button appearance={"tonal"}>
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
