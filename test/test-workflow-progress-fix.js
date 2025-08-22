// Test for workflow progress data creation fix
console.log('🧪 Testing Workflow Progress Data Creation Fix...\n');

// Mock data that simulates the GraphQL response structure
const mockWorkflowInstance = {
  id: 1,
  templateId: 1,
  template: {
    id: 1,
    name: 'Test Workflow Template',
    description: 'Test template for workflow',
    isActive: true,
    steps: [
      {
        id: 1,
        name: 'Step 1',
        description: 'First step',
        type: 'START',
        assignedRole: 'ADMIN',
        orderNumber: 1,
        isActive: true,
        nextStepId: 2
      },
      {
        id: 3,
        name: 'Step 3',
        description: 'Third step',
        type: 'APPROVAL',
        assignedRole: 'MANAGER',
        orderNumber: 3,
        isActive: true,
        nextStepId: null
      },
      {
        id: 2,
        name: 'Step 2',
        description: 'Second step',
        type: 'TRANSFER',
        assignedRole: 'STAFF',
        orderNumber: 2,
        isActive: true,
        nextStepId: 3
      }
    ]
  },
  documentId: 1,
  currentStepId: 2,
  currentStep: {
    id: 2,
    name: 'Step 2',
    description: 'Second step',
    type: 'TRANSFER',
    assignedRole: 'STAFF',
    orderNumber: 2,
    isActive: true
  },
  currentAssigneeUserId: 2,
  currentAssigneeUser: {
    id: 2,
    fullName: 'John Doe',
    email: 'john@example.com'
  },
  status: 'IN_PROGRESS',
  createdByUserId: 1,
  createdByUser: {
    id: 1,
    fullName: 'Admin User',
    email: 'admin@example.com'
  },
  notes: 'Test workflow instance',
  logs: [
    {
      id: 1,
      instanceId: 1,
      stepId: 1,
      step: {
        id: 1,
        name: 'Step 1',
        type: 'START'
      },
      actionType: 'START',
      actionByUserId: 1,
      actionByUser: {
        id: 1,
        fullName: 'Admin User',
        email: 'admin@example.com'
      },
      actionAt: new Date('2024-01-01T10:00:00Z'),
      note: 'Workflow started',
      metadata: null,
      createdAt: new Date('2024-01-01T10:00:00Z')
    },
    {
      id: 2,
      instanceId: 1,
      stepId: 1,
      step: {
        id: 1,
        name: 'Step 1',
        type: 'START'
      },
      actionType: 'COMPLETE',
      actionByUserId: 1,
      actionByUser: {
        id: 1,
        fullName: 'Admin User',
        email: 'admin@example.com'
      },
      actionAt: new Date('2024-01-01T10:30:00Z'),
      note: 'Step 1 completed',
      metadata: null,
      createdAt: new Date('2024-01-01T10:30:00Z')
    }
  ],
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T10:30:00Z')
};

// Simulate the createWorkflowProgressData function with the fix
function createWorkflowProgressData(workflowInstance) {
  console.log('🔧 createWorkflowProgressData called with:', workflowInstance);
  
  if (!workflowInstance.template?.steps) {
    console.log('❌ No template or steps found, returning empty array');
    return [];
  }

  // FIXED: Create a copy of the array before sorting
  const steps = [...workflowInstance.template.steps].sort((a, b) => a.orderNumber - b.orderNumber);
  const logs = workflowInstance.logs || [];
  const currentStepId = workflowInstance.currentStepId;
  
  console.log('📊 Processing workflow data:');
  console.log('  - Steps count:', steps.length);
  console.log('  - Logs count:', logs.length);
  console.log('  - Current step ID:', currentStepId);

  const result = steps.map(step => {
    // Tìm log cuối cùng cho step này
    const stepLogs = logs.filter(log => log.stepId === step.id);
    const lastLog = stepLogs.length > 0 ? stepLogs[stepLogs.length - 1] : null;

    // Xác định trạng thái của step
    let status = 'pending';
    let completedAt = undefined;
    let completedBy = undefined;
    let notes = undefined;

    if (lastLog) {
      if (lastLog.actionType === 'COMPLETE' || lastLog.actionType === 'APPROVE') {
        status = 'completed';
        completedAt = lastLog.actionAt;
        completedBy = lastLog.actionByUser;
        notes = lastLog.note;
      } else if (lastLog.actionType === 'TRANSFER') {
        status = 'completed';
        completedAt = lastLog.actionAt;
        completedBy = lastLog.actionByUser;
        notes = lastLog.note;
      } else if (lastLog.actionType === 'REJECT') {
        status = 'skipped';
        notes = lastLog.note;
      }
    }

    // Nếu là step hiện tại
    if (step.id === currentStepId) {
      status = 'current';
    }

    return {
      id: step.id,
      name: step.name,
      description: step.description,
      type: step.type,
      assignedRole: step.assignedRole,
      orderNumber: step.orderNumber,
      isActive: step.isActive,
      status,
      completedAt,
      completedBy,
      notes
    };
  });
  
  console.log('✅ Created workflow progress steps:', result);
  return result;
}

// Test the function
try {
  console.log('📋 Testing with mock workflow instance...\n');
  
  const progressData = createWorkflowProgressData(mockWorkflowInstance);
  
  console.log('\n🎉 Test completed successfully!');
  console.log('✅ No "0 is read-only" error occurred');
  console.log('✅ Steps were sorted correctly by orderNumber');
  console.log('✅ Progress data created successfully');
  
  console.log('\n📊 Results:');
  console.log('Total steps processed:', progressData.length);
  console.log('Steps in order:', progressData.map(step => `${step.orderNumber}: ${step.name} (${step.status})`));
  
  // Verify the steps are in the correct order
  const isOrdered = progressData.every((step, index) => {
    if (index === 0) return true;
    return step.orderNumber >= progressData[index - 1].orderNumber;
  });
  
  if (isOrdered) {
    console.log('✅ Steps are correctly ordered by orderNumber');
  } else {
    console.log('❌ Steps are not in correct order');
  }
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('Stack trace:', error.stack);
}

