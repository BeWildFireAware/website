'use client';
//NAV BAR LOGIN BUTTON
//TO BE REMOVED AT OTHER TIME
//WANT TO ONLY ACCESS IF YOU KNOW LINK TO REACH ADMIN DASH
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useRequireAuth from '../auth/useRequiredAuth.jsx';
import useLogOut from '../auth/useLogOut.jsx';

export default function AuthNav() {
  const { session } = useRequireAuth();
  const { logout } = useLogOut();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    session ? (
      <button onClick={handleLogout}>Log Out</button>

    ) : (
      <Link href="/auth/logIn">Log In</Link>

    )
  );
}