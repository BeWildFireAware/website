// This is where we will be using resend emailer to send emails to users.
//resend emailer is a third party service that allows us to send emails easily without having to set up our own email server. We will be using the resend API to send emails to users when they sign up or when they need to reset their password. We will also be using it to send test emails from the test-email page.
// We will be using the resend API to send emails to users when fire danger is extreme
//grab verified emails from auth table to send emails to all verified users when fire danger is extreme
//using free email from resend - need to pay/make domain for custom email, but for testing purposes this is fine. It also has a limit of 12,000 emails per month, which should be sufficient for our needs.

//NOTE: this is only working to send emails to talonf13@gmail
    //need to set up domain and verify it with resend to send to other emails, for now just testing functionality with my email, but will need to set up domain for actual use
    //to get domain, can get one from vercel but need to pay for it, so for now just using resend test email to test functionality, but will need to set up domain for actual use
    //get one from cloudflare but have to pay for it, so for now just using resend test email to test functionality, but will need to set up domain for actual use

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Create admin client for accessing auth.users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);


export async function POST(request) {
    try {
        // sendToAllVerified can be used to send alerts to all verified users in the database,
        // or sendTo can be used to target specific email addresses.
        const { sendTo, subject, html, /*sendToAllVerified */ } = await request.json();

        let recipients = sendTo || [];
        console.log('Send to:', recipients);
        //console.log('Send to all verified users:', sendToAllVerified);

        /*
        // If requested, fetch all verified user emails from auth.users
        if (sendToAllVerified) {
            const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

            if (error) {
                console.error('Error fetching users:', error);
                return Response.json({ success: false, error: 'Failed to fetch verified users' }, { status: 500 });
            }

            // Filter for verified users with emails
            recipients = users.users
                .filter(user => user.email_confirmed_at && user.email)
                .map(user => user.email);// Extract email addresses
        }*/

        if (recipients.length === 0) {
            return Response.json({ success: false, error: 'No recipients specified' }, { status: 400 });
        }

        const data = await resend.emails.send({
            from: 'BeWildfireAware <onboarding@resend.dev>', // Change to your verified sender email
            to: recipients,
            subject: subject || 'Test Email',
            html: html || '<strong>Test email sent!</strong>',
        });

        console.log('Email sent successfully to', recipients.length, 'recipients:', data);
        return Response.json({
            success: true,
            data,
            recipientCount: recipients.length
        });
    } catch (error) {
        console.error('Error sending email:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}