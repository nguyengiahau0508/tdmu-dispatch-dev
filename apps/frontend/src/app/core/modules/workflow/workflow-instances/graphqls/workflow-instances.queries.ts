import { gql } from 'apollo-angular';

export const WORKFLOW_INSTANCE_QUERY_FIND_ALL = gql`
  query FindAllWorkflowInstances {
    workflowInstances {
      id
      templateId
      documentId
      currentStepId
      status
      createdByUserId
      notes
      createdAt
      updatedAt
      template {
        id
        name
        description
        isActive
      }
      currentStep {
        id
        name
        type
        assignedRole
        orderNumber
      }
      createdByUser {
        id
        firstName
        lastName
        fullName
        email
      }
      logs {
        id
        actionType
        actionAt
        note
        metadata
        actionByUser {
          id
          firstName
          lastName
          fullName
        }
        step {
          id
          name
          type
        }
      }
    }
  }
`;

export const WORKFLOW_INSTANCE_QUERY_FIND_ONE = gql`
  query FindOneWorkflowInstance($id: Int!) {
    workflowInstance(id: $id) {
      id
      templateId
      documentId
      currentStepId
      status
      createdByUserId
      notes
      createdAt
      updatedAt
      template {
        id
        name
        description
        isActive
        steps {
          id
          name
          type
          assignedRole
          orderNumber
        }
      }
      currentStep {
        id
        name
        type
        assignedRole
        orderNumber
      }
      createdByUser {
        id
        firstName
        lastName
        fullName
        email
      }
      logs {
        id
        actionType
        actionAt
        note
        metadata
        actionByUser {
          id
          firstName
          lastName
          fullName
        }
        step {
          id
          name
          type
        }
      }
    }
  }
`;

export const WORKFLOW_INSTANCE_QUERY_MY_INSTANCES = gql`
  query FindMyWorkflowInstances {
    myWorkflowInstances {
      id
      templateId
      documentId
      currentStepId
      status
      createdByUserId
      notes
      createdAt
      updatedAt
      template {
        id
        name
        description
        isActive
      }
      currentStep {
        id
        name
        type
        assignedRole
        orderNumber
      }
      createdByUser {
        id
        firstName
        lastName
        fullName
        email
      }
      logs {
        id
        actionType
        actionAt
        note
        metadata
        actionByUser {
          id
          firstName
          lastName
          fullName
        }
        step {
          id
          name
          type
        }
      }
    }
  }
`;

export const WORKFLOW_INSTANCE_QUERY_PENDING_WORKFLOWS = gql`
  query FindPendingWorkflows {
    pendingWorkflows {
      id
      templateId
      documentId
      currentStepId
      status
      createdByUserId
      notes
      createdAt
      updatedAt
      template {
        id
        name
        description
        isActive
      }
      currentStep {
        id
        name
        type
        assignedRole
        orderNumber
      }
      createdByUser {
        id
        firstName
        lastName
        fullName
        email
      }
      logs {
        id
        actionType
        actionAt
        note
        metadata
        actionByUser {
          id
          firstName
          lastName
          fullName
        }
        step {
          id
          name
          type
        }
      }
    }
  }
`;

export const WORKFLOW_INSTANCE_QUERY_HISTORY = gql`
  query GetWorkflowHistory($instanceId: Int!) {
    workflowHistory(instanceId: $instanceId) {
      id
      templateId
      documentId
      currentStepId
      status
      createdByUserId
      notes
      createdAt
      updatedAt
      template {
        id
        name
        description
        isActive
        steps {
          id
          name
          type
          assignedRole
          orderNumber
        }
      }
      currentStep {
        id
        name
        type
        assignedRole
        orderNumber
      }
      createdByUser {
        id
        firstName
        lastName
        fullName
        email
      }
      logs {
        id
        actionType
        actionAt
        note
        metadata
        actionByUser {
          id
          firstName
          lastName
          fullName
        }
        step {
          id
          name
          type
        }
      }
    }
  }
`;
