//Top Nav Bar and Bottom Border Bar

import "./layouts/globals.css";
import Link from "next/link";
import DropDownClient from "./components/dropdown_comp/DropDownClient";
import { GetDropdownData } from "./components/dropdown_comp/GetDropdownData";
import LearnMoreDropDown from "./components/dropdown_comp/LearnMoreDropDown"
// import AuthNav from "./deprecated/authNav"
import 'leaflet/dist/leaflet.css'; //for map comp 

export const metadata = {
  title: "Wildfire Data Dashboard",
  description: "Wildfire dispatch and FDRA data management",
};

export default async function RootLayout({ children }) {
  
  const {data} = await GetDropdownData();
  return (
    <html lang="en">
      <body>
        
        <nav className="nav-Bar-Top">
          <div className="logo-navbar">
            <img src="/images/bwa_logo_150x150px.webp" width="90px" height="90px" />
          </div>

          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/map">View Map</Link>
            <Link href="/resources">Resources</Link>
            <LearnMoreDropDown>Learn More</LearnMoreDropDown>
            <DropDownClient dispatchData={data} />
          </div>
        </nav>
        
        <div className="page-container">
          {children}
        </div>
        
        <nav className="nav-Bar-Bottom">
          <Link href="/">✪ Home</Link>
          <Link href="/about">✪ About</Link>
          <Link href="/map">✪ Map</Link>
        </nav>
       
          
        
        <p className="contact-info">Contact us at **@gmail.com</p>
        
      </body>
    </html>
  );
}
