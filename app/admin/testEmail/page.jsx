// Test page for email functionality
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import FireAlert from '@/app/components/sendEmail/fireAlert';
import useRequireAuth from '../../auth/useRequiredAuth.jsx';
import Link from 'next/link';

export default function TestEmail() {
    const {session, UserLoading} = useRequireAuth(); //check if logged in 
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('Test Email');
    const [message, setMessage] = useState('');
    //const [sendToAllVerified, setSendToAllVerified] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [fdraDataList, setFdraDataList] = useState([]);
    const [loadingFdra, setLoadingFdra] = useState(true);

    

    // Fetch FDRA data on component mount for testing fire alert emails
    useEffect(() => {
        fetchData();
    }, []);

    

    const fetchData = async () => {
        setLoadingFdra(true);
        try {
            console.log('Fetching FDRA data for test email...');
            
            // 1. Pull FDRA data with DispatchArea relationship
            const { data: fdra, error: fdraError } = await supabase
                .from('FDRA')
                .select('FDRAname, AVG_BI, AVG_ERC, Dispatch_ID, Danger_Level, DispatchArea(DispatchName)')
                .neq('Danger_Level', null)// Only get records with a valid danger level for testing
                .order('FDRA_ID', { ascending: false }); // Get most recent records first


            if (fdraError) {
                console.log('Error fetching FDRA data:', fdraError);
                return;
            }

            if (fdra && fdra.length > 0) {
                const completeDataList = fdra.map((record) => ({
                    ...record,
                    DispatchArea: record.DispatchArea || { DispatchName: 'Unknown' }
                }));

                setFdraDataList(completeDataList);
                console.log('Complete FDRA data list:', completeDataList);
            } else {
                console.log('No FDRA data found in database.');
                setFdraDataList([]);
            }
        } catch (error) {
            console.error('Error in fetchData:', error);
            setFdraDataList([]);
        } finally {
            setLoadingFdra(false);
        }
    };

    //check if logged in
    if(UserLoading || !session){
        return <p>..checking credentials..</p>;
    }

        //send email of danger levels to all verified users in database, or to specific email if provided, using resend email API route

    



    const sendTestEmail = async () => {
        setLoading(true);
        setResult('');

        try {
            const response = await fetch('/api/sendEmail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sendTo: email || 'delivered@resend.dev',
                    //sendToAllVerified,
                    subject,
                    html: `<p>${message || 'This is a test email from your Next.js app!'}</p>`,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setResult(` Email sent to ${data.recipientCount} recipients!`);
            } else {
                setResult(` Error: ${data.error}`);
            }
        } catch (error) {
            setResult(` Error: ${error.message}`);
        }
        setLoading(false);
    };

    return (
        <div>
            <h1>Test Email Functionality</h1>

            <div className='test-email-form'>

                {/* <h2>Regular Email Test</h2> */}

                <div>
                    <label>To Email: </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="delivered@resend.dev (Resend test email)"
                        //disabled={sendToAllVerified}
                    />
                </div>

                {/* NOT ENABLED DUE TO ONLY BEING ABLE TO SEND TO TEST EMAIL UNTIL DOMAIN IS ADDED */}
                {/* <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={sendToAllVerified}
                            onChange={(e) => setSendToAllVerified(e.target.checked)}
                        />
                        Send to ALL verified users
                    </label>
                </div> */}

                {/* <div>
                    <label>Subject:</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </div> */}

                {/* <div>
                    <label>Message:</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Enter your test message..."
                        rows={4}
                    />
                </div> */}

                {/* <button
                    onClick={sendTestEmail}
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Test Email'}
                </button> */}

                {/* {result && (
                    <div>
                        {result}
                    </div>
                )} */}
                <div >
                    <Link href="../admin">
                        ← Back to Admin Dashboard
                    </Link>
                </div>
            </div>

            

            <div className='Fire_dangers_email'>
                <h2>Fire Alert Test</h2>
                <p>Test sending fire danger alerts to all verified users using real FDRA data from the database.</p>

                {loadingFdra ? (
                    <p>Loading FDRA data...</p>
                ) : fdraDataList.length > 0 ? (
                    <div>
                        <div>
                            <h3>Current FDRA Data:</h3>
                            <button
                                onClick={fetchData}
                            >
                                Refresh Data
                            </button>
                        </div>
                        {fdraDataList.map((item, index) => (
                            <div className='danger_email_cards'
                             key={`${item.FDRAname}-${item.Dispatch_ID}-${index}`}
                            >
                                <p><strong>FDRA:</strong> {item.FDRAname}</p>
                                <p><strong>Dispatch Area ID:</strong> {item.Dispatch_ID}</p>
                                <p><strong>Dispatch Area:</strong> {item.DispatchArea?.DispatchName || 'Not available'}</p>
                                <p><strong>Average ERC:</strong> {item.AVG_ERC}</p>
                                <p><strong>Average BI:</strong> {item.AVG_BI}</p>
                                <p><strong>Danger Level:</strong> {item.Danger_Level || 'Not available'}</p>

                                <FireAlert
                                    fdraData={{
                                        FDRAname: item.FDRAname,
                                        AVG_ERC: item.AVG_ERC,
                                        AVG_BI: item.AVG_BI,
                                        Danger_Level: { DangerLevelName: item.Danger_Level || 'Unknown' },
                                        DispatchArea: item.DispatchArea
                                    }}
                                    sendTo={email}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>No FDRA data found. Make sure your database has FDRA records.</p>
                )}
            </div>
        </div>
    );
}