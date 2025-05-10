export default async function getLoggedInUser(context: any) {
  const user = fetch(
    process.env.NEXT_PUBLIC_SKPF_API_PATH + "/user",
    {
      method: "GET",
      headers: {
        Cookie: context.req.headers.cookie || "",
      },
    }
  );

  return (await user).json()
}