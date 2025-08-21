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

// Test data - thay đổi ID này thành ID thực tế của document
const testUpdateInput = {
  id: 1, // Thay đổi ID này thành ID thực tế của document
  title: "Test Updated Document",
  content: "This is an updated test document",
  documentType: "INTERNAL",
  documentCategoryId: 1, // Thay đổi ID này thành ID thực tế của category
  status: "PENDING"
};

async function testDocumentUpdateWithAuth() {
  console.log('=== Testing Document Update with Authentication ===');
  console.log('Update input:', testUpdateInput);
  
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
testDocumentUpdateWithAuth();
