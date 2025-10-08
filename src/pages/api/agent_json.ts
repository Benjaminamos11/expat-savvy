import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Use production backend URL
    const BACKEND_URL = import.meta.env.PUBLIC_BACKEND_URL || 'https://expat-savvy-ai-backend-white-night-2514.fly.dev';
    
    const response = await fetch(`${BACKEND_URL}/api/agent_json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error:', response.status, errorText);
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    return new Response(
      JSON.stringify({
        message: "I'm sorry, I encountered a connection error. Please check your internet connection and try again.",
        conversationId: null
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};