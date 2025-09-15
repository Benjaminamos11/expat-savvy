#!/usr/bin/env python3
"""
Phase A Test Suite
Tests ETL functionality and reporting endpoints
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
import requests
import json

# Test configuration
API_BASE_URL = os.getenv("API_BASE_URL", "https://expat-savvy-api.fly.dev")
ADMIN_USER = os.getenv("ADMIN_USER", "admin")
ADMIN_PASS = os.getenv("ADMIN_PASS", "changeme123")

class PhaseATests:
    def __init__(self):
        self.base_url = API_BASE_URL
        self.auth = (ADMIN_USER, ADMIN_PASS)
        self.test_results = []
    
    def log_test(self, test_name, passed, message=""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.test_results.append({"name": test_name, "passed": passed, "message": message})
        print(f"{status}: {test_name}")
        if message:
            print(f"      {message}")
    
    def test_api_health(self):
        """Test basic API health"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            passed = response.status_code == 200
            message = f"Status: {response.status_code}"
            self.log_test("API Health Check", passed, message)
            return passed
        except Exception as e:
            self.log_test("API Health Check", False, str(e))
            return False
    
    def test_database_connection(self):
        """Test database connectivity"""
        try:
            response = requests.get(f"{self.base_url}/test-db", timeout=10)
            passed = response.status_code == 200
            data = response.json() if response.status_code == 200 else {}
            message = data.get("message", f"Status: {response.status_code}")
            self.log_test("Database Connection", passed, message)
            return passed
        except Exception as e:
            self.log_test("Database Connection", False, str(e))
            return False
    
    def test_attribution_migration(self):
        """Test attribution migration endpoint"""
        try:
            response = requests.post(
                f"{self.base_url}/api/attribution/migrate",
                auth=self.auth,
                timeout=30
            )
            passed = response.status_code == 200
            data = response.json() if response.status_code == 200 else {}
            message = data.get("message", f"Status: {response.status_code}")
            self.log_test("Attribution Migration", passed, message)
            return passed
        except Exception as e:
            self.log_test("Attribution Migration", False, str(e))
            return False
    
    def test_plausible_etl(self):
        """Test Plausible ETL endpoint"""
        try:
            # Test with yesterday's date
            target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            response = requests.post(
                f"{self.base_url}/api/etl/plausible",
                auth=self.auth,
                json={"target_date": target_date},
                timeout=60
            )
            
            passed = response.status_code == 200
            data = response.json() if response.status_code == 200 else {}
            message = data.get("message", f"Status: {response.status_code}")
            self.log_test("Plausible ETL", passed, message)
            return passed
        except Exception as e:
            self.log_test("Plausible ETL", False, str(e))
            return False
    
    def test_gsc_etl(self):
        """Test Google Search Console ETL endpoint"""
        try:
            target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            response = requests.post(
                f"{self.base_url}/api/etl/gsc",
                auth=self.auth,
                json={"target_date": target_date},
                timeout=60
            )
            
            passed = response.status_code == 200
            data = response.json() if response.status_code == 200 else {}
            message = data.get("message", f"Status: {response.status_code}")
            
            # GSC might not be configured, so we're more lenient here
            if "GSC service not initialized" in message:
                self.log_test("Google Search Console ETL", True, "GSC not configured (optional)")
            else:
                self.log_test("Google Search Console ETL", passed, message)
            return True  # Always return true since GSC is optional
        except Exception as e:
            self.log_test("Google Search Console ETL", False, str(e))
            return False
    
    def test_daily_report(self):
        """Test daily reporting endpoint"""
        try:
            target_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
            
            response = requests.get(
                f"{self.base_url}/api/reports/daily",
                auth=self.auth,
                params={"date": target_date},
                timeout=30
            )
            
            passed = response.status_code == 200
            if passed:
                data = response.json()
                events_summary = data.get("events_summary", {})
                total_pageviews = events_summary.get("total_pageviews", 0)
                message = f"Found {total_pageviews} pageviews for {target_date}"
            else:
                message = f"Status: {response.status_code}"
            
            self.log_test("Daily Report", passed, message)
            return passed
        except Exception as e:
            self.log_test("Daily Report", False, str(e))
            return False
    
    def test_cpl_report(self):
        """Test CPL reporting endpoint"""
        try:
            end_date = datetime.now().strftime("%Y-%m-%d")
            start_date = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")
            
            response = requests.get(
                f"{self.base_url}/api/reports/cpl",
                auth=self.auth,
                params={"start_date": start_date, "end_date": end_date},
                timeout=30
            )
            
            passed = response.status_code == 200
            if passed:
                data = response.json()
                total_leads = data.get("total_leads", 0)
                overall_cpl = data.get("overall_cpl", 0)
                message = f"{total_leads} leads, CPL: CHF {overall_cpl:.2f}"
            else:
                message = f"Status: {response.status_code}"
            
            self.log_test("CPL Report", passed, message)
            return passed
        except Exception as e:
            self.log_test("CPL Report", False, str(e))
            return False
    
    def test_lead_creation_with_attribution(self):
        """Test that lead creation properly creates attribution entries"""
        try:
            # Create test lead
            test_lead_data = {
                "email": f"test.{datetime.now().strftime('%Y%m%d%H%M%S')}@example.com",
                "name": "Phase A Test User",
                "city": "zurich",
                "utm_source": "test",
                "utm_medium": "automated_test",
                "utm_campaign": "phase_a_testing",
                "channel": "paid",
                "page_type": "homepage",
                "flow": "quote"
            }
            
            response = requests.post(
                f"{self.base_url}/api/lead",
                json=test_lead_data,
                timeout=30
            )
            
            if response.status_code != 200:
                self.log_test("Lead Creation with Attribution", False, f"Lead creation failed: {response.status_code}")
                return False
            
            lead_data = response.json()
            lead_id = lead_data.get("lead_id")
            
            if not lead_id:
                self.log_test("Lead Creation with Attribution", False, "No lead_id returned")
                return False
            
            # Check attribution was created
            response = requests.get(
                f"{self.base_url}/api/attribution/{lead_id}",
                auth=self.auth,
                timeout=30
            )
            
            passed = response.status_code == 200
            if passed:
                attribution_data = response.json()
                first_touch = attribution_data.get("first_touch", {})
                utm_campaign = first_touch.get("utm_campaign")
                message = f"Lead {lead_id} created with attribution: {utm_campaign}"
            else:
                message = f"Attribution check failed: {response.status_code}"
            
            self.log_test("Lead Creation with Attribution", passed, message)
            return passed
            
        except Exception as e:
            self.log_test("Lead Creation with Attribution", False, str(e))
            return False
    
    def run_all_tests(self):
        """Run all Phase A tests"""
        print("🧪 Running Phase A Test Suite")
        print("=" * 60)
        
        # Core infrastructure tests
        if not self.test_api_health():
            print("❌ API not accessible, aborting tests")
            return False
        
        if not self.test_database_connection():
            print("❌ Database connection failed, aborting tests")
            return False
        
        # Phase A specific tests
        self.test_attribution_migration()
        self.test_plausible_etl()
        self.test_gsc_etl()
        self.test_daily_report()
        self.test_cpl_report()
        self.test_lead_creation_with_attribution()
        
        # Summary
        print("\n📊 Test Results Summary")
        print("-" * 30)
        
        passed_tests = [r for r in self.test_results if r["passed"]]
        failed_tests = [r for r in self.test_results if not r["passed"]]
        
        print(f"Total tests: {len(self.test_results)}")
        print(f"Passed: {len(passed_tests)}")
        print(f"Failed: {len(failed_tests)}")
        
        if failed_tests:
            print("\n❌ Failed tests:")
            for test in failed_tests:
                print(f"  - {test['name']}: {test['message']}")
        
        overall_success = len(failed_tests) == 0
        
        print(f"\n🎯 Overall result: {'✅ ALL TESTS PASSED' if overall_success else '❌ SOME TESTS FAILED'}")
        
        if overall_success:
            print("\n🚀 Phase A is working correctly!")
            print("You can proceed with:")
            print("1. Setting up automated ETL scheduling")
            print("2. Monitoring data quality for a few days")
            print("3. Planning Phase B implementation")
        else:
            print("\n⚠️ Please fix failed tests before proceeding")
        
        return overall_success

def main():
    """Main test execution"""
    if len(sys.argv) > 1:
        if sys.argv[1] == "--help":
            print("Phase A Test Suite")
            print("Usage: python test_phase_a.py [--quick]")
            print("")
            print("Options:")
            print("  --quick    Run only essential tests")
            print("  --help     Show this help message")
            return
        elif sys.argv[1] == "--quick":
            # Quick test mode - only essential checks
            tester = PhaseATests()
            tester.test_api_health()
            tester.test_database_connection()
            tester.test_daily_report()
            return
    
    # Full test suite
    tester = PhaseATests()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()

