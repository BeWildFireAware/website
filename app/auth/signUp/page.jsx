'use client';
//can only be accessed by ADMIN users
//this page handles signing up users 
//need email (checked by supabase)
//need display name
//need to set admin role type
//need password and need to confirm (automatically hashed and secured by supabase)

import { supabase } from '@/lib/supabase';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useRequireAuth from '../useRequiredAuth.jsx'
import Link from 'next/link';




export default function SignUpForm() {
    //const [isLogin, setIsLogin] = useState(true); // true = login, false = signup (testing)

    const {session, UserLoading} = useRequireAuth(); //check if logged in 

    const [displayName, setDisplayName] = useState('');
    const [email,setEmail]=useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('')
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    //const navigate = useNavigate();
    const router = useRouter();

    //check if logged in
    if(UserLoading || !session){
        return <p>..checking credentials..</p>;
    }
    
    
    const handleSignUp = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        setLoading(true);
        setMessage('');

        if(password !== confirmPassword){
            setMessage("Error: passwords do not match");
            setLoading(false);
            return;
        }

        try {//get database function to sign up new user
            const {data,error}=await supabase.auth.signUp({
                email: email, //supabase checks if email for us
                password: password, //supabase hashes for us
                options:{
                    data: {
                        display_name:displayName,
                        role:role,
                    }, //user metadata
                
                },
            });

            if(error){
                //setMessage(`Error: ${error.message}`);
                console.log(`email: ${email}, password: ${password}`);
                console.log("Error signing up user:\n", error);
                
                setMessage(error.message);
                console.log(data);
                setLoading(false);
                return;
            }
            else{
                setMessage('Success: Sign up!',data.user);
                
                console.log("User signed up successfully");
                console.log(data);
                 //console.log("Session set successfully, redirecting to admin page...");

                //once user is signed up, supabase triggers a function to add a profile to the profile table to view users safer
            }

        }
        catch (err) {
            setMessage('Error: Something went wrong');
            console.log("Error in handleSignUp:\n", err);
        }
        setLoading(false);
    }

    return(
        <main>
            <div className="Auth-form-container">
            <h1 className = "Auth-form-title">Admin SignUp</h1>
            

            <form className="Auth-form" onSubmit={handleSignUp}>
                <input
                    type="text"
                    placeholder="EMAIL:"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                />
                <input
                    type='text'
                    placeholder='DISPLAY NAME:'
                    value={displayName}
                    onChange={(e)=>setDisplayName(e.target.value)}
                    disabled={loading}
                    required
                />
                <input
                    type="password"
                    placeholder="PASSWORD:"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                />
                <input
                    type="password"
                    placeholder="COMFIRM PASSWORD:"
                    value={confirmPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    />
                <section className='radio-signUp'>
                    <input
                        type="radio"
                        id="ADMIN-radio"
                        name="role"
                        value="ADMIN"
                        checked={role === 'ADMIN'}
                        onChange={(e) => setRole(e.target.value)}
                        />
                    <label htmlFor="ADMIN-radio">Admin</label>

                    <input
                        type="radio"
                        id="EDITOR-radio"
                        name="role"
                        value="EDITOR"
                        checked={role === 'EDITOR'}
                        onChange={(e) => setRole(e.target.value)}
                        />
                    <label htmlFor="EDITOR-radio">Editor</label>
                </section>
                
                


                <button type="submit" disabled={loading} >
                    {loading ? 'signing up...' : 'sign up'}
                </button>
                {/* Show message if one exists */}
                {message && (
                    <p className={message.startsWith('Error') ? 'error-message' : 'success-message'}>
                    {message}
                    </p>
                )}
            </form>
            <Link href="../admin">Back to admin dashboard</Link>
            </div>
        </main>


    );
}


