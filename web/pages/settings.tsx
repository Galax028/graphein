import Button from "@/components/common/Button";
import getLoggedInUser from "@/utils/helpers/getLoggedInUser";
import { GetServerSideProps } from "next";
import NavigationBar from "@/components/common/NavigationBar";

const SettingsPage = (user: any) => {
  const handleSignOutButton = async () => {
    return;
  };

  return (
    <>
      <NavigationBar title="Settings" backEnabled={true} />
      <div className="p-3">
        <p>{JSON.stringify(user)}</p>
        <Button appearance="tonal" onClick={handleSignOutButton}>
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
