/**
 * Savvy AI Chat Tools — server-side tool handlers
 */

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = import.meta.env.SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendKey = import.meta.env.RESEND_API_KEY || process.env.RESEND_API_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const resend = resendKey ? new Resend(resendKey) : null;

// Cal.com consultant config
const CONSULTANTS: Record<string, { eventTypeId: number; apiKey: string; name: string; slug: string; username: string }> = {
  robert: {
    eventTypeId: 1894802,
    apiKey: 'cal_live_02d332e8841c6f13b371ee6dd3ca7ca8',
    name: 'Robert Kolar',
    slug: 'expat-savvy-consultation',
    username: 'expat-savvy',
  },
  hans: {
    eventTypeId: 4550098,
    apiKey: 'cal_live_8cb1d91e956c64fd591ca700ff9bc523',
    name: 'Hans Steiner',
    slug: 'expat-savvy-financial-consultation',
    username: 'expat-savvy',
  },
};

// Tool definitions for Claude
export const TOOL_DEFINITIONS = [
  {
    name: 'create_lead',
    description:
      'Save user contact info as a lead. Call this when the user provides their name and email, or explicitly wants to be contacted.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string' as const, description: 'User full name' },
        email: { type: 'string' as const, description: 'User email address' },
        phone: { type: 'string' as const, description: 'Optional phone number' },
        insurance_type: { type: 'string' as const, description: 'Type of insurance they are interested in' },
        message: { type: 'string' as const, description: 'Summary of what the user needs' },
      },
      required: ['name', 'email'],
    },
  },
  {
    name: 'get_available_slots',
    description:
      'Fetch available consultation time slots from Cal.com for the next 5-7 days. Returns slots grouped by date.',
    input_schema: {
      type: 'object' as const,
      properties: {
        consultant: {
          type: 'string' as const,
          enum: ['robert', 'hans'],
          description: 'Robert for health insurance consultations, Hans for life insurance / 3rd pillar / pension planning.',
        },
        week_offset: {
          type: 'number' as const,
          description: '0 = this week, 1 = next week. Default 0.',
        },
      },
      required: ['consultant'],
    },
  },
  {
    name: 'create_booking',
    description:
      'Book a consultation slot on Cal.com. Requires a specific start time from get_available_slots, plus user name and email.',
    input_schema: {
      type: 'object' as const,
      properties: {
        start: { type: 'string' as const, description: 'ISO 8601 start time from available slots' },
        name: { type: 'string' as const, description: 'User full name' },
        email: { type: 'string' as const, description: 'User email address' },
        consultant: { type: 'string' as const, enum: ['robert', 'hans'] },
      },
      required: ['start', 'name', 'email', 'consultant'],
    },
  },
  {
    name: 'send_summary_email',
    description:
      'Send a branded summary email to the user with key points from the conversation. Use when the user asks for a recap or after providing detailed insurance guidance.',
    input_schema: {
      type: 'object' as const,
      properties: {
        email: { type: 'string' as const, description: 'User email address' },
        name: { type: 'string' as const, description: 'User first name' },
        summary: { type: 'string' as const, description: 'Markdown-formatted summary of key points discussed' },
      },
      required: ['email', 'name', 'summary'],
    },
  },
];

// ─── Tool Handlers ───

export async function handleCreateLead(input: {
  name: string;
  email: string;
  phone?: string;
  insurance_type?: string;
  message?: string;
}): Promise<{ success: boolean; message: string; lead_id?: string }> {
  if (!supabase) return { success: false, message: 'Database not configured' };

  // 24h duplicate check
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('leads')
    .select('id')
    .eq('email', input.email)
    .gte('created_at', twentyFourHoursAgo)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: true, message: 'Contact info already saved', lead_id: existing[0].id };
  }

  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: input.name,
      email: input.email,
      phone: input.phone || '',
      message: input.message || '',
      flow: 'ai-chat',
      stage: 'new',
      notes: {
        insurance_type: input.insurance_type || null,
        source: 'savvy-ai-chat',
      },
    })
    .select('id')
    .single();

  if (error) return { success: false, message: error.message };

  // Notify admin
  if (resend) {
    try {
      await resend.emails.send({
        from: 'Savvy AI <notification@expat-savvy.ch>',
        to: ['bw@expat-savvy.ch'],
        subject: `New AI Chat Lead – ${input.name}`,
        text: [
          `New lead from Savvy AI Chat:`,
          ``,
          `Name: ${input.name}`,
          `Email: ${input.email}`,
          `Phone: ${input.phone || '-'}`,
          `Insurance type: ${input.insurance_type || '-'}`,
          `Message: ${input.message || '-'}`,
          ``,
          `Created: ${new Date().toISOString()}`,
        ].join('\n'),
      });
    } catch { /* non-critical */ }
  }

  return { success: true, message: 'Lead created', lead_id: data?.id };
}

export async function handleGetAvailableSlots(input: {
  consultant: string;
  week_offset?: number;
}): Promise<{ success: boolean; slots?: Record<string, string[]>; message?: string }> {
  const config = CONSULTANTS[input.consultant];
  if (!config) return { success: false, message: `Unknown consultant: ${input.consultant}` };

  const offset = input.week_offset || 0;
  const start = new Date();
  start.setDate(start.getDate() + offset * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const params = new URLSearchParams({
    eventTypeId: config.eventTypeId.toString(),
    startTime: start.toISOString().split('T')[0] + 'T00:00:00Z',
    endTime: end.toISOString().split('T')[0] + 'T23:59:59Z',
    timeZone: 'Europe/Zurich',
  });

  try {
    const res = await fetch(`https://api.cal.com/v2/slots/available?${params}`, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'cal-api-version': '2024-08-13',
      },
    });

    if (!res.ok) {
      return { success: false, message: `Cal.com API error: ${res.status}` };
    }

    const data = await res.json();
    const slots: Record<string, string[]> = {};

    if (data?.data?.slots) {
      for (const [date, timeSlots] of Object.entries(data.data.slots)) {
        if (Array.isArray(timeSlots) && timeSlots.length > 0) {
          slots[date] = timeSlots.map((s: any) => s.time || s.start);
        }
      }
    }

    return { success: true, slots };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}

export async function handleCreateBooking(input: {
  start: string;
  name: string;
  email: string;
  consultant: string;
}): Promise<{ success: boolean; message: string }> {
  const config = CONSULTANTS[input.consultant];
  if (!config) return { success: false, message: `Unknown consultant: ${input.consultant}` };

  try {
    const res = await fetch('https://api.cal.com/v2/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
        'cal-api-version': '2024-08-13',
      },
      body: JSON.stringify({
        start: input.start,
        eventTypeId: config.eventTypeId,
        attendee: {
          name: input.name,
          email: input.email,
          timeZone: 'Europe/Zurich',
        },
        metadata: { source: 'savvy-ai-chat' },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, message: `Booking failed: ${errText}` };
    }

    return { success: true, message: `Consultation booked with ${config.name} for ${input.name} at ${input.start}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}

export async function handleSendSummaryEmail(input: {
  email: string;
  name: string;
  summary: string;
}): Promise<{ success: boolean; message: string }> {
  if (!resend) return { success: false, message: 'Email not configured' };

  // Convert basic markdown to HTML
  const htmlSummary = input.summary
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n/g, '<br>');

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
        <tr><td style="background:#1e293b;padding:24px 40px;text-align:center;">
          <h1 style="color:#fff;font-size:20px;margin:0;">Expat Savvy</h1>
          <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">Your Swiss Insurance Assistant</p>
        </td></tr>
        <tr><td style="padding:0 40px;"><div style="height:3px;background:linear-gradient(to right,#ef4444,#f97316);border-radius:2px;"></div></td></tr>
        <tr><td style="padding:30px 40px;">
          <p style="font-size:16px;color:#333;margin:0 0 16px;">Hi ${input.name},</p>
          <p style="font-size:16px;color:#333;margin:0 0 24px;">Here's a summary of what we discussed:</p>
          <div style="font-size:15px;color:#555;line-height:1.7;background:#f8fafc;padding:20px;border-radius:8px;border:1px solid #e2e8f0;">
            ${htmlSummary}
          </div>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:30px 0 10px;">
            <a href="https://expat-savvy.ch/ai-chat" style="display:inline-block;background:#ef4444;color:#fff;font-size:16px;font-weight:600;text-decoration:none;padding:14px 32px;border-radius:8px;">Continue Chat with Savvy AI</a>
          </td></tr></table>
          <p style="font-size:15px;color:#333;margin:24px 0 0;">Best regards,<br>The Expat Savvy Team</p>
        </td></tr>
        <tr><td style="background:#1e293b;color:#fff;padding:24px 40px;text-align:center;">
          <p style="font-size:14px;margin:0 0 8px;font-weight:600;">Expat Savvy Switzerland</p>
          <p style="font-size:12px;margin:0 0 4px;color:#94a3b8;">info@expat-savvy.ch · expat-savvy.ch</p>
          <p style="font-size:11px;margin:8px 0 0;color:#64748b;">© ${new Date().getFullYear()} Expat Savvy. All rights reserved.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const { error } = await resend.emails.send({
      from: 'Savvy AI <notification@expat-savvy.ch>',
      to: [input.email],
      subject: `Your Insurance Consultation Summary — Expat Savvy`,
      html,
    });

    if (error) return { success: false, message: error.message };
    return { success: true, message: `Summary email sent to ${input.email}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, message: msg };
  }
}
