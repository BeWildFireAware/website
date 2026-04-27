'use client';
//handle login of user

import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';


export default function AuthForm() {
    //const [isLogin, setIsLogin] = useState(true); // true = login, false = signup

    //const [userName, setUserName] = useState('');
    const [email,setEmail]=useState('');
    const [password, setPassword] = useState('');

    //const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    //const navigate = useNavigate();
    const router = useRouter();

    


    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        setLoading(true);
        setMessage('');

        try {
            // if(userName === 'admin' && password === 'password' && confirmPassword === 'password') {
            //     setMessage('Success: Account created!');
            // } else {
            //     setMessage('Error: Invalid credentials or passwords do not match');
            // }
            // testing supabase auth login logic here, for now just check if username and password are correct
            const {data,error}=await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if(error){
                //setMessage(`Error: ${error.message}`);
                console.log(`email: ${email}, password: ${password}`);

                console.log("Error logging in user:\n", error);
                setMessage('Error: Please confirm your email address before logging in.');
                console.log(data);
                setLoading(false);
                return;

            }
            else{
                setMessage('Success: Logged in!');
                //redirect to admin page after successful login
                console.log("User logged in successfully");
                console.log(data);
                //window.location.href = '/';
                //navigate('/admin');
                console.log(data.session);
                //await supabase.auth.setSession(data.session); // Ensure session is updated before redirecting
                //console.log("Session set successfully, redirecting to admin page...");
                router.push('/admin');

            }

        }
        catch (err) {
            setMessage('Error: Something went wrong');
            console.log("Error in handleSubmit:\n", err);
        }
        setLoading(false);
    }

    return(
        <main>
            <div className="Auth-form-container">
            <h1 className = "Auth-form-title">Admin Login</h1>
            

            <form className="Auth-form" onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="EMAIL:"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                
                


                <button type="submit" disabled={loading} >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                {/* Show message if one exists */}
                {message && (
                    <p className={message.startsWith('Error') ? 'error-message' : 'success-message'}>
                    {message}
                    </p>
                )}
            </form>
            </div>
        </main>


    );
}

