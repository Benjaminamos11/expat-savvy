"""
LLM Service for AI-Powered Growth Ops
Supports multiple LLM providers with tool calling capabilities
"""

import os
import json
import httpx
import asyncio
from typing import Dict, Any, List, Optional, Union
from datetime import datetime
import uuid

class LLMService:
    def __init__(self):
        self.provider = os.getenv("LLM_PROVIDER", "anthropic")
        self.anthropic_api_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.max_tokens = int(os.getenv("LLM_MAX_TOKENS", "8000"))  # Claude 4 supports up to 1M tokens
        self.timeout = int(os.getenv("AI_QUERY_TIMEOUT", "30"))
        
        # Tool calling configuration
        self.available_tools = self._define_available_tools()
        
        print(f"🤖 LLM Service initialized with provider: {self.provider} (Claude Sonnet 4)")
    
    def _define_available_tools(self) -> List[Dict[str, Any]]:
        """Define tools available to the AI"""
        return [
            {
                "name": "query_analytics",
                "description": "Query analytics data using named queries",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query_name": {
                            "type": "string",
                            "enum": ["funnel_by_channel", "cpl_by_campaign", "leads_by_city", "top_pages", "recent_leads"]
                        },
                        "params": {
                            "type": "object",
                            "properties": {
                                "start_date": {"type": "string"},
                                "end_date": {"type": "string"},
                                "channel": {"type": "string"},
                                "city": {"type": "string"},
                                "limit": {"type": "integer"}
                            }
                        }
                    },
                    "required": ["query_name"]
                }
            },
            {
                "name": "get_plausible_report",
                "description": "Get aggregated Plausible analytics data",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "period": {"type": "string", "default": "7d"},
                        "metrics": {"type": "string", "default": "visitors,pageviews,events"}
                    }
                }
            },
            {
                "name": "create_approval_item",
                "description": "Create an item for human approval",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "item_type": {
                            "type": "string",
                            "enum": ["ad_campaign", "ad_set", "ad", "email_drip", "content_test"]
                        },
                        "title": {"type": "string"},
                        "description": {"type": "string"},
                        "draft_payload": {"type": "object"}
                    },
                    "required": ["item_type", "title", "draft_payload"]
                }
            }
        ]
    
    async def chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        system_prompt: Optional[str] = None,
        use_tools: bool = True
    ) -> Dict[str, Any]:
        """
        Main chat completion interface with tool calling
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            system_prompt: Optional system prompt to set context
            use_tools: Whether to enable tool calling
        """
        try:
            if self.provider == "anthropic":
                return await self._anthropic_chat_completion(messages, system_prompt, use_tools)
            elif self.provider == "openai":
                return await self._openai_chat_completion(messages, system_prompt, use_tools)
            else:
                raise ValueError(f"Unsupported LLM provider: {self.provider}")
                
        except Exception as e:
            print(f"❌ LLM chat completion error: {str(e)}")
            return {
                "error": str(e),
                "provider": self.provider,
                "timestamp": datetime.now().isoformat()
            }
    
    async def _anthropic_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        system_prompt: Optional[str],
        use_tools: bool
    ) -> Dict[str, Any]:
        """Anthropic Claude chat completion"""
        if not self.anthropic_api_key:
            raise ValueError("ANTHROPIC_API_KEY not configured")
        
        # Prepare the request
        headers = {
            "x-api-key": self.anthropic_api_key,
            "content-type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": "claude-sonnet-4-20250514",
            "max_tokens": self.max_tokens,
            "messages": messages
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        if use_tools and self.available_tools:
            payload["tools"] = self.available_tools
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Anthropic API call successful")
                return self._format_response(result, "anthropic")
            else:
                raise Exception(f"Anthropic API error: {response.status_code} - {response.text}")
    
    async def _openai_chat_completion(
        self, 
        messages: List[Dict[str, str]], 
        system_prompt: Optional[str],
        use_tools: bool
    ) -> Dict[str, Any]:
        """OpenAI GPT chat completion"""
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY not configured")
        
        headers = {
            "Authorization": f"Bearer {self.openai_api_key}",
            "Content-Type": "application/json"
        }
        
        # Add system prompt as first message if provided
        if system_prompt:
            messages = [{"role": "system", "content": system_prompt}] + messages
        
        payload = {
            "model": "gpt-5",
            "messages": messages,
            "max_tokens": self.max_tokens
        }
        
        if use_tools and self.available_tools:
            payload["tools"] = [
                {"type": "function", "function": tool} 
                for tool in self.available_tools
            ]
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ OpenAI API call successful")
                return self._format_response(result, "openai")
            else:
                raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")
    
    def _format_response(self, raw_response: Dict, provider: str) -> Dict[str, Any]:
        """Format LLM response to common structure"""
        if provider == "anthropic":
            content = raw_response.get("content", [])
            text_blocks = [block.get("text", "") for block in content if block.get("type") == "text"]
            tool_calls = [block for block in content if block.get("type") == "tool_use"]
            
            return {
                "provider": "anthropic",
                "text": "\n".join(text_blocks),
                "tool_calls": tool_calls,
                "usage": raw_response.get("usage", {}),
                "raw_response": raw_response
            }
        
        elif provider == "openai":
            message = raw_response.get("choices", [{}])[0].get("message", {})
            
            return {
                "provider": "openai", 
                "text": message.get("content", ""),
                "tool_calls": message.get("tool_calls", []),
                "usage": raw_response.get("usage", {}),
                "raw_response": raw_response
            }
        
        return {"error": "Unknown provider format", "raw_response": raw_response}
    
    async def generate_ad_copy(
        self, 
        brief: str, 
        context: Dict[str, Any],
        variants: int = 3
    ) -> Dict[str, Any]:
        """Generate ad copy variants based on brief and context"""
        
        system_prompt = """You are an expert marketing copywriter specializing in Swiss health insurance. 
        
        Create compelling ad copy that:
        - Addresses Swiss residents' health insurance concerns
        - Follows Swiss advertising regulations
        - Uses clear, trustworthy language
        - Includes relevant calls-to-action
        - Considers seasonal factors (insurance change periods)
        
        Always provide multiple variants for A/B testing."""
        
        user_prompt = f"""
        Brief: {brief}
        
        Context:
        - Target audience: {context.get('audience', 'Swiss residents')}
        - Platform: {context.get('platform', 'Google Ads')}
        - Budget: CHF {context.get('budget', 'Not specified')}
        - Current season: {context.get('season', 'Not specified')}
        - Top performing pages: {context.get('top_pages', [])}
        
        Please generate {variants} ad copy variants with headlines, descriptions, and CTAs.
        """
        
        messages = [{"role": "user", "content": user_prompt}]
        
        response = await self.chat_completion(messages, system_prompt, use_tools=False)
        
        return {
            "brief": brief,
            "context": context,
            "variants_requested": variants,
            "response": response,
            "created_at": datetime.now().isoformat()
        }
    
    async def analyze_funnel(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze funnel metrics and provide optimization recommendations"""
        
        system_prompt = """You are a growth optimization expert analyzing conversion funnels.
        
        Provide actionable insights about:
        - Drop-off points and potential causes
        - Optimization opportunities
        - A/B testing recommendations
        - Attribution insights
        - Budget allocation suggestions
        
        Be specific and data-driven in your recommendations."""
        
        user_prompt = f"""
        Please analyze this funnel data and provide optimization recommendations:
        
        Metrics:
        {json.dumps(metrics, indent=2)}
        
        Focus on identifying the biggest improvement opportunities and provide specific actionable recommendations.
        """
        
        messages = [{"role": "user", "content": user_prompt}]
        
        response = await self.chat_completion(messages, system_prompt, use_tools=True)
        
        return {
            "metrics_analyzed": metrics,
            "analysis": response,
            "created_at": datetime.now().isoformat()
        }
    
    async def execute_builtin_command(
        self, 
        command: str, 
        args: Dict[str, Any],
        user_context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Execute built-in AI commands like /find_waste, /idea_copy"""
        
        if command == "find_waste":
            return await self._cmd_find_waste(args.get("days", 30))
        elif command == "idea_copy":
            return await self._cmd_idea_copy(args.get("page_type", "homepage"))
        elif command == "build_retargeting":
            return await self._cmd_build_retargeting(args.get("segment", "quote_started_no_submit_7d"))
        elif command == "seo_overlap":
            return await self._cmd_seo_overlap(args.get("keyword", ""))
        else:
            return {"error": f"Unknown command: {command}"}
    
    async def _cmd_find_waste(self, days: int = 30) -> Dict[str, Any]:
        """Find campaigns with high spend/low conversion"""
        system_prompt = """You are analyzing ad spend efficiency. Identify campaigns that are wasting money and provide specific optimization recommendations."""
        
        # This would call the analytics tools to get real data
        user_prompt = f"""
        Analyze ad spend efficiency for the last {days} days. Look for:
        - High spend campaigns with low conversion rates
        - Keywords/audiences that aren't performing
        - Budget reallocation opportunities
        - Bid optimization suggestions
        
        Provide specific recommendations with expected impact.
        """
        
        messages = [{"role": "user", "content": user_prompt}]
        response = await self.chat_completion(messages, system_prompt, use_tools=True)
        
        return {
            "command": "find_waste",
            "period_days": days,
            "analysis": response,
            "created_at": datetime.now().isoformat()
        }
    
    async def _cmd_idea_copy(self, page_type: str = "homepage") -> Dict[str, Any]:
        """Generate A/B test copy variants for a page"""
        system_prompt = """You are a conversion optimization expert. Create A/B test variants for page copy that could improve conversion rates."""
        
        user_prompt = f"""
        Create A/B test copy variants for {page_type} pages. Focus on:
        - Headlines that grab attention
        - Value propositions that address pain points
        - CTAs that drive action
        - Trust signals for Swiss market
        
        Provide 3-5 variants with rationale for each test.
        """
        
        messages = [{"role": "user", "content": user_prompt}]
        response = await self.chat_completion(messages, system_prompt, use_tools=True)
        
        return {
            "command": "idea_copy",
            "page_type": page_type,
            "variants": response,
            "created_at": datetime.now().isoformat()
        }
    
    async def _cmd_build_retargeting(self, segment: str) -> Dict[str, Any]:
        """Draft retargeting campaign for audience segment"""
        system_prompt = """You are creating retargeting campaigns. Design campaigns that re-engage users based on their previous behavior."""
        
        user_prompt = f"""
        Create a retargeting campaign for the "{segment}" audience segment. Include:
        - Campaign strategy and messaging
        - Ad creatives and copy
        - Budget recommendations
        - Timing and frequency
        - Success metrics
        
        Make it specific to Swiss health insurance market.
        """
        
        messages = [{"role": "user", "content": user_prompt}]
        response = await self.chat_completion(messages, system_prompt, use_tools=True)
        
        return {
            "command": "build_retargeting",
            "segment": segment,
            "campaign_spec": response,
            "created_at": datetime.now().isoformat()
        }
    
    async def _cmd_seo_overlap(self, keyword: str) -> Dict[str, Any]:
        """Detect content cannibalization and suggest fixes"""
        system_prompt = """You are an SEO expert analyzing content overlap. Identify cannibalization issues and provide consolidation recommendations."""
        
        user_prompt = f"""
        Analyze potential SEO cannibalization for keyword "{keyword}". Look for:
        - Multiple pages targeting the same keyword
        - Content overlap between pages
        - Internal linking opportunities
        - Consolidation recommendations
        
        Provide specific action items to improve rankings.
        """
        
        messages = [{"role": "user", "content": user_prompt}]
        response = await self.chat_completion(messages, system_prompt, use_tools=True)
        
        return {
            "command": "seo_overlap",
            "keyword": keyword,
            "analysis": response,
            "created_at": datetime.now().isoformat()
        }

# Global instance
llm_service = None

def get_llm_service() -> LLMService:
    """Get or create LLM service instance"""
    global llm_service
    if llm_service is None:
        llm_service = LLMService()
    return llm_service
