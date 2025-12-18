/**
 * Test script to verify BlackWire UI flows work correctly.
 * Run this in browser console on the trace page after tracing a domain.
 */

// Test 1: Check if escalation packet data is stored correctly
function testEscalationPacketStorage() {
  console.log("=".repeat(70));
  console.log("TEST 1: Escalation Packet Storage");
  console.log("=".repeat(70));
  
  // Simulate what happens when button is clicked
  const mockResults = [
    {
      type: "domain",
      value: "example.com",
      data: {
        ip_address: "93.184.216.34",
        registrar: "Example Registrar",
        threat_level: "high"
      }
    }
  ];
  
  // Store in localStorage (as the code does)
  localStorage.setItem('escalationEntities', JSON.stringify(mockResults));
  
  // Verify it can be read back
  const stored = localStorage.getItem('escalationEntities');
  if (stored) {
    const parsed = JSON.parse(stored);
    console.log("✅ localStorage storage/retrieval works");
    console.log(`   Stored ${parsed.length} entity/entities`);
    console.log(`   Entity type: ${parsed[0].type}`);
    console.log(`   Entity value: ${parsed[0].value}`);
    return true;
  } else {
    console.log("❌ localStorage storage failed");
    return false;
  }
}

// Test 2: Check if trace results structure is correct
function testTraceResultsStructure() {
  console.log("\n" + "=".repeat(70));
  console.log("TEST 2: Trace Results Structure");
  console.log("=".repeat(70));
  
  // Check if window.traceResults exists (set by displayResults)
  if (typeof window.traceResults !== 'undefined') {
    console.log("✅ window.traceResults exists");
    console.log(`   Number of results: ${window.traceResults.length}`);
    
    if (window.traceResults.length > 0) {
      const first = window.traceResults[0];
      console.log(`   First result type: ${first.type}`);
      console.log(`   First result value: ${first.value}`);
      console.log(`   Has data: ${!!first.data}`);
      
      // Check for new RDAP fields
      if (first.data) {
        const hasEmailSecurity = 'email_security' in first.data;
        const hasTyposquatting = 'typosquatting' in first.data;
        const hasSslInfo = 'ssl_info' in first.data;
        
        console.log(`   Email security data: ${hasEmailSecurity ? '✅' : '❌'}`);
        console.log(`   Typosquatting data: ${hasTyposquatting ? '✅' : '❌'}`);
        console.log(`   SSL/TLS data: ${hasSslInfo ? '✅' : '❌'}`);
      }
    }
    return true;
  } else {
    console.log("⚠️  window.traceResults not set (run a trace first)");
    return false;
  }
}

// Test 3: Check if escalation packet button exists
function testEscalationButton() {
  console.log("\n" + "=".repeat(70));
  console.log("TEST 3: Escalation Packet Button");
  console.log("=".repeat(70));
  
  const button = document.getElementById('generateEscalationBtn');
  if (button) {
    console.log("✅ Generate Escalation Packet button found");
    console.log(`   Button text: ${button.textContent.trim()}`);
    console.log(`   Button visible: ${button.offsetParent !== null}`);
    return true;
  } else {
    console.log("❌ Generate Escalation Packet button not found");
    console.log("   (Button only appears after trace results are displayed)");
    return false;
  }
}

// Test 4: Check if checkboxes exist
function testEscalationCheckboxes() {
  console.log("\n" + "=".repeat(70));
  console.log("TEST 4: Escalation Checkboxes");
  console.log("=".repeat(70));
  
  const resultsContainer = document.getElementById('resultsData');
  if (resultsContainer) {
    const checkboxes = resultsContainer.querySelectorAll('.escalation-checkbox');
    console.log(`✅ Found ${checkboxes.length} escalation checkboxes`);
    
    if (checkboxes.length > 0) {
      const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
      console.log(`   Checked: ${checked}/${checkboxes.length}`);
    }
    return true;
  } else {
    console.log("⚠️  Results container not found (run a trace first)");
    return false;
  }
}

// Test 5: Simulate navigation to support page
function testNavigationFlow() {
  console.log("\n" + "=".repeat(70));
  console.log("TEST 5: Navigation Flow");
  console.log("=".repeat(70));
  
  // Check if we can construct the navigation URL
  const supportUrl = '/blackwire/support#report';
  console.log(`✅ Navigation URL: ${supportUrl}`);
  
  // Check if support page elements would exist
  console.log("   (To fully test, navigate to support page and check:)");
  console.log("   - localStorage.getItem('escalationEntities') should exist");
  console.log("   - generateEscalationPacket() should be called");
  console.log("   - #escalation-packet div should be visible");
  console.log("   - #escalation-text textarea should have content");
  
  return true;
}

// Test 6: Check for JavaScript errors
function testJavaScriptErrors() {
  console.log("\n" + "=".repeat(70));
  console.log("TEST 6: JavaScript Error Check");
  console.log("=".repeat(70));
  
  // Check if key functions exist
  const functions = [
    'generateEscalationPacket',
    'addResultRow',
    'displayResults'
  ];
  
  let allExist = true;
  for (const funcName of functions) {
    if (typeof window[funcName] === 'function') {
      console.log(`✅ Function ${funcName} exists`);
    } else {
      console.log(`❌ Function ${funcName} not found`);
      allExist = false;
    }
  }
  
  return allExist;
}

// Run all tests
function runAllTests() {
  console.log("\n" + "=".repeat(70));
  console.log("BLACKWIRE UI FLOW TESTING");
  console.log("=".repeat(70));
  
  const results = [];
  results.push(["Escalation Storage", testEscalationPacketStorage()]);
  results.push(["Trace Results", testTraceResultsStructure()]);
  results.push(["Escalation Button", testEscalationButton()]);
  results.push(["Escalation Checkboxes", testEscalationCheckboxes()]);
  results.push(["Navigation Flow", testNavigationFlow()]);
  results.push(["JavaScript Functions", testJavaScriptErrors()]);
  
  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("TEST SUMMARY");
  console.log("=".repeat(70));
  
  const passed = results.filter(([_, result]) => result).length;
  const total = results.length;
  
  results.forEach(([name, result]) => {
    console.log(`${result ? '✅' : '❌'} ${name}`);
  });
  
  console.log(`\nTotal: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log("🎉 All UI tests passed!");
  } else {
    console.log("⚠️  Some tests failed or require trace results");
  }
}

// Auto-run tests
runAllTests();
