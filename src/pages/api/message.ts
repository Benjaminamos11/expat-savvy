import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const resend = resendKey ? new Resend(resendKey) : null;

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { name, email, phone, message, source, language, device } = data;

        const ip = request.headers.get('x-nf-client-connection-ip') ||
            request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('client-ip') ||
            'unknown';

        // Save to Supabase messages table
        if (supabase) {
            try {
                await (supabase as any)
                    .from('messages')
                    .insert([{
                        name: name || 'Unknown',
                        email: email || '',
                        phone: phone || '',
                        message: message || '',
                        source: source || '',
                        language: language || 'en',
                        device: device || '',
                        ip,
                    }]);
            } catch (err) {
                console.error("Supabase insert error:", err);
            }
        }

        // Send email notification
        if (resend) {
            try {
                await resend.emails.send({
                    from: 'Expat Savvy Platform <notification@expat-savvy.ch>',
                    to: 'bw@expat-savvy.ch',
                    subject: `💬 New Message: ${name || 'Website Visitor'}`,
                    html: `
                        <h2>New Message from Website</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                        <p><strong>Message:</strong></p>
                        <blockquote style="border-left:3px solid #ccc;padding-left:12px;color:#555">${message}</blockquote>
                        <hr>
                        <p style="color:#999;font-size:12px">
                            Source: ${source || 'N/A'} · Language: ${language || 'en'} · Device: ${device || 'unknown'} · IP: ${ip}
                        </p>
                    `
                });
            } catch (err) {
                console.error("Resend error:", err);
            }
        }

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Message API error:", error);
        return new Response(JSON.stringify({ ok: false }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
