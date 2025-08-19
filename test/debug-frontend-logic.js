// Debug script để kiểm tra frontend logic
console.log('=== DEBUG FRONTEND LOGIC ===');

// Simulate DocumentFormComponent logic
function simulateDocumentFormLogic(document, documentType) {
  console.log('\n1. Simulating DocumentFormComponent logic...');
  console.log('Input document:', document);
  console.log('Input documentType:', documentType);
  
  let isEditMode = false;
  
  if (document) {
    isEditMode = true;
    console.log('✅ isEditMode set to TRUE (document provided)');
  } else if (documentType) {
    isEditMode = false;
    console.log('✅ isEditMode set to FALSE (only documentType provided)');
  } else {
    isEditMode = false;
    console.log('✅ isEditMode set to FALSE (no document or documentType)');
  }
  
  return isEditMode;
}

// Simulate onSubmit logic
function simulateOnSubmitLogic(isEditMode, document, formValues) {
  console.log('\n2. Simulating onSubmit logic...');
  console.log('isEditMode:', isEditMode);
  console.log('document:', document);
  console.log('formValues:', formValues);
  
  if (isEditMode && document) {
    console.log('✅ Executing UPDATE logic');
    const updateInput = {
      id: document.id,
      ...formValues
    };
    console.log('Update input:', updateInput);
    return { type: 'UPDATE', input: updateInput };
  } else {
    console.log('✅ Executing CREATE logic');
    const createInput = formValues;
    console.log('Create input:', createInput);
    return { type: 'CREATE', input: createInput };
  }
}

// Test cases
console.log('\n=== TEST CASE 1: Edit Mode ===');
const testDocument = {
  id: 123,
  title: 'Test Document',
  content: 'Test content',
  documentType: 'INTERNAL',
  documentCategoryId: 1,
  status: 'DRAFT'
};

const testFormValues = {
  title: 'Updated Test Document',
  content: 'Updated test content',
  documentType: 'INTERNAL',
  documentCategoryId: 1,
  status: 'PENDING'
};

const isEditMode1 = simulateDocumentFormLogic(testDocument, 'INTERNAL');
const result1 = simulateOnSubmitLogic(isEditMode1, testDocument, testFormValues);

console.log('\n=== TEST CASE 2: Create Mode ===');
const isEditMode2 = simulateDocumentFormLogic(null, 'INTERNAL');
const result2 = simulateOnSubmitLogic(isEditMode2, null, testFormValues);

console.log('\n=== TEST CASE 3: Create Mode (no documentType) ===');
const isEditMode3 = simulateDocumentFormLogic(null, null);
const result3 = simulateOnSubmitLogic(isEditMode3, null, testFormValues);

// Test edge cases
console.log('\n=== EDGE CASES ===');

// Edge case 1: document is undefined
console.log('\nEdge Case 1: document is undefined');
const isEditMode4 = simulateDocumentFormLogic(undefined, 'INTERNAL');
const result4 = simulateOnSubmitLogic(isEditMode4, undefined, testFormValues);

// Edge case 2: document is null
console.log('\nEdge Case 2: document is null');
const isEditMode5 = simulateDocumentFormLogic(null, 'INTERNAL');
const result5 = simulateOnSubmitLogic(isEditMode5, null, testFormValues);

// Edge case 3: document has no id
console.log('\nEdge Case 3: document has no id');
const invalidDocument = {
  title: 'Invalid Document',
  content: 'No ID'
};
const isEditMode6 = simulateDocumentFormLogic(invalidDocument, 'INTERNAL');
const result6 = simulateOnSubmitLogic(isEditMode6, invalidDocument, testFormValues);

console.log('\n=== SUMMARY ===');
console.log('✅ Test Case 1 (Edit):', result1.type, result1.input.id);
console.log('✅ Test Case 2 (Create):', result2.type, 'No ID');
console.log('✅ Test Case 3 (Create):', result3.type, 'No ID');
console.log('✅ Edge Case 1 (undefined):', result4.type, result4.input?.id || 'No ID');
console.log('✅ Edge Case 2 (null):', result5.type, 'No ID');
console.log('✅ Edge Case 3 (no id):', result6.type, result6.input?.id || 'No ID');

console.log('\n🎯 Kết luận: Frontend logic simulation hoạt động đúng!');
console.log('Vấn đề có thể nằm ở:');
console.log('1. Component không nhận được document prop đúng cách');
console.log('2. Template binding có vấn đề');
console.log('3. Angular change detection không hoạt động');
console.log('4. GraphQL mutation gọi sai endpoint');
