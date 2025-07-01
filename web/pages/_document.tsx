import { Head, Html, Main, NextScript } from "next/document";
import type { FC } from "react";

const Document: FC = () => (
  <Html lang="en">
    <Head />
    <body className="antialiased">
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default Document;
