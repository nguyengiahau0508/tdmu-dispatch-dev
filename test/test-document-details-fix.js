const axios = require('axios');

const GRAPHQL_URL = 'http://localhost:3000/graphql';

async function testDocumentDetailsFix() {
  try {
    console.log('🧪 Testing Document Details GraphQL Query Fix...\n');

    // First, get an access token (you'll need to replace with actual credentials)
    const loginResponse = await axios.post(GRAPHQL_URL, {
      query: `
        mutation SignInWithOtp($input: SignInOtpInput!) {
          signInWithOtp(input: $input) {
            metadata {
              statusCode
              message
            }
            data {
              accessToken
            }
          }
        }
      `,
      variables: {
        input: {
          email: 'admin@tdmu.edu.vn',
          otp: '123456'
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const loginData = loginResponse.data;
    console.log('🔐 Login response:', JSON.stringify(loginData, null, 2));

    if (!loginData.data?.signInWithOtp?.data?.accessToken) {
      console.error('❌ Failed to get access token');
      return;
    }

    const accessToken = loginData.data.signInWithOtp.data.accessToken;
    console.log('✅ Got access token\n');

    // Get a list of documents first
    const documentsResponse = await axios.post(GRAPHQL_URL, {
      query: `
        query GetDocumentsPaginated($input: GetDocumentsPaginatedInput!) {
          documentsPaginated(input: $input) {
            data {
              id
              title
              workflowInstanceId
            }
            meta {
              itemCount
            }
          }
        }
      `,
      variables: {
        input: {
          page: 1,
          take: 5
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const documentsData = documentsResponse.data;
    console.log('📄 Documents response:', JSON.stringify(documentsData, null, 2));

    if (!documentsData.data?.documentsPaginated?.data?.length) {
      console.error('❌ No documents found');
      return;
    }

    // Get the first document with a workflow instance
    const documentWithWorkflow = documentsData.data.documentsPaginated.data.find(
      doc => doc.workflowInstanceId
    );

    if (!documentWithWorkflow) {
      console.log('⚠️ No documents with workflow instances found, testing with first document...');
    }

    const testDocumentId = documentWithWorkflow?.id || documentsData.data.documentsPaginated.data[0].id;
    console.log(`\n🔍 Testing document details for ID: ${testDocumentId}\n`);

    // Test the document details query
    const documentDetailsResponse = await axios.post(GRAPHQL_URL, {
      query: `
        query GetDocumentDetails($id: Int!) {
          document(id: $id) {
            metadata {
              statusCode
              message
            }
            data {
              id
              title
              workflowInstanceId
              workflowInstance {
                id
                templateId
                template {
                  id
                  name
                  description
                  isActive
                  steps {
                    id
                    name
                    description
                    type
                    assignedRole
                    orderNumber
                    isActive
                    nextStepId
                  }
                }
                currentStepId
                currentStep {
                  id
                  name
                  description
                  type
                  assignedRole
                  orderNumber
                  isActive
                }
                status
                logs {
                  id
                  stepId
                  step {
                    id
                    name
                    type
                  }
                  actionType
                  actionByUser {
                    id
                    fullName
                    email
                  }
                  actionAt
                  note
                }
              }
            }
          }
        }
      `,
      variables: {
        id: testDocumentId
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    const documentDetailsData = documentDetailsResponse.data;
    console.log('📋 Document Details Response:');
    console.log('Status Code:', documentDetailsData.data?.document?.metadata?.statusCode);
    console.log('Message:', documentDetailsData.data?.document?.metadata?.message);
    
    if (documentDetailsData.errors) {
      console.error('❌ GraphQL Errors:', JSON.stringify(documentDetailsData.errors, null, 2));
    } else {
      console.log('✅ No GraphQL errors found!');
      
      const document = documentDetailsData.data?.document?.data;
      if (document?.workflowInstance?.template?.steps) {
        console.log(`✅ Template steps loaded successfully: ${document.workflowInstance.template.steps.length} steps`);
        console.log('Steps:', document.workflowInstance.template.steps.map(step => ({
          id: step.id,
          name: step.name,
          type: step.type,
          orderNumber: step.orderNumber
        })));
      } else {
        console.log('ℹ️ No workflow template steps found (this is normal if document has no workflow)');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testDocumentDetailsFix();
