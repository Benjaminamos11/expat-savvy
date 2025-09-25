import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Forward request to Python backend
    const response = await fetch('http://localhost:8000/tools/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from('admin:phase_a_2025').toString('base64')
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: body.message || body.query || body.text }],
        system_prompt: `You are an expert Swiss health insurance assistant powered by GPT-5. Help users with Swiss insurance questions, premium calculations, and provider comparisons. Use official Swiss data when possible.`,
        use_tools: true
      })
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      response: data.text || data.message || 'I can help you with Swiss insurance questions!',
      data: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Agent API Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get response from agent',
      message: 'Sorry, I\'m having trouble right now. Please try again in a moment.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
