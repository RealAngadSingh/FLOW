#!/usr/bin/env python3

import requests
import json
import sys
from datetime import datetime
import tempfile
import os

class TrafficSystemTester:
    def __init__(self, base_url="https://pdf-to-deploy.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def run_test(self, name, method, endpoint, expected_status=200, data=None, files=None, **kwargs):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = kwargs.get('headers', {'Content-Type': 'application/json'})
        
        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=kwargs.get('params'))
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers, params=kwargs.get('params'))
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                self.log(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'test': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}
                
        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            return False, {}
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "")
    
    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        success, data = self.run_test("Dashboard Stats", "GET", "traffic/dashboard")
        if success:
            required_fields = ['total_intersections', 'active_intersections', 'active_incidents', 'avg_speed']
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                self.log(f"⚠️  Dashboard missing fields: {missing_fields}")
                return False
        return success
    
    def test_traffic_metrics(self):
        """Test traffic metrics endpoint"""
        return self.run_test("Traffic Metrics", "GET", "traffic/metrics?hours=1")
    
    def test_intersections(self):
        """Test intersections endpoints"""
        success1, data = self.run_test("Get Intersections", "GET", "intersections")
        if not success1 or not data:
            return False
            
        # Test getting a specific intersection
        if isinstance(data, list) and len(data) > 0:
            intersection_id = data[0]['id']
            success2, _ = self.run_test("Get Single Intersection", "GET", f"intersections/{intersection_id}")
            
            # Test updating intersection signal
            update_data = {"current_signal_state": "green-ns"}
            success3, _ = self.run_test("Update Intersection", "PATCH", f"intersections/{intersection_id}", data=update_data)
            
            return success1 and success2 and success3
        
        return success1
    
    def test_vehicle_detections(self):
        """Test vehicle detection endpoints"""
        success1, _ = self.run_test("Get Vehicle Detections", "GET", "vehicles/detections?limit=10")
        success2, _ = self.run_test("Get Vehicle Stats", "GET", "vehicles/stats")
        return success1 and success2
    
    def test_incidents(self):
        """Test incident management endpoints"""
        # Get all incidents
        success1, _ = self.run_test("Get All Incidents", "GET", "incidents")
        
        # Get active incidents
        success2, _ = self.run_test("Get Active Incidents", "GET", "incidents?status=active")
        
        # Create new incident
        incident_data = {
            "type": "test_incident",
            "intersection_id": "int-001",
            "location": "Test Location",
            "severity": "low",
            "description": "Test incident created by automated testing"
        }
        success3, new_incident = self.run_test("Create Incident", "POST", "incidents", data=incident_data, expected_status=200)
        
        # Update incident status if creation succeeded
        success4 = True
        if success3 and new_incident and 'id' in new_incident:
            success4, _ = self.run_test("Update Incident", "PATCH", f"incidents/{new_incident['id']}", 
                                      data={}, params={'status': 'resolved'})
        
        return success1 and success2 and success3 and success4
    
    def test_video_feeds(self):
        """Test video feed endpoints"""
        success1, _ = self.run_test("Get Video Feeds", "GET", "feeds")
        
        # Test video upload with a small test file
        try:
            # Create a small test video file (just a text file for testing)
            with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_file:
                tmp_file.write(b'fake video data for testing')
                tmp_file.flush()
                
                with open(tmp_file.name, 'rb') as test_file:
                    files = {'file': ('test.mp4', test_file, 'video/mp4')}
                    data = {'intersection_id': 'int-001'}
                    success2, _ = self.run_test("Upload Video", "POST", "feeds/upload", 
                                              data=data, files=files, expected_status=200)
                
                # Clean up test file
                os.unlink(tmp_file.name)
                
        except Exception as e:
            self.log(f"⚠️  Video upload test failed with error: {e}")
            success2 = False
        
        return success1 and success2
    
    def test_analytics(self):
        """Test analytics endpoints"""
        return self.run_test("Get Hourly Analytics", "GET", "analytics/hourly?hours=24")
    
    def run_all_tests(self):
        """Run comprehensive backend testing"""
        self.log("🚀 Starting SmartFlow AI Traffic Management System Backend Tests")
        self.log(f"Testing against: {self.base_url}")
        
        # Test all endpoints
        test_results = {
            'Root API': self.test_root_endpoint(),
            'Dashboard': self.test_dashboard_stats(), 
            'Traffic Metrics': self.test_traffic_metrics(),
            'Intersections': self.test_intersections(),
            'Vehicle Detection': self.test_vehicle_detections(),
            'Incident Management': self.test_incidents(),
            'Video Feeds': self.test_video_feeds(),
            'Analytics': self.test_analytics()
        }
        
        # Print summary
        self.log("\n" + "="*60)
        self.log("📊 TEST SUMMARY")
        self.log("="*60)
        
        for category, success in test_results.items():
            status = "✅ PASSED" if success else "❌ FAILED"
            self.log(f"{category:<20} {status}")
        
        self.log(f"\nOverall: {self.tests_passed}/{self.tests_run} tests passed ({(self.tests_passed/self.tests_run)*100:.1f}%)")
        
        if self.failed_tests:
            self.log("\n🔍 FAILED TESTS DETAILS:")
            for failure in self.failed_tests:
                error_msg = failure.get('error', f"Expected {failure.get('expected')}, got {failure.get('actual')}")
                self.log(f"  - {failure['test']}: {error_msg}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = TrafficSystemTester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"💥 Fatal error during testing: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())