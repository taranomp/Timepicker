import "./globals.css";

export const metadata = {
  title: "MFT Time Picker",
  description: "Time Picker app for MFT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
