import dayjs from "dayjs";

const checkIsBuildingOrder = (): boolean => {
  const orderStage = localStorage.getItem("orderStage");
  const draftOrderId = localStorage.getItem("draftOrderId");
  const draftOrderExpiry = localStorage.getItem("draftOrderExpiry");
  const draftOrderData = localStorage.getItem("draftOrderData");
  const now = dayjs();

  if (
    typeof orderStage === "string" &&
    typeof draftOrderId === "string" &&
    typeof draftOrderExpiry === "string" &&
    typeof draftOrderData === "string" &&
    now.isBefore(dayjs(draftOrderExpiry))
  ) {
    return true;
  } else {
    localStorage.removeItem("orderStage");
    localStorage.removeItem("draftOrderId");
    localStorage.removeItem("draftOrderExpiry");
    localStorage.removeItem("draftOrderData");
    console.log("cleared items due to check");
    return false;
  }
};

export default checkIsBuildingOrder;
