'use client';
//this displays users information from safe profiles page on supabase
//HANDLED IN BACKEND SUPABASE POLICIES
  //ADMIN role can see all
  //EDITOR role can see just own profile
//
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import useRequireAuth from '../../auth/useRequiredAuth.jsx'

//THESE ARE NOT FINISHED YET TO EDIT USERS AND DELETE USERS
function editUser(){
  console.log('edit clickes')
}

function deleteUser(){
  console.log('delete pressed')
}
///

export default function StationPreview() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const {isAdmin} = useRequireAuth();
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
              <button onClick={editUser}>EDIT</button>
              {isAdmin && (
                <button onClick={deleteUser}>DELETE</button>
              )}
            </td>
            
          </tr>
          ))}
        </tbody>
      </table>
    </div>

    
    
    
      
  );
}

