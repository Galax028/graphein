import { type NextRequest, NextResponse } from "next/server";

export const middleware = (request: NextRequest) => {
  if (request.nextUrl.pathname.startsWith("/_next")) return;

  let response = NextResponse.next();
  const locale = request.cookies.get("NEXT_LOCALE")?.value ?? "default";
  if (locale === "default")
    response.cookies.set(
      "NEXT_LOCALE",
      process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "en",
    );

  const langQueryParam = request.nextUrl.searchParams.get("lang");
  if (langQueryParam) {
    request.nextUrl.searchParams.delete("lang");
    response = NextResponse.redirect(request.nextUrl);
    response.cookies.set("NEXT_LOCALE", langQueryParam);
  }

  return response;
};
