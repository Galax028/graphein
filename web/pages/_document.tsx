import type { PageProps } from "@/utils/types/common";
import { Head, Html, Main, NextScript } from "next/document";
import type { FC } from "react";

const Document: FC<PageProps> = () => (
  <Html lang="en">
    <Head />
    <body className="antialiased">
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
