#!/usr/bin/env node

/**
 * Test script để kiểm tra workflow fix
 * Chạy: node test-workflow-fix.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3000/graphql';

// Test data
const testWorkflowAction = {
  instanceId: 3,
  stepId: 2,
  actionType: 'APPROVE',
  note: 'Test approval from fix script',
  metadata: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
};

async function testWorkflowAction() {
  console.log('🧪 Testing Workflow Action Fix...');
  console.log('=====================================');
  
  try {
    // Test 1: Execute workflow action
    console.log('1️⃣ Testing workflow action execution...');
    
    const mutation = `
      mutation ExecuteWorkflowAction($input: WorkflowActionInput!) {
        executeWorkflowAction(workflowActionInput: $input) {
          id
          status
          currentStepId
          currentStep {
            id
            name
            type
          }
          logs {
            id
            instanceId
            stepId
            actionType
            actionByUser {
              id
              fullName
            }
            actionAt
            note
            createdAt
          }
        }
      }
    `;

    const response = await axios.post(API_URL, {
      query: mutation,
      variables: {
        input: testWorkflowAction
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        // Thêm authorization header nếu cần
        // 'Authorization': 'Bearer YOUR_TOKEN'
      }
    });

    if (response.data.errors) {
      console.error('❌ GraphQL Errors:', response.data.errors);
      return false;
    }

    const result = response.data.data.executeWorkflowAction;
    console.log('✅ Workflow action executed successfully!');
    console.log('📊 Result:', {
      id: result.id,
      status: result.status,
      currentStepId: result.currentStepId,
      logsCount: result.logs?.length || 0
    });

    // Test 2: Validate logs
    console.log('\n2️⃣ Validating workflow logs...');
    
    if (result.logs && result.logs.length > 0) {
      const validLogs = result.logs.filter(log => {
        if (!log.instanceId) {
          console.error('❌ Found log with null instanceId:', log);
          return false;
        }
        return true;
      });

      console.log(`✅ All ${validLogs.length} logs have valid instanceId`);
      
      // Show latest log
      const latestLog = result.logs[result.logs.length - 1];
      console.log('📝 Latest log:', {
        id: latestLog.id,
        instanceId: latestLog.instanceId,
        stepId: latestLog.stepId,
        actionType: latestLog.actionType,
        actionByUser: latestLog.actionByUser?.fullName,
        actionAt: latestLog.actionAt,
        note: latestLog.note
      });
    } else {
      console.log('⚠️ No logs found');
    }

    // Test 3: Check database integrity
    console.log('\n3️⃣ Checking database integrity...');
    
    const query = `
      query GetWorkflowInstance($id: Int!) {
        workflowInstance(id: $id) {
          id
          status
          currentStepId
          logs {
            id
            instanceId
            stepId
            actionType
            createdAt
          }
        }
      }
    `;

    const integrityResponse = await axios.post(API_URL, {
      query: query,
      variables: { id: result.id }
    });

    if (integrityResponse.data.errors) {
      console.error('❌ Integrity check failed:', integrityResponse.data.errors);
      return false;
    }

    const instance = integrityResponse.data.data.workflowInstance;
    const allLogsValid = instance.logs.every(log => log.instanceId);
    
    if (allLogsValid) {
      console.log('✅ Database integrity check passed');
      console.log(`📊 Instance ${instance.id} has ${instance.logs.length} valid logs`);
    } else {
      console.error('❌ Database integrity check failed - found logs with null instanceId');
      return false;
    }

    console.log('\n🎉 All tests passed! Workflow fix is working correctly.');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting Workflow Fix Tests...\n');
  
  const success = await testWorkflowAction();
  
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('🎉 ALL TESTS PASSED - Workflow fix is working!');
  } else {
    console.log('❌ TESTS FAILED - Please check the implementation');
  }
  console.log('='.repeat(50));
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testWorkflowAction, runTests };

