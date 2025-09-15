"""
AI Tool Endpoints - Safe data access for LLM
Provides named queries and controlled data access to prevent SQL injection
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import uuid
import json

from database import get_supabase
from auth import verify_admin
from services.plausible import PlausibleService
from services.llm import get_llm_service
from supabase import Client

router = APIRouter(prefix="/tools", tags=["AI Tools"])

# Named queries - safe, parameterized queries for AI access
NAMED_QUERIES = {
    "funnel_by_channel": """
        SELECT 
            l.channel,
            COUNT(DISTINCT l.id) as total_leads,
            COUNT(DISTINCT CASE WHEN l.stage IN ('booked', 'closed_won') THEN l.id END) as converted_leads,
            ROUND(
                COUNT(DISTINCT CASE WHEN l.stage IN ('booked', 'closed_won') THEN l.id END) * 100.0 / 
                NULLIF(COUNT(DISTINCT l.id), 0), 2
            ) as conversion_rate,
            MIN(l.created_at) as first_lead_date,
            MAX(l.created_at) as latest_lead_date
        FROM leads l
        WHERE l.created_at >= %s AND l.created_at <= %s
        AND (%s IS NULL OR l.channel = %s)
        GROUP BY l.channel
        ORDER BY total_leads DESC
    """,
    
    "cpl_by_campaign": """
        SELECT 
            l.utm_campaign as campaign,
            l.utm_source as source,
            l.channel,
            COUNT(DISTINCT l.id) as leads,
            COALESCE(SUM(ac.cost), 0) as total_spend,
            CASE 
                WHEN COUNT(DISTINCT l.id) > 0 THEN ROUND(COALESCE(SUM(ac.cost), 0) / COUNT(DISTINCT l.id), 2)
                ELSE COALESCE(SUM(ac.cost), 0)
            END as cpl
        FROM leads l
        LEFT JOIN ad_costs ac ON DATE(l.created_at) = ac.date 
            AND (l.utm_campaign = ac.campaign OR l.utm_source = ac.source)
        WHERE l.created_at >= %s AND l.created_at <= %s
        AND l.channel = 'paid'
        GROUP BY l.utm_campaign, l.utm_source, l.channel
        HAVING COUNT(DISTINCT l.id) > 0
        ORDER BY total_spend DESC
        LIMIT %s
    """,
    
    "leads_by_city": """
        SELECT 
            l.city,
            COUNT(DISTINCT l.id) as total_leads,
            COUNT(DISTINCT CASE WHEN l.stage = 'booked' THEN l.id END) as booked_leads,
            COUNT(DISTINCT CASE WHEN l.stage = 'closed_won' THEN l.id END) as won_leads,
            ROUND(AVG(CASE WHEN l.stage IN ('booked', 'closed_won') THEN 1.0 ELSE 0.0 END) * 100, 2) as conversion_rate,
            MIN(l.created_at) as first_lead_date,
            MAX(l.created_at) as latest_lead_date
        FROM leads l
        WHERE l.created_at >= %s AND l.created_at <= %s
        AND (%s IS NULL OR l.city = %s)
        GROUP BY l.city
        ORDER BY total_leads DESC
        LIMIT %s
    """,
    
    "top_pages": """
        SELECT 
            ed.page_path,
            ed.page_type,
            ed.city,
            SUM(ed.pageviews) as total_pageviews,
            SUM(ed.quote_starts) as total_quote_starts,
            SUM(ed.quote_submits) as total_quote_submits,
            SUM(ed.leads) as total_leads,
            CASE 
                WHEN SUM(ed.pageviews) > 0 
                THEN ROUND(SUM(ed.quote_starts) * 100.0 / SUM(ed.pageviews), 2)
                ELSE 0 
            END as quote_start_rate,
            CASE 
                WHEN SUM(ed.quote_starts) > 0 
                THEN ROUND(SUM(ed.quote_submits) * 100.0 / SUM(ed.quote_starts), 2)
                ELSE 0 
            END as quote_completion_rate
        FROM events_daily ed
        WHERE ed.date >= %s AND ed.date <= %s
        GROUP BY ed.page_path, ed.page_type, ed.city
        ORDER BY total_pageviews DESC
        LIMIT %s
    """,
    
    "recent_leads": """
        SELECT 
            l.id,
            l.created_at,
            l.email,
            l.city,
            l.channel,
            l.utm_source,
            l.utm_campaign,
            l.stage,
            l.page_type,
            ls.first_landing_path,
            ls.last_landing_path
        FROM leads l
        LEFT JOIN lead_sources ls ON l.id = ls.lead_id
        WHERE l.created_at >= %s
        ORDER BY l.created_at DESC
        LIMIT %s
    """,
    
    "performance_by_page_type": """
        SELECT 
            ed.page_type,
            COUNT(DISTINCT ed.page_path) as unique_pages,
            SUM(ed.pageviews) as total_pageviews,
            SUM(ed.quote_starts) as total_quote_starts,
            SUM(ed.leads) as total_leads,
            ROUND(AVG(ed.pageviews), 2) as avg_pageviews_per_page,
            CASE 
                WHEN SUM(ed.pageviews) > 0 
                THEN ROUND(SUM(ed.quote_starts) * 100.0 / SUM(ed.pageviews), 2)
                ELSE 0 
            END as conversion_rate
        FROM events_daily ed
        WHERE ed.date >= %s AND ed.date <= %s
        GROUP BY ed.page_type
        ORDER BY total_pageviews DESC
    """
}

@router.post("/query_sql")
async def query_sql(
    request: Dict[str, Any],
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """
    Execute named SQL queries with parameters
    Safe interface for AI to access data without SQL injection risks
    """
    try:
        query_name = request.get("query_name")
        params = request.get("params", {})
        
        if query_name not in NAMED_QUERIES:
            raise HTTPException(
                status_code=400, 
                detail=f"Unknown query: {query_name}. Available: {list(NAMED_QUERIES.keys())}"
            )
        
        # Get the named query
        query = NAMED_QUERIES[query_name]
        
        # Prepare parameters with defaults
        end_date = params.get("end_date", datetime.now().strftime("%Y-%m-%d"))
        start_date = params.get("start_date", (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"))
        channel = params.get("channel")
        city = params.get("city") 
        limit = min(params.get("limit", 10), 100)  # Cap at 100 for performance
        
        # Execute query with parameters based on query type
        if query_name == "funnel_by_channel":
            result = supabase.rpc('exec_query', {
                'query': query,
                'params': [start_date, end_date, channel, channel]
            }).execute()
            
        elif query_name == "cpl_by_campaign":
            result = supabase.rpc('exec_query', {
                'query': query,
                'params': [start_date, end_date, limit]
            }).execute()
            
        elif query_name == "leads_by_city":
            result = supabase.rpc('exec_query', {
                'query': query,
                'params': [start_date, end_date, city, city, limit]
            }).execute()
            
        elif query_name == "top_pages":
            result = supabase.rpc('exec_query', {
                'query': query,
                'params': [start_date, end_date, limit]
            }).execute()
            
        elif query_name == "recent_leads":
            result = supabase.rpc('exec_query', {
                'query': query,
                'params': [start_date, limit]
            }).execute()
            
        elif query_name == "performance_by_page_type":
            result = supabase.rpc('exec_query', {
                'query': query,
                'params': [start_date, end_date]
            }).execute()
        
        # For now, let's use a simpler approach with table queries since RPC might not be set up
        # This is a fallback implementation
        if query_name == "recent_leads":
            result = supabase.table("leads").select(
                "id, created_at, email, city, channel, utm_source, utm_campaign, stage, page_type"
            ).gte("created_at", start_date).order("created_at", desc=True).limit(limit).execute()
        
        elif query_name == "leads_by_city":
            # Simplified query using table interface
            query_builder = supabase.table("leads").select("city, stage, created_at").gte("created_at", start_date).lte("created_at", end_date)
            if city:
                query_builder = query_builder.eq("city", city)
            result = query_builder.execute()
            
            # Process results to aggregate by city
            city_stats = {}
            for lead in result.data:
                lead_city = lead.get("city") or "unknown"
                if lead_city not in city_stats:
                    city_stats[lead_city] = {"total_leads": 0, "booked_leads": 0, "won_leads": 0}
                
                city_stats[lead_city]["total_leads"] += 1
                if lead.get("stage") == "booked":
                    city_stats[lead_city]["booked_leads"] += 1
                elif lead.get("stage") == "closed_won":
                    city_stats[lead_city]["won_leads"] += 1
            
            # Convert to list format
            processed_data = [
                {
                    "city": city,
                    "total_leads": stats["total_leads"],
                    "booked_leads": stats["booked_leads"], 
                    "won_leads": stats["won_leads"],
                    "conversion_rate": round((stats["booked_leads"] + stats["won_leads"]) * 100.0 / stats["total_leads"], 2) if stats["total_leads"] > 0 else 0
                }
                for city, stats in sorted(city_stats.items(), key=lambda x: x[1]["total_leads"], reverse=True)[:limit]
            ]
            
            return {
                "query_name": query_name,
                "params": params,
                "data": processed_data,
                "count": len(processed_data),
                "executed_at": datetime.now().isoformat()
            }
        
        else:
            # For other queries, return sample data for now
            return {
                "query_name": query_name,
                "params": params,
                "data": [],
                "count": 0,
                "note": "Query implementation in progress",
                "executed_at": datetime.now().isoformat()
            }
        
        return {
            "query_name": query_name,
            "params": params,
            "data": result.data if hasattr(result, 'data') else result,
            "count": len(result.data) if hasattr(result, 'data') else 0,
            "executed_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query execution error: {str(e)}")

@router.get("/get_plausible_report")
async def get_plausible_report(
    period: str = "7d",
    metrics: str = "visitors,pageviews,events",
    admin: dict = Depends(verify_admin)
):
    """Get aggregated Plausible analytics report"""
    try:
        plausible_service = PlausibleService()
        
        # Get aggregate stats
        stats = await plausible_service.get_aggregate_stats(period, metrics)
        
        # Get funnel data 
        funnel_data = await plausible_service.get_funnel_data(period)
        
        return {
            "period": period,
            "metrics": metrics,
            "aggregate_stats": stats,
            "funnel_data": funnel_data,
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plausible report error: {str(e)}")

@router.post("/create_approval")
async def create_approval_item(
    request: Dict[str, Any],
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Create an approval item for AI-generated content"""
    try:
        item_type = request.get("item_type")
        title = request.get("title")
        description = request.get("description", "")
        draft_payload = request.get("draft_payload")
        created_by = request.get("created_by", f"ai_session_{str(uuid.uuid4())[:8]}")
        
        if not all([item_type, title, draft_payload]):
            raise HTTPException(status_code=400, detail="Missing required fields: item_type, title, draft_payload")
        
        valid_types = ["ad_campaign", "ad_set", "ad", "email_drip", "content_test"]
        if item_type not in valid_types:
            raise HTTPException(status_code=400, detail=f"Invalid item_type. Must be one of: {valid_types}")
        
        approval_item = {
            "id": str(uuid.uuid4()),
            "item_type": item_type,
            "title": title,
            "description": description,
            "draft_payload_json": draft_payload,
            "status": "pending",
            "created_by": created_by,
            "created_at": datetime.now().isoformat()
        }
        
        result = supabase.table("approvals").insert(approval_item).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create approval item")
        
        return {
            "success": True,
            "approval_id": result.data[0]["id"],
            "item_type": item_type,
            "title": title,
            "status": "pending",
            "message": "Approval item created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating approval item: {str(e)}")

@router.get("/list_approvals")
async def list_approval_items(
    status: Optional[str] = None,
    item_type: Optional[str] = None,
    limit: int = 50,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """List approval items with optional filtering"""
    try:
        query = supabase.table("approvals").select("*")
        
        if status:
            query = query.eq("status", status)
        if item_type:
            query = query.eq("item_type", item_type)
        
        result = query.order("created_at", desc=True).limit(limit).execute()
        
        return {
            "approvals": result.data if result.data else [],
            "count": len(result.data) if result.data else 0,
            "filters": {"status": status, "item_type": item_type},
            "retrieved_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing approvals: {str(e)}")

@router.post("/approve_item/{approval_id}")
async def approve_item(
    approval_id: str,
    action: str,  # "approve" or "reject"
    notes: Optional[str] = None,
    admin: dict = Depends(verify_admin),
    supabase: Client = Depends(get_supabase)
):
    """Approve or reject an approval item"""
    try:
        if action not in ["approve", "reject"]:
            raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")
        
        # Get the approval item
        result = supabase.table("approvals").select("*").eq("id", approval_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Approval item not found")
        
        approval_item = result.data[0]
        
        if approval_item["status"] != "pending":
            raise HTTPException(status_code=400, detail=f"Item already {approval_item['status']}")
        
        # Update the approval status
        update_data = {
            "status": "approved" if action == "approve" else "rejected",
            "reviewer_id": admin["username"],
            "reviewed_at": datetime.now().isoformat(),
            "review_notes": notes
        }
        
        update_result = supabase.table("approvals").update(update_data).eq("id", approval_id).execute()
        
        if not update_result.data:
            raise HTTPException(status_code=500, detail="Failed to update approval status")
        
        # Log the approval action
        log_entry = {
            "id": str(uuid.uuid4()),
            "actor_type": "user",
            "actor_id": admin["username"],
            "action": f"approval_{action}",
            "payload_json": {
                "approval_id": approval_id,
                "item_type": approval_item["item_type"],
                "title": approval_item["title"],
                "notes": notes
            },
            "result_json": {"status": update_data["status"]}
        }
        
        supabase.table("audit_log").insert(log_entry).execute()
        
        return {
            "success": True,
            "approval_id": approval_id,
            "action": action,
            "status": update_data["status"],
            "reviewed_by": admin["username"],
            "message": f"Item {action}ed successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error {action}ing item: {str(e)}")

@router.get("/available_queries")
async def get_available_queries(admin: dict = Depends(verify_admin)):
    """Get list of available named queries for AI"""
    return {
        "queries": list(NAMED_QUERIES.keys()),
        "descriptions": {
            "funnel_by_channel": "Lead conversion funnel metrics by traffic channel",
            "cpl_by_campaign": "Cost per lead analysis by campaign",
            "leads_by_city": "Lead generation performance by city",
            "top_pages": "Page performance with conversion metrics",
            "recent_leads": "Most recent leads with attribution data",
            "performance_by_page_type": "Conversion performance by page type"
        }
    }

# Chat endpoint for LLM interaction
@router.post("/chat")
async def ai_chat(
    request: Dict[str, Any],
    admin: dict = Depends(verify_admin)
):
    """Main AI chat endpoint"""
    try:
        messages = request.get("messages", [])
        system_prompt = request.get("system_prompt")
        use_tools = request.get("use_tools", True)
        
        if not messages:
            raise HTTPException(status_code=400, detail="Messages required")
        
        llm_service = get_llm_service()
        response = await llm_service.chat_completion(messages, system_prompt, use_tools)
        
        # Log the AI interaction
        log_entry = {
            "id": str(uuid.uuid4()),
            "actor_type": "ai",
            "actor_id": "ai_chat_session",
            "action": "chat_completion",
            "payload_json": {
                "messages_count": len(messages),
                "use_tools": use_tools,
                "provider": response.get("provider")
            },
            "result_json": {
                "response_length": len(response.get("text", "")),
                "tool_calls_count": len(response.get("tool_calls", [])),
                "usage": response.get("usage", {})
            }
        }
        
        # Store audit log (async, don't wait)
        try:
            from database import get_supabase
            supabase = get_supabase()
            supabase.table("audit_log").insert(log_entry).execute()
        except Exception as e:
            print(f"⚠️ Failed to log AI interaction: {e}")
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI chat error: {str(e)}")

@router.post("/builtin_command")
async def execute_builtin_command(
    request: Dict[str, Any],
    admin: dict = Depends(verify_admin)
):
    """Execute built-in AI commands like /find_waste, /idea_copy"""
    try:
        command = request.get("command", "").lstrip("/")
        args = request.get("args", {})
        user_context = request.get("user_context", {})
        
        if not command:
            raise HTTPException(status_code=400, detail="Command required")
        
        llm_service = get_llm_service()
        result = await llm_service.execute_builtin_command(command, args, user_context)
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Command execution error: {str(e)}")

