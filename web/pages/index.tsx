import NavigationBar from "@/components/common/NavigationBar";
import GoogleSignInButton from "@/components/landing/GoogleSignInButton";

const LandingPage = () => {
  return (
    <div className="flex flex-col h-dvh">
      <NavigationBar title={"Welcome to Printer Facility"} />
      <div className="flex flex-col justify-between flex-grow p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="opacity-50">
              Use the email ending in sk.ac.th to continue.
            </p>
          </div>
          <GoogleSignInButton />
        </div>
        <div>
          <p className="text-xs opacity-50">
            SK Printing Facility is a project powered by EPLUS+ students, visit
            About for more information. • SK Printing Facility may collect data
            for analytics and research purposes, see our Privacy Policy and
            Terms of Service for more information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
