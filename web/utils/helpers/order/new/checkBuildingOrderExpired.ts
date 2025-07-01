const checkBuildingOrderExpired = (): boolean => {
  const existing = localStorage.getItem("skpf-buildingOrderCreated");

  if (existing) {
    return new Date().getTime() - new Date(existing).getTime() > 15 * 60 * 1000;
  } else {
    return false;
  }
};

export default checkBuildingOrderExpired;
