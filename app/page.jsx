import Image from "next/image";
import Link from "next/link";
export default function homePage() {
  return(
    <>

    <section className="homepage-header">
      <h1>Be Wildfire Aware</h1>
      <p> Stay Informed and Stay Safe</p>  
    </section> 
    <h2>Dispatch Areas</h2>
    <p>Explore the current wildfire danger in your area</p>
    <Link href="/map"> <button>Explore Dispatch Areas</button></Link>
    <img src="/images/FEMS_logo.png" width="301" height="47"/>

    <p>Weather and NFDRS data now coming from FEMS</p> 
    </>
  );
}