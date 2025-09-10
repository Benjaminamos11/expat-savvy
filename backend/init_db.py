"""
Initialize Supabase database tables for Expat Savvy Lead Platform
Run this script to create the required tables in your Supabase project
"""

from database import get_supabase
from supabase_models import CREATE_TABLES_SQL

def init_database():
    """Initialize database tables"""
    try:
        supabase = get_supabase()
        
        print("🔄 Initializing Supabase database...")
        
        # Execute the SQL to create tables
        result = supabase.rpc('exec_sql', {'sql': CREATE_TABLES_SQL}).execute()
        
        print("✅ Database initialized successfully!")
        print("📊 Created tables: leads, events, ad_costs")
        print("🔐 Enabled Row Level Security")
        print("📈 Created indexes for performance")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {str(e)}")
        print("\n💡 Manual setup required:")
        print("1. Go to your Supabase SQL Editor")
        print("2. Run the SQL from supabase_models.py")
        return False

if __name__ == "__main__":
    init_database()