# Ví dụ Sử dụng Hệ thống Workflow

## Kịch bản: Phê duyệt Quyết định thành lập Khoa mới

### Nhân vật:
- **Nguyễn Văn A** (CLERK - Văn thư)
- **Trần Thị B** (DEPARTMENT_STAFF - Trưởng phòng Tổ chức)
- **Lê Văn C** (UNIVERSITY_LEADER - Phó Hiệu trưởng)
- **Phạm Thị D** (UNIVERSITY_LEADER - Hiệu trưởng)

### Quy trình:

#### Bước 1: Văn thư tạo workflow
```typescript
// Nguyễn Văn A (CLERK) tạo workflow cho quyết định mới
const createWorkflowInput = {
  templateId: 1, // "Quy trình phê duyệt văn bản thông thường"
  documentId: 456, // ID của quyết định thành lập khoa
  notes: "Quyết định thành lập Khoa Công nghệ Thông tin - cần phê duyệt gấp"
};

// Gọi API
const result = await createWorkflowInstance(createWorkflowInput);
// Kết quả: Workflow instance được tạo với status = "IN_PROGRESS"
// Current step: "Tạo văn bản" (START)
```

#### Bước 2: Văn thư hoàn thành bước tạo văn bản
```typescript
// Nguyễn Văn A thực hiện action COMPLETE
const actionInput1 = {
  instanceId: 1,
  stepId: 1, // ID của bước "Tạo văn bản"
  actionType: "COMPLETE",
  note: "Văn bản đã được soạn thảo hoàn chỉnh"
};

// Gọi API
const result1 = await executeWorkflowAction(actionInput1);
// Kết quả: Workflow chuyển sang bước "Phê duyệt trưởng phòng"
// Current step: "Phê duyệt trưởng phòng" (APPROVAL)
```

#### Bước 3: Trưởng phòng phê duyệt
```typescript
// Trần Thị B (DEPARTMENT_STAFF) nhận thông báo có workflow cần xử lý
// Kiểm tra danh sách workflow đang chờ
const pendingWorkflows = await getMyPendingWorkflows();
// Kết quả: Có 1 workflow cần xử lý

// Trần Thị B phê duyệt
const actionInput2 = {
  instanceId: 1,
  stepId: 2, // ID của bước "Phê duyệt trưởng phòng"
  actionType: "APPROVE",
  note: "Đồng ý với nội dung quyết định, đề xuất trình lên lãnh đạo"
};

// Gọi API
const result2 = await executeWorkflowAction(actionInput2);
// Kết quả: Workflow chuyển sang bước "Phê duyệt phó hiệu trưởng"
// Current step: "Phê duyệt phó hiệu trưởng" (APPROVAL)
```

#### Bước 4: Phó Hiệu trưởng phê duyệt
```typescript
// Lê Văn C (UNIVERSITY_LEADER) nhận thông báo
// Kiểm tra danh sách workflow đang chờ
const pendingWorkflows = await getMyPendingWorkflows();
// Kết quả: Có 1 workflow cần xử lý

// Lê Văn C phê duyệt
const actionInput3 = {
  instanceId: 1,
  stepId: 3, // ID của bước "Phê duyệt phó hiệu trưởng"
  actionType: "APPROVE",
  note: "Đồng ý với đề xuất, trình Hiệu trưởng phê duyệt cuối cùng"
};

// Gọi API
const result3 = await executeWorkflowAction(actionInput3);
// Kết quả: Workflow chuyển sang bước "Phê duyệt hiệu trưởng"
// Current step: "Phê duyệt hiệu trưởng" (END)
```

#### Bước 5: Hiệu trưởng phê duyệt cuối cùng
```typescript
// Phạm Thị D (UNIVERSITY_LEADER) nhận thông báo
// Kiểm tra danh sách workflow đang chờ
const pendingWorkflows = await getMyPendingWorkflows();
// Kết quả: Có 1 workflow cần xử lý

// Phạm Thị D phê duyệt cuối cùng
const actionInput4 = {
  instanceId: 1,
  stepId: 4, // ID của bước "Phê duyệt hiệu trưởng"
  actionType: "COMPLETE",
  note: "Phê duyệt quyết định thành lập Khoa Công nghệ Thông tin"
};

// Gọi API
const result4 = await executeWorkflowAction(actionInput4);
// Kết quả: Workflow hoàn thành
// Status: "COMPLETED"
// Current step: null
```

## Kịch bản: Từ chối văn bản

### Nhân vật:
- **Nguyễn Văn A** (CLERK - Văn thư)
- **Trần Thị B** (DEPARTMENT_STAFF - Trưởng phòng Tổ chức)

### Quy trình:

#### Bước 1-2: Tương tự như trên

#### Bước 3: Trưởng phòng từ chối
```typescript
// Trần Thị B từ chối văn bản
const actionInput = {
  instanceId: 1,
  stepId: 2, // ID của bước "Phê duyệt trưởng phòng"
  actionType: "REJECT",
  note: "Văn bản có một số nội dung chưa phù hợp, cần chỉnh sửa lại"
};

// Gọi API
const result = await executeWorkflowAction(actionInput);
// Kết quả: Workflow bị từ chối
// Status: "REJECTED"
// Current step: null
```

## Kịch bản: Chuyển tiếp văn bản

### Nhân vật:
- **Nguyễn Văn A** (CLERK - Văn thư)
- **Trần Thị B** (DEPARTMENT_STAFF - Trưởng phòng Tổ chức)
- **Lê Văn C** (UNIVERSITY_LEADER - Phó Hiệu trưởng)

### Quy trình:

#### Bước 1-3: Tương tự như trên

#### Bước 4: Phó Hiệu trưởng chuyển tiếp
```typescript
// Lê Văn C chuyển tiếp văn bản cho bộ phận khác xem xét
const actionInput = {
  instanceId: 1,
  stepId: 3, // ID của bước "Phê duyệt phó hiệu trưởng"
  actionType: "TRANSFER",
  note: "Chuyển cho Phòng Tài chính xem xét về ngân sách trước khi trình Hiệu trưởng",
  metadata: "TRANSFER_TO_FINANCE_DEPARTMENT"
};

// Gọi API
const result = await executeWorkflowAction(actionInput);
// Kết quả: Workflow chuyển sang bước mới (có thể là bước TRANSFER)
// Current step: "Xem xét tài chính" (TRANSFER)
```

## API Calls trong Frontend

### 1. Dashboard Component
```typescript
// Load workflow dashboard
ngOnInit() {
  // Load pending workflows
  this.workflowInstancesService.getMyPendingWorkflows().subscribe({
    next: (response: any) => {
      this.pendingWorkflows = response.data?.myPendingWorkflows || [];
      this.pendingCount = this.pendingWorkflows.length;
    }
  });

  // Load my workflows
  this.workflowInstancesService.getMyWorkflowInstances().subscribe({
    next: (response: any) => {
      this.myWorkflows = response.data?.myWorkflowInstances || [];
      this.myWorkflowsCount = this.myWorkflows.length;
    }
  });
}
```

### 2. Action Component
```typescript
// Load available actions
loadAvailableActions() {
  this.workflowInstancesService.getAvailableActions(this.workflowInstance.id).subscribe({
    next: (response: any) => {
      this.availableActions = response.data?.availableActions || [];
    }
  });
}

// Execute action
onSubmit() {
  const actionInput: WorkflowActionInput = {
    instanceId: this.workflowInstance.id,
    stepId: this.workflowInstance.currentStep.id,
    actionType: this.actionForm.value.actionType,
    note: this.actionForm.value.note
  };

  this.workflowInstancesService.executeWorkflowAction(actionInput).subscribe({
    next: (response: any) => {
      const updatedInstance = response.data?.executeWorkflowAction;
      this.actionCompleted.emit(updatedInstance);
    }
  });
}
```

## GraphQL Queries

### 1. Lấy workflow instances đang chờ xử lý
```graphql
query {
  myPendingWorkflows {
    id
    template {
      name
      description
    }
    currentStep {
      name
      description
      assignedRole
    }
    status
    createdByUser {
      fullName
    }
    createdAt
  }
}
```

### 2. Lấy chi tiết workflow instance
```graphql
query {
  workflowInstance(id: 1) {
    id
    template {
      name
      description
    }
    currentStep {
      id
      name
      description
      type
      assignedRole
    }
    status
    createdByUser {
      fullName
      email
    }
    logs {
      actionType
      actionByUser {
        fullName
      }
      actionAt
      note
    }
  }
}
```

### 3. Thực hiện action
```graphql
mutation {
  executeWorkflowAction(workflowActionInput: {
    instanceId: 1
    stepId: 2
    actionType: APPROVE
    note: "Văn bản đã được phê duyệt"
  }) {
    id
    status
    currentStep {
      name
      assignedRole
    }
    logs {
      actionType
      actionByUser {
        fullName
      }
      actionAt
      note
    }
  }
}
```

## Lưu ý quan trọng

1. **Quyền truy cập**: Mỗi user chỉ thấy và xử lý được workflow phù hợp với role của mình
2. **Thứ tự xử lý**: Workflow phải được xử lý theo đúng thứ tự các bước
3. **Ghi chú**: Nên ghi chú rõ ràng khi thực hiện action để dễ dàng theo dõi
4. **Thông báo**: Hệ thống sẽ tự động thông báo cho user có quyền xử lý bước tiếp theo
5. **Lịch sử**: Tất cả actions đều được lưu lại trong logs để audit trail
