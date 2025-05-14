import type { APIRoute } from 'astro';
// import { Resend } from 'resend';

// To use this, uncomment the import above and install:
// npm install resend

export const post: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    
    // Validate required data
    if (!data.name || !data.email) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required fields',
        }),
        { status: 400 }
      );
    }
    
    // ⚠️ UNCOMMENT TO ENABLE RESEND INTEGRATION ⚠️
    // Initialize Resend
    // const resend = new Resend(import.meta.env.RESEND_API_KEY);
    
    // Send notification email to admin
    // const { data: adminEmailData, error: adminEmailError } = await resend.emails.send({
    //   from: 'Expat Savvy <notifications@expat-savvy.ch>',
    //   to: 'your-admin-email@example.com',
    //   subject: `New Consultation Request: ${data.name}`,
    //   html: `
    //     <h1>New Consultation Request</h1>
    //     <p><strong>Name:</strong> ${data.name}</p>
    //     <p><strong>Email:</strong> ${data.email}</p>
    //     <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
    //     <p><strong>Topic:</strong> ${data.topic}</p>
    //     <p><strong>Language:</strong> ${data.language}</p>
    //     <p><strong>Notes:</strong> ${data.notes || 'None'}</p>
    //     <p><strong>Source:</strong> ${data.source}</p>
    //   `,
    // });
    
    // if (adminEmailError) {
    //   console.error('Resend admin notification error:', adminEmailError);
    //   return new Response(
    //     JSON.stringify({
    //       success: false,
    //       message: 'Error sending admin notification',
    //     }),
    //     { status: 500 }
    //   );
    // }
    
    // Send confirmation email to customer
    // const { data: customerEmailData, error: customerEmailError } = await resend.emails.send({
    //   from: 'Expat Savvy <info@expat-savvy.ch>',
    //   to: data.email,
    //   subject: 'Your Consultation Request Confirmation',
    //   html: `
    //     <h1>Thank You for Your Request</h1>
    //     <p>Dear ${data.name},</p>
    //     <p>We have received your consultation request. You will soon receive a calendar invitation 
    //     for a meeting at your chosen time.</p>
    //     <p>If you have any questions before your consultation, feel free to reply to this email 
    //     or contact us via WhatsApp.</p>
    //     <p>Best regards,<br>Robert Kolar<br>Expat Savvy</p>
    //   `,
    // });
    
    // if (customerEmailError) {
    //   console.error('Resend customer confirmation error:', customerEmailError);
    //   // Continue anyway, as we've already notified the admin
    // }
    
    // For now, just log that we would be sending an email
    console.log('Would send email with Resend:', data);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Consultation data submitted successfully',
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
      }),
      { status: 500 }
    );
  }
}; 