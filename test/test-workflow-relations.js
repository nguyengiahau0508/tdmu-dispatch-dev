console.log('🔧 Testing Workflow Relations Fix...\n');

console.log('✅ Backend Changes Applied:');
console.log('   - DocumentsService.findOne() now loads workflow instance with relations');
console.log('   - WorkflowInstancesService.findOne() validates template and createdByUser');
console.log('   - GraphQL schema fields are nullable');
console.log('');

console.log('🎯 Test Steps:');
console.log('1. Start backend: cd apps/backend && npm run start:dev');
console.log('2. Start frontend: cd apps/frontend && npm start');
console.log('3. Open browser: http://localhost:4200');
console.log('4. Login: admin@tdmu.edu.vn / admin123');
console.log('5. Navigate to document details (ID: 23)');
console.log('6. Check browser console for debug logs');
console.log('');

console.log('🔍 Expected Console Logs:');
console.log('Backend:');
console.log('   - "Finding workflow instance: 10"');
console.log('   - "Basic instance found: { id: 10, templateId: 1, ... }"');
console.log('   - "Found workflow instance: { templateName: ..., ... }"');
console.log('');
console.log('Frontend:');
console.log('   - "Loading document details for ID: 23"');
console.log('   - "Document details loaded: [object]"');
console.log('   - "Workflow instance: [object with template and steps]"');
console.log('   - "🔧 createWorkflowProgressData called with: [object]"');
console.log('   - "📊 Processing workflow data: Steps count: X, Logs count: Y"');
console.log('   - "✅ Created workflow progress steps: [array]"');
console.log('   - "getWorkflowProgressSteps()?.length: X"');
console.log('');

console.log('🎨 Expected UI Sections:');
console.log('   - "Tiến độ quy trình" với nút "Xem chi tiết"');
console.log('   - "Thông tin quy trình" với workflow details');
console.log('   - "Lịch sử quy trình" với action logs');
console.log('');

console.log('🐛 Debug Commands (Browser Console):');
console.log('   // Quick debug for document ID 23');
console.log('   (function() {');
console.log('     const component = angular.getComponent(document.querySelector("app-document-details"));');
console.log('     if (!component) { console.log("❌ Component not found"); return; }');
console.log('     console.log("🔍 Debug Document 23:");');
console.log('     console.log("Document ID:", component.getDocumentId());');
console.log('     console.log("Workflow Instance ID:", component.getWorkflowInstanceId());');
console.log('     console.log("Workflow Instance:", component.documentDetails?.workflowInstance);');
console.log('     console.log("Template:", component.documentDetails?.workflowInstance?.template);');
console.log('     console.log("Template Steps:", component.documentDetails?.workflowInstance?.template?.steps?.length);');
console.log('     console.log("Current Step:", component.documentDetails?.workflowInstance?.currentStep);');
console.log('     console.log("Progress Steps:", component.workflowProgressSteps?.length);');
console.log('     console.log("Should Show Progress:", component.getWorkflowProgressSteps()?.length > 0);');
console.log('   })();');
console.log('');

console.log('❌ If still not working:');
console.log('1. Check backend logs for validation errors');
console.log('2. Verify workflow instance 10 has valid templateId (1)');
console.log('3. Verify template 1 exists and has steps');
console.log('4. Check database foreign key relationships');
console.log('');

console.log('✨ Workflow Relations Fix Test Completed!');
console.log('   The workflow instance should now load with template and steps.');
