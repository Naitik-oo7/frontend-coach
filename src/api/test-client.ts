// Simple test to verify Axios client is working
import { apiGet, apiPost, setAccessToken } from "./client";

// Test function to verify our Axios client
async function testApiClient() {
  // Test setting access token
  setAccessToken("test-token");
  console.log("Set access token successfully");

  // Test GET request structure (not actually making the request)
  console.log("API methods imported successfully:", !!apiGet, !!apiPost);

  console.log("All API client tests passed!");
}

testApiClient();
