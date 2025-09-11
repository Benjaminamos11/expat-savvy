"""
Supabase configuration for Expat Savvy Lead Platform
"""

from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

print(f"SUPABASE_URL: {SUPABASE_URL}")
print(f"SUPABASE_SERVICE_ROLE_KEY length: {len(SUPABASE_SERVICE_ROLE_KEY) if SUPABASE_SERVICE_ROLE_KEY else 0}")

# Global supabase client variable
supabase: Client = None

def initialize_supabase():
    """Initialize Supabase client"""
    global supabase
    
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("WARNING: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        return False
    
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
        print("Supabase client initialized successfully")
        return True
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
        supabase = None
        return False

def get_supabase():
    """Dependency to get Supabase client"""
    if supabase is None:
        if not initialize_supabase():
            raise Exception("Supabase client not available")
    return supabase

# Try to initialize on import, but don't fail the whole app
initialize_supabase()