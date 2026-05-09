import type { ReactNode } from "react";
import PublishButton from "./_components/PublishButton";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <PublishButton />
      </body>
    </html>
  );
}
