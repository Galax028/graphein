import NavigationBar from "@/components/common/NavigationBar";

const OrderHistoryPage = () => {
  return (
    <>
      <NavigationBar 
        title="Order History"
        backEnabled={true}
        backContextURL={"/client/dashboard"}
      />
      <main>OrderHistoryPage</main>
    </>
  );
};

export default OrderHistoryPage;
