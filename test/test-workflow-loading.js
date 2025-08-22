console.log('🔧 Testing Workflow Instance Loading...\n');

console.log('✅ Backend Changes Applied:');
console.log('   - Added debug logs to DocumentsService.findOne()');
console.log('   - Workflow instance loading with relations');
console.log('   - Error handling for workflow loading');
console.log('');

console.log('🎯 Test Steps:');
console.log('1. Start backend: cd apps/backend && npm run start:dev');
console.log('2. Start frontend: cd apps/frontend && npm start');
console.log('3. Open browser: http://localhost:4200');
console.log('4. Login: admin@tdmu.edu.vn / admin123');
console.log('5. Navigate to document details (ID: 23)');
console.log('6. Check backend console for debug logs');
console.log('7. Check frontend console for debug logs');
console.log('');

console.log('🔍 Expected Backend Logs:');
console.log('   === DocumentsService.findOne(23) ===');
console.log('   Document found: { id: 23, title: "...", workflowInstanceId: 10, workflowInstance: "NULL" }');
console.log('   Loading workflow instance 10...');
console.log('   Finding workflow instance: 10');
console.log('   Basic instance found: { id: 10, templateId: 1, ... }');
console.log('   Found workflow instance: { templateName: "...", ... }');
console.log('   Workflow instance loaded successfully: { id: 10, templateId: 1, template: "EXISTS", currentStep: "EXISTS" }');
console.log('   === DocumentsService.findOne END ===');
console.log('');

console.log('🔍 Expected Frontend Logs:');
console.log('   Loading document details for ID: 23');
console.log('   Document details loaded: [object]');
console.log('   Workflow instance: [object with template and steps]');
console.log('   🔧 createWorkflowProgressData called with: [object]');
console.log('   📊 Processing workflow data: Steps count: X, Logs count: Y');
console.log('   ✅ Created workflow progress steps: [array]');
console.log('   getWorkflowProgressSteps()?.length: X (should be > 0)');
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
console.log('1. Check backend logs for "Error loading workflow instance"');
console.log('2. Check if workflow instance 10 exists in database');
console.log('3. Check if template 1 exists and has steps');
console.log('4. Check database foreign key relationships');
console.log('5. Check if WorkflowInstancesService.findOne() throws error');
console.log('');

console.log('🎨 Expected UI Result:');
console.log('   - "Tiến độ quy trình" section should appear');
console.log('   - "Xem chi tiết" button should be visible');
console.log('   - Workflow progress visualization should show');
console.log('');

console.log('✨ Workflow Loading Test Completed!');
console.log('   The debug logs will show exactly where the issue is.');

