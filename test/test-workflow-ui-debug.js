const axios = require('axios');

const GRAPHQL_URL = 'http://localhost:3000/graphql';

async function testWorkflowUI() {
  try {
    console.log('🔍 Testing Workflow UI Debug...\n');

    // 1. First, sign in to get access token
    const signInResponse = await axios.post(GRAPHQL_URL, {
      query: `
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) {
            accessToken
            user {
              id
              email
              fullName
            }
          }
        }
      `,
      variables: {
        input: {
          email: 'admin@tdmu.edu.vn',
          password: 'admin123'
        }
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const signInData = signInResponse.data;
    console.log('✅ Sign in response:', JSON.stringify(signInData, null, 2));

    if (signInData.errors) {
      console.error('❌ Sign in failed:', signInData.errors);
      return;
    }

    const accessToken = signInData.data.signIn.accessToken;
    console.log('🔑 Access token obtained');

    // 2. Get a document with workflow
    const documentsResponse = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        query: `
          query GetDocuments($paginationInput: PaginationInput!) {
            documents(paginationInput: $paginationInput) {
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
                  }
                  status
                  currentStepId
                  currentStep {
                    id
                    name
                    type
                  }
                }
              }
              meta {
                totalCount
              }
            }
          }
        `,
        variables: {
          paginationInput: {
            page: 1,
            limit: 10
          }
        }
      })
    });

    const documentsData = await documentsResponse.json();
    console.log('\n📄 Documents response:', JSON.stringify(documentsData, null, 2));

    if (documentsData.errors) {
      console.error('❌ Documents query failed:', documentsData.errors);
      return;
    }

    // 3. Find a document with workflow
    const documents = documentsData.data.documents.data;
    const documentWithWorkflow = documents.find(doc => doc.workflowInstanceId);

    if (!documentWithWorkflow) {
      console.log('⚠️ No document with workflow found. Creating one...');
      
      // Get workflow templates first
      const templatesResponse = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          query: `
            query GetWorkflowTemplates {
              workflowTemplates {
                data {
                  id
                  name
                  description
                  isActive
                }
              }
            }
          `
        })
      });

      const templatesData = await templatesResponse.json();
      console.log('\n🔄 Templates response:', JSON.stringify(templatesData, null, 2));

      if (templatesData.data?.workflowTemplates?.data?.length > 0) {
        const activeTemplate = templatesData.data.workflowTemplates.data.find(t => t.isActive);
        if (activeTemplate) {
          console.log(`\n📋 Found active template: ${activeTemplate.name} (ID: ${activeTemplate.id})`);
        }
      }
      return;
    }

    console.log(`\n✅ Found document with workflow: ${documentWithWorkflow.title}`);
    console.log(`📋 Workflow Instance ID: ${documentWithWorkflow.workflowInstanceId}`);
    console.log(`🔄 Template: ${documentWithWorkflow.workflowInstance?.template?.name}`);
    console.log(`📊 Status: ${documentWithWorkflow.workflowInstance?.status}`);
    console.log(`📍 Current Step: ${documentWithWorkflow.workflowInstance?.currentStep?.name}`);

    // 4. Test detailed document query
    const detailedDocResponse = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
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
                    type
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
          id: documentWithWorkflow.id
        }
      })
    });

    const detailedDocData = await detailedDocResponse.json();
    console.log('\n📄 Detailed document response:', JSON.stringify(detailedDocData, null, 2));

    if (detailedDocData.errors) {
      console.error('❌ Detailed document query failed:', detailedDocData.errors);
      return;
    }

    const detailedDoc = detailedDocData.data.document.data;
    console.log('\n🔍 UI Debug Information:');
    console.log(`Document ID: ${detailedDoc.id}`);
    console.log(`Document Title: ${detailedDoc.title}`);
    console.log(`Workflow Instance ID: ${detailedDoc.workflowInstanceId}`);
    
    if (detailedDoc.workflowInstance) {
      console.log(`\n📋 Workflow Instance:`);
      console.log(`  - ID: ${detailedDoc.workflowInstance.id}`);
      console.log(`  - Template: ${detailedDoc.workflowInstance.template?.name || 'NULL'}`);
      console.log(`  - Status: ${detailedDoc.workflowInstance.status}`);
      console.log(`  - Steps count: ${detailedDoc.workflowInstance.template?.steps?.length || 0}`);
      console.log(`  - Logs count: ${detailedDoc.workflowInstance.logs?.length || 0}`);
      
      if (detailedDoc.workflowInstance.template?.steps) {
        console.log(`\n📊 Steps:`);
        detailedDoc.workflowInstance.template.steps.forEach((step, index) => {
          console.log(`  ${index + 1}. ${step.name} (${step.type}) - Order: ${step.orderNumber}, Active: ${step.isActive}`);
        });
      }
      
      if (detailedDoc.workflowInstance.logs) {
        console.log(`\n📚 Logs:`);
        detailedDoc.workflowInstance.logs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log.actionType} on ${log.step?.name} by ${log.actionByUser?.fullName}`);
        });
      }
    } else {
      console.log('❌ No workflow instance data in detailed response');
    }

    console.log('\n✅ Workflow UI Debug Test Completed!');
    console.log('\n💡 Instructions for frontend testing:');
    console.log('1. Open browser console');
    console.log(`2. Navigate to document details for Document ID: ${documentWithWorkflow.id}`);
    console.log('3. Check console logs for data loading');
    console.log('4. Look for workflow progress sections in UI');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testWorkflowUI();
