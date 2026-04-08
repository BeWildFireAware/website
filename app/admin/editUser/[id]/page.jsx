'use client';

import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import useRequireAuth from '../../../auth/useRequiredAuth.jsx';
import { useParams, useRouter } from 'next/navigation';

export default function EditUser() {
    const { session, loading, isAdmin } = useRequireAuth();//check if logged in and if admin
    const { id } = useParams();//get user id from url
    const router = useRouter();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');

    

    useEffect(() => {
        if (!id) return;

        const fetchUser = async () => {
            const response = await fetch(`/api/getUser?userId=${id}`);//call api route to get user data from supabase
            const result = await response.json();
            if (!result.success) {
                console.error('Error fetching user:', result.message);
                alert('Error fetching user: ' + result.message);
                router.push('/admin');
                return;
            }

            if (result?.data) {
                setDisplayName(result.data.display_name);
                setEmail(result.data.email);
                setRole(result.data.role);
            }
        };

        fetchUser();
    }, [id]);//fetch user data to prefill form

    if (loading || !session) {
        return <p>Loading...</p>;
    }

    const handleUpdate = async (e) => {
        e.preventDefault();

        const isSelf = session.user.id === id;

        const payload = {
            userId: id,
            displayName,
            email,
            role: isAdmin ? role : null, // only admin can set role
            isSelf
        };

        try {
             //if admin is editing another user's profile, allow them to update display name, email, and role

            const response = await fetch(`/api/updateUser`, {//call api route to update user role in supabase auth
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
            });

                const result = await response.json();

                if (!result.success) {
                    console.log('Error updating user:', result.message);
                    alert('Error updating user: ' + result.message);
                    return;
                }
                 alert('User updated successfully!');
                router.push('/admin');
           

        } 
        catch (err) {
            console.error('Error updating user:', err);
        }
    };


    return (
        <div>
            <h1>Edit User</h1>

            <form onSubmit={handleUpdate}>
                <div>
                    <label>Display Name: </label>
                    <input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />
                </div>

                <div>
                    <label>Email: </label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/*Only admin sees role controls */}
                {isAdmin && (
                    <section className='radio-signUp'>
                        <input
                            type="radio"
                            name="role"
                            value="ADMIN"
                            checked={role === 'ADMIN'}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label>Admin</label>

                        <input
                            type="radio"
                            name="role"
                            value="EDITOR"
                            checked={role === 'EDITOR'}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label>Editor</label>
                    </section>
                )}

                <button type="submit">Update User</button>
            </form>
        </div>
    );
}