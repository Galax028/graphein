const getGreetingMessage = (): string => {
  const hour = new Date().getHours();

  if (hour >= 19 || (hour >= 0 && hour <= 3)) {
    return "greeting.midnight";
  } else if (hour >= 16) {
    return "greeting.evening";
  } else if (hour >= 12) {
    return "greeting.afternoon";
  } else {
    return "greeting.morning";
  }
};

export default getGreetingMessage;
