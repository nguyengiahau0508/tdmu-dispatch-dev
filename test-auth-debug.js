const axios = require('axios');

const GRAPHQL_URL = 'http://localhost:3000/graphql';

// Test với user CLERK
const CLERK_EMAIL = 'user5@tdmu.edu.vn';
const CLERK_PASSWORD = '123456'; // Mật khẩu mặc định

async function testAuth() {
  try {
    console.log('🔍 Testing authentication with CLERK user...');
    
    // 1. Đăng nhập
    const loginQuery = `
      mutation SignIn($input: SignInInput!) {
        signIn(input: $input) {
          metadata {
            statusCode
            message
          }
          data {
            accessToken
            user {
              id
              email
              firstName
              lastName
              roles
            }
          }
        }
      }
    `;
    
    const loginResponse = await axios.post(GRAPHQL_URL, {
      query: loginQuery,
      variables: {
        input: {
          email: CLERK_EMAIL,
          password: CLERK_PASSWORD
        }
      }
    });
    
    console.log('📝 Login Response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.data?.signIn?.data?.accessToken) {
      const token = loginResponse.data.data.signIn.data.accessToken;
      const user = loginResponse.data.data.signIn.data.user;
      
      console.log('✅ Login successful!');
      console.log('👤 User:', user);
      console.log('🔑 Token:', token.substring(0, 50) + '...');
      
      // 2. Test tạo văn bản
      const createDocumentQuery = `
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
              status
            }
          }
        }
      `;
      
      const createDocumentResponse = await axios.post(GRAPHQL_URL, {
        query: createDocumentQuery,
        variables: {
          createDocumentInput: {
            title: 'Test Document from CLERK',
            content: 'This is a test document created by CLERK user',
            documentType: 'INTERNAL',
            priority: 'MEDIUM',
            documentCategoryId: 1
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📄 Create Document Response:', JSON.stringify(createDocumentResponse.data, null, 2));
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.errors || loginResponse.data.data?.signIn?.metadata);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Test với user SYSTEM_ADMIN
async function testAdminAuth() {
  try {
    console.log('\n🔍 Testing authentication with SYSTEM_ADMIN user...');
    
    const loginQuery = `
      mutation SignIn($input: SignInInput!) {
        signIn(input: $input) {
          metadata {
            statusCode
            message
          }
          data {
            accessToken
            user {
              id
              email
              firstName
              lastName
              roles
            }
          }
        }
      }
    `;
    
    const loginResponse = await axios.post(GRAPHQL_URL, {
      query: loginQuery,
      variables: {
        input: {
          email: 'admin@tdmu.edu.vn',
          password: '123456'
        }
      }
    });
    
    console.log('📝 Admin Login Response:', JSON.stringify(loginResponse.data, null, 2));
    
    if (loginResponse.data.data?.signIn?.data?.accessToken) {
      const token = loginResponse.data.data.signIn.data.accessToken;
      const user = loginResponse.data.data.signIn.data.user;
      
      console.log('✅ Admin Login successful!');
      console.log('👤 Admin User:', user);
      
      // Test tạo văn bản với admin
      const createDocumentQuery = `
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
              status
            }
          }
        }
      `;
      
      const createDocumentResponse = await axios.post(GRAPHQL_URL, {
        query: createDocumentQuery,
        variables: {
          createDocumentInput: {
            title: 'Test Document from ADMIN',
            content: 'This is a test document created by ADMIN user',
            documentType: 'INTERNAL',
            priority: 'MEDIUM',
            documentCategoryId: 1
          }
        }
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📄 Admin Create Document Response:', JSON.stringify(createDocumentResponse.data, null, 2));
      
    } else {
      console.log('❌ Admin Login failed:', loginResponse.data.errors || loginResponse.data.data?.signIn?.metadata);
    }
    
  } catch (error) {
    console.error('❌ Admin Error:', error.response?.data || error.message);
  }
}

// Chạy test
async function runTests() {
  await testAuth();
  await testAdminAuth();
}

runTests();
