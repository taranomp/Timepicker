import "bootstrap/dist/css/bootstrap.min.css";

import "./globals.css";
import TobBar from "@/components/TobBar";

export const metadata = {
  title: "MFT Time Picker",
  description: "Time Picker app for MFT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" >
      <body>
        <TobBar />
        {children}
      </body>
    </html>
  );
}
