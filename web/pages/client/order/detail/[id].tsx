import { useRouter } from "next/router";
import NavigationBar from "@/components/common/NavigationBar";
import { GetServerSideProps } from "next";
import getLoggedInUser from "@/utils/helpers/getLoggedInUser";

type OrderDetailsPageProps = {
  user: any;
};

const OrderDetailsPage = ({ user }: OrderDetailsPageProps) => {
  const router = useRouter();

  return (
    <>
      <NavigationBar
        title={`Order #${router.query.id}`}
        backEnabled={true}
        user={user}
      />
      <main>{router.query.id}</main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (req) => {
  const user = await getLoggedInUser(req);

  return { props: { user } };
};

export default OrderDetailsPage;
