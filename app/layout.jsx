import "./globals.css";
<<<<<<< HEAD
import Link from "next/link";
import DropDownClient from "./components/dropdown_comp/DropDownClient";
import { GetDropdownData } from "./components/dropdown_comp/GetDropdownData";

=======
import Navbar from "./components/Navbar";
>>>>>>> ea7079f8ed3cf5cdd2a9daafd9bfd5d63142f5df

export const metadata = {
  title: "Wildfire Data Dashboard",
  description: "Wildfire dispatch and FDRA data management",
};

<<<<<<< HEAD
export default async function RootLayout({ children }) {

  const {data} = await GetDropdownData();
  return (
    <html lang="en">
      <body>
        
        <nav className="nav-Bar-Top">
          <div className="logo-navbar"> 
            <img src="/images/bwa_logo_150x150px.webp" width="60" height="60"/>
          </div>
          
          <Link href="/"> Home</Link>
          <Link href="/about"> Who We Are</Link>
          <Link href="/data"> Data</Link>
          <Link href="/learn-more"> Learn More</Link>
          <Link href="/map"> View Map</Link>
          <DropDownClient dispatchData={data} />
        </nav>
        
        <div className="page-container">
          {children}
        </div>
        
        <nav className="nav-Bar-Bottom">
          <Link href="/"> Home</Link>
          <Link href="/about"> Who We Are</Link>
          <Link href="/data"> Data</Link>
          <Link href="/learn-more"> Learn More</Link>
        </nav>
          
        
        <p className="contact-info">Contact us at **@gmail.com</p>
=======
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Navigation bar appears on all pages */}
        <Navbar />
        {children}
>>>>>>> ea7079f8ed3cf5cdd2a9daafd9bfd5d63142f5df
      </body>
    </html>
  );
}
