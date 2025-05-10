import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/client/dashboard/OrderCard";
import Button from "@/components/common/Button";
import InputLabel from "@/components/common/InputLabel";
import NavigationBar from "@/components/common/NavigationBar";
import getLoggedInUser from "@/utils/helpers/getLoggedInUser";
import getUserFullName from "@/utils/helpers/getUserFullName";
import { testOrdersGlance } from "@/utils/testResponse/clientDashboard";
import { GetServerSideProps } from "next";
import Link from "next/link";

type ClientDashboardProps = {
  user: any;
};

const ClientDashboard = ({ user }: ClientDashboardProps) => {
  console.warn(user);

const ClientDashboard = () => {
  return (
    <>
      <NavigationBar title={`Good morning, ${getUserFullName()}`} />
      <main className="flex flex-col h-full overflow-auto gap-3">
        <div className="flex flex-col p-3 gap-2 [&>div]:w-full h-full overflow-auto pb-16">
          <InputLabel label="Ongoing">
            {testOrdersGlance.OrdersGlance.ongoing.map((order) => {
              return (
                <OrderCard
                  id={order.id}
                  status={order.status}
                  orderNumber={order.orderNumber}
                  createdAt={order.createdAt}
                  filesCount={order.filesCount}
                />
              );
            })}
          </InputLabel>
          <InputLabel label="Completed">
            {testOrdersGlance.OrdersGlance.finished.map((order) => {
              return (
                <OrderCard
                  id={order.id}
                  status={order.status}
                  orderNumber={order.orderNumber}
                  createdAt={order.createdAt}
                  filesCount={order.filesCount}
                />
              );
            })}
          </InputLabel>
          <Link href="/client/order/history">
            <Button appearance={"tonal"} icon={"history"} className="w-full">
              Order History
            </Button>
          </Link>
        </div>
        <div className="fixed p-3 left-0 bottom-0 w-full flex flex-col h-16">
          <Link href="/client/order/new/upload">
            <Button appearance={"filled"} icon={"add"} className="w-full">
              New Order
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (req) => {
  const user = await getLoggedInUser(req);

  return { props: { user } };
};
export default ClientDashboard;
