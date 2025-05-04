import NavigationBar from "@/components/common/NavigationBar";
import OrderCard from "@/components/client/dashboard/OrderCard";
import getUserFullName from "@/utils/helpers/getUserFullName";

const ClientDashboard = () => {
  return (
    <>
      <NavigationBar title={`Good morning, ${getUserFullName()}`} />
      <main className="p-3">
        <div className="flex flex-col gap-1 [&>div]:w-full max-w-96">
          <OrderCard
            status="review"
            orderCode="C-028"
            filesCount={1}
            date="28 Febuary 2025"
            />
          <OrderCard
            status="printing"
            orderCode="C-028"
            filesCount={2}
            date="28 Febuary 2025"
            />
          <OrderCard
            status="pickup"
            orderCode="C-028"
            filesCount={3}
            date="28 Febuary 2025"
            />
          <OrderCard
            status="complete"
            orderCode="C-028"
            filesCount={4}
            date="28 Febuary 2025"
            />
          <OrderCard
            status="reject"
            orderCode="C-028"
            filesCount={5}
            date="28 Febuary 2025"
            />
          <OrderCard
            status="cancel"
            orderCode="C028"
            filesCount={6}
            date="28 Febuary 2025"
            />
          <OrderCard
            status="unknown"
            orderCode="C-028"
            filesCount={0}
            date="28 Febuary 2025"
          />
        </div>
      </main>
    </>
  );
};

export default ClientDashboard;
