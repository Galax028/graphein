const getGreetingMessage = (t: any, username: string): string => {
  const hour = new Date().getHours();

  if (hour >= 19 || (hour >= 0 && hour <= 3)) {
    return t("greeting.midnight", { username });
  } else if (hour >= 16) {
    return t("greeting.evening", { username });
  } else if (hour >= 12) {
    return t("greeting.afternoon", { username });
  } else {
    return t("greeting.morning", { username });
  }
};

export default getGreetingMessage;
