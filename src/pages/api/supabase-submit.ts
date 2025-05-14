import type { APIRoute } from 'astro';
// import { createClient } from '@supabase/supabase-js';

// To use this, uncomment the import above and install:
// npm install @supabase/supabase-js

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
    
    // ⚠️ UNCOMMENT TO ENABLE SUPABASE INTEGRATION ⚠️
    // Connect to Supabase
    // const supabaseUrl = import.meta.env.SUPABASE_URL;
    // const supabaseKey = import.meta.env.SUPABASE_KEY;
    // const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Insert data into 'consultations' table
    // const { data: insertedData, error } = await supabase
    //   .from('consultations')
    //   .insert([
    //     {
    //       name: data.name,
    //       email: data.email,
    //       phone: data.phone || null,
    //       topic: data.topic,
    //       language: data.language,
    //       notes: data.notes,
    //       source: data.source,
    //       created_at: new Date().toISOString(),
    //     },
    //   ]);
    
    // if (error) {
    //   console.error('Supabase error:', error);
    //   return new Response(
    //     JSON.stringify({
    //       success: false,
    //       message: 'Error storing consultation data',
    //     }),
    //     { status: 500 }
    //   );
    // }
    
    // For now, just log that we would be storing this
    console.log('Would store in Supabase:', data);
    
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