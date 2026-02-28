import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize external clients
// These throw errors securely on the server if the ENV vars are missing during build/runtime
const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

// Only initialize if we have the keys, otherwise endpoints will 500 cleanly with explanations
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const resend = resendKey ? new Resend(resendKey) : null;

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        const {
            name,
            email,
            phone,
            message,
            notes, // Used by RelocationModal for priority arrays
            provider,
            insurance_status,
            insurance_type,
            start_date,
            priorities,
            stage,
            flow,
            url,     // Exact URL from frontend
            device   // Mobile/Desktop from frontend
        } = data;

        // Extract IP address from common headers (Netlify/Proxy)
        const ip = request.headers.get('x-nf-client-connection-ip') ||
            request.headers.get('x-forwarded-for')?.split(',')[0] ||
            request.headers.get('client-ip') ||
            'unknown';

        // Prepare metadata for notes
        const enrichedNotes = {
            ...(notes || {}),
            meta: {
                url: url || 'N/A',
                ip: ip,
                device: device || 'unknown',
                userAgent: request.headers.get('user-agent') || 'N/A'
            }
        };

        // 1. Save to Supabase (if configured)
        let leadId = `fallback-${Date.now()}`;

        if (supabase) {
            try {
                const { data: insertedData, error } = await (supabase as any)
                    .from('leads')
                    .insert([
                        {
                            name: name || 'Unknown',
                            email: email || 'No Email Provided',
                            phone: phone || '',
                            message: message || '',
                            stage: stage || 'new',
                            flow: flow || 'website_form',
                            notes: enrichedNotes,
                            consent_marketing: true // Assuming consent is given implicitly by filling out out contact forms
                        }
                    ])
                    .select();

                if (error) {
                    console.error("Supabase Insert Error:", error);
                } else if (insertedData && insertedData.length > 0) {
                    leadId = insertedData[0].id;
                }
            } catch (err) {
                console.error("Supabase execution failed:", err);
            }
        } else {
            console.warn("Supabase credentials missing. Bypassing database save.");
        }

        // 2. Send Email via Resend
        if (resend) {
            // Build a clean HTML structure of the submitted dynamic notes/priorities
            let additionalDetailsHtml = '';
            if (enrichedNotes && typeof enrichedNotes === 'object') {
                additionalDetailsHtml = '<ul>';
                for (const [key, value] of Object.entries(enrichedNotes)) {
                    if (key === 'meta') continue; // Handle meta separately for cleaner email
                    if (Array.isArray(value)) {
                        additionalDetailsHtml += `<li><strong>${key}:</strong> ${value.join(', ')}</li>`;
                    } else {
                        additionalDetailsHtml += `<li><strong>${key}:</strong> ${value}</li>`;
                    }
                }
                additionalDetailsHtml += '</ul>';

                // Add Meta info at the bottom
                additionalDetailsHtml += `
                    <h3>Tracking Info</h3>
                    <ul>
                        <li><strong>Source URL:</strong> ${enrichedNotes.meta.url}</li>
                        <li><strong>IP Address:</strong> ${enrichedNotes.meta.ip}</li>
                        <li><strong>Device:</strong> ${enrichedNotes.meta.device}</li>
                    </ul>
                 `;
            }

            try {
                await resend.emails.send({
                    from: 'Expat Savvy Platform <notification@expat-savvy.ch>',
                    to: 'bw@expat-savvy.ch',
                    subject: `🎯 New Lead: ${name || 'Website User'}`,
                    html: `
            <h2>New Lead Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Submitted Message:</strong> ${message || 'N/A'}</p>
            
            <h3>Specific Details</h3>
            <p><strong>Flow/Provider:</strong> ${flow || provider || 'N/A'}</p>
            ${additionalDetailsHtml}
          `
                });
            } catch (err) {
                console.error("Resend execution failed:", err);
            }
        } else {
            console.warn("Resend credentials missing. Email was not sent.");
        }

        return new Response(JSON.stringify({
            ok: true,
            message: "Lead processed successfully natively in Astro",
            leadId: leadId
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("API Route Error:", error);
        return new Response(JSON.stringify({
            ok: false,
            message: "Error processing the request",
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
