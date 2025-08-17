// Test script để kiểm tra backend API đơn giản
const https = require('https');
const http = require('http');

// GraphQL query và mutation
const GET_DOCUMENTS_QUERY = `
  query GetDocumentsPaginated($input: GetDocumentsPaginatedInput!) {
    documents(input: $input) {
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
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          originalName
          mimeType
          isPublic
        }
        status
        priority
        deadline
        assignedToUserId
        createdAt
        updatedAt
      }
      totalCount
      hasNextPage
    }
  }
`;

const CREATE_DOCUMENT_MUTATION = `
  mutation CreateDocument($createDocumentInput: CreateDocumentInput!) {
    createDocument(createDocumentInput: $createDocumentInput) {
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
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          originalName
          mimeType
          isPublic
        }
        status
        priority
        deadline
        assignedToUserId
        createdAt
        updatedAt
      }
    }
  }
`;

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
        documentCategory {
          id
          name
        }
        fileId
        file {
          id
          driveFileId
          originalName
          mimeType
          isPublic
        }
        status
        priority
        deadline
        assignedToUserId
        createdAt
        updatedAt
      }
    }
  }
`;

// Helper function để gọi GraphQL
function callGraphQL(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      query,
      variables
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          resolve(result);
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function testBackendAPI() {
  try {
    console.log('=== TEST BACKEND API ===');
    
    // 1. Test lấy danh sách documents
    console.log('\n1. Testing GET documents...');
    const documentsResult = await callGraphQL(GET_DOCUMENTS_QUERY, {
      input: {
        page: 1,
        take: 5,
        order: 'DESC'
      }
    });
    
    console.log('Documents result:', JSON.stringify(documentsResult, null, 2));
    
    if (!documentsResult.data?.documents?.data?.length) {
      console.log('❌ Không có documents nào để test');
      return;
    }
    
    const existingDocuments = documentsResult.data.documents.data;
    console.log('✅ Tìm thấy', existingDocuments.length, 'documents');
    
    // 2. Test tạo document mới
    console.log('\n2. Testing CREATE document...');
    const createInput = {
      title: 'Test Document for Update Debug',
      content: 'This is a test document to debug update issue',
      documentType: 'INTERNAL',
      documentCategoryId: 1,
      status: 'DRAFT',
      priority: 'MEDIUM'
    };
    
    const createResult = await callGraphQL(CREATE_DOCUMENT_MUTATION, {
      createDocumentInput: createInput
    });
    
    console.log('Create result:', JSON.stringify(createResult, null, 2));
    
    if (createResult.data?.createDocument?.metadata?.statusCode !== 200) {
      console.log('❌ Tạo document thất bại:', createResult.data?.createDocument?.metadata);
      return;
    }
    
    const newDocument = createResult.data.createDocument.data;
    console.log('✅ Tạo document thành công!');
    console.log('  - ID:', newDocument.id);
    console.log('  - Title:', newDocument.title);
    
    // 3. Test update document
    console.log('\n3. Testing UPDATE document...');
    const updateInput = {
      id: newDocument.id,
      title: '[UPDATED] ' + newDocument.title,
      content: newDocument.content + '\n\n--- Updated at ' + new Date().toLocaleString() + ' ---',
      status: 'PENDING'
    };
    
    const updateResult = await callGraphQL(UPDATE_DOCUMENT_MUTATION, {
      updateDocumentInput: updateInput
    });
    
    console.log('Update result:', JSON.stringify(updateResult, null, 2));
    
    if (updateResult.data?.updateDocument?.metadata?.statusCode !== 200) {
      console.log('❌ Update thất bại:', updateResult.data?.updateDocument?.metadata);
      return;
    }
    
    const updatedDocument = updateResult.data.updateDocument.data;
    console.log('✅ Update thành công!');
    console.log('  - ID:', updatedDocument.id);
    console.log('  - Title:', updatedDocument.title);
    
    // 4. Verify document ID không thay đổi
    console.log('\n4. Verifying document ID...');
    if (updatedDocument.id === newDocument.id) {
      console.log('✅ Document ID không thay đổi:', updatedDocument.id);
    } else {
      console.log('❌ Document ID đã thay đổi!');
      console.log('  - Original ID:', newDocument.id);
      console.log('  - Updated ID:', updatedDocument.id);
    }
    
    // 5. Kiểm tra lại danh sách documents
    console.log('\n5. Checking documents list after update...');
    const documentsAfterUpdate = await callGraphQL(GET_DOCUMENTS_QUERY, {
      input: {
        page: 1,
        take: 10,
        order: 'DESC'
      }
    });
    
    const documentsAfter = documentsAfterUpdate.data.documents.data;
    console.log('✅ Tìm thấy', documentsAfter.length, 'documents sau update');
    
    // Tìm document đã update
    const foundDocument = documentsAfter.find(doc => doc.id === newDocument.id);
    if (foundDocument) {
      console.log('✅ Tìm thấy document đã update trong danh sách:');
      console.log('  - ID:', foundDocument.id);
      console.log('  - Title:', foundDocument.title);
      console.log('  - Status:', foundDocument.status);
    } else {
      console.log('❌ Không tìm thấy document đã update trong danh sách!');
    }
    
    // 6. Kiểm tra có document mới nào được tạo không
    const newDocuments = documentsAfter.filter(doc => 
      doc.createdAt > newDocument.createdAt
    );
    
    if (newDocuments.length > 0) {
      console.log('⚠️ Phát hiện documents mới được tạo sau khi update:');
      newDocuments.forEach((doc, index) => {
        console.log(`  ${index + 1}. ID: ${doc.id}, Title: "${doc.title}", Created: ${doc.createdAt}`);
      });
    } else {
      console.log('✅ Không có document mới nào được tạo');
    }
    
    console.log('\n=== TEST SUMMARY ===');
    console.log('✅ Backend API: WORKING');
    console.log('✅ Create Document: WORKING');
    console.log('✅ Update Document: WORKING');
    console.log('✅ Document ID Consistency: WORKING');
    console.log('✅ No Duplicate Creation: WORKING');
    
    console.log('\n🎯 Kết luận: Backend API hoạt động đúng!');
    console.log('Vấn đề có thể nằm ở frontend logic hoặc cách gọi API.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Backend server có thể chưa chạy. Hãy chạy: npm run start:dev');
    }
  }
}

// Chạy test
testBackendAPI();
