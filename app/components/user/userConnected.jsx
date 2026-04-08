'use client';
//this displays users information from safe profiles page on supabase
//HANDLED IN BACKEND SUPABASE POLICIES
  //ADMIN role can see all
  //EDITOR role can see just own profile
//
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useRequireAuth from '../../auth/useRequiredAuth.jsx'
import { useRouter } from 'next/navigation';
//import deleteUser from '../deleteuser.jsx';

///

export default function StationPreview() {
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const {session,isAdmin} = useRequireAuth();
  const [deletingUserId, setDeletingUserId] = useState(null);
// get profiles of users (admin seed all, editor see own only)
 useEffect(() => {
  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, role');

    if (error) {
      console.error(error);
    } else {
      console.log("profiles:", data);
      setProfiles(data);
    }

    setLoading(false);
  };

  fetchProfiles();
}, []);

//waiting to get users
  if (loading) {
    return <p>Loading users...</p>;
  }

  //THESE ARE NOT FINISHED YET TO EDIT USERS AND DELETE USERS
  function editUser(userId){
    console.log('edit clicked for user:', userId)
    router.push(`../admin/editUser/${userId}`)

  }

  async function deleteUser(userId){
    const isSelf = session.user.id === userId;
    const adminCount = profiles.filter(p => p.role === 'admin').length;
    if(isSelf && adminCount === 1){
      alert('You cannot delete your own account while logged in if you are the only admin. Please log out and contact another admin to delete your account if needed.');
      return;
    }
    
    console.log('delete pressed for user:', userId)
    //router.push(`../admin/deleteUser/${userId}`)
    if(!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')){
      return;
    }

    setDeletingUserId(userId);
    try{
      const response = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      const result = await response.json();
      if(!result.success){
        alert('Error deleting user: ' + result.message);
      } else {
        setProfiles(profiles.filter(profile => profile.id !== userId));
        alert('User deleted successfully');

      }
    }
    catch(error){
      console.error('Error deleting user:', error);
      alert('An unexpected error occurred while deleting the user.');
    }
    finally{
      setDeletingUserId(null);
    }

  }

  return (


    <div>
      <h1>User Profiles</h1>
      <table className ="userTable">
        <thead>
          <tr>
            <th>NAME</th>
            <th>EMAIL</th>
            <th>ROLE</th>
            <th>ACTION</th>
          </tr>
        </thead>

      
      <tbody>
          {profiles.map((profile) => (
          <tr key={profile.id}>
            <td>{profile.display_name}</td>
            <td>{profile.email}</td>
            <td>{profile.role}</td>
            <td>
              {/* implement functions later */}
              <button onClick={() => editUser(profile.id)}>EDIT</button>
              {isAdmin && (
                <button onClick={() => deleteUser(profile.id)} disabled={deletingUserId === profile.id}>
                  {deletingUserId === profile.id ? 'DELETING...' : 'DELETE'}
                </button>
              )}
            </td>
            
          </tr>
          ))}
        </tbody>
      </table>
    </div>

    
    
    
      
  );
}

