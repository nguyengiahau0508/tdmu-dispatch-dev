// Test script để kiểm tra logic upload file và lưu fileId
const { ApolloClient, InMemoryCache, gql } = require('@apollo/client');
const { createUploadLink } = require('apollo-upload-client');

// Tạo Apollo Client với upload support
const client = new ApolloClient({
  link: createUploadLink({
    uri: 'http://localhost:3000/graphql',
  }),
  cache: new InMemoryCache(),
});

// Mutation để tạo document với file
const CREATE_DOCUMENT_WITH_FILE = gql`
  mutation CreateDocument($createDocumentInput: CreateDocumentInput!, $file: Upload) {
    createDocument(createDocumentInput: $createDocumentInput, file: $file) {
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
        fileId
        file {
          id
          driveFileId
          originalName
          mimeType
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
`;

// Query để lấy document
const GET_DOCUMENT = gql`
  query GetDocument($id: Int!) {
    document(id: $id) {
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
        fileId
        file {
          id
          driveFileId
          originalName
          mimeType
          isPublic
        }
        status
        createdAt
        updatedAt
      }
    }
  }
`;

async function testDocumentCreation() {
  try {
    console.log('=== Testing Document Creation with File Upload ===');
    
    // Tạo một file test đơn giản
    const testFile = new File(['Test content for file upload'], 'test-document.txt', {
      type: 'text/plain',
    });
    
    const createDocumentInput = {
      title: 'Test Document with File Upload',
      content: 'This is a test document to verify file upload and fileId saving',
      documentType: 'INTERNAL',
      documentCategoryId: 1, // Đảm bảo category này tồn tại
      status: 'DRAFT',
      priority: 'MEDIUM',
    };
    
    console.log('Creating document with input:', createDocumentInput);
    console.log('File to upload:', testFile.name, testFile.type, testFile.size);
    
    const result = await client.mutate({
      mutation: CREATE_DOCUMENT_WITH_FILE,
      variables: {
        createDocumentInput,
        file: testFile,
      },
    });
    
    console.log('Document creation result:', JSON.stringify(result.data, null, 2));
    
    if (result.data?.createDocument?.data) {
      const document = result.data.createDocument.data;
      console.log('\n=== Document Created Successfully ===');
      console.log('Document ID:', document.id);
      console.log('Document Title:', document.title);
      console.log('File ID:', document.fileId);
      console.log('Has File:', !!document.file);
      
      if (document.file) {
        console.log('File Details:');
        console.log('  - File ID:', document.file.id);
        console.log('  - Drive File ID:', document.file.driveFileId);
        console.log('  - Original Name:', document.file.originalName);
        console.log('  - MIME Type:', document.file.mimeType);
        console.log('  - Is Public:', document.file.isPublic);
      }
      
      // Test lấy lại document để đảm bảo fileId được lưu đúng
      console.log('\n=== Testing Document Retrieval ===');
      const retrievedResult = await client.query({
        query: GET_DOCUMENT,
        variables: { id: document.id },
      });
      
      const retrievedDocument = retrievedResult.data?.document?.data;
      if (retrievedDocument) {
        console.log('Retrieved Document:');
        console.log('  - Document ID:', retrievedDocument.id);
        console.log('  - File ID:', retrievedDocument.fileId);
        console.log('  - Has File:', !!retrievedDocument.file);
        
        if (retrievedDocument.file) {
          console.log('  - File Drive ID:', retrievedDocument.file.driveFileId);
        }
        
        // Kiểm tra xem fileId có được lưu đúng không
        if (retrievedDocument.fileId && retrievedDocument.file) {
          console.log('✅ SUCCESS: FileId is properly saved and linked!');
        } else {
          console.log('❌ FAILED: FileId is not properly saved or linked!');
        }
      }
    } else {
      console.log('❌ Document creation failed:', result.data?.createDocument?.metadata);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err, index) => {
        console.error(`GraphQL Error ${index + 1}:`, err.message);
      });
    }
  }
}

// Chạy test
testDocumentCreation();
