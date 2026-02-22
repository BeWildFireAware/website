import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Wildfire Data Dashboard",
  description: "Wildfire dispatch and FDRA data management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Navigation bar appears on all pages */}
        <Navbar />
        {children}
      </body>
    </html>
  );
}
