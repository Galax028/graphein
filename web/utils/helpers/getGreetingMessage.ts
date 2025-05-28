export default function getGrettingMessage() {
  const hour = new Date("December 17, 1995 12:24:00").getHours();

  if (hour >= 19 || (hour >= 0 && hour <= 3)) {
    return "Hi";
  } else if (hour >= 16) {
    return "Good evening";
  } else if (hour >= 12) {
    return "Good afternoon";
  } else {
    return "Good morning";
  }
}
