import dayjs from "dayjs";

/**
 * Checks localStorage for a valid, non-expired draft order. This function has a
 * side effect: it will clear any invalid or expired draft order data from
 * localStorage.
 *
 * @returns {boolean} Returns true if a valid draft order exists, otherwise
 * false.
 */
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
    window.dispatchEvent(
      new StorageEvent("storage", { key: "orderStage", newValue: null }),
    );
    localStorage.removeItem("draftOrderId");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "draftOrderId", newValue: null }),
    );
    localStorage.removeItem("draftOrderExpiry");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "draftOrderExpiry", newValue: null }),
    );
    localStorage.removeItem("draftOrderData");
    return false;
  }
};

export default checkIsBuildingOrder;
