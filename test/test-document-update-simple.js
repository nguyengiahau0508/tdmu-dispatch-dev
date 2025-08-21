import fetch from 'node-fetch';

// GraphQL endpoint
const GRAPHQL_URL = 'http://localhost:3000/graphql';

// Test mutation
const UPDATE_DOCUMENT_MUTATION = `
  mutation UpdateDocument($updateDocumentInput: UpdateDocumentInput!) {
    updateDocument(updateDocumentInput: $updateDocumentInput) {
      metadata {
        statusCode
        message
      }
      data {
        id
        title
        content
        documentType
        documentCategoryId
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// Test data
const testUpdateInput = {
  id: 1, // Document ID thực tế từ database
  title: "Test Updated Document - " + new Date().toISOString(),
  content: "This is an updated test document with timestamp: " + new Date().toISOString(),
  documentType: "INTERNAL",
  documentCategoryId: 1, // Document category ID thực tế
  status: "PENDING"
};

async function testDocumentUpdate() {
  console.log('=== Testing Document Update ===');
  console.log('Update input:', testUpdateInput);
  
  try {
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Thêm authorization header nếu cần
        // 'Authorization': 'Bearer your-token-here'
      },
      body: JSON.stringify({
        query: UPDATE_DOCUMENT_MUTATION,
        variables: { updateDocumentInput: testUpdateInput }
      })
    });
    
    const result = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.data?.updateDocument?.data) {
      console.log('✅ Update successful!');
      console.log('Updated document ID:', result.data.updateDocument.data.id);
      console.log('Updated document title:', result.data.updateDocument.data.title);
    } else if (result.errors) {
      console.log('❌ GraphQL errors:');
      result.errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error.message);
      });
    } else {
      console.log('❌ Unexpected response format');
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run test
testDocumentUpdate();
