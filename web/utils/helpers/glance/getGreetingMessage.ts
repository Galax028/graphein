export default function useGreetingMessage(t: any) {
  const hour = new Date().getHours();

  if (hour >= 19 || (hour >= 0 && hour <= 3)) {
    return t("greeting.midnight");
  } else if (hour >= 16) {
    return t("greeting.evening");
  } else if (hour >= 12) {
    return t("greeting.afternoon");
  } else {
    return t("greeting.morning");
  }
}