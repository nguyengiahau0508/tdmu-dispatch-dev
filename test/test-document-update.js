// Test script để kiểm tra chức năng update document
const { ApolloClient, InMemoryCache, gql, createHttpLink } = require('@apollo/client');
const fetch = require('cross-fetch');

// GraphQL endpoint
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
  fetch,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Test mutation
const UPDATE_DOCUMENT = gql`
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
  id: 1, // Thay đổi ID này thành ID thực tế của document
  title: "Test Updated Document",
  content: "This is an updated test document",
  documentType: "INTERNAL",
  documentCategoryId: 1, // Thay đổi ID này thành ID thực tế của category
  status: "PENDING"
};

async function testDocumentUpdate() {
  console.log('=== Testing Document Update ===');
  console.log('Update input:', testUpdateInput);
  
  try {
    const result = await client.mutate({
      mutation: UPDATE_DOCUMENT,
      variables: { updateDocumentInput: testUpdateInput }
    });
    
    console.log('✅ Update successful!');
    console.log('Result:', JSON.stringify(result.data, null, 2));
    
    if (result.data.updateDocument.data) {
      console.log('Updated document ID:', result.data.updateDocument.data.id);
      console.log('Updated document title:', result.data.updateDocument.data.title);
    }
    
  } catch (error) {
    console.error('❌ Update failed!');
    console.error('Error:', error.message);
    console.error('GraphQL errors:', error.graphQLErrors);
    console.error('Network error:', error.networkError);
  }
}

// Run test
testDocumentUpdate();
