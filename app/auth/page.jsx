'use client';


import { supabase } from '@/lib/supabase';
import { useState } from 'react';


export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true); // true = login, false = signup

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');

    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        setLoading(true);
        setMessage('');

        try {
            // TEMP: replace with real auth later
            if(isLogin) {
                // if(userName === 'admin' && password === 'password' && confirmPassword === 'password') {
                //     setMessage('Success: Account created!');
                // } else {
                //     setMessage('Error: Invalid credentials or passwords do not match');
                // }
                // testing supabase auth login logic here, for now just check if username and password are correct
                const {data,error}=await supabase.auth.signInWithPassword({
                    email: userName,
                    password: password,
                });
                if(error){
                    setMessage(`Error: ${error.message}`);
                }
                else{
                    setMessage('Success: Logged in!');
                    //redirect to admin page after successful login
                    
                }

            }
            else{
                //sign up logic here, for now just check if username and password are correct
                // if(!userName || !password) {
                //     setMessage('Error: Please enter both username and password');
                //     setLoading(false);
                //     return;
                // }
                // else if(password !== confirmPassword) {
                //     setMessage('Error: Passwords do not match');
                //     setLoading(false);
                //     return;
                // }
                // else{
                //     setMessage('Success: Account created! Please log in.');
                //     setUserName('');
                //     setPassword('');
                //     setConfirmPassword('');
                //     setLoading(false);
                //     return;
                // }
                // testing supabase auth sign up logic here, for now just check if username and password are correct
                const {data,error}=await supabase.auth.signUp({
                    email: userName,
                    password: password,
                });
                if(error){
                    setMessage(`Error: ${error.message}`);
                }
                else{
                    setMessage('Success: Account created! Please log in.');
                    
                    // Insert profile for this user
                    const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        { auth_id: data.user.id, full_name: userName, role: 'admin' },
                    ]);

                    if (profileError) {
                        setMessage(`Error creating profile: ${profileError.message}`);
                        setLoading(false);
                        return;
                    }
                 
                    setUserName('');
                    setPassword('');
                    setConfirmPassword('');
                }   
            }
        }
        catch (err) {
            setMessage('Error: Something went wrong');
        }
        setLoading(false);

    }
    return(
        <>
            <div className="Auth-form-container">
            <h1 className = "Auth-form-title">{isLogin ? 'Admin Login' : 'Admin Signup'}</h1>
            {/* Toggle button above the form */}
            <button
                type="button"
                className="toggle-button"
                onClick={() => {
                setIsLogin(!isLogin);
                setMessage('');
                }}
            >
                {isLogin ? 'Switch to Sign Up' : 'Switch to Login'}
            </button>

            <form onSubmit={handleSubmit} className="Auth-form">
                <input
                    type="text"
                    placeholder="USERNAME:"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
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
                {!isLogin && (
                    <input
                        type="password"
                        placeholder="CONFIRM PASSWORD"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                    />
                )}

                <button type="submit" disabled={loading}>
                    {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Sign Up')}
                </button>
                {/* Show message if one exists */}
                {message && (
                    <p className={message.startsWith('Error') ? 'error-message' : 'success-message'}>
                    {message}
                    </p>
                )}
            </form>
            </div>
        </>


    );
}