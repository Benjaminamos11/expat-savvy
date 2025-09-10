"""
Plausible Analytics server-side event tracking
"""

import httpx
import os
from typing import Dict, Any, Optional
import asyncio

class PlausibleService:
    def __init__(self):
        self.api_url = "https://plausible.io/api/event"
        self.domain = os.getenv("PLAUSIBLE_DOMAIN", "expat-savvy.ch")
        
    async def track_event(
        self, 
        event_name: str, 
        url: str, 
        props: Optional[Dict[str, Any]] = None
    ) -> bool:
        """Send server-side event to Plausible"""
        try:
            payload = {
                "name": event_name,
                "url": url,
                "domain": self.domain
            }
            
            if props:
                # Filter out None values and ensure all values are strings
                clean_props = {
                    k: str(v) for k, v in props.items() 
                    if v is not None
                }
                if clean_props:
                    payload["props"] = clean_props
            
            headers = {
                "Content-Type": "application/json",
                "User-Agent": "Expat Savvy Backend/1.0"
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    json=payload,
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 202:
                    print(f"✅ Plausible event sent: {event_name}")
                    return True
                else:
                    print(f"⚠️  Plausible event failed: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Plausible event error: {str(e)}")
            return False