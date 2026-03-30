'use client';


import { supabase } from '@/lib/supabase';
import { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useRequireAuth from '../useRequiredAuth.jsx'
import Link from 'next/link';




export default function AuthForm() {
    //const [isLogin, setIsLogin] = useState(true); // true = login, false = signup

    const {session, UserLoading} = useRequireAuth();
    
    if(UserLoading || !session){
        return <p>..checking credentials..</p>;
    }
    
    //const [userName, setUserName] = useState('');
    const [email,setEmail]=useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    //const navigate = useNavigate();
    const router = useRouter();

    
    const handleSignUp = async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        setLoading(true);
        setMessage('');

        if(password !== confirmPassword){
            setMessage("Error: passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const {data,error}=await supabase.auth.signUp({
                email: email,
                password: password,
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
                setMessage('Success: Sign up!');
                //redirect to admin page after successful login
                console.log("User signed up successfully");
                console.log(data);
                 //console.log("Session set successfully, redirecting to admin page...");

                
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



//  <main className="dashboard-container">
//       {/* Connection Status */}
//       <section className="add-dispatch-section">
//         <h2 className="dashboard-heading">Add Dispatch Area</h2>
//         <AddDispatchForm />
//       </section>
      
//       {/* Connection Status */}
//       <section className="add-fdra-section">
//         <h2 className="dashboard-heading">Add FDRA</h2>
//         <AddFDRAForm dispatchData={dispatchData} />
//       </section>

//       {/* Connection Status */}
//       <DispatchAreasSection dispatchData={dispatchData} dispatchError={dispatchError} />

//       {/* FDRA Section */}
//       <FdraSection fdraData={fdraData} fdraError={fdraError} />
//       {/* Stations Section */}
//       <StationSection stationData={stationData} stationError={stationError} />

//       {/* Connection Status */}
//       <StatusSection dispatchError={dispatchError} fdraError={fdraError} stationError={stationError} />
//     </main>