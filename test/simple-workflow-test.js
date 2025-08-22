console.log('🔍 Testing Workflow UI...\n');

// Bước kiểm tra workflow UI
console.log('📋 Checklist để kiểm tra Workflow UI:');
console.log('');

console.log('1. ✅ Backend Status:');
console.log('   - Backend đã chạy trên http://localhost:3000');
console.log('   - GraphQL schema đã được cập nhật');
console.log('   - WorkflowInstance.template field đã nullable');
console.log('');

console.log('2. ✅ Frontend Status:');
console.log('   - Frontend build thành công');
console.log('   - Document details component có debug logs');
console.log('   - Workflow progress components đã được tạo');
console.log('');

console.log('3. 🔍 Cách kiểm tra UI:');
console.log('   a) Mở browser và vào http://localhost:4200');
console.log('   b) Login với admin@tdmu.edu.vn / admin123');
console.log('   c) Vào "Tất cả văn bản" hoặc "Xử lý văn bản"');
console.log('   d) Click vào một văn bản có workflow');
console.log('   e) Mở Developer Tools (F12) → Console');
console.log('   f) Kiểm tra các log debug:');
console.log('      - "Loading document details for ID: ..."');
console.log('      - "Document details loaded: ..."');
console.log('      - "Workflow instance: ..."');
console.log('      - "getWorkflowInstanceId(): ..."');
console.log('      - "getWorkflowProgressSteps(): ..."');
console.log('');

console.log('4. 🎯 Các section cần xuất hiện:');
console.log('   - "Tiến độ quy trình" với nút "Xem chi tiết"');
console.log('   - "Thông tin quy trình" với ID, tên template');
console.log('   - "Lịch sử quy trình" với logs');
console.log('');

console.log('5. ❓ Nếu không thấy workflow sections:');
console.log('   a) Kiểm tra console có error không');
console.log('   b) Kiểm tra document có workflowInstanceId không');
console.log('   c) Kiểm tra GraphQL response có workflow data không');
console.log('   d) Kiểm tra documentDetails được load đúng không');
console.log('');

console.log('6. 🐛 Debug Commands:');
console.log('   - Console: documentDetailsComponent.documentDetails');
console.log('   - Console: documentDetailsComponent.workflowProgressSteps');
console.log('   - Console: documentDetailsComponent.getWorkflowInstanceId()');
console.log('   - Console: documentDetailsComponent.getWorkflowProgressSteps()');
console.log('');

console.log('🚀 Frontend start command:');
console.log('   cd apps/frontend && npm start');
console.log('');

console.log('📝 Tạo văn bản mới với workflow:');
console.log('   1. Vào "Tạo văn bản"');
console.log('   2. Điền thông tin văn bản');
console.log('   3. Chọn quy trình workflow');
console.log('   4. Submit và kiểm tra văn bản vừa tạo');

console.log('\n✨ Test completed! Follow the steps above to check UI.');
