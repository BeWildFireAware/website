import Link from "next/link";

// Navigation bar component with links to different pages
export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo/Brand */}
        <Link href="/" className="navbar-brand">
          Wildfire Data Dashboard
        </Link>
        {/* Navigation links */}
        <ul className="nav-links">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/csvPreview">CSV Preview</Link>
          </li>
          <li>
            <Link href="/about">About Me</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
