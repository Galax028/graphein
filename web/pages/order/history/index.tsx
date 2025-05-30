import NavigationBar from "@/components/common/NavigationBar";

const OrderHistoryPage = () => {
  return (
    <>
      <NavigationBar
        title="Order History"
        backEnabled={true}
        backContextURL={"/glance"}
      />
      <main>OrderHistoryPage</main>
    </>
  );
};

export default OrderHistoryPage;
