import Button from "@/components/common/Button";
import getLoggedInUser from "@/utils/helpers/getLoggedInUser";
import { GetServerSideProps } from "next";
import NavigationBar from "@/components/common/NavigationBar";
import { useState } from "react";
import { useRouter } from "next/router";

const SettingsPage = (user: any) => {
  const router = useRouter();
  const [busy, setBusy] = useState<boolean>(false)

  const handleSignOut = async () => {
    setBusy(true)

    const res = await fetch(
      process.env.NEXT_PUBLIC_API_PATH + "/auth/signout",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (res.ok) {
      return router.push("/");
    }
  };

  return (
    <>
      <NavigationBar title="Settings" backEnabled={true} />
      <div className="p-3">
        <p>{JSON.stringify(user)}</p>
        <Button
          appearance="tonal"
          onClick={handleSignOut}
          className="w-full text-actionError"
          icon={"logout"}
          busy={busy}
        >
          Sign Out
        </Button>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (req) => {
  const user = await getLoggedInUser(req);

  return { props: { user } };
};

export default SettingsPage;
