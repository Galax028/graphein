import Button from "../common/Button";
import Image from "next/image";

const GoogleSignInButton = () => {
  return (
    <Button appearance={"tonal"}>
      {/* Show the logo variant in their respective theme. */}
      <>
        <Image
          src={"/images/common/google-logo_light.svg"}
          width={18}
          height={18}
          alt="Google Logo"
          className="dark:hidden aspect-square"
        />
        <Image
          src={"/images/common/google-logo_dark.svg"}
          width={18}
          height={18}
          alt="Google Logo"
          className="hidden dark:block aspect-square"
        />
      </>
      <span className="block w-full pr-3">Sign in with Google</span>
    </Button>
  );
};

export default GoogleSignInButton;