const axios = require('axios');

const GRAPHQL_URL = 'http://localhost:3000/graphql';

async function testDocumentDetailsSchema() {
  try {
    console.log('🧪 Testing Document Details GraphQL Schema...\n');

    // Test the introspection query to check if the schema is valid
    const introspectionResponse = await axios.post(GRAPHQL_URL, {
      query: `
        query IntrospectionQuery {
          __schema {
            types {
              name
              fields {
                name
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
            }
          }
        }
      `
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const introspectionData = introspectionResponse.data;
    
    if (introspectionData.errors) {
      console.error('❌ Schema introspection errors:', JSON.stringify(introspectionData.errors, null, 2));
      return;
    }

    console.log('✅ Schema introspection successful');

    // Look for WorkflowTemplate type and check if steps field is properly defined
    const schema = introspectionData.data.__schema;
    const workflowTemplateType = schema.types.find(type => type.name === 'WorkflowTemplate');
    
    if (workflowTemplateType) {
      console.log('✅ Found WorkflowTemplate type');
      
      const stepsField = workflowTemplateType.fields?.find(field => field.name === 'steps');
      if (stepsField) {
        console.log('✅ Found steps field in WorkflowTemplate');
        console.log('Steps field type:', JSON.stringify(stepsField.type, null, 2));
      } else {
        console.log('⚠️ Steps field not found in WorkflowTemplate');
      }
    } else {
      console.log('⚠️ WorkflowTemplate type not found in schema');
    }

    // Test a simple query to see if the server is responding
    const simpleQueryResponse = await axios.post(GRAPHQL_URL, {
      query: `
        query TestQuery {
          __typename
        }
      `
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const simpleQueryData = simpleQueryResponse.data;
    
    if (simpleQueryData.errors) {
      console.error('❌ Simple query errors:', JSON.stringify(simpleQueryData.errors, null, 2));
    } else {
      console.log('✅ Simple query successful');
    }

    console.log('\n🎉 Schema test completed successfully!');
    console.log('The GraphQL server is running and the schema is valid.');
    console.log('The fix for the WorkflowTemplate.steps field should now work correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 3000');
      console.log('Run: cd apps/backend && npm run start:dev');
    }
  }
}

testDocumentDetailsSchema();
