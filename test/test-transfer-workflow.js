import fetch from 'node-fetch';

// GraphQL endpoint
const GRAPHQL_URL = 'http://localhost:3000/graphql';

// Test mutation
const PROCESS_DOCUMENT_ACTION = `
  mutation ProcessDocumentAction($input: DocumentActionInput!) {
    processDocumentAction(input: $input) {
      metadata {
        statusCode
        message
      }
      data {
        id
        title
        status
        assignedToUserId
        workflowInstance {
          id
          currentStepId
          status
        }
      }
    }
  }
`;

// Test data
const testTransferInput = {
  documentId: 11, // Document ID có workflow instance
  actionType: "TRANSFER",
  notes: "Test transfer action - " + new Date().toISOString(),
  transferToUserId: 2 // User ID để chuyển cho
};

async function testTransferWorkflow() {
  console.log('=== Testing Transfer Workflow ===');
  console.log('Transfer input:', testTransferInput);
  
  // Lấy token từ environment hoặc hardcode cho test
  const token = process.env.AUTH_TOKEN || 'your-jwt-token-here';
  
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: PROCESS_DOCUMENT_ACTION,
        variables: { input: testTransferInput }
      })
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.data?.processDocumentAction?.data) {
      console.log('✅ Transfer successful!');
      const document = result.data.processDocumentAction.data;
      console.log('Document ID:', document.id);
      console.log('Document status:', document.status);
      console.log('Assigned to user ID:', document.assignedToUserId);
      
      if (document.workflowInstance) {
        console.log('Workflow instance ID:', document.workflowInstance.id);
        console.log('Current step ID:', document.workflowInstance.currentStepId);
        console.log('Workflow status:', document.workflowInstance.status);
      }
    } else if (result.errors) {
      console.log('❌ GraphQL errors:');
      result.errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error.message);
        if (error.extensions?.metadata) {
          console.log('  Metadata:', error.extensions.metadata);
        }
      });
    } else {
      console.log('❌ Unexpected response format');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run test
testTransferWorkflow();
