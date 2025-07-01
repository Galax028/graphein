const getLoggedInUser = async (context: any) => {
  const user = fetch(process.env.NEXT_PUBLIC_API_PATH + "/user", {
    method: "GET",
    headers: {
      Cookie: context.req.headers.cookie || "",
    },
  });

  return (await user).json();
};

export default getLoggedInUser;
