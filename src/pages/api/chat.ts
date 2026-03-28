/**
 * /api/chat — Savvy AI Chat endpoint
 * Claude agent loop with tool use for leads, booking, email, premium calc
 */

import type { APIRoute } from 'astro';
import Anthropic from '@anthropic-ai/sdk';

export const prerender = false;

import {
  TOOL_DEFINITIONS,
  handleCreateLead,
  handleGetAvailableSlots,
  handleCreateBooking,
  handleSendSummaryEmail,
  handleCalculatePremium,
  handleGetInsuranceModels,
  handleGetDeductibles,
  handleResolveRegion,
  handleGetInsuranceChecklist,
  handleExplainDeductibleChange,
  handleGetInsuranceReviewInfo,
} from '../../lib/chat-tools';

const SYSTEM_PROMPT = `You are Savvy AI, the AI assistant for Expat Savvy — a Swiss insurance advisory company helping expats navigate the Swiss insurance landscape.

**Your personality:** Warm, professional, knowledgeable. You speak like a trusted advisor who genuinely wants to help expats understand their insurance options. Keep responses concise (2-4 paragraphs max) unless detailed info was requested.

**Language:** Match the user's language. You speak English and German fluently. Default to English.

**Your expertise — Swiss insurance:**
- **KVG (mandatory health insurance):** How it works, choosing a provider, deductibles (300-2500 CHF), switching deadlines (Nov 30), supplementary vs basic coverage
- **VVG (supplementary insurance):** Hospital upgrades, dental, alternative medicine, international coverage
- **3rd Pillar (Säule 3a):** Tax deductions (max ~7,056 CHF/year employed, ~35,280 self-employed), provider comparison, investment options
- **Life insurance:** Term life, mixed policies, risk coverage, mortgage requirements
- **Household insurance (Hausratversicherung):** What it covers, typical costs, liability bundling
- **Personal liability (Privathaftpflicht):** Coverage limits, typical premiums, what's included

**Consultant routing:**
- Robert Kolar → Health insurance (KVG/VVG), household, liability consultations
- Hans Steiner → Life insurance, 3rd pillar, pension planning, financial advisory

**Premium calculator (PrimAI API):**
- You can compare KVG/OKP basic health insurance premiums using calculate_premium
- ALWAYS clarify: these are mandatory basic insurance (KVG/OKP) premiums only — supplementary insurance (VVG) is separate and requires a personal consultation
- To compare premiums you need: postal code (PLZ), age, and deductible amount
- If the user doesn't specify all three, ask for the missing information
- Use get_deductibles to show deductible options if the user is unsure
- Use get_insurance_models to explain model differences (Standard, HMO, Telmed, Hausarzt)
- Present results in a **markdown table** with columns: Insurer | Model | Monthly Premium (CHF)
- After showing premiums, ALWAYS suggest booking a free consultation to discuss supplementary coverage and optimize their overall insurance setup

**Insurance knowledge tools:**
- Use get_insurance_checklist when someone is new to Switzerland or asks what insurance they need
- ALWAYS use explain_deductible_change when someone asks about deductibles, franchises, comparing deductible options, or changing their deductible. This triggers an interactive calculator widget on the frontend.
- Use get_insurance_review_info when someone asks about reviewing or optimizing their existing insurance

**Key rules:**
- Never promise specific savings — actual premiums depend on individual circumstances
- Only collect contact info when the user explicitly wants to book a consultation or be contacted
- Don't be pushy with lead capture — provide value first
- If unsure about a specific regulation, say so and offer to have a specialist follow up
- For non-insurance topics (relocation, permits, etc.), mention our partner network: expat-services.ch for relocation, insurance-guide.ch for detailed insurance comparisons
- Keep the conversation focused on being helpful, not salesy

**Consultation booking flow:**
1. Understand what the user needs
2. Recommend the right consultant (Robert or Hans)
3. If they want to book, use get_available_slots to show real times
4. Collect name + email, then use create_booking

**Contact (don't share unprompted):**
- Website: expat-savvy.ch
- Email: info@expat-savvy.ch`;

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Chat not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { messages: Array<{ role: string; content: any }> };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const messages = body.messages.slice(-20);
  const client = new Anthropic({ apiKey });

  try {
    let currentMessages = [...messages];
    let finalResponse = '';
    let toolsUsed: string[] = [];
    let toolData: Record<string, any> = {};
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools: TOOL_DEFINITIONS as any,
        messages: currentMessages as any,
      });

      const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
      const textBlocks = response.content.filter((b) => b.type === 'text');

      if (toolUseBlocks.length === 0) {
        finalResponse = textBlocks.map((b) => ('text' in b ? b.text : '')).join('');
        break;
      }

      currentMessages.push({ role: 'assistant', content: response.content as any });

      const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = [];

      for (const toolBlock of toolUseBlocks) {
        if (toolBlock.type !== 'tool_use') continue;
        const toolName = toolBlock.name;
        const toolInput = toolBlock.input as any;
        toolsUsed.push(toolName);

        let result: any;

        try {
          switch (toolName) {
            case 'create_lead':
              result = await handleCreateLead(toolInput);
              break;
            case 'get_available_slots':
              result = await handleGetAvailableSlots(toolInput);
              break;
            case 'create_booking':
              result = await handleCreateBooking(toolInput);
              break;
            case 'send_summary_email':
              result = await handleSendSummaryEmail(toolInput);
              break;
            case 'calculate_premium':
              result = await handleCalculatePremium(toolInput);
              break;
            case 'get_insurance_models':
              result = await handleGetInsuranceModels();
              break;
            case 'get_deductibles':
              result = await handleGetDeductibles(toolInput);
              break;
            case 'resolve_region':
              result = await handleResolveRegion(toolInput);
              break;
            case 'get_insurance_checklist':
              result = handleGetInsuranceChecklist();
              break;
            case 'explain_deductible_change':
              result = handleExplainDeductibleChange();
              break;
            case 'get_insurance_review_info':
              result = handleGetInsuranceReviewInfo();
              break;
            default:
              result = { error: `Unknown tool: ${toolName}` };
          }

          if (toolName === 'get_available_slots' && result?.slots) {
            toolData.slots = result.slots;
            toolData.consultant = toolInput.consultant;
          }
          if (toolName === 'calculate_premium' && result?.offers) {
            toolData.premiums = result.offers;
          }
          if (toolName === 'explain_deductible_change') {
            toolData.deductibleCalc = true;
          }
        } catch (toolErr) {
          console.error(`Tool ${toolName} error:`, toolErr);
          result = { success: false, error: `Tool failed: ${toolErr instanceof Error ? toolErr.message : 'Unknown error'}` };
        }

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolBlock.id,
          content: JSON.stringify(result),
        });
      }

      currentMessages.push({ role: 'user', content: toolResults as any });

      if (textBlocks.length > 0) {
        finalResponse += textBlocks.map((b) => ('text' in b ? b.text : '')).join('');
      }
    }

    return new Response(
      JSON.stringify({ response: finalResponse, toolsUsed, toolData }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Chat API error:', err);
    const message = err instanceof Error ? err.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
