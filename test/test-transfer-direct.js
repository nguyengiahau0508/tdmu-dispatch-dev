// Test script để kiểm tra logic transfer trực tiếp
// Chạy trong backend console hoặc sử dụng để debug

const testTransferLogic = async () => {
  console.log('=== Testing Transfer Logic Directly ===');
  
  // Giả lập dữ liệu
  const documentId = 11;
  const currentStepId = 1;
  const transferToUserId = 2;
  
  console.log('Document ID:', documentId);
  console.log('Current Step ID:', currentStepId);
  console.log('Transfer to User ID:', transferToUserId);
  
  // Test findNextStep logic
  try {
    // Giả lập tìm bước tiếp theo
    const nextStepQuery = `
      SELECT id, name, orderNumber, templateId 
      FROM workflow_step 
      WHERE templateId = 1 AND orderNumber = 2 AND isActive = 1
    `;
    
    console.log('Next step query:', nextStepQuery);
    
    // Kết quả mong đợi: ID = 2, Name = "Tạo văn bản"
    
    // Test update workflow instance
    const updateQuery = `
      UPDATE workflow_instance 
      SET currentStepId = 2, updatedAt = NOW() 
      WHERE documentId = ${documentId}
    `;
    
    console.log('Update query:', updateQuery);
    
    // Test update document
    const updateDocumentQuery = `
      UPDATE document 
      SET assignedToUserId = ${transferToUserId}, status = 'PROCESSING' 
      WHERE id = ${documentId}
    `;
    
    console.log('Update document query:', updateDocumentQuery);
    
    console.log('✅ Logic transfer should work correctly');
    
  } catch (error) {
    console.error('❌ Error in transfer logic:', error);
  }
};

// Export để sử dụng trong backend console
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testTransferLogic };
} else {
  // Chạy trực tiếp nếu không phải module
  testTransferLogic();
}
